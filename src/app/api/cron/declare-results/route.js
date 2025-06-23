// /app/api/cron/declare-results/route.js

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {

    console.log("fired");
    const now = new Date();
    const tomorrowStart = new Date(now);
    tomorrowStart.setDate(now.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setHours(23, 59, 59, 999);

    console.log(1);

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
        console.log(2);
        console.log(exams);
        console.log(3);

        const examIds = exams.map((e) => e.id);
        console.log(4);
        console.log(examIds);
        console.log(5);

        if (examIds.length === 0) {
            console.log(6);
            return NextResponse.json({ message: "No exams with resultDate tomorrow." });
        }
        console.log(7);
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
        console.log(8);
        console.log(updateResult);
        console.log("Results declared successfully.");
        return NextResponse.json({
        message: "Results declared successfully.",
        updatedCount: updateResult.count,
        examIds,
        });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : error }, { status: 500 });
  }
}
