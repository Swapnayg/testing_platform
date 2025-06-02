"use server";

import { revalidatePath } from "next/cache";
import nodemailer from 'nodemailer';
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


    const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER!,
      pass: process.env.GMAIL_PASS!,
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
        id: parseInt(id),
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

export async function createRegistration(data: { name: string; status: "pending" | "approved" | "rejected"; fatherName: string; registerdAt: Date; dateOfBirth: Date; religion: string; cnicNumber: string; email: string; mobileNumber: string; city: string; stateProvince: string; addressLine1: string; instituteName: string; olympiadCategory: string; bankName: string; accountTitle: string; accountNumber: string; totalAmount: string; transactionId: string; dateOfPayment: Date; paymentOption: string; otherName: string; applicationId: string; gender: "male" | "female" | "other"; confirmEmail: string; catGrade: string; id?: number | undefined; profilePicture?: any; transactionReceipt?: any; }) {
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

    await prisma.registration.create({
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

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateRegistration = async (
  currentState: CurrentState,
  data: FormSchema
) => {
  try {
    await prisma.registration.update({
      where: {
        id: data.id,
      },
      data: {
        status: data.status,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};
