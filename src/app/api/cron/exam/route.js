import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma';
import { generatePDFDocument } from '@/lib/actions'; // optional

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.CRON_SECRET) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  console.log('✅ Step: Cron job triggered at', new Date());

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
        select: { name: true },
      },
      grade: {
        select: {
          level: true,
          category: {
            select: { catName: true },
          },
        },
      },
    },
  });

  const processedRegistrations = [];

  for (const exam of examsToday) {
    const { grade } = exam;
    const examCategory = grade.category.catName;
    const examGradeLevel = grade.level;

    console.log(`📝 Processing Exam ID: ${exam.id}`);

    const matchingRegistrations = await prisma.registration.findMany({
      where: {
        status: 'APPROVED',
        catGrade: examGradeLevel,
        olympiadCategory: examCategory,
        exams: {
          none: {
            examId: exam.id,
          },
        },
      },
      select: {
        id: true,
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

    for (const reg of matchingRegistrations) {
      try {
        // Check if already exists
        const exists = await prisma.examOnRegistration.findFirst({
          where: {
            registrationId: reg.id,
            examId: exam.id,
          },
        });

        if (!exists) {
          await prisma.examOnRegistration.create({
            data: {
              examId: exam.id,
              registrationId: reg.id,
            },
          });

          await prisma.result.upsert({
            where: {
              examId_studentId: {
                examId: exam.id,
                studentId: reg.studentId,
              },
            },
            update: {},
            create: {
              examId: exam.id,
              studentId: reg.studentId,
              status: 'NOT_GRADED',
              score: 0,
              totalScore: exam.totalMarks,
              grade: '',
              startTime: new Date(exam.startTime),
              endTime: new Date(exam.endTime),
            },
          });

          processedRegistrations.push({
            examId: exam.id,
            registrationId: reg.id,
            studentId: reg.studentId,
          });

          console.log(`✅ Registered: RegID ${reg.id} for Exam ${exam.id}`);
        }
      } catch (error) {
        console.error(
          `❌ Error processing studentId: ${reg.studentId}, registrationId: ${reg.id}`,
          error
        );
      }
    }
  }

  console.log('🎯 Final processed registrations:', processedRegistrations.length);

  // Optional: Send summary email to admin
  try {
    if (processedRegistrations.length > 0) {
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: 'infoswap90@gmail.com', // change to actual admin
        subject: '📊 Daily Exam Registration Cron Summary',
        text: `Successfully registered ${processedRegistrations.length} students for today's exams.\n\nTime: ${new Date().toLocaleString()}`,
      });
    }
  } catch (emailError) {
    console.error('📧 Email sending failed:', emailError);
  }

  return new Response(
    JSON.stringify({
      message: 'Cron executed successfully',
      examsProcessed: examsToday.length,
      registrationsCreated: processedRegistrations.length,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
