import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter");
  const selectedParam = searchParams.get("selected");
  const selectedIds = selectedParam ? selectedParam.split(",") : [];

  try {
    let exams;

    if (filter === "undeclared") {
      exams = await prisma.exam.findMany({
        where: {
          endTime: { lt: new Date() }, // ✅ Only exams that have ended
          OR: [
            { resultDate: null },
            { id: { in: selectedIds } }, // Include selected even if declared
          ],
        },
        select: {
          id: true,
          title: true,
          resultDate: true,
          grades: {
            select: {
              id: true,
              level: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });
    } else {
      exams = await prisma.exam.findMany({
        where: {
          endTime: { lt: new Date() }, // ✅ Only completed exams
        },
        select: {
          id: true,
          title: true,
          resultDate: true,
          grades: {
            select: {
              id: true,
              level: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });
    }

    return NextResponse.json(exams);
  } catch (error) {
    console.error("Failed to fetch exams", error);
    return NextResponse.json({ error: "Failed to fetch exams" }, { status: 500 });
  }
}
