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

    // Assign ranks
    let rank = 1;
    let lastScore = null;
    let sameRankCount = 0;

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const isSameScore = result.score === lastScore;

      const currentRank = isSameScore ? rank : i + 1;

      await prisma.result.update({
        where: { id: result.id },
        data: {
          grade: `${currentRank}`, // or Number(currentRank)
          resultDeclared: true,
          declaredOn: declaredAt,
        },
      });

      lastScore = result.score;
      if (!isSameScore) {
        rank = i + 1;
      }
    }
  }

  return NextResponse.json({ message: "Results updated with ranks." });

  } catch (error) {
    console.error("Error updating results with rank:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
