import prisma from "@/lib/prisma";
import { $Enums } from "@prisma/client";
import { NextRequest, NextResponse } from 'next/server';


export async function POST(req) {
    try{
    const { quizid } = body;
    if (!quizid) {
        return NextResponse.json({ message: 'Quiz is required' }, { status: 400 });
    }
    const quiz = await prisma.quiz.findUnique({
        where: { id: quizid },
            include: {
                questions: {
                    orderBy: { id: 'asc' },
                    include:{
                        options:{
                            orderBy: { id: 'asc' },
                        }
                    }
                }
            }
        });
    if (!quiz) return null;
    const questions = quiz.questions.map((question, index) => {
    const options = question.options.filter(opt => opt.questionId === question.id).map(opt => opt.text);
    return {
        id: question.id,
        questionNumber: parseInt(index + 1),
        questionText: question.text,
        questionType: question.type,
        options:  options?.length > 0 ? options : undefined,
        points: question.marks,
        correctAnswer: question.correctAnswer
        };
    }).sort((a, b) => a.questionNumber - b.questionNumber);

    var quizData =  {
        id: quiz.id,
        title: quiz.title,
        timeLimit: 30, // 30 minutes
        questions,
        category: quiz.category,
        grade: quiz.grade,
        subject: quiz.subject,
        totalMarks: quiz.totalMarks
    };

    return NextResponse.json({"quizData": quizData}, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create quiz' }, { status: 500 });
  }
}
