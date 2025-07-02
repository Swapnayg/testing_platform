
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { generatePDFDocument } from '@/lib/actions';
import { UserRole, NotificationType } from '@prisma/client';
// import { getIO } from "@/lib/socket";

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// const io = getIO();

async function getUserIdByNameAndRole(name, role) {
  const user = await prisma.user.findFirst({
    where: {
      name,
      role: role,
    },
    select: {
      id: true,
    },
  });

  return user?.id ?? null;
}

// POST request handler
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId');
  const status = searchParams.get('status');


  const adminUserId = await getUserIdByNameAndRole("admin", "admin");
    if (adminUserId === null) {
      throw new Error("Admin user not found. Cannot send notification.");
  }

  // Example create logic
    if (!['APPROVED', 'REJECTED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  try {
    // Find latest registration of student

    const latestRegistration = await prisma.registration.findFirst({
      where: { studentId: studentId },
      orderBy: { registerdAt: 'desc' },
      include: {
        student: {
          select: {
            id: true,
            rollNo: true,
            cnicNumber: true,
            email:true,
            user: true, // ✅ include full user info
          },
        },
      },
    });

    if (!latestRegistration) {
      return NextResponse.json({ error: 'No registration found for student' }, { status: 404 });
    }

    const updated = await prisma.registration.update({
      where: { id: latestRegistration.id },
      data: { status },
    });
    const logoUrl = `${process.env.APP_URL}/favicon.ico`;
    const loginUrl = `${process.env.APP_URL}/`;
    const studentCnic =  latestRegistration.student.rollNo || '';
    const studentPassword = latestRegistration.student.cnicNumber || '';
    if (status === 'APPROVED') {
        const notification = await prisma.notification.create({
          data: {
            senderId: adminUserId,
            senderRole: UserRole.admin,
            receiverId: latestRegistration.student.user.id,
            receiverRole: UserRole.student,
            type: NotificationType.PAYMENT_APPROVED,
            title:  "Payment Approved",
            message: "Your payment has been approved.",
          },
        });
        // io.to(`user_${latestRegistration.student.user.id}`).emit("new-notification", {
        //   id: notification.id,
        //   title: notification.title,
        //   message: notification.message,
        //   createdAt: notification.createdAt,
        // });
        const exams = await prisma.exam.findMany({
          where: {
            grades: {
              some: {
                level: latestRegistration.catGrade ?? '',
              },
            },
            status: {
              in: ["NOT_STARTED"],
            },
          },
          select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true,
            status: true,
            subjectId: true,
            totalMCQ: true,
            totalMarks: true,
            subject: {
              select: {
                name: true,
              },
            },
            grades: {
              select: {
                level: true,
                category: {
                  select: {
                    catName: true,
                  },
                },
              },
            },
          },
        });
        try {
         for (const ex of exams) { 
            await prisma.result.create({
            data: {
              examId: ex.id,
              studentId: latestRegistration.student.cnicNumber,
              status: "NOT_GRADED",
              score: 0,
              totalScore:ex.totalMarks,
              grade:'',
              startTime: new Date(ex.startTime),
              endTime: new Date(ex.endTime),
            },
        });
      }
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
            var formattedExams = []
        
            if(exams.length === 0)
            {
                formattedExams = [{
                    subject: 'Comming Soon',
                    startTime:'Comming Soon',
                    endTime: 'Comming Soon',
                    totalMCQ:'Comming Soon',
                    totalMarks: 'Comming Soon',
                }];
            }
            else
            {
                formattedExams = exams.map(exam => ({
                  subject: exam.subject?.name || '',
                  startTime: new Date(exam.startTime).toLocaleString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
                  endTime: new Date(exam.endTime).toLocaleString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
                  totalMCQ: exam.totalMCQ?.toString() || '',
                  totalMarks: exam.totalMarks?.toString() || '',
                }));
            }
            const buffer = await generatePDFDocument(latestRegistration.id, formattedExams);
            const fileName = `Test-slip-${latestRegistration.student.rollNo || 'student'}-${Date.now()}.pdf`;
              const info = await transporter.sendMail({
                from: process.env.GMAIL_USER,
                to: latestRegistration.student.email || '',
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
      } catch (error) {
      }

    }
    else if (status === 'REJECTED') {
        const notification = await prisma.notification.create({
          data: {
            senderId: adminUserId,
            senderRole: UserRole.admin,
            receiverId: latestRegistration.student.user.id,
            receiverRole: UserRole.student,
            type: NotificationType.PAYMENT_REJECTED,
            title: "Payment Rejected",
            message: "Unfortunately, your payment was rejected. Please try again.",
          },
        });

        // io.to(`user_${latestRegistration.student.user.id}`).emit("new-notification", {
        //   id: notification.id,
        //   title: notification.title,
        //   message: notification.message,
        //   createdAt: notification.createdAt,
        // });
        const htmlTemplate = `<!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <title>Payment Rejected</title>
            <style>
                body {
                font-family: Arial, sans-serif;
                background-color: #f6f8fa;
                padding: 20px;
                }
                .container {
                max-width: 600px;
                margin: auto;
                background: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                .header {
                background-color: #4b0082;
                padding: 20px;
                color: white;
                text-align: center;
                }
                .logo {
                max-width: 120px;
                margin-bottom: 10px;
                }
                .content {
                padding: 30px;
                line-height: 1.6;
                color: #333333;
                }
                .btn {
                background-color: #4b0082;
                color: white !important;
                text-decoration: none;
                padding: 12px 20px;
                border-radius: 5px;
                display: inline-block;
                margin-top: 20px;
                }
                .footer {
                font-size: 12px;
                text-align: center;
                color: #999999;
                padding: 15px;
                }
                .login-details {
                background-color: #f2f2f2;
                padding: 15px;
                border-radius: 5px;
                margin-top: 15px;
                font-family: monospace;
                }
            </style>
            </head>
            <body>
            <div class="container">
                <div class="header">
                <img src="`+logoUrl+`" alt="Olympiad Logo" class="logo" />
                <h2>Olympiad Portal</h2>
                </div>
                <div class="content">
                <h3>Dear Student,</h3>
                <p>We regret to inform you that your recent payment for the Olympiad registration has been <strong>rejected</strong> due to issues in the submitted receipt or transaction.</p>

                <p>Please log in to your student dashboard and re-upload a valid payment receipt or contact the support team for assistance.</p>

                <div class="login-details">
                    <p><strong>Login Portal:</strong> <a href="`+loginUrl+`" target="_blank">`+loginUrl+`</a></p>
                    <p><strong>Username:</strong> `+studentCnic+`</p>
                    <p><strong>Password:</strong> `+studentPassword+`</p>
                </div>

                <a href="`+loginUrl+`" class="btn">Go to Student Portal</a>

                <p>If you believe this was an error, please reach out to our support team at <a href="mailto:support@yourdomain.com">support@yourdomain.com</a>.</p>

                <p>Thank you,<br />Olympiad Registration Team</p>
                </div>
                <div class="footer">
                &copy; 2025 Olympiad Organization. All rights reserved.
                </div>
            </div>
        </body>
        </html> `;

        const info = await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: latestRegistration.student.email || '',
            subject: 'Olympiad Payment Rejected – Action Required to Complete Registration',
            html: htmlTemplate,
        });

        console.log('Email sent:', info.messageId);
    }

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error('[PATCH /registrations/by-student]', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
