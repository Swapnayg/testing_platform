import prisma from "@/lib/prisma";
import { $Enums } from "@prisma/client";
import { NextRequest, NextResponse } from 'next/server';


export async function POST(req: NextRequest) {
  try {
    const body = await req.json(); // get POSTed JSON data
    const { examId } = body;
    const latestQuiz = await prisma.quiz.findFirst({
        where: {
            examId: examId,
        },
        select: {
            id: true,
            title: true,
        },
    });
    var questionsWithOptions: ({ options: { id: string; createdAt: Date; updatedAt: Date; text: string; orderIndex: number; questionId: string; isCorrect: boolean; }[]; } & { id: string; createdAt: Date; updatedAt: Date; quizId: string; type: $Enums.QuestionType; text: string; marks: number; correctAnswer: string | null; orderIndex: number; })[] = []
    try{
        questionsWithOptions = await prisma.question.findMany({
        where: {
            quizId: latestQuiz?.id, // Replace with actual quizId
        },
        include: {
            options: true, // include all options for the question
        },
        orderBy: {
            orderIndex: 'asc',
        },
    });
    }
    catch{

    }
    return NextResponse.json({"lattestQuiz":latestQuiz,"questions": questionsWithOptions});
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create quiz' }, { status: 500 });
  }
}
