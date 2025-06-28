// pages/api/grades.ts
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request) {

  try {
    const examsWithoutResults = await prisma.exam.findMany({
      where: {
        resultDate: null,          // ✅ No result declared yet
        status: 'COMPLETED',       // ✅ Only completed exams
      },
      select: {
        id: true,
        title: true,
        status: true,
      },
    });


    return NextResponse.json({ examsWithoutResults }, { status: 200 });
  } catch (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json({ error: 'Error fetching grades.' }, { status: 500 });
  }
}
