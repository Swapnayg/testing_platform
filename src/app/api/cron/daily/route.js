// app/api/cron/daily/route.js

import nodemailer from 'nodemailer';
import prisma from "@/lib/prisma";
import { generatePDFDocument1 } from "@/lib/actions";

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  console.log("✅ Step: Cron job triggered at", new Date());

  const today = new Date();
  const yesterdayStart = new Date(today);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  yesterdayStart.setHours(0, 0, 0, 0);

  const yesterdayEnd = new Date(today);
  yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
  yesterdayEnd.setHours(23, 59, 59, 999);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  await prisma.exam.updateMany({
    where: {
      status: "NOT_STARTED",
      startTime: {
        gte: new Date(tomorrow.setHours(0, 0, 0, 0)),
        lt: new Date(tomorrow.setHours(23, 59, 59, 999)),
      },
    },
    data: {
      status: 'IN_PROGRESS',
    },
  });

  await prisma.exam.updateMany({
    where: {
      status: "IN_PROGRESS",
      endTime: {
        gte: yesterdayStart,
        lte: yesterdayEnd,
      },
    },
    data: {
      status: 'COMPLETED',
    },
  });

  await prisma.result.updateMany({
    where: {
      status: "NOT_GRADED",
      endTime: {
        gte: yesterdayStart,
        lte: yesterdayEnd,
      },
    },
    data: {
      status: 'ABSENT',
    },
  });
  const examsToday = await prisma.exam.findMany({
    where: {
      createdAt: {
        gte: yesterdayStart,
        lte: yesterdayEnd,
      },
    },
    select: {
      id: true,
      title: true,
      startTime: true,
      endTime: true,
      totalMCQ: true,
      totalMarks: true,
      subject: {
        select: { name: true }
      },
      grade: {
        select: {
          level: true,
          category: {
            select: { catName: true }
          }
        },
      },
    },
  });

  var regId = [];

  examsToday.forEach(async (exam, examIndex) => {
    const { grade } = exam;
    const examCategory = grade.category.catName;
    const examGradeLevel = grade.level;

    const matchingRegistrations = await prisma.registration.findMany({
        where: {
            status: 'APPROVED',
            catGrade: examGradeLevel,
            olympiadCategory: examCategory,
        },
        select: {
            id: true,
            olympiadCategory: true,
            catGrade: true,
            studentId: true,
            student: {
                select: {
                    name: true,
                    fatherName:true,
                    cnicNumber: true,
                    rollNo: true,
                    email:true,
                    instituteName:true,
                },
            },
        },
    });
    if (matchingRegistrations.length > 0) {
        matchingRegistrations.forEach(async (matchOnReg, matchIndex) => {
            try {
                if (!regId.includes(matchOnReg.id)) {
                  regId.push(matchOnReg.id);
                }
                await prisma.examOnRegistration.upsert({
                    where: {
                        examId_registrationId: {
                            examId: exam.id,
                            registrationId: matchOnReg.id,
                        },
                    },
                    update: {},
                    create: {
                        examId: exam.id,
                        registrationId: matchOnReg.id,
                    },
                });

                await prisma.result.upsert({
                    where: {
                        examId_studentId: {
                        examId: exam.id,
                        studentId: matchOnReg.studentId,
                        },
                    },
                    update: {}, // do nothing if exists
                    create: {
                        examId: exam.id,
                        studentId: matchOnReg.studentId,
                        status: "NOT_GRADED",
                        score: 0,
                        totalScore: exam.totalMarks,
                        grade: '',
                        startTime: new Date(exam.startTime),
                        endTime: new Date(exam.endTime),
                    },
                });
                } catch (error) {
                console.error(`❌ Failed to create examonresult for examId: ${exam.id}, studentId: ${matchOnReg.id}`, error);
                // Optional: You can log to a monitoring service or continue gracefully
          }           
      });
    };
  });



  await delay(3000);
  console.log("⏳ Step : Waited 3 seconds for async operations");
  console.log(regId);
  regId.forEach(async (reg, regIndex) => {
    console.log(reg);
  });

  console.log("✅ Step: Cron job finished successfully");

  return new Response(JSON.stringify({ message: "Cron executed" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
