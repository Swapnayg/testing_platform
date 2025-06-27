// /app/api/cron/declare-results/route.js

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";


export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  console.log("✅ Step: Cron job triggered at", new Date());
  const now = new Date();

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  try {
    // Step 1: Get exams whose results are declared today
    const exams = await prisma.exam.findMany({
      where: {
        resultDate: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      select: { id: true },
    });

    const examIds = exams.map((e) => e.id);

    if (examIds.length === 0) {
      return NextResponse.json({ message: "No exams with resultDate today." });
    }

    const declaredAt = new Date();

    for (const examId of examIds) {
      // Step 2: Get results for this exam, ordered by score DESC
     const results = await prisma.result.findMany({
        where: {
          examId,
          status: {
            in: ['PASSED', 'FAILED'],
          },
        },
        orderBy: {
          score: 'desc',
        },
        select: {
          id: true,
          score: true,
          status: true,
        },
      });
      console.log(results, "Results for exam ID:", examId);

      // Step 3: Assign ranks
      let currentRank = 1;
      let previousScore = null;
      let actualRank = 1;

      for (let i = 0; i < results.length; i++) {
        const result = results[i];

        if (previousScore !== null && result.score < previousScore) {
          actualRank = currentRank;
        }

        // Update result with rank in grade field
        await prisma.result.update({
          where: { id: result.id },
          data: {
            grade: `${actualRank}`, // Or Number(actualRank) if grade is numeric
            resultDeclared: true,
            declaredOn: declaredAt,
          },
        });

        previousScore = result.score;
        currentRank++;
      }
    }

    return NextResponse.json({ message: "Results updated with ranks." });

  } catch (error) {
    console.error("Error updating results with rank:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
