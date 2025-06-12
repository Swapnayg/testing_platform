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
    console.log("❌ Step 1: Unauthorized access attempt");
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  console.log("✅ Step 2: Cron job triggered at", new Date());

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

  console.log("📅 Step 3: Time calculations completed");

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
  console.log("📝 Step 4: Updated NOT_STARTED -> IN_PROGRESS");

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
  console.log("📝 Step 5: Updated IN_PROGRESS -> COMPLETED");

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
  console.log("📝 Step 6: Updated NOT_GRADED -> ABSENT");

  const examsToday = await prisma.exam.findMany({
    where: {
      createdAt: {
        // gte: yesterdayStart,
        // lte: yesterdayEnd,
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
  console.log(`📚 Step 7: Retrieved ${examsToday.length} exams created yesterday`);

  var examResults = [];
  var regId = [];
  var studentList = [];

  examsToday.forEach(async (exam, examIndex) => {
    const { grade } = exam;
    const examCategory = grade.category.catName;
    const examGradeLevel = grade.level;

    const matchingRegistrations = await prisma.registration.findMany({
      where: {
        status: 'APPROVED',
        catGrade: examGradeLevel,
        olympiadCategory: examCategory,
      }
    });
    console.log(`🔍 Step 8.${examIndex}: Found ${matchingRegistrations.length} matching registrations`);

    if (matchingRegistrations.length > 0) {
        console.log("8.1");
      matchingRegistrations.forEach(async (matchOnReg, matchIndex) => {
         console.log("8.2");
        const matchExmOnReg = await prisma.examOnRegistration.findMany({
          where: {
            examId: exam.id,
            registrationId: matchOnReg.id,
          }
        });
        console.log("8.3");
        if (matchExmOnReg.length === 0) {
            console.log("8.4");
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
            console.log("8.5");
            try {
                await prisma.result.create({
                    data: {
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
                console.error(`❌ Failed to create result for examId: ${exam.id}, studentId: ${matchOnReg.studentId}`, error);
                // Optional: You can log to a monitoring service or continue gracefully
            }
            console.log("8.6");
            console.log(`➕ Step 9.${examIndex}.${matchIndex}: Linked exam ${exam.id} to registration ${matchOnReg.id}`);

          examResults.push({
            id: exam.id,
            title: exam.title,
            startTime: new Date(exam.startTime).toLocaleString('en-IN', {
              day: '2-digit', month: 'long', year: 'numeric',
              hour: '2-digit', minute: '2-digit', hour12: true
            }),
            endTime: new Date(exam.endTime).toLocaleString('en-IN', {
              day: '2-digit', month: 'long', year: 'numeric',
              hour: '2-digit', minute: '2-digit', hour12: true
            }),
            category: matchOnReg.olympiadCategory,
            grade: matchOnReg.catGrade,
            subject: exam.subject.name,
            totalMCQ: exam.totalMCQ,
            totalMarks: exam.totalMarks,
            studentId: matchOnReg.studentId,
            regsId: matchOnReg.id
          });

          console.log("9.0");

          if (!regId.includes(matchOnReg.id)) {
            console.log("9.1");
            regId.push(matchOnReg.id);
            console.log("9.2");
            const user = await prisma.student.findUnique({
              where: { cnicNumber: matchOnReg.studentId },
            });

            console.log("9.3");

            if (user?.id) {
                console.log("9.4");
              studentList.push({
                examregId: matchOnReg.id,
                name: user.name,
                fatherName: user.fatherName,
                cnicNumber: user.cnicNumber,
                rollNo: user.rollNo,
                email: user.email,
                category: matchOnReg.olympiadCategory,
                grade: matchOnReg.catGrade,
                instituteName: user.instituteName
              });
              console.log("9.5");
              console.log(`👨‍🎓 Step 10.${examIndex}.${matchIndex}: Student data saved for reg ${matchOnReg.id}`);
            }
          }
        }
      });
    }
  });
  console.log("examResults");
  console.log(examResults);
  console.log("studentList");
  console.log(studentList);
  console.log("regId");
  console.log(regId);
  await delay(5000);
  console.log("⏳ Step 11: Waited 5 seconds for async operations");

  regId.forEach(async (reg, regIndex) => {
    const examList = examResults.filter(result => result.regsId === reg);
    const student = studentList.find(result => result.examregId === reg);

    const logoUrl = `${process.env.APP_URL}/favicon.ico`;
    const loginUrl = `${process.env.APP_URL}/`;
    const studentCnic = student?.rollNo || '';
    const studentPassword = student?.cnicNumber || '';

    const htmlTemplate = `<!DOCTYPE html>...`; // trimmed for brevity

    const safeStudent = student ? {
      rollNo: student.rollNo ?? '',
      cnicNumber: student.cnicNumber ?? '',
      name: student.name ?? '',
      fatherName: student.fatherName ?? '',
      category: student.category ?? '',
      grade: student.grade ?? '',
      instituteName: student.instituteName ?? ''
    } : {
      rollNo: '', cnicNumber: '', name: '', fatherName: '',
      category: '', grade: '', instituteName: ''
    };

    const buffer = await generatePDFDocument1(reg, examList, safeStudent);
    const fileName = `Test-slip-${student?.rollNo || 'student'}-${Date.now()}.pdf`;

    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: student?.email || '',
      subject: 'Payment Confirmation: Your Registration Has Been Approved',
      html: htmlTemplate,
      attachments: [
        {
          filename: fileName,
          content: buffer,
          contentType: "application/pdf",
        },
      ],
    });
    console.log(`📧 Step 12.${regIndex}: Email sent to ${student?.email} - ID: ${info.messageId}`);
  });

  console.log("✅ Step 13: Cron job finished successfully");

  return new Response(JSON.stringify({ message: "Cron executed" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
