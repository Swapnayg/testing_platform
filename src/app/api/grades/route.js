// app/api/grades/route.ts (or pages/api/grades.ts if using pages directory)
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const grades = await prisma.grade.findMany({
      select: {
        id: true,
        level: true,
      },
      orderBy: { id: "asc" },
    });
    return NextResponse.json(grades);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch grades" }, { status: 500 });
  }
}
