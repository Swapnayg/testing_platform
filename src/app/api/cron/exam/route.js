// app/api/cron/daily/route.js

import nodemailer from 'nodemailer';
import prisma from "@/lib/prisma";
import { generatePDFDocument } from "@/lib/actions";

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

const todayStart = new Date();
todayStart.setHours(0, 0, 0, 0);

const todayEnd = new Date();
todayEnd.setHours(23, 59, 59, 999);

const examsToday = await prisma.exam.findMany({
  where: {
    createdAt: {
      gte: todayStart,
      lte: todayEnd,
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

const regId = [];

console.log("🔍 Starting registration process for today's exams...");

for (const exam of examsToday) {
  console.log(`📘 Processing exam: ${exam.title} (${exam.id})`);

  const { grade } = exam;
  const examCategory = grade.category.catName;
  const examGradeLevel = grade.level;

  console.log(`🔎 Finding approved registrations for grade: ${examGradeLevel}, category: ${examCategory}`);

  const matchingRegistrations = await prisma.registration.findMany({
    where: {
      status: 'APPROVED',
      catGrade: examGradeLevel,
      olympiadCategory: examCategory,
      // Filter out those already registered for the exam
      exams: {
        none: {
          examId: exam.id, // exclude those who already have this exam
        },
      },
    },
    select: {
      id: true,
      olympiadCategory: true,
      catGrade: true,
      studentId: true,
      student: {
        select: {
          name: true,
          fatherName: true,
          cnicNumber: true,
          rollNo: true,
          email: true,
          instituteName: true,
        },
      },
    },
  });

  console.log(`✅ Found ${matchingRegistrations.length} approved registrations`);

  for (const matchOnReg of matchingRegistrations) {
    console.log(`📝 Registering student: ${matchOnReg.student.name} (${matchOnReg.studentId})`);

    try {
      console.log(`➡️  Upserting ExamOnRegistration for regId: ${matchOnReg.id}`);
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
      console.log("✅ ExamOnRegistration success");

      console.log(`➡️  Upserting Result for studentId: ${matchOnReg.studentId}`);
      await prisma.result.upsert({
        where: {
          examId_studentId: {
            examId: exam.id,
            studentId: matchOnReg.studentId,
          },
        },
        update: {},
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
      console.log("✅ Result upsert success");

      if (!regId.includes(matchOnReg.id)) {
        regId.push(matchOnReg.id);
        console.log(`📌 Registered ID added: ${matchOnReg.id}`);
      }

    } catch (error) {
      console.error(`❌ Error processing studentId: ${matchOnReg.studentId}, registrationId: ${matchOnReg.id}`, error);
    }
  }
}

console.log("🎯 Final registration IDs:", regId);


return new Response(JSON.stringify({ message: "Cron executed" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
