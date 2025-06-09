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

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  console.log("✅Every Day 12 pm Cron job triggered at", new Date());

  const today = new Date();
  const dateOnly = new Date(today.toISOString().split('T')[0]);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yes_dateOnly = new Date(yesterday.toISOString().split('T')[0]); 
    await prisma.exam.updateMany({
      where: {
        startTime: dateOnly, // exactly today
        endTime: {
          gte: today, // still ongoing or ends today
        },
      },
      data: {
        status: 'IN_PROGRESS',
      },
    });
  
    await prisma.exam.updateMany({
      where: {
        endTime: yes_dateOnly,
      },
      data: {
        status: 'COMPLETED',
      },
    });
  
    await prisma.result.updateMany({
      where: {
        status: "NOT_GRADED",
        endTime: yes_dateOnly,
      },
      data: {
        status: 'ABSENT',
      },
    });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const examsToday = await prisma.exam.findMany({
        where: {
            createdAt: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
        select: {
            id:true,
            title:true,
            startTime:true,
            endTime:true,
            totalMCQ:true,
            totalMarks:true,
            subject:{
                select:{
                    name:true,
                }
            },
            grade: {
                select: {
                    level:true,
                    category: {
                        select:{
                            catName:true,
                        }
                    },
                },
            },
            registrations: {
                select: {
                    catGrade:true,
                    olympiadCategory:true,
                    status:true,
                },
            },
    
        },
    });
    const examResults = [];
    const regId = [];
    const studentList = [];
    examsToday.forEach(exam => {
        const { grade } = exam;
        const examCategory = grade.category.catName;
        const examGradeLevel = grade.level;

        const matchingRegistrations = exam.registrations.filter(reg => {
            return (
                reg.status === 'APPROVED' &&
                reg.catGrade === examGradeLevel &&
                reg.olympiadCategory === examCategory
            );
        });
        if (matchingRegistrations.length > 0) {
            matchingRegistrations.forEach(async matchReg => {
                const matchingExamonRegistration = matchReg.examOnRegistration.filter(exmreg => {
                    const examregId = exmreg.id;
                    return (
                        exmreg.registrationId === examregId
                    );
                });
                if(matchingExamonRegistration.length === 0)
                {
                    await prisma.examOnRegistration.upsert({
                    where: {
                        examId_registrationId: {
                            examId: exam.id,
                            registrationId:examregId,
                        },
                    },
                    update: {}, // Do nothing if already exists
                    create: {
                        examId: exam.id,
                        registrationId: examregId,
                    },
                    });
                    examResults.push({
                        id:exam.id, 
                        title:exam.title, 
                        startTime:new Date(exam.startTime).toLocaleString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
                        endTime:new Date(exam.endTime).toLocaleString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
                        category:exmreg.olympiadCategory, 
                        grade:exmreg.catGrade,
                        subject:exam.subject.name, 
                        totalMCQ:exam.totalMCQ, 
                        totalMarks:exam.totalMarks,
                        studentId: exmreg.studentId, 
                        regsId:exmreg.id
                    });
                    if (!regId.includes(examregId)) {
                        regId.push(examregId);
                        const user = await prisma.student.findUnique({
                            where: { cnicNumber: exmreg.studentId },
                        });
                        if (user?.id) {
                            studentList.push({
                                examregId:examregId, 
                                name:user.name, 
                                fatherName:user.fatherName,
                                cnicNumber:user.cnicNumber,
                                rollNo:user.rollNo,
                                category:exmreg.olympiadCategory, 
                                grade:exmreg.catGrade, 
                                instituteName:user.instituteName
                            })
                        }
                    }    
                }
            });
        }
    });
    regId.forEach(async reg => {
        const examList = examResults.find(result => result.regsId === reg);
        const student = studentList.find(result => result.examregId === reg);
        const logoUrl = `${process.env.APP_URL}/favicon.ico`;
        const loginUrl = `${process.env.APP_URL}/`;
        const studentCnic =  student.rollNo || '';
        const studentPassword = student.cnicNumber || '';

        const htmlTemplate = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <title>Payment Accepted</title>
            <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f6f8;
                padding: 20px;
            }
            .container {
                max-width: 600px;
                background: #ffffff;
                margin: auto;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                background-color: #28a745; /* ✅ GREEN */
                color: #ffffff;
                text-align: center;
                padding: 20px;
            }
            .header img {
                max-width: 100px;
                margin-bottom: 10px;
            }
            .content {
                padding: 30px;
                color: #333333;
                line-height: 1.6;
            }
            .login-box {
                background-color: #f0f0f0;
                padding: 15px;
                border-radius: 6px;
                margin-top: 20px;
                font-family: monospace;
            }
            .btn {
                background-color: #28a745;
                color: #ffffff !important;
                text-decoration: none;
                padding: 12px 20px;
                border-radius: 5px;
                display: inline-block;
                margin-top: 20px;
            }
            .footer {
                text-align: center;
                font-size: 12px;
                color: #999999;
                padding: 15px;
            }
            </style>
        </head>
        <body>
            <div class="container">
            <div class="header">
                <img src="`+logoUrl+`" alt="Olympiad Logo" />
                <h2>Olympiad Registration Confirmed</h2>
            </div>
            <div class="content">
                <p>Dear Student,</p>
                <p>We are pleased to inform you that your payment for the Olympiad registration has been <strong>successfully accepted</strong>.</p>
                <p>You can now log in to your student dashboard to view your exams, results, and other details.</p>

                <div class="login-box">
                <p><strong>Login Portal:</strong> <a href="`+loginUrl+`" target="_blank">`+loginUrl+`</a></p>
                <p><strong>Username:</strong> `+studentCnic+`</p>
                <p><strong>Password:</strong> `+studentPassword+`</p>
                </div>

                <a href="`+loginUrl+`" class="btn">Go to Student Portal</a>

                <p>If you have any questions or need assistance, feel free to contact our support team at <a href="mailto:support@yourdomain.com">support@yourdomain.com</a>.</p>

                <p>Best regards,<br />Olympiad Registration Team</p>
            </div>
            <div class="footer">
                &copy; 2025 Olympiad Organization. All rights reserved.
            </div>
            </div>
        </body>
        </html>
        `;
        const buffer = await generatePDFDocument1(id, examList,student);
        const fileName = `Test-slip-${user.rollNo || 'student'}-${Date.now()}.pdf`;
        const info = await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: user.email || '',
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
        console.log('Email sent:', info.messageId);
    });


  return new Response(JSON.stringify({ message: "Cron executed" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
