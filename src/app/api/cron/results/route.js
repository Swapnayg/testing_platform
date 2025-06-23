import { NextResponse } from "next/server"; // ✅ required
import prisma from "@/lib/prisma";


export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("✅ Step: Results Cron job triggered at", new Date());

  const now = new Date();
  const tomorrowStart = new Date(now);
  tomorrowStart.setDate(now.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setHours(23, 59, 59, 999);

  try {
    const exams = await prisma.exam.findMany({
      where: {
        resultDate: {
          gte: tomorrowStart,
          lte: tomorrowEnd,
        },
      },
      select: { id: true },
    });

    const examIds = exams.map((e) => e.id);

    if (examIds.length === 0) {
      return NextResponse.json({ message: "No exams with resultDate tomorrow." });
    }

    const updateResult = await prisma.result.updateMany({
      where: { examId: { in: examIds } },
      data: { resultDeclared: true },
    });

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
