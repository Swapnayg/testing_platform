import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { QuestionType } from "@prisma/client";



export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    const rollNo = searchParams.get('rollNo');

    switch (type) {
      case 'byId':

        const student = await prisma.student.findFirst({
          where: { rollNo },
        });
        // GET 2: Get answers by ID and quizz id
        if (!id) return NextResponse.json({ message: 'ID is required' }, { status: 400 });
        const answers = await prisma.quizAttempt.findMany({
            where: { 
                quizId: id,
                studentId:student.cnicNumber,
             },
             include:{
              answers:true,
             }
        });

        return NextResponse.json(answers, { status: 200 });

      case 'byRoll':
        if (!rollNo) return NextResponse.json({ message: 'rollNo is required' }, { status: 400 });
        const studentByRoll = await prisma.student.findFirst({
          where: { rollNo: rollNo },
        });
        const upcomingExams = await prisma.exam.findMany({
          where: {
            registrations: {
              some: {
                registration: {
                  studentId: studentByRoll?.cnicNumber,
                },
              },
            },
            results: {
              none: {
                studentId: studentByRoll?.cnicNumber,
                quizAttemptId: { not: null },
              },
            },
            startTime: {
              gt: new Date(), // Upcoming only
            },
          },
          select: {
            id: true,
            title: true,
            totalMCQ: true,
            totalMarks: true,
            timeLimit: true,
            startTime: true,
            endTime: true,
            grade: {
              select: {
                level: true,
                category: {
                  select: {
                    catName: true,
                  },
                },
              },
            },
            subject: {
              select: {
                name: true,
              },
            },
          },
        });

        // Get all attempted quizzes by this student
        const attemptedResults = await prisma.result.findMany({
          where: { studentId:studentByRoll.cnicNumber },
          select: {
            exam: {
              select: {
                id: true,
                title: true,
                totalMCQ: true,
                totalMarks: true,
                timeLimit: true,
                startTime: true,
                endTime: true,
                grade: {
                  select: {
                    level: true,
                    category: {
                      select: { catName: true },
                    },
                  },
                },
                subject: { select: { name: true } },
              },
            },
            score: true,
            correctAnswers: true,
            status: true,
            gradedAt: true,
          },
        });


        const formattedResults = [
          // Completed quizzes (attempted)
          ...attemptedResults.map(r => ({
            id: r.exam?.id,
            title: r.exam?.title,
            subject: r.exam?.subject?.name || "Unknown",
            grade: r.exam?.grade?.level || "N/A",
            category: r.exam?.grade?.category?.catName || "N/A",
            timeRemaining: "Completed",
            questions: r.exam?.totalMCQ ?? 0,
            duration: `${r.exam?.timeLimit ?? 0} mins`,
            totalMarks: r.exam?.totalMarks ?? 0,
            score: r.score,
            totalScore: r.totalScore,
            progress: 100,
            status: "completed",
            quizType: "completed",
            startTime: r.startTime,
            endTime: r.endTime,
          })),

          // Upcoming quizzes (not attempted)
          ...upcomingExams.map(e => {
            const now = new Date();
            const start = new Date(e.startTime);
            const diffMs = start.getTime() - now.getTime();
            const timeRemaining = diffMs > 0
              ? `${Math.ceil(diffMs / (1000 * 60 * 60 * 24))} days`
              : "Starts today";

            return {
              id: e.id,
              title: e.title,
              subject: e.subject?.name || "Unknown",
              grade: e.grade?.level || "N/A",
              category: e.grade?.category?.catName || "N/A",
              timeRemaining,
              questions: e.totalMCQ ?? 0,
              duration: `${e.timeLimit ?? 0} mins`,
              totalMarks: e.totalMarks ?? 0,
              score: null,
              totalScore: null,
              progress: 0,
              status: "not-started",
              quizType: "upcoming",
              startTime: e.startTime,
              endTime: e.endTime,
            };
          }),
        ];
        return NextResponse.json({quizzes: formattedResults}, { status: 200 });

      default:
        return NextResponse.json({ message: 'Invalid GET type' }, { status: 400 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Server Error', error }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { type } = body;

    switch (type) {
      case 'create':
        // POST 1: Create new quiz Attempt
        const { quizId, rollNo, totalMarks } = body;
        if (!quizId || !rollNo) {
          return NextResponse.json({ message: 'Quiz and rollNo are required' }, { status: 400 });
        }
        const studentByRoll = await prisma.student.findFirst({
          where: { rollNo },
        });
        let quizAttempt;

        try {
          quizAttempt = await prisma.quizAttempt.create({
            data: {
                quizId: quizId,
                studentId: studentByRoll.cnicNumber,
                studentName: studentByRoll.name,
                startTime: new Date(),
                totalScore:totalMarks,
            }
        });
        } catch (error) {
          if (error.code === 'P2002') {
            // Duplicate entry
            quizAttempt = await prisma.quizAttempt.findFirst({
              where: {
                quizId: quizId,
                studentId: studentByRoll.cnicNumber,
              },
            });
            console.log('Student has already attempted this quiz.');
          } else {
            throw error;
          }
        }

        return NextResponse.json(quizAttempt, { status: 201 });

      case 'answers':
        const {aquizId,arollNo, data } = body;
        if (!aquizId || !arollNo)  {
          return NextResponse.json({ message: 'Quiz and rollNo are required' }, { status: 400 });
        }

        const attempt = await prisma.quizAttempt.findFirst({
          where: {
            quizId: aquizId, // <-- Replace with your actual attemptId variable
          },
        });
        const questionsWithOptions = await prisma.quiz.findFirst({
          where: {
            id: aquizId, // Replace with actual quizId
          },
          include: {
            exam: true,
            questions: {
              orderBy: {
                orderIndex: 'asc', // ✅ sort questions by their order
              }
            }
          }
        });

        const questionMap= {};

        questionsWithOptions.questions.forEach((question) => {
          questionMap[question.id] = {
            correctAnswer: question.correctAnswer, // Make sure this exists on your question object
            points: question.marks || 1,
            type: question.type,         // Default to 1 point if not explicitly set
          };
        });

        const insertData = data.answers.map((answer) => {
          const qInfo = questionMap[answer.questionId];
          if (!qInfo) {
            return {
              attemptId: data.attemptId,
              questionId: answer.questionId,
              answerText: answer.answerText,
              isCorrect: false,
              pointsEarned: 0,
              answeredAt: new Date(),
            };
          }
          let isCorrect = false;
          switch (qInfo.type) {
            case 'MULTIPLE_CHOICE':
            case 'TRUE_FALSE':
              isCorrect = answer.answerText.toLowerCase() === qInfo.correctAnswer.toLowerCase();
              break;

            case 'SHORT_TEXT':
            case 'LONG_TEXT':
              isCorrect = answer.answerText.trim().toLowerCase() === qInfo.correctAnswer.trim().toLowerCase();
              break;

            case 'NUMERICAL':
              const submitted = parseFloat(answer.answerText);
              const correct = parseFloat(qInfo.correctAnswer);
              isCorrect = !isNaN(submitted) && Math.abs(submitted - correct) < 0.0001;
              break;
            }
          return {
            attemptId: data.attemptId,
            questionId: answer.questionId,
            answerText: answer.answerText,
            isCorrect,
            pointsEarned: isCorrect ? qInfo.points : 0,
            answeredAt: new Date(),
          };
        });
        // ✅ Calculate total score earned
        const totalScoreEarned = insertData.reduce((sum, ans) => sum + ans.pointsEarned, 0);
        const correctAnswerCount = insertData.filter((item) => item.isCorrect).length;

        const [updatedAttempt, createdAnswers] = await prisma.$transaction([
          prisma.quizAttempt.update({
            where: { id: data.attemptId },
            data: {
              endTime: new Date(data.endTime),
              isCompleted: true,
              isSubmitted: true,
              timeSpent: data.timeSpent,
            },
          }),
          prisma.result.update({
            where: { 
              examId_studentId: {
                examId: questionsWithOptions.exam.id,
                studentId: attempt.studentId,
            }},
            data:{
              score:totalScoreEarned,
              gradedAt: new Date(),
              quizAttemptId:data.attemptId,
              answeredQuestions:data.answeredCount,
              correctAnswers:correctAnswerCount,
            }
          }),
          prisma.answer.createMany({
            data: insertData,
          }),
        ]);

        await new Promise(resolve => setTimeout(resolve, 1000));
        return NextResponse.json({ attempt: updatedAttempt, answers: createdAnswers }, { status: 200 });

      case 'updateanswers':
        const {uquizId,urollNo,uattemptId, udata } = body;
        if (!uquizId || !urollNo)  {
          return NextResponse.json({ message: 'Quiz and rollNo are required' }, { status: 400 });
        }

        await prisma.answer.deleteMany({
          where: {
            attemptId:uattemptId,
          },
        });
        const attempt1 = await prisma.quizAttempt.findFirst({
          where: {
            quizId: uquizId, // Make sure this is the correct quizId
          },
          include: {
            quiz: {
              include: {
                exam: true, // Include the exam related to the quiz
              },
            },
          },
        });
        const insertData1 = udata.map((answer) => {
          const correctAnswer = answer.correctAnswer;
          const studentAnswer = answer.studentAnswer;;
          const questionType = answer.questionType;
          const marks = answer.points || 0;
          let isCorrect = false;

          switch (questionType) {
            case 'MULTIPLE_CHOICE':
            case 'TRUE_FALSE':
              isCorrect = studentAnswer.toLowerCase() === correctAnswer.toLowerCase();
              break;

            case 'SHORT_TEXT':
            case 'LONG_TEXT':
              isCorrect =
                studentAnswer?.trim().toLowerCase() === correctAnswer?.trim().toLowerCase();
              break;

            case 'NUMERICAL':
              const submitted = parseFloat(studentAnswer);
              const expected = parseFloat(correctAnswer);
              isCorrect = !isNaN(submitted) && Math.abs(submitted - expected) < 0.0001;
              break;
          }

          return {
            attemptId: uattemptId,
            questionId: answer.id,
            answerText: studentAnswer,
            isCorrect,
            pointsEarned: isCorrect ? marks : 0,
            answeredAt: new Date(),
          };
        });

        // ✅ Calculate total score earned
        const totalScoreEarned1 = insertData1.reduce((sum, ans) => sum + ans.pointsEarned, 0);
        const correctAnswerCount1 = insertData1.filter((item) => item.isCorrect).length;
        const [ updatedAnswers] = await prisma.$transaction([
          prisma.result.update({
            where: { 
              examId_studentId: {
                examId: attempt1.quiz.exam.id,
                studentId: attempt1.studentId,
            }},
            data:{
              score:totalScoreEarned1,
              gradedAt: new Date(),
              quizAttemptId:udata.attemptId,
              answeredQuestions:attempt1.quiz.totalQuestions,
              correctAnswers:correctAnswerCount1,
            }
          }),
          prisma.answer.createMany({
            data: insertData1,
          }),
        ]);

        await new Promise(resolve => setTimeout(resolve, 1000));
        return NextResponse.json({ answers: updatedAnswers }, { status: 200 });
  
      default:
        return NextResponse.json({ message: 'Invalid POST type' }, { status: 400 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Server Error', error }, { status: 500 });
  }
}
