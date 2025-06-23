// /app/api/cron/declare-results/route.js

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "edge";

export async function GET() {
  const now = new Date();
  const tomorrowStart = new Date(now);
  tomorrowStart.setDate(now.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setHours(23, 59, 59, 999);

  try {
    // Step 1: Get exam IDs with resultDate == tomorrow
    const exams = await prisma.exam.findMany({
      where: {
        resultDate: {
          gte: tomorrowStart,
          lte: tomorrowEnd,
        },
      },
      select: {
        id: true,
      },
    });

    const examIds = exams.map((e) => e.id);

    if (examIds.length === 0) {
      return NextResponse.json({ message: "No exams with resultDate tomorrow." });
    }

    // Step 2: Update related results
    const updateResult = await prisma.result.updateMany({
      where: {
        examId: {
          in: examIds,
        },
      },
      data: {
        resultDeclared: true,
      },
    });

    return NextResponse.json({
      message: "Results declared successfully.",
      updatedCount: updateResult.count,
      examIds,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : error }, { status: 500 });
  }
}
