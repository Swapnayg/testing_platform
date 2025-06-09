"use server";

import { revalidatePath } from "next/cache";
import { QuizData, Question } from '@/components/quiz/types';
import nodemailer from 'nodemailer';
import jsPDF from 'jspdf';
import {
  ExamSchema,
  StudentSchema,
  SubjectSchema,
} from "./formValidationSchemas";
import prisma from "./prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from 'uuid';

type CurrentState = { success: boolean; error: boolean };

const today = new Date();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER!,
    pass: process.env.GMAIL_PASS!,
  },
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

export async function generatePDFDocument1(id: number, exams: any[], student: { rollNo: any; cnicNumber: any; name: any; fatherName: any; category: string; grade: string; instituteName: any; }): Promise<Buffer> {
const doc = new jsPDF();
    // Page 1 - Student Information
    console.log(exams)
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
      { label: 'Category/Class:', value: student?.category  + " " + student?.grade },
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
        const examList = await prisma.examOnRegistration.findMany({
          where: {
            registrationId :id
          }, 
        });
        
        if (examList.length === 0) {
          console.log('No exams found for this registration');
        }
        const examIds = examList.map(er => er.examId);
        const exams = await prisma.exam.findMany({
          where: { id: { in: examIds } },
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
            grade:{
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
        grade: data.quiz.grade || '',
        subject: data.quiz.subject || '',
        totalQuestions: data.quiz.totalQuestions,
        totalMarks: data.quiz.totalMarks,
        startDateTime: data.quiz.startDateTime ? new Date(data.quiz.startDateTime) : new Date(),
        endDateTime: data.quiz.endDateTime ? new Date(data.quiz.endDateTime) : new Date(),
        // Provide valid values for category and exam as required by your schema
        category: data.quiz.category, // Replace with actual categoryId
        examId: data.quiz.examId ,         // Replace with actual examId
      },
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
          correctAnswer: question.correctAnswer || null,
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
