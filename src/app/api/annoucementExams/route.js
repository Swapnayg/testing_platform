// /api/exams/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter");
  const selectedParam = searchParams.get("selected");

  const selectedIds = selectedParam ? selectedParam.split(",") : [];

  console.log(selectedIds);
  console.log("selectedIds");

  try {
    let exams;

    if (filter === "undeclared") {
      exams = await prisma.exam.findMany({
        where: {
          OR: [
            { resultDate: null },
            { id: { in: selectedIds } }, // ✅ Include selected exams even if declared
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
