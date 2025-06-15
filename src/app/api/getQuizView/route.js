import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json(); // ✅ fix: extract body properly
    const { quizid } = body;

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
        QuizAttempt: {
          select: {
            id:true,
            studentName:true,
            timeSpent:true,
            isCompleted:true,
            isSubmitted:true,
            results:true,
            answers: {
              select: {
                id: true,
                attemptId: true,
                questionId: true,
                answerText: true,
                isCorrect:true,
                pointsEarned:true,
              },
              orderBy: { id: 'asc' },
            }
          },
        },
      },
    });


    if (!quiz) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    const answerMap = {};
    quiz.QuizAttempt[0].answers.forEach((answer) => {
      answerMap[answer.questionId] = {
        id: answer.id,
        answerText: answer.answerText,
        attemptId: answer.attemptId,
        isCorrect: answer.isCorrect,
        pointsEarned: answer.pointsEarned,
      };
    });
    const questions = quiz.questions.map((question, index) => {
      const options = question.options.map(opt => opt.text); // options already filtered by Prisma
      const mapAns = answerMap[question.id];
      return {
        id: question.id,
        questionNumber: index + 1,
        questionText: question.text,
        questionType: question.type,
        options: options.length > 0 ? options : undefined,
        correctAnswer: question.correctAnswer,
        studentAnswer : mapAns?.answerText || '',                
        isCorrect: mapAns?.isCorrect ?? false,                  
        points: question.marks,
        obtainedPoints: mapAns?.pointsEarned ?? 0,
      };
    });

    const quizData = {
      id: quiz.id,
      studentName: quiz.QuizAttempt[0].studentName,
      quizTitle: quiz.title,
      timeLimit: quiz.timeLimit, // 30 minutes
      questions,
      category: quiz.category,
      grade: quiz.grade,
      subject: quiz.subject,
      totalMarks: quiz.totalMarks,
      attemptId : quiz.QuizAttempt[0].id,
      startTime:quiz.startDateTime,
      endTime:quiz.endDateTime,
      totalQuestions:quiz.totalQuestions,
      answeredQuestions:quiz.QuizAttempt[0].results[0].answeredQuestions,
      correctAnswers:quiz.QuizAttempt[0].results[0].correctAnswers,
      totalMarks:quiz.totalMarks,
      obtainedMarks:quiz.QuizAttempt[0].results[0].score,
      timeSpent:quiz.QuizAttempt[0].timeSpent,
      status:quiz.QuizAttempt[0].isCompleted ? 'completed' :
          attempt?.isSubmitted ? 'abandoned' :
          'in_progress',
    };
    return NextResponse.json({ quizData }, { status: 200 });
  } catch (error) {
    console.error("POST /quiz error:", error); // ✅ debug logging
    return NextResponse.json({ error: 'Failed to fetch quiz data' }, { status: 500 });
  }
}
