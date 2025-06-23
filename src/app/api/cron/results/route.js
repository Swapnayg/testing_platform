// /app/api/cron/declare-results/route.js

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "edge";

export async function GET() {
  const now = new Date();

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  try {
    // Step 1: Get exam IDs with resultDate == today
    const exams = await prisma.exam.findMany({
      where: {
        resultDate: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      select: {
        id: true,
      },
    });

    const examIds = exams.map((e) => e.id);
    console.log(examIds);

    if (examIds.length === 0) {
      return NextResponse.json({ message: "No exams with resultDate today." });
    }

    const declaredAt = new Date();

    // Step 2: Update related results with declared flag and date
    const updateResult = await prisma.result.updateMany({
      where: {
        examId: {
          in: examIds,
        },
      },
      data: {
        resultDeclared: true,
        declaredOn: declaredAt,
      },
    });

    console.log("Results declared successfully.");

    return NextResponse.json({
      message: "Results declared successfully.",
      updatedCount: updateResult.count,
      examIds,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}
