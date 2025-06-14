import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { $Enums } from "@prisma/client";

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
          where: { rollNo },
        });
        const upcomingStudentResults = await prisma.result.findMany({
            where: {
                studentId: studentByRoll?.cnicNumber, // Replace with actual student ID
                // exam: {
                //   endTime: {
                //     gt: new Date() // Only exams that haven't ended yet
                //   }
                // }
            },
            include: {
                exam: {
                include: {
                    quizzes: true, 
                    subject: true,
                    grade: true
                }
                }
            },
            orderBy: {
                exam: {
                startTime: 'asc' // Sort by upcoming exams first
                }
            }
        });
        return NextResponse.json(upcomingStudentResults, { status: 200 });

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
        const [updatedAttempt, createdAnswers] = await prisma.$transaction([
          prisma.quizAttempt.update({
            where: { id: data.attemptId },
            data: {
              endTime: new Date(data.endTime),
              isCompleted: true,
              isSubmitted: true,
              timeSpent: data.timeSpent,
            }
          }),
          prisma.answer.createMany({
            data: data.answers.map(answer => ({
              attemptId: data.attemptId,
              questionId: answer.questionId,
              answerText: answer.answerText,
              answeredAt: new Date(),
            }))
          })
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
        const [ updatedAnswers] = await prisma.$transaction([
          prisma.answer.createMany({
            data: udata.map(answer => ({
              attemptId: uattemptId,
              questionId: answer.id,
              answerText: answer.studentAnswer,
              answeredAt: new Date(),
            }))
          })
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
