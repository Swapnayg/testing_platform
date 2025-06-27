import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json(); // ✅ fix: extract body properly
    const { quizid } = body;

    if (!quizid) {
      return NextResponse.json({ message: 'Quiz is required' }, { status: 400 });
    }

      const exam = await prisma.exam.findUnique({
        where: { id: quizid },
        include: {
          subject: true,
          grades: {
            include: {
              category: true,
            },
          },
        },
      });

    return NextResponse.json({ exam }, { status: 200 });
  } catch (error) {
    console.error("POST /quiz error:", error); // ✅ debug logging
    return NextResponse.json({ error: 'Failed to fetch quiz data' }, { status: 500 });
  }
}
