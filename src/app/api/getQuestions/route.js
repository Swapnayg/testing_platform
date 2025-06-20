import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json(); // ✅ fix: extract body properly
    const { quizid } = body;
    console.log(quizid);

    if (!quizid) {
      return NextResponse.json({ message: 'Quiz is required' }, { status: 400 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizid },
      include: {
        questions: {
          orderBy: { id: 'asc' },
          include: {
            options: {
              orderBy: { id: 'asc' },
            },
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    const questions = quiz.questions.map((question, index) => {
      const options = question.options.map(opt => opt.text); // options already filtered by Prisma
      return {
        id: question.id,
        questionNumber: index + 1,
        questionText: question.text,
        questionType: question.type,
        options: options.length > 0 ? options : undefined,
        points: question.marks,
        correctAnswer: question.correctAnswer,
      };
    });

    const quizData = {
      id: quiz.id,
      title: quiz.title,
      timeLimit: quiz.timeLimit, // 30 minutes
      questions,
      category: quiz.category,
      grade: quiz.grade,
      subject: quiz.subject,
      totalMarks: quiz.totalMarks,
      startTime:quiz.startDateTime,
      endTime:quiz.endDateTime,
    };

    return NextResponse.json({ quizData }, { status: 200 });
  } catch (error) {
    console.error("POST /quiz error:", error); // ✅ debug logging
    return NextResponse.json({ error: 'Failed to fetch quiz data' }, { status: 500 });
  }
}
