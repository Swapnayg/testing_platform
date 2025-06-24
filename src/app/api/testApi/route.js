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

export async function GET(request) {

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
    const examIds = examsToday.map(exam => exam.id);
    const regId = [];

    for (const exam of examsToday) {
      const { grade } = exam;
      const examCategory = grade.category.catName;
      const examGradeLevel = grade.level;

      try {
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

        for (const matchOnReg of matchingRegistrations) {
          try {
            const existing = await prisma.examOnRegistration.findFirst({
              where: {
                registrationId: matchOnReg.id,
              },
            });
            if (!existing) {
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
              if (!regId.includes(matchOnReg.id)) {
                regId.push(matchOnReg.id);
              }
            }
            else
            {
             const existingExamRegs = await prisma.examOnRegistration.findMany({
              where: {
                registrationId: matchOnReg.id,
                examId: { in: examIds },
              },
            });
            const existingExamIds = existingExamRegs.map(e => e.examId);
            if (!existingExamIds.includes(exam.id)) {
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
            }
            }
          } catch (error) {
            console.error(`❌ Error processing studentId: ${matchOnReg.studentId}, registrationId: ${matchOnReg.id}`, error);
          }
        }
      } catch (regError) {
        console.error(`❌ Error fetching registrations for examId: ${exam.id}`, regError);
      }
    }

    console.log("🎯 Final registration IDs:", regId);


return new Response(JSON.stringify({ message: "Cron executed" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
