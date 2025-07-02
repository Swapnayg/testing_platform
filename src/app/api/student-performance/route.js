// app/api/student-performance/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
  const studentId = req.nextUrl.searchParams.get("studentId");
  if (!studentId) {
    return new NextResponse("Missing studentId", { status: 400 });
  }

  try {
    const results = await prisma.result.findMany({
      where: {
        studentId:studentId,
        resultDeclared: true,
        // only include if the related exam exists and is COMPLETED
        exam: {
          isNot: null,
          // if you want only completed exams, nest:
          // is: { status: "COMPLETED" }
        },
      },
      include: {
        exam: true,
      },
      orderBy: { declaredOn: "desc" },
      take: 7,
    });

    // build chart payload
    const chartData = results.map((r, i) => ({
      name: r.exam?.title ?? `Exam ${i + 1}`,
      value: r.score,
      total: r.totalScore,
      fill: ["#C3EBFA", "#FAE27C", "#90cdf4", "#fcd34d", "#38bdf8", "#fde68a", "#60a5fa"][i % 7],
    }));

    const overallScore = chartData.reduce((sum, e) => sum + e.value, 0);
    const maxScore     = chartData.reduce((sum, e) => sum + e.total, 0);

    return NextResponse.json({ chartData, overallScore, maxScore });
  } catch (err) {
    console.error(err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
