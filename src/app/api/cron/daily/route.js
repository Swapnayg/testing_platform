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
  // const examsToday = await prisma.exam.findMany({
  //   where: {
  //     createdAt: {
  //       gte: yesterdayStart,
  //       lte: yesterdayEnd,
  //     },
  //   },
  //   select: {
  //     id: true,
  //     title: true,
  //     startTime: true,
  //     endTime: true,
  //     totalMCQ: true,
  //     totalMarks: true,
  //     subject: {
  //       select: { name: true }
  //     },
  //     grade: {
  //       select: {
  //         level: true,
  //         category: {
  //           select: { catName: true }
  //         }
  //       },
  //     },
  //   },
  // });

  // var regId = [];

  // examsToday.forEach(async (exam, examIndex) => {
  //   const { grade } = exam;
  //   const examCategory = grade.category.catName;
  //   const examGradeLevel = grade.level;

  //   const matchingRegistrations = await prisma.registration.findMany({
  //       where: {
  //           status: 'APPROVED',
  //           catGrade: examGradeLevel,
  //           olympiadCategory: examCategory,
  //       },
  //       select: {
  //           id: true,
  //           olympiadCategory: true,
  //           catGrade: true,
  //           studentId: true,
  //           student: {
  //               select: {
  //                   name: true,
  //                   fatherName:true,
  //                   cnicNumber: true,
  //                   rollNo: true,
  //                   email:true,
  //                   instituteName:true,
  //               },
  //           },
  //       },
  //   });
  //   if (matchingRegistrations.length > 0) {
  //       matchingRegistrations.forEach(async (matchOnReg, matchIndex) => {
  //           try {
  //               console.log("1");
  //               await prisma.examOnRegistration.upsert({
  //                   where: {
  //                       examId_registrationId: {
  //                           examId: exam.id,
  //                           registrationId: matchOnReg.id,
  //                       },
  //                   },
  //                   update: {},
  //                   create: {
  //                       examId: exam.id,
  //                       registrationId: matchOnReg.id,
  //                   },
  //               });
  //               console.log("2");

  //               await prisma.result.upsert({
  //                   where: {
  //                       examId_studentId: {
  //                       examId: exam.id,
  //                       studentId: matchOnReg.studentId,
  //                       },
  //                   },
  //                   update: {}, // do nothing if exists
  //                   create: {
  //                       examId: exam.id,
  //                       studentId: matchOnReg.studentId,
  //                       status: "NOT_GRADED",
  //                       score: 0,
  //                       totalScore: exam.totalMarks,
  //                       grade: '',
  //                       startTime: new Date(exam.startTime),
  //                       endTime: new Date(exam.endTime),
  //                   },
  //               });
  //               console.log("3");
  //               if (!regId.includes(matchOnReg.id)) {
  //                 regId.push(matchOnReg.id);
  //               }
  //               console.log("4");
  //               } catch (error) {
  //               console.error(`❌ Failed to `, error);
  //               // Optional: You can log to a monitoring service or continue gracefully
  //         }           
  //     });
  //   };
  // });
  // console.log(regId);

  // await delay(3000);
  // console.log("⏳ Step : Waited 3 seconds for async operations");
  // console.log(regId);
  // regId.forEach(async (reg, regIndex) => {
  //   const result = await prisma.examOnRegistration.findMany({
  //     where: {
  //       registrationId: reg, // replace with actual ID
  //     },
  //     include: {
  //       exam: {
  //         include:{
  //           subject:true,
  //         }
  //       },
  //       registration: {
  //         include: {
  //           student: true,
  //         },
  //       },
  //     },
  //   });
  //   const logoUrl = `${process.env.APP_URL}/favicon.ico`;
  //   const loginUrl = `${process.env.APP_URL}/`;
  //   const studentCnic = result?.registration.student.rollNo || '';
  //   const studentPassword = result?.registration.student.cnicNumber || '';

  //   const htmlTemplate = `<!DOCTYPE html>
  //       <html lang="en">
  //       <head>
  //           <meta charset="UTF-8" />
  //           <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  //           <title>Payment Accepted</title>
  //           <style>
  //           body {
  //               font-family: Arial, sans-serif;
  //               background-color: #f4f6f8;
  //               padding: 20px;
  //           }
  //           .container {
  //               max-width: 600px;
  //               background: #ffffff;
  //               margin: auto;
  //               border-radius: 8px;
  //               overflow: hidden;
  //               box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  //           }
  //           .header {
  //               background-color: #28a745; /* ✅ GREEN */
  //               color: #ffffff;
  //               text-align: center;
  //               padding: 20px;
  //           }
  //           .header img {
  //               max-width: 100px;
  //               margin-bottom: 10px;
  //           }
  //           .content {
  //               padding: 30px;
  //               color: #333333;
  //               line-height: 1.6;
  //           }
  //           .login-box {
  //               background-color: #f0f0f0;
  //               padding: 15px;
  //               border-radius: 6px;
  //               margin-top: 20px;
  //               font-family: monospace;
  //           }
  //           .btn {
  //               background-color: #28a745;
  //               color: #ffffff !important;
  //               text-decoration: none;
  //               padding: 12px 20px;
  //               border-radius: 5px;
  //               display: inline-block;
  //               margin-top: 20px;
  //           }
  //           .footer {
  //               text-align: center;
  //               font-size: 12px;
  //               color: #999999;
  //               padding: 15px;
  //           }
  //           </style>
  //       </head>
  //       <body>
  //           <div class="container">
  //           <div class="header">
  //               <img src="`+logoUrl+`" alt="Olympiad Logo" />
  //               <h2>Olympiad Registration Confirmed</h2>
  //           </div>
  //           <div class="content">
  //               <p>Dear Student,</p>
  //               <p>We are pleased to inform you that your payment for the Olympiad registration has been <strong>successfully accepted</strong>.</p>
  //               <p>You can now log in to your student dashboard to view your exams, results, and other details.</p>

  //               <div class="login-box">
  //               <p><strong>Login Portal:</strong> <a href="`+loginUrl+`" target="_blank">`+loginUrl+`</a></p>
  //               <p><strong>Username:</strong> `+studentCnic+`</p>
  //               <p><strong>Password:</strong> `+studentPassword+`</p>
  //               </div>

  //               <a href="`+loginUrl+`" class="btn">Go to Student Portal</a>

  //               <p>If you have any questions or need assistance, feel free to contact our support team at <a href="mailto:support@yourdomain.com">support@yourdomain.com</a>.</p>

  //               <p>Best regards,<br />Olympiad Registration Team</p>
  //           </div>
  //           <div class="footer">
  //               &copy; 2025 Olympiad Organization. All rights reserved.
  //           </div>
  //           </div>
  //       </body>
  //       </html>
  //       `; // trimmed for brevity

  //    const formattedExams = result.exam.map(ex => ({
  //         subject: ex.subject?.name || '',
  //         startTime: new Date(ex.startTime).toLocaleString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
  //         endTime: new Date(ex.endTime).toLocaleString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
  //         totalMCQ: ex.totalMCQ?.toString() || '',
  //         totalMarks: ex.totalMarks?.toString() || '',
  //   }));

  //   const buffer = await generatePDFDocument(reg, formattedExams);
  //   const fileName = `Test-slip-${student?.rollNo || 'student'}-${Date.now()}.pdf`;

  //   const info = await transporter.sendMail({
  //     from: process.env.GMAIL_USER,
  //     to: student?.email || '',
  //     subject: 'Payment Confirmation: Your Registration Has Been Approved',
  //     html: htmlTemplate,
  //     attachments: [
  //       {
  //         filename: fileName,
  //         content: buffer,
  //         contentType: "application/pdf",
  //       },
  //     ],
  //   });
  //   console.log(`📧 Step .${regIndex}: Email sent to ${student?.email} - ID: ${info.messageId}`);
  // });

  console.log("✅ Step: Cron job finished successfully");

  return new Response(JSON.stringify({ message: "Cron executed" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
