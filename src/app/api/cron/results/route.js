// /app/api/cron/declare-results/route.js

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";


export async function GET() {
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
      return NextResponse.json({ message: "No exams with resultDate tomorrow." });
    }

    const declaredAt = new Date();

    const updateResult = await prisma.result.updateMany({
      where: { examId: { in: examIds } },
      data: { 
        resultDeclared: true,
        declaredOn: declaredAt,
      },
    });

    console.log("Results declared successfully.");

    console.log("✅ Step: Cron job finished successfully");

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
