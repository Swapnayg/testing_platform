import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { QuestionType } from "@prisma/client";

function getGrade(score, total) {
  const percentage = (score / total) * 100;

  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
}


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

        let studentByRoll;
        try {
          studentByRoll = await prisma.student.findFirst({
            where: { rollNo },
            select: {
              cnicNumber: true,
              gradeId: true,
              grade: {
                select: {
                  level: true,
                },
              },
            },
          });

          if (!studentByRoll) {
            return NextResponse.json({ message: 'Student not found' }, { status: 404 });
          }
        } catch (err) {
          return NextResponse.json({ message: 'Error fetching student', error: err }, { status: 500 });
        }

        const now = new Date();

        let registrations = [];
        try {
          registrations = await prisma.registration.findMany({
            where: {
              studentId: studentByRoll.cnicNumber,
              status: 'APPROVED',
            },
            select: { id: true },
          });
        } catch (err) {
          return NextResponse.json({ message: 'Error fetching registrations', error: err }, { status: 500 });
        }

        const registrationIds = registrations.map(r => r.id);

        let examRegistrations = [];
        try {
          examRegistrations = await prisma.examOnRegistration.findMany({
            where: {
              registrationId: { in: registrationIds },
            },
            select: { examId: true },
          });
        } catch (err) {
          return NextResponse.json({ message: 'Error fetching exam registrations', error: err }, { status: 500 });
        }

        const registeredExamIds = examRegistrations.map(er => er.examId);

        // STEP 3: Get Attempted Exams (has result and quizAttemptId is not null)
        let attemptedResults = [];
        try {
          attemptedResults = await prisma.result.findMany({
            where: {
              studentId: studentByRoll.cnicNumber,
              quizAttemptId: { not: null },
              quizAttempt: {
                answers: { some: {} },
              },
            },
            include: {
              exam: {
                include: {
                  grades: { include: { category: true } },
                  subject: true,
                  quizzes: { select: { id: true } },
                },
              },
            },
          });
        } catch (err) {
          return NextResponse.json({ message: 'Error fetching attempted results', error: err }, { status: 500 });
        }

        // STEP 4: Get Upcoming Exams (registered, not attempted, future)
        let upcomingExams = [], absentExams = [];
        try {
          const attemptedExamIds = attemptedResults.map(r => r.examId);

          upcomingExams = await prisma.exam.findMany({
            where: {
              id: { in: registeredExamIds, notIn: attemptedExamIds },
              OR: [{ startTime: { gt: now } }, { endTime: { gt: now } }],
              grades: { some: { id: studentByRoll.gradeId } },
            },
            include: {
              grades: { include: { category: true } },
              subject: true,
              quizzes: { select: { id: true } },
            },
          });

          absentExams = await prisma.exam.findMany({
            where: {
              id: { in: registeredExamIds, notIn: attemptedExamIds },
              endTime: { lt: now },
              grades: { some: { id: studentByRoll.gradeId } },
            },
            include: {
              grades: { include: { category: true } },
              subject: true,
              quizzes: { select: { id: true } },
            },
          });
        } catch (err) {
          return NextResponse.json({ message: 'Error fetching exams', error: err }, { status: 500 });
        }

        try {
          const formattedResults = [
            // ✅ Attempted exams (completed)
            ...attemptedResults.map(r => {
              const formatted = {
                id: r.exam?.id,
                title: r.exam?.title,
                quizId: r.exam.quizzes?.id || null,
                subject: r.exam?.subject?.name || "Unknown",
                grade: studentByRoll.grade.level || "N/A",
                category: r.exam?.grades[0]?.category?.catName || "N/A",
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
              };
              console.log("✅ Attempted Exam:", formatted);
              return formatted;
            }),

            // ✅ Upcoming exams (registered but not attempted)
            ...upcomingExams.map(e => {
              const diffMs = new Date(e.startTime).getTime() - now.getTime();
              const timeRemaining = diffMs > 0
                ? `${Math.ceil(diffMs / (1000 * 60 * 60 * 24))} days`
                : "Starts today";

              const formatted = {
                id: e.id,
                title: e.title,
                quizId:  e.quizzes?.id || null,
                subject: e.subject?.name || "Unknown",
                grade: studentByRoll.grade.level || "N/A",
                category: e.grades[0]?.category?.catName || "N/A",
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
              console.log("⏳ Upcoming Exam:", formatted);
              return formatted;
            }),

            // ✅ Absent exams (missed after end)
            ...absentExams.map(a => {
              const formatted = {
                id: a.id,
                title: a.title,
                quizId: a.quizzes?.id || null,
                subject: a.subject?.name || "Unknown",
                grade: studentByRoll.grade.level || "N/A",
                category: a.grades[0]?.category?.catName || "N/A",
                timeRemaining: "Missed",
                questions: a.totalMCQ ?? 0,
                duration: `${a.timeLimit ?? 0} mins`,
                totalMarks: a.totalMarks ?? 0,
                score: null,
                totalScore: null,
                progress: 100,
                status: "absent",
                quizType: "completed",
                startTime: a.startTime,
                endTime: a.endTime,
              };
              return formatted;
            }),
          ];

          return NextResponse.json({ quizzes: formattedResults }, { status: 200 });
        } catch (err) {
          return NextResponse.json({ message: 'Error formatting results', error: err }, { status: 500 });
        }


      default:
        return NextResponse.json({ message: 'Invalid GET type' }, { status: 400 });
    }
  } catch (error) {
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
        const studentByRoll1 = await prisma.student.findFirst({
          where: { rollNo: rollNo.toUpperCase()},
        });
        let quizAttempt;

        try {
          quizAttempt = await prisma.quizAttempt.create({
            data: {
                quizId: quizId,
                studentId: studentByRoll1.cnicNumber,
                studentName: studentByRoll1.name,
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
                studentId: studentByRoll1.cnicNumber,
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

        const studentByRoll2 = await prisma.student.findFirst({
          where: { rollNo: arollNo.toUpperCase()},
        });

        const attempt = await prisma.quizAttempt.findFirst({
          where: {
            quizId: aquizId, // <-- Replace with your actual attemptId variable
            studentId:studentByRoll2.cnicNumber,
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
        const totalScoreEarned2 = insertData.reduce((sum, ans) => sum + ans.pointsEarned, 0);
        const correctAnswerCount2 = insertData.filter((item) => item.isCorrect).length;


        const score = parseInt(totalScoreEarned2); // your earned marks
        const passingThreshold = 0.4; // 40% passing mark (customize as needed)
        const totalMarks2 = questionsWithOptions.exam.totalMarks || 100; // fallback to 100

        let resultStatus = "NOT_GRADED";

        if (score === 0 && data.answeredCount === 0) {
          resultStatus = "ABSENT";
        } else if (score / totalMarks2 >= passingThreshold) {
          resultStatus = "PASSED";
        } else {
          resultStatus = "FAILED";
        }

        const grade = getGrade(parseInt(score), parseInt(totalMarks2));

        try { 
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
                }
              },
              data: {
                score: parseInt(totalScoreEarned2), // just for test
                gradedAt: new Date(),
                quizAttemptId: data.attemptId,
                answeredQuestions: data.answeredCount,
                correctAnswers: correctAnswerCount2,
                status: resultStatus, // ✅ dynamically set status
              }
            }),
            prisma.answer.createMany({
              data: insertData,
            }),
          ]);

          console.log('✅ Transaction completed successfully:');
        } catch (error) {
          console.error('❌ Transaction failed:', error);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        return NextResponse.json({  answers: "success" }, { status: 200 });

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

        
        const score1 = parseInt(totalScoreEarned1); // your earned marks
        const passingThreshold1 = 0.4; // 40% passing mark (customize as needed)
        const totalMarks3 =  attempt1.quiz.exam.totalMarks || 100; // fallback to 100
        const grade2 = getGrade(parseInt(score1), parseInt(totalMarks3));

        let resultStatus1 = "NOT_GRADED";

        if (score1 === 0 && udata.answeredCount === 0) {
          resultStatus1 = "ABSENT";
        } else if (score1 / totalMarks3 >= passingThreshold1) {
          resultStatus1 = "PASSED";
        } else {
          resultStatus1 = "FAILED";
        }
        const [ updatedAnswers1] = await prisma.$transaction([
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
              status: resultStatus1, // ✅ dynamically set status
            }
          }),
          prisma.answer.createMany({
            data: insertData1,
          }),
        ]);

        await new Promise(resolve => setTimeout(resolve, 1000));
        return NextResponse.json({ answers: updatedAnswers1 }, { status: 200 });
  
      default:
        return NextResponse.json({ message: 'Invalid POST type' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ message: 'Server Error', error }, { status: 500 });
  }
}
