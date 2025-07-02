"use server";

import { revalidatePath } from "next/cache";
import { QuizData, Question } from '@/components/quiz/types';
import nodemailer from 'nodemailer';
import jsPDF from 'jspdf';
// import { getIO } from "@/lib/socket";
import {
  ExamSchema,
  StudentSchema,
  SubjectSchema,
} from "./formValidationSchemas";
import prisma from "./prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from 'uuid';
import { UserRole, NotificationType } from '@prisma/client';

// const io = getIO();
type CurrentState = { success: boolean; error: boolean };
const today = new Date();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER!,
    pass: process.env.GMAIL_PASS!,
  },
});

async function getUserIdByNameAndRole(name: string, role: string): Promise<number | null> {
  const user = await prisma.user.findFirst({
    where: {
      name,
      role: role as UserRole,
    },
    select: {
      id: true,
    },
  });

  return user?.id ?? null;
}


type StudentExamMap = {
  [studentId: string]: {
    email: string;
    rollNo: string;
    registrations: {
      registrationId: number;
      registrationNumber: string;
      title: string;
      subject: string;
      startTime: string;
      endTime: string;
      totalMCQ: string;
      totalMarks: string;
      cnicNumber: string;
    }[];
  };
};

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
  try {
    var rollNo = uuidTo6DigitNumber();
    const user = await clerkClient.users.createUser({
      username: "UIN" + rollNo.toString(),
      password: data.cnicNumber || '',
      publicMetadata:{role:"student"}
    });


    const newStudent = await prisma.user.create({
      data: {
        name: "UIN" + rollNo.toString(),
        role: UserRole.student,
        cnicNumber: data.cnicNumber || '', // must match Student
      },
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
        gradeId: data.gradeId !== undefined && data.gradeId !== null ? Number(data.gradeId) : undefined,
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
  
    try {
      // Find the student by internal Prisma `id` field
      const student = await prisma.student.findFirst({
        where: { id },
      });

      if (!student) {
        throw new Error("Student not found.");
      }

      // Delete the user from Clerk
      await clerkClient.users.deleteUser(id);

      // Delete related registrations
      await prisma.registration.deleteMany({
        where: {
          studentId: student.cnicNumber.toString(),
        },
      });

      // Delete the student record
      await prisma.student.delete({
        where: {
          cnicNumber: student.cnicNumber.toString().trim(),
        },
      });

      // Delete from user table using rollNo
      const rollNo = student.rollNo?.toString().trim();
      if (rollNo) {
        await prisma.user.deleteMany({
          where: {
            name: rollNo,
          },
        });
      }

      console.log("✅ Student and related records deleted successfully.");

    } catch (error) {
      console.error("❌ Error deleting student:", error);
    }

};

export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {

  try {
    const createdExam = await prisma.exam.create({
      data: {
        title: data.title,
        categoryId: data.categoryId,
        subjectId: data.subjectId,
        startTime: data.startTime,
        endTime: data.endTime,
        totalMCQ: data.totalMCQ,
        totalMarks: data.totalMarks,
        timeLimit: data.timeLimit,

        // 👇 Connect multiple grades
        grades: {
          connect: data.grades.map((gradeId: number) => ({ id: gradeId })),
        },
      },
    });

    // ✅ Step 1: Get all students with matching gradeIds
    const students = await prisma.student.findMany({
      where: {
        gradeId: { in: data.grades },
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    const adminUserId = await getUserIdByNameAndRole("admin", "admin");
      if (adminUserId === null) {
        throw new Error("Admin user not found. Cannot send notification.");
    }

    // ✅ Step 2: Prepare notifications// or fetch admin ID separately
    const notifications = students.flatMap((student) =>
      student.user
        ? [{
            senderId: adminUserId,
            senderRole: UserRole.admin,
            receiverId: student.user.id,
            receiverRole: UserRole.student,
            type: NotificationType.EXAM_CREATED,
            title: "New Exam Created",
            message: `A new exam "${createdExam.title}" has been scheduled.`,
          }]
        : []
    );

    // ✅ Step 3: Send notifications
    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications,
        skipDuplicates: true,
      });
    }

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
    const updateExam = await prisma.exam.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        categoryId: data.categoryId,
        // 👇 Connect multiple grades
       grades: {
          set: data.grades.map((gradeId: number) => ({ id: gradeId })),
        },
        subjectId: data.subjectId,
        startTime: data.startTime,
        endTime: data.endTime,
        totalMCQ: data.totalMCQ,
        totalMarks: data.totalMarks,
        timeLimit: data.timeLimit,
      },
    });

    const examWithId = await prisma.exam.findUnique({
      where: { id: data.id },
      include: {
        grades: {
          include: {
            category: true,
          },
        }, // pulls in the Grade relation
        subject:true,
      },
    });

    // ✅ Step 1: Get all students with matching gradeIds
    const students = await prisma.student.findMany({
      where: {
        gradeId: { in: data.grades },
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    const adminUserId = await getUserIdByNameAndRole("admin", "admin");
      if (adminUserId === null) {
        throw new Error("Admin user not found. Cannot send notification.");
    }

    // ✅ Step 2: Prepare notifications// or fetch admin ID separately
    const notifications = students.flatMap((student) =>
      student.user
        ? [{
            senderId: adminUserId,
            senderRole: UserRole.admin,
            receiverId: student.user.id,
            receiverRole: UserRole.student,
            type: NotificationType.EXAM_CREATED,
            title: "Exam Updated",
            message: `An exam "${updateExam.title}" has been updated.`,
          }]
        : []
    );

    // ✅ Step 3: Send notifications
    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications,
        skipDuplicates: true,
      });
    }
    try{
        await prisma.quiz.update({
          where: {examId: data.id },
          data: { 
            title: data.title,
            grades:  examWithId?.grades.map(grade => grade.level).join(', ') || '',
            subject: examWithId?.subject.name || '',
            totalQuestions:  data.totalMCQ,
            totalMarks: data.totalMarks,
            timeLimit: data.timeLimit,
            startDateTime: data.startTime ? new Date(data.startTime) : new Date(),
            endDateTime: data.endTime ? new Date(data.endTime) : new Date(),
            // Provide valid values for category and exam as required by your schema
            category: examWithId?.grades[0]?.category?.catName || '', // Use the first grade's category name
          },
        });
      }
      catch{
        console.log("Quiz not found");
      }
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

export async function createRegistration(data: { name: string; status: "PENDING" | "APPROVED" | "REJECTED"; fatherName: string; registerdAt: Date; dateOfBirth: Date; religion: string; cnicNumber: string; email: string; mobileNumber: string; city: string; stateProvince: string; addressLine1: string; instituteName: string; olympiadCategory: string; bankName: string; accountTitle: string; accountNumber: string; totalAmount: string; transactionId: string; dateOfPayment: Date; paymentOption: string; otherName: string; applicationId: string; gender: "male" | "female" | "other"; confirmEmail: string; catGrade: string; id?: number | undefined; profilePicture?: any; transactionReceipt?: any; rollNo: string; }) {
  try {
    const user = await clerkClient.users.createUser({
      username: data.rollNo || '',
      password: data.cnicNumber || '',
      publicMetadata:{role:"student"}
    });

    const grade = await prisma.grade.findUnique({
      where: {
        level:  data.catGrade || '',
    },
    select: {
      id: true,
    },
  });

  
  if (grade) {

    const newStudent = await prisma.user.create({
      data: {
        name: data.rollNo,
        role: UserRole.student,
        cnicNumber: data.cnicNumber, // must match Student
      },
    });

    const student: any = await prisma.student.create({
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
      rollNo: data.rollNo.toString(),
      gradeId: grade.id, // Ensure 'gradeId' is provided in the data argument
    }
  });

    const now = new Date();
    const examList = await prisma.exam.findMany({
      where: {
        startTime: {
          gte: now, // "greater than or equal to current date & time"
        },
        category: {
          catName: data.olympiadCategory || '',
        },
        grades: {
          some: {
            level: data.catGrade || '',
          },
        },
      },
    });
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

    const adminUserId = await getUserIdByNameAndRole("admin", "admin");
    if (adminUserId === null) {
      throw new Error("Admin user not found. Cannot send notification.");
    }
    const notification = await prisma.notification.create({
      data: {
        senderId: newStudent.id,
        senderRole: UserRole.student,
        receiverId: adminUserId,
        receiverRole: UserRole.admin,
        type: NotificationType.STUDENT_REGISTERED,
        title: "Registration Completed",
        message: `Roll No: ${data.rollNo.toString()} - I have completed my registration.`,
      },
    });

    // io.to(`user_${Number(adminUserId)}`).emit("new-notification", {
    //   id: notification.id,
    //   title: notification.title,
    //   message: notification.message,
    //   createdAt: notification.createdAt,
    // });

    await prisma.examOnRegistration.createMany({
        data: examList.map((exam: { id: any; }) => ({
        examId: exam.id,
        registrationId: newRegistration.id,
      })),
      skipDuplicates: true,
    });
    // revalidatePath("/list/students");
  }
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


const addColoredSection = (doc: jsPDF, title: string, yPos: number, bgColor: [number, number, number], textColor: [number, number, number] = [255, 255, 255], topMargin: number = 0) => {
    const adjustedYPos = yPos + topMargin;
    
    // Check if we need a new page (section header + some content space)
    if (adjustedYPos > 250) {
      doc.addPage();
      return addColoredSection(doc, title, 30, bgColor, textColor, topMargin);
    }
    
    // Add colored background for section
    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.rect(15, adjustedYPos - 8, 180, 12, 'F');
    
    // Add section title
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(title, 20, adjustedYPos);
    
    // Reset text color to black
    doc.setTextColor(0, 0, 0);
    
    return adjustedYPos + 15;
  };

  const addTableRow = (doc: jsPDF, label: string, value: string, yPos: number, isEven: boolean = false) => {
    // Check if we need a new page
    if (yPos > 270) {
      doc.addPage();
      yPos = 40;
    }
    
    // Alternate row colors
    if (isEven) {
      doc.setFillColor(245, 245, 245);
      doc.rect(15, yPos - 6, 180, 10, 'F');
    }
    
    // Add table borders
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.rect(15, yPos - 6, 90, 10);
    doc.rect(105, yPos - 6, 90, 10);
    
    // Add content with consistent font size
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(label, 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(value || 'N/A', 110, yPos);
    
    return yPos + 10;
  };

  const addRedHighlight = (doc: jsPDF, text: string, x: number, y: number) => {
    doc.setTextColor(220, 20, 20); // Red color
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10); // Consistent font size
    doc.text(text, x, y);
    doc.setTextColor(0, 0, 0); // Reset to black
    doc.setFont("helvetica", "normal");
  };

export async function generatePDFDocument(id: number, exams: any[]): Promise<Buffer> {
 const doc = new jsPDF();
    const register = await prisma.registration.findUnique({
      where: { id: id }
    });
    const student = await prisma.student.findUnique({
      where: { cnicNumber: register?.studentId }
    });

    // Page 1 - Student Information
    doc.setFillColor(52, 152, 219); // Steel blue background
    doc.rect(0, 0, 210, 40, 'F');
    
    // Main title with white text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text('TEST INFORMATION CARD', 105, 25, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    let yPosition = 60;
    
    // Student Information Section
    yPosition = addColoredSection(doc, 'STUDENT INFORMATION', yPosition, [52, 152, 219]); // Blue
    
    const studentFields = [
      { label: 'Roll No:', value: student?.rollNo },
      { label: 'CNIC Number:', value: student?.cnicNumber},
      { label: 'Name:', value: student?.name},
      { label: 'Father Name:', value: student?.fatherName },
      { label: 'Category/Class:', value: register?.olympiadCategory  + " " + register?.catGrade },
      { label: 'School/College Name:', value: student?.instituteName}
    ];
    
    studentFields.forEach((field, index) => {
      return yPosition = addTableRow(
        doc,
        field.label,
        field.value !== undefined && field.value !== null ? String(field.value) : '',
        yPosition,
        index % 2 === 0
      );
    });
    
    yPosition += 15;
    
    // Multiple Test Information Sections with page breaking
    exams.forEach((test, testIndex) => {
      if (test.subject) {
        // Check if we need a new page for the test section
        if (yPosition > 200) {
          doc.addPage();
          yPosition = 30;
        }
        
        yPosition = addColoredSection(doc, `TEST INFORMATION - ${test.subject.toUpperCase()}`, yPosition, [46, 204, 113]); // Purple
        
        const testFields = [
          { label: 'Test Subject:', value: test.subject },
          { label: 'Start Time:', value: test.startTime },
          { label: 'End Time:', value: test.endTime },
          { label: 'Total Marks:', value: test.totalMCQ },
          { label: 'Total MCQs:', value: test.totalMarks },
        ];
        
        testFields.forEach((field, index) => {
          return yPosition = addTableRow(
            doc,
            field.label,
            field.value !== undefined && field.value !== null ? String(field.value) : '',
            yPosition,
            index % 2 === 0
          );
        });
        
        yPosition += 15;
      }
    });
    
    // Check if we need a new page for the important notice
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 30;
    }
    
    // Important Notice
    yPosition += 5;
    doc.setFillColor(231, 76, 60); // Tomato red background
    doc.rect(15, yPosition - 8, 180, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text('IMPORTANT: Keep this document safe for exam day', 105, yPosition, { align: 'center' });
    doc.text('Bring a valid ID and arrive 30 minutes early', 105, yPosition + 8, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    
    // Add new page for instructions
    doc.addPage();
    
    // Page 2 - Instructions
    yPosition = 30;
    
    // Page header
    doc.setFillColor(52, 152, 219 ); // Purple background
    doc.rect(0, 0, 210, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text('EXAMINATION GUIDELINES', 105, 17, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    
    // Exam Instructions Section with increased top margin
    yPosition = addColoredSection(doc, 'EXAM INSTRUCTIONS', yPosition, [231, 76, 60], [255, 255, 255], 10); // Red with 10px top margin
    
    doc.setFontSize(10); // Consistent font size
    doc.setFont("helvetica", "normal");
    
    const examInstructions = [
      'Read all instructions carefully before starting the exam.',
      'Fill in your personal details completely and correctly.',
      'Use only black or blue pen for marking answers.',
      'Mark only one answer for each question.',
      'Avoid overwriting or erasing answers.',
      'Mobile phones and electronic devices are strictly prohibited.',
      'Do not leave your seat without permission.',
      'Submit your answer sheet before time expires.',
      'Any form of cheating will result in disqualification.',
      'Remain silent throughout the examination.'
    ];
    
    examInstructions.forEach((instruction, index) => {
      if (index === 5 || index === 8) { // Highlight important rules in red
        addRedHighlight(doc, `${index + 1}. ${instruction}`, 20, yPosition);
      } else {
        doc.setFontSize(10); // Consistent font size
        doc.text(`${index + 1}. ${instruction}`, 20, yPosition);
      }
      yPosition += 8;
    });
    
    yPosition += 10;
    
    // Online Guidelines Section
    yPosition = addColoredSection(doc, 'ONLINE GUIDELINES', yPosition, [52, 152, 219]); // Blue
    
    const onlineGuidelines = [
      'Ensure stable internet connection before starting.',
      'Use updated browser (Chrome, Firefox, Safari).',
      'Close all unnecessary applications and browser tabs.',
      'Keep your device charged or connected to power.',
      'Test your webcam and microphone if required.',
      'Find a quiet, well-lit environment for the exam.',
      'Keep your ID document ready for verification.',
      'Do not refresh the browser during the exam.',
      'Submit answers before the timer expires.',
      'Contact technical support immediately if issues arise.'
    ];
    
    onlineGuidelines.forEach((guideline, index) => {
      if (index === 0 || index === 7 || index === 8) { // Highlight critical guidelines in red
        addRedHighlight(doc, `${index + 1}. ${guideline}`, 20, yPosition);
      } else {
        doc.setFontSize(10); // Consistent font size
        doc.text(`${index + 1}. ${guideline}`, 20, yPosition);
      }
      yPosition += 8;
    });
    
    // Add third page for additional information
    doc.addPage();
    
    // Page 3 - Additional Information
    yPosition = 30;
    
    // Page header
    doc.setFillColor(52, 152, 219); // Green background
    doc.rect(0, 0, 210, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text('ADDITIONAL INFORMATION', 105, 17, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    
    // Contact Information Section with increased top margin
    yPosition = addColoredSection(doc, 'CONTACT INFORMATION', yPosition, [46, 204, 113], [255, 255, 255], 15); // Purple with 15px top margin
    
    yPosition = addTableRow(doc, 'Technical Support:', '+1-800-EXAM-HELP', yPosition, true);
    yPosition = addTableRow(doc, 'Email Support:', 'support@examcenter.edu', yPosition, false);
    yPosition = addTableRow(doc, 'Emergency Contact:', '+1-800-EMERGENCY', yPosition, true);
    yPosition = addTableRow(doc, 'Exam Center Website:', 'www.examcenter.edu', yPosition, false);
    
    yPosition += 25;
    
    // What to Bring Section with increased top margin
    yPosition = addColoredSection(doc, 'WHAT TO BRING ON EXAM DAY', yPosition, [231, 76, 60], [255, 255, 255], 15); // Orange with 15px top margin
    
    const bringItems = [
      'Valid photo identification (ID card, passport, or driver\'s license)',
      'This printed test information card',
      'Black or blue pens (at least 2)',
      'Pencils and eraser for rough work',
      'Water bottle (clear, label removed)',
      'Any permitted calculators or tools (if applicable)'
    ];
    
    bringItems.forEach((item, index) => {
      if (index === 0 || index === 1) { // Highlight essential items in red
        addRedHighlight(doc, `• ${item}`, 20, yPosition);
      } else {
        doc.setFontSize(10); // Consistent font size
        doc.text(`• ${item}`, 20, yPosition);
      }
      yPosition += 8;
    });
    
    yPosition += 15;
    
    // Final Important Notice
    doc.setFillColor(231, 76, 60); // Red background
    doc.rect(15, yPosition - 8, 180, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text('FAILURE TO FOLLOW THESE GUIDELINES', 105, yPosition, { align: 'center' });
    doc.text('MAY RESULT IN EXAM DISQUALIFICATION', 105, yPosition + 10, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    
    // Add footer to all pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 285);
      doc.text(`Page ${i} of ${totalPages}`, 170, 285);
      doc.text('Please keep this document for your records.', 20, 290);
    }

  const arrayBuffer = doc.output('arraybuffer');
  const buffer = Buffer.from(arrayBuffer);
  return buffer;
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
        const exams = await prisma.exam.findMany({
          where: {
            grades: { some: { level: register.catGrade ?? '' } },
            category: { catName:  register.olympiadCategory ?? '' },
            status: {
              in: ["NOT_STARTED", "IN_PROGRESS"],
            },
          },
          select:
          {
            id:true,
            title:true,
            startTime:true,
            endTime:true,
            status:true,
            subjectId:true,
            totalMCQ:true,
            totalMarks:true,
            subject:{
              select: {
                name:true
              }
            },
            grades:{
              select:{
                level:true,
                category:{
                  select:{
                    catName:true
                  }
                }
              }
            }
          }
        });

        try {
         for (const ex of exams) { 
            await prisma.result.create({
            data: {
              examId: ex.id,
              studentId: user.cnicNumber,
              status: "NOT_GRADED",
              score: 0,
              totalScore:ex.totalMarks,
              grade:'',
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

      
      const buffer = await generatePDFDocument(id, formattedExams);
      const fileName = `Test-slip-${user.rollNo || 'student'}-${Date.now()}.pdf`;
      const info = await transporter.sendMail({
        from: process.env.GMAIL_USER!,
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
      }  
    }
    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};


export interface CreateQuizData {
  quiz: QuizData;
  questions: Question[];
}

export const saveQuizToDatabase = async (data: CreateQuizData) => {
  try {
    // Create the quiz first
    await prisma.quiz.deleteMany({
     where: {
        examId: data.quiz.examId ,
      },
    });

    const createdQuiz = await prisma.quiz.create({
      data: {
        title: data.quiz.title,
        subject: data.quiz.subject || '',
        totalQuestions: data.quiz.totalQuestions,
        totalMarks: data.quiz.totalMarks,
        timeLimit: data.quiz.timeLimit,
        startDateTime: new Date(data.quiz.startDateTime),
        endDateTime: new Date(data.quiz.endDateTime),
        category: data.quiz.category,
        examId: data.quiz.examId,
        // ✅ Connect multiple grades by IDs
        grades: Array.isArray(data.quiz.grades) ? data.quiz.grades.join(', ') : data.quiz.grades,
      }
    });

    console.log('Quiz created:', createdQuiz);

   // Create questions for the quiz
    const questionPromises = data.questions.map(async (question, index) => {
      const createdQuestion = await prisma.question.create({
        data: {
          quizId: createdQuiz.id,
          type: question.type.toUpperCase().replace('-', '_') as any,
          text: question.text,
          marks: question.marks,
          correctAnswer: question.type === 'MULTIPLE_CHOICE' && Array.isArray(question.options)
        ? question.options.find(opt => opt.isCorrect)?.text.toLowerCase() || null
        : question.correctAnswer || null,
          orderIndex: index + 1,
        },
      });

      console.log('Question created:', createdQuestion);

      // Create options if it's a multiple choice question
      if (question.options && question.options.length > 0) {
        const optionPromises = question.options.map(async (option, optionIndex) => {
          return await prisma.questionOption.create({
            data: {
              questionId: createdQuestion.id,
              text: option.text,
              isCorrect: option.isCorrect,
              orderIndex: optionIndex + 1,
            },
          });
        });

        const createdOptions = await Promise.all(optionPromises);
        console.log('Options created for question:', createdOptions);
      }

      return createdQuestion;
    });

    const createdQuestions = await Promise.all(questionPromises);
    console.log('All questions created:', createdQuestions);

    return {
      quiz: createdQuiz,
      questions: createdQuestions,
    };
  } catch (error) {
    console.error('Error saving quiz to database:', error);
    throw error;
  }
};


// Get all exams for the dropdown
export const getAllExams = async () => {
  return await prisma.exam.findMany({
  where: {
    status: "COMPLETED", // assuming enum ExamStatus has COMPLETED
  },
  orderBy: {
    endTime: 'desc',
  },
  include: {
    subject: true,
    grades: true,
    category: true,
  },
});
};


// lib/actions.ts

interface ExamResultFilter {
  examId: string;
  grade?: string;
  subject?: string;
}

export const getacceptedCount = async ({ examId }: { examId: string }) => {
  return await prisma.examOnRegistration.count({
  where: {
    examId: examId, // replace with your variable
    registration: {
      status: 'APPROVED', // ✅ replace with the exact enum value
    },
  },
});
};

export const getFilteredStudentDetails = async ({ username }: { username: string }) => {
  const studentByRoll =  await prisma.student.findFirst({
    where: { rollNo: username.toUpperCase() },
  });

  const results = await prisma.result.findMany({
    where: {
      resultDeclared: true,
      studentId: studentByRoll?.cnicNumber || '',
      quizAttempt: {
        isNot: null,
      },
    },
    include: {
      student: true,
      exam: {
        include: {
          grades: true,
          subject: true,
          category: true,
        },
      },
      quizAttempt: {
        include: {
          answers: {
            include: {
              question: {
                include: {
                  options: true,
                },
              },
              QuestionOption: true,
            },
          },
        },
      },
    },
  });

  // Get distinct exam IDs from results
  const examIds = [...new Set(results.map(r => r.examId))].filter((id): id is string => id !== null);

  // Fetch total participants per examId
  const participantCounts = await prisma.result.groupBy({
    by: ['examId'],
    where: {
      examId: { in: examIds },
      resultDeclared: true,
      quizAttempt: {
        isNot: null,
      },
    },
    _count: {
      examId: true,
    },
  });

  // Convert to a map: { examId: count }
  const participantsMap = Object.fromEntries(
    participantCounts.map(pc => [pc.examId, pc._count.examId])
  );

  // Attach totalParticipants to each result
  const enrichedResults = results.map(r => ({
    ...r,
    exam: {
      ...r.exam,
      totalParticipants: r.examId ? participantsMap[r.examId] || 0 : 0,
    },
  }));
  return enrichedResults;
};


export const getExamDetails = async ({ examId }: { examId: string }) => {
  return await prisma.exam.findUnique({
  where: {
    id: examId, // replace with your variable
  },
});
};

export const getFilteredExamResults = async ({
  examId,
  grade,
  subject,
}: ExamResultFilter) => {
  return await prisma.result.findMany({
  where: {
    examId: examId, // 🔁 Replace with actual exam ID
    status: {
      in: ['PASSED', 'FAILED'], // ✅ Only include PASSED or FAILED
    },
  },
  include: {
    student: true,
    exam: {
      include: {
        grades: true,
        subject: true,
        category: true, // optional, for more detail
      },
    },
    quizAttempt: {
      include: {
        answers: {
          include: {
            question: {
              include: {
                options: true,
              },
            },
            QuestionOption: true, // the selected option (if any)
          },
        },
      },
    },
  },
  orderBy: {
    score: 'desc',
  },
});
};

export async function assignStudentsToExams() {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const exams = await prisma.exam.findMany({
      where: {
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      include: {
        grades: true,
        category: true,
        subject: true,
      },
    });

    const studentExamMap: Record<string, { userId: string | null; email: string; cnicNumber: string; rollNo: string; registrations: any[] }> = {};

    for (const exam of exams) {
      for (const grade of exam.grades) {
        const registrations = await prisma.registration.findMany({
          where: {
            status: "APPROVED",
            olympiadCategory: exam.category.catName.toString(),
            catGrade: grade.level,
          },
          include: {
            student: {
            select: {
              id: true,
              rollNo: true,
              cnicNumber: true,
              email:true,
              name:true,
              user: true, // ✅ include full user info
            },
          },
          },
        });
        for (const reg of registrations) {
          const existing = await prisma.examOnRegistration.findFirst({
            where: {
              registrationId: reg.id,
            },
          });

          let shouldCreate = false;

          if (existing) {
            const alreadyAssignedExamIds = await prisma.examOnRegistration.findMany({
              where: {
                registrationId: reg.id,
                examId: {
                  in: exams.map((e) => e.id),
                },
              },
              select: {
                examId: true,
              },
            });

            const assignedExamIdSet = new Set(alreadyAssignedExamIds.map((e) => e.examId));

            if (!assignedExamIdSet.has(exam.id)) {
              shouldCreate = true;
            }
          } else {
            shouldCreate = true;
          }

          if (shouldCreate) {
            await prisma.examOnRegistration.create({
              data: {
                examId: exam.id,
                registrationId: reg.id,
              },
            });

            await prisma.result.create({
              data: {
                examId: exam.id,
                studentId: reg.studentId,
                status: "NOT_GRADED",
                score: 0,
                totalScore: exam.totalMarks,
                grade: '',
                startTime: new Date(exam.startTime),
                endTime: new Date(exam.endTime),
              },
            });

            // ✅ Track for email, registration, and student details
            if (!studentExamMap[reg.studentId]) {
              studentExamMap[reg.studentId] = {
                userId: reg.student.user?.id != null ? String(reg.student.user.id) : null, // ✅ Ensure userId is string or null
                email: reg.student.email!,
                cnicNumber: reg.student.cnicNumber,
                rollNo: reg.student.rollNo ?? '',
                registrations: [],
              };
            }

            studentExamMap[reg.studentId].registrations.push({
              registrationId: reg.id,
              registrationNumber: reg.applicationId ?? '',
              title: exam.title,
              subject: exam.subject.name,
              startTime: exam.startTime,
              endTime: exam.endTime,
              totalMCQ: exam.totalMCQ || 0,
              totalMarks: exam.totalMarks || 0,
            });
          }
        }
      }
    };

    const adminUserId = await getUserIdByNameAndRole("admin", "admin");
    if (adminUserId === null) {
      throw new Error("Admin user not found. Cannot send notification.");
    }

   for (const [studentId, { userId, email, rollNo, registrations }] of Object.entries(studentExamMap)) {

      if (userId !== null && userId !== undefined) {
        const notification = await prisma.notification.create({
          data: {
            senderId: adminUserId,
            senderRole: UserRole.admin,
            receiverId:  Number(userId),
            receiverRole: UserRole.student,
            type: NotificationType.EXAM_CREATED,
            title: "Exam Scheduled",
            message: `${rollNo.toUpperCase() || "A student"}your exam has been scheduled.`,
          },
        });

        // io.to(`user_${Number(userId)}`).emit("new-notification", {
        //   id: notification.id,
        //   title: notification.title,
        //   message: notification.message,
        //   createdAt: notification.createdAt,
        // });
      }
      
      const sortedRegistrations = [...registrations].sort((a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );

      const formattedExams = sortedRegistrations.map((registration) => ({
        title: registration.title,
        subject: registration.subject,
        startTime: new Date(registration.startTime).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        endTime: new Date(registration.endTime).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        registrationId: registration.registrationId,
        registrationNumber: registration.registrationNumber,
        totalMCQ: registration.totalMCQ,
        totalMarks: registration.totalMarks,
      }));
        const logoUrl = `${process.env.APP_URL}/favicon.ico`;
        const loginUrl = `${process.env.APP_URL}/`;
        const studentCnic = rollNo.toString();
        const studentPassword = registrations[0].cnicNumber || 'Not Provided';// ✅ use registration context

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

      const buffer = await generatePDFDocument(registrations[0].registrationId, formattedExams); // or use studentId if needed

      const fileName = `Test-slip-${rollNo || 'student'}-${Date.now()}.pdf`;

      const subject = `📘 Exam Scheduled: ${formattedExams[0].title} on ${formattedExams[0]?.startTime}`;

      await transporter.sendMail({
        from: process.env.GMAIL_USER!,
        to: email,
        subject: subject,
        html: htmlTemplate,
        attachments: [
          {
            filename: fileName,
            content: buffer,
            contentType: "application/pdf",
          },
        ],
      });
    }

    revalidatePath("/dashboard/exams");
    return { success: true };
  } catch (err) {
    console.error("❌ Error:", err);
    return { success: false, error: "Assignment failed" };
  }
}

export async function getStudentQuizStats(studentId: string) {
  const completedAttempts = await prisma.quizAttempt.count({
    where: {
      studentId,
      isSubmitted: true,
    },
  });

  const upcomingQuizzes = await prisma.examOnRegistration.findMany({
    where: {
      registration: {
        studentId,
      },
      exam: {
        quizzes: {
          startDateTime: {
            gt: new Date(),
          },
        },
      },
    },
    select: {
      exam: {
        select: {
          id: true,
          quizzes: {
            select: {
              title: true,
              startDateTime: true,
              subject: true,
            },
          },
        },
      },
    },
  });

  const results = await prisma.result.findMany({
    where: {
      studentId,
      score: { not: undefined },
      totalScore: { not: undefined },
    },
    include: {
      quizAttempt: {
        include: {
          quiz: true,
        },
      },
    },
  });

  // Average Quiz Score and Best Subject
  let totalScore = 0;
  let totalMax = 0;
  const subjectScores = new Map<string, { total: number; count: number }>();

  for (const result of results) {
    const score = result.score;
    const max = result.totalScore;
    const subject = result.quizAttempt?.quiz?.subject || "Unknown";

    if (score != null && max != null) {
      totalScore += score;
      totalMax += max;

      if (!subjectScores.has(subject)) {
        subjectScores.set(subject, { total: score, count: 1 });
      } else {
        const prev = subjectScores.get(subject)!;
        subjectScores.set(subject, {
          total: prev.total + score,
          count: prev.count + 1,
        });
      }
    }
  }

  const averageScore =
    results.length > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

  const overallScore = averageScore;

  let bestSubject = "N/A";
  let bestSubjectScore = 0;

  for (const [subject, { total, count }] of subjectScores.entries()) {
    const avg = total / count;
    if (avg > bestSubjectScore) {
      bestSubjectScore = avg;
      bestSubject = subject;
    }
  }

  return {
    quizCompleted: completedAttempts,
    upcomingQuizzes,
    averageScore,
    overallScore,
    bestSubject,
  };
}

export async function getAnnouncementsForStudent(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { cnicNumber: studentId },
    select: { gradeId: true },
  });

  const registrations = await prisma.registration.findMany({
    where: { studentId },
    include: {
      exams: {
        select: { examId: true },
      },
    },
  });

  const examIds = registrations.flatMap((reg) =>
    reg.exams.map((exam) => exam.examId)
  );

  return await prisma.announcement.findMany({
    where: {
      OR: [
        { isForAll: true },
        { grades: { some: { id: student?.gradeId ?? -1 } } },
        { exams: { some: { id: { in: examIds } } } },
      ],
    },
    orderBy: {
      date: "desc",
    },
    take: 10, // 👈 Fetch only top 10
  });
}


export async function getAnnouncements() {
  return await prisma.announcement.findMany({
    orderBy: {
      date: "desc",
    },
    take: 10, // 👈 Fetch only top 10
  });
}


export async function getUpcomingExams() {
  const now = new Date();

  const exams = await prisma.exam.findMany({
    where: {
      startTime: {
        gt: now,
      },
    },
    include: {
      subject: {
        select: {
          name: true,
        },
      },
      category: {
        select: {
          id: true,
          catName: true,
        },
      },
      grades: {
        select: {
          id: true,
          level: true,
        },
      },
    },
    orderBy: {
      startTime: "asc",
    },
  });

  return exams;
}


export async function getUpcomingExamsByStudentId(studentId: string) {
  const now = new Date();

  // 1. Get the student's gradeId
  const student = await prisma.student.findUnique({
    where: { cnicNumber: studentId },
    select: { gradeId: true },
  });

  if (!student) throw new Error("Student not found");

  // 2. Get all upcoming exams that are assigned to this grade
  const exams = await prisma.exam.findMany({
    where: {
      startTime: { gt: now },
      grades: {
        some: {
          id: student.gradeId ?? undefined,
        },
      },
    },
    include: {
      subject: {
        select: { name: true },
      },
      category: {
        select: { id: true, catName: true },
      },
      grades: {
        select: { id: true, level: true },
      },
    },
    orderBy: {
      startTime: "asc",
    },
  });

  return exams;
}
