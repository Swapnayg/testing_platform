// app/api/students/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";// adjust path to your prisma instance

export async function GET() {
  try {
    const students = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        role:true,
      },
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}
