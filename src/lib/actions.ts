"use server";

import { revalidatePath } from "next/cache";
import nodemailer from 'nodemailer';
import jsPDF from 'jspdf';
import {
  ClassSchema,
  ExamSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
  FormSchema
} from "./formValidationSchemas";
import prisma from "./prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from 'uuid';
import cron from 'node-cron';

type CurrentState = { success: boolean; error: boolean };

const today = new Date();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER!,
    pass: process.env.GMAIL_PASS!,
  },
});

cron.schedule('0 0 * * *', async () => {
  console.log('Archiving old results...');
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

});


export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.subject.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};




function uuidTo6DigitNumber() {
  const uuid = uuidv4(); // Generate UUID
  const hash = parseInt(uuid.replace(/-/g, '').slice(0, 12), 16); // Convert part of UUID to number
  const sixDigit = hash % 900000 + 100000; // Ensure 6 digits
  return sixDigit;
}

export const createStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  console.log(data);
  try {


    var rollNo = uuidTo6DigitNumber();

    
    const user = await clerkClient.users.createUser({
      username: "UIN" + rollNo.toString(),
      password: data.cnicNumber || '',
      publicMetadata:{role:"student"}
    });

    await prisma.student.create({
      data: {
        id:user.id,
        name: data.name || '',
        fatherName: data.fatherName || '',
        dateOfBirth: data.dateOfBirth || '',
        religion: data.religion || '',
        gender: data.gender || '', // Removed because 'gender' is not a valid field in Student model
        cnicNumber: data.cnicNumber || '',
        profilePicture: data.profilePicture || '',
        email: data.email || '',
        mobileNumber: data.mobileNumber || '',
        city: data.city || '',
        stateProvince: data.stateProvince || '',
        addressLine1: data.addressLine1 || '',
        instituteName: data.instituteName || '',
        others: "",
        rollNo: "UIN" + rollNo.toString(),
      },
    });

  const logoUrl = `${process.env.APP_URL}/favicon.ico`;
  const loginUrl = `${process.env.APP_URL}/`;
  const studentCnic = "UIN" + rollNo.toString();
  const studentPassword = data.cnicNumber || '';

  const htmlTemplate = `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto;">
  <!-- Logo -->
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="` + logoUrl + `" alt="School Logo" style="max-height: 60px;" />
  </div>

  <h2 style="color: #4CAF50;">Welcome to the Student Portal 🎓</h2>

  <p>Dear Student,</p>

  <p>You have been successfully registered on the <strong>Student Portal</strong>. Below are your login details:</p>

  <table style="margin: 15px 0; border-collapse: collapse; width: 100%;">
    <tr>
      <td style="padding: 8px; font-weight: bold; width: 30%;">🔗 Login URL:</td>
      <td style="padding: 8px;">
        <a href="` + loginUrl + `" target="_blank" style="color: #1a73e8;">` + loginUrl + `</a>
      </td>
    </tr>
    <tr>
      <td style="padding: 8px; font-weight: bold;">👤 Username (CNIC):</td>
      <td style="padding: 8px;"> ` + studentCnic + `</td>
    </tr>
    <tr>
      <td style="padding: 8px; font-weight: bold;">🔐 Password:</td>
      <td style="padding: 8px;"> ` + studentPassword + `</td>
    </tr>
  </table>

  <p>✅ Please log in using the above credentials. You will be asked to change your password upon first login.</p>

  <p>If you experience any issues, contact us at <a href="mailto:support@yourschool.edu">support@yourschool.edu</a>.</p>

  <br />
  <p>Best regards,<br /><strong>Your School Administration</strong></p>

  <hr style="margin-top: 30px;" />
  <p style="font-size: 12px; color: #888;">This is an automated message. Please do not reply directly to this email.</p>
</div>

    `;


  const info = await transporter.sendMail({
    from: process.env.GMAIL_USER!,
    to: data.email || '',
    subject: '🎓 Welcome Aboard! Your Portal Login Details',
    html: htmlTemplate,
  });

  console.log('Email sent:', info.messageId);

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {

    await prisma.student.update({
      where: {
        cnicNumber: data.cnicNumber,
      },
      data: {
        name: data.name || '',
        fatherName: data.fatherName || '',
        dateOfBirth: data.dateOfBirth || '',
        religion: data.religion || '',
        profilePicture: data.profilePicture || '',
        email: data.email || '',
        mobileNumber: data.mobileNumber || '',
        city: data.city || '',
        stateProvince: data.stateProvince || '',
        addressLine1: data.addressLine1 || '',
        instituteName: data.instituteName || '',
        others: "",
      },
    });
    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  const user = await prisma.student.findFirst({
      where: { id },
  });
  try {
    if (user?.id) {
      await clerkClient.users.deleteUser(id);
      // First, find the registration record by studentId (cnicNumber)
      const registration = await prisma.registration.findMany({
        where: {
          studentId: user.cnicNumber.toString(),
        },
      });

      if (registration) {
        for (var i =0; i < registration.length ; i++)
        {
          await prisma.registration.delete({
            where: {
              id: registration[i].id,
          },
        });
      }
    }
    await prisma.student.delete({
      where: {
        cnicNumber: user.cnicNumber.toString().trim(),
      },
    });
    }

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {

  try {
    console.log(data);
    await prisma.exam.create({
      data: {
        title: data.title,
        categoryId: data.categoryId,
        gradeId: data.gradeId,
        subjectId: data.subjectId,
        startTime: data.startTime,
        endTime: data.endTime,
        totalMCQ: data.totalMCQ,
        totalMarks: data.totalMarks,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {

  try {

    await prisma.exam.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        categoryId: data.categoryId,
        gradeId: data.gradeId,
        subjectId: data.subjectId,
        startTime: data.startTime,
        endTime: data.endTime,
        totalMCQ: data.totalMCQ,
        totalMarks: data.totalMarks,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    await prisma.exam.delete({
      where: {
        id: id,
        // ...(role === "teacher" ? { lesson: { teacherId: userId! } } : {}),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export async function createRegistration(data: { name: string; status: "PENDING" | "APPROVED" | "REJECTED"; fatherName: string; registerdAt: Date; dateOfBirth: Date; religion: string; cnicNumber: string; email: string; mobileNumber: string; city: string; stateProvince: string; addressLine1: string; instituteName: string; olympiadCategory: string; bankName: string; accountTitle: string; accountNumber: string; totalAmount: string; transactionId: string; dateOfPayment: Date; paymentOption: string; otherName: string; applicationId: string; gender: "male" | "female" | "other"; confirmEmail: string; catGrade: string; id?: number | undefined; profilePicture?: any; transactionReceipt?: any; }) {
  try {
    var rollNo = uuidTo6DigitNumber();
    const user = await clerkClient.users.createUser({
      username: "UIN" + rollNo.toString(),
      password: data.cnicNumber || '',
      publicMetadata:{role:"student"}
    });
  
  const student =  await prisma.student.create({
    data: {
      id: user.id,// Ensure 'id' is provided in the data argument
      name: data.name || '',
      fatherName: data.fatherName || '',
      dateOfBirth: data.dateOfBirth || '',
      religion: data.religion || '',
      gender: data.gender || '',
      cnicNumber: data.cnicNumber || '',
      profilePicture: data.profilePicture || '',
      email: data.email || '',
      mobileNumber: data.mobileNumber || '',
      city: data.city || '',
      stateProvince: data.stateProvince || '',
      addressLine1: data.addressLine1 || '',
      instituteName: data.instituteName || '',
      others: "",
      rollNo: "UIN" + rollNo.toString(),
    }
  });
  const examList = await prisma.exam.findMany({
    where: {
      startTime: {
        gt: new Date(),
      },
      category: {
        catName: data.olympiadCategory || '',
      },
      grade: {
      level:  data.catGrade || '',
      },
    },
    });
    console.log(examList);

    const newRegistration = await prisma.registration.create({
      data: {
        olympiadCategory: data.olympiadCategory || '',
        catGrade : data.catGrade || '',
        bankName: data.bankName || '',
        accountTitle: data.accountTitle || '',
        accountNumber: data.accountNumber || '',
        totalAmount: data.totalAmount || '',
        transactionId: data.transactionId || '',
        dateOfPayment: data.dateOfPayment ? data.dateOfPayment.toISOString() : '',
        paymentOption: data.paymentOption || null,
        otherName: data.otherName || '',
        transactionReceipt: data.transactionReceipt || '',
        applicationId: data.applicationId || '',
        status: data.status || '',
        registerdAt : new Date().toISOString(),
        studentId: student.cnicNumber
      },
    });


    await prisma.examOnRegistration.createMany({
        data: examList.map((exam: { id: any; }) => ({
        examId: exam.id,
        registrationId: newRegistration.id,
      })),
      skipDuplicates: true,
    });
    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};


export const updateReject = async (
  id: number // or string, depending on your schema
) => {
  try {
    const register = await prisma.registration.findUnique({
      where: { id },
    });
    if (register?.id) {
      const user = await prisma.student.findUnique({
        where: { cnicNumber: register.studentId },
      });
      if (user?.id) {

        await prisma.registration.update({
          where: {
            id: id,
          },
          data: {
            status: "REJECTED",
          },
        });
        const logoUrl = `${process.env.APP_URL}/favicon.ico`;
        const loginUrl = `${process.env.APP_URL}/`;
        const studentCnic =  user.rollNo || '';
        const studentPassword = user.cnicNumber || '';

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
    from: process.env.GMAIL_USER!,
    to: user.email || '',
    subject: 'Olympiad Payment Rejected – Action Required to Complete Registration',
    html: htmlTemplate,
  });

  console.log('Email sent:', info.messageId);
      }  
    }
    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};


export async function generatePDFDocument(): Promise<Blob> {
  const doc = new jsPDF();

  doc.text('Hello, this is your generated PDF!', 10, 10);

  const pdfBlob = doc.output('blob');
  return pdfBlob;
}



export const updateAccept = async (
  id: number // or string, depending on your schema
) => {
  try {
    const register = await prisma.registration.findUnique({
      where: { id },
    });
    if (register?.id) {
      const user = await prisma.student.findUnique({
        where: { cnicNumber: register.studentId },
      });
      if (user?.id) {
        const examList = await prisma.examOnRegistration.findMany({
          where: {
            registrationId :id
          }, 
        });
        
        if (examList.length === 0) {
          console.log('No exams found for this registration');
          return;
        }
        const examIds = examList.map(er => er.examId);
        const exams = await prisma.exam.findMany({
          where: { id: { in: examIds } },
        });

        try {
         for (const ex of exams) { 
            await prisma.result.create({
            data: {
              examId: ex.id,
              studentId: user.cnicNumber,
              status: "NOT_GRADED",
              score: 0,
              startTime: new Date(ex.startTime),
              endTime: new Date(ex.endTime),
            },
        });
      }   
      } catch (error) {
      }

      await prisma.registration.update({
        where: {
          id: id,
        },
        data: {
          status: "APPROVED",
        },
      });
      const logoUrl = `${process.env.APP_URL}/favicon.ico`;
      const loginUrl = `${process.env.APP_URL}/`;
      const studentCnic =  user.rollNo || '';
      const studentPassword = user.cnicNumber || '';

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
        const fileName = `Test-slip-${user.rollNo || 'student'}-${Date.now()}.pdf`;
        const info = await transporter.sendMail({
          from: process.env.GMAIL_USER!,
          to: user.email || '',
          subject: 'Olympiad Payment Rejected – Action Required to Complete Registration',
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
      }  
    }
    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};
