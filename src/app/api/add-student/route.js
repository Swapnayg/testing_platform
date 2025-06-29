// app/api/students/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';
import { clerkClient } from "@clerk/nextjs/server";
import nodemailer from 'nodemailer';
import { UserRole, NotificationType } from '@prisma/client';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});


function uuidTo6DigitNumber() {
  const uuid = uuidv4(); // Generate UUID
  const hash = parseInt(uuid.replace(/-/g, '').slice(0, 12), 16); // Convert part of UUID to number
  const sixDigit = hash % 900000 + 100000; // Ensure 6 digits
  return sixDigit;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const existing = await prisma.student.findUnique({
      where: { cnicNumber: body.cnicNumber },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Student with this CNIC already exists." },
        { status: 400 }
      );
    }
    
    var rollNo = await uuidTo6DigitNumber();   
    const user = await clerkClient.users.createUser({
      username: "UIN" + rollNo.toString(),
      password: body.cnicNumber || '',
      publicMetadata: { role: "student" }
    });

    const newStudent = await prisma.user.create({
      data: {
        name: "UIN" + rollNo.toString(),
        role: UserRole.student,
        cnicNumber: body.cnicNumber, // must match Student
      },
    });
    const student = await prisma.student.create({
      data: {
        id: user.id,
        name: body.name,
        fatherName: body.fatherName,
        dateOfBirth: new Date(body.dateOfBirth),
        religion: body.religion,
        gender: body.gender,
        cnicNumber: body.cnicNumber,
        profilePicture: body.profilePicture,
        email: body.email,
        mobileNumber: body.mobileNumber,
        city: body.city,
        stateProvince: body.stateProvince,
        addressLine1: body.addressLine1,
        instituteName: body.instituteName,
        others: "",
        rollNo: "UIN" + rollNo.toString(),
        gradeId: parseInt(body.gradeId),
      },
    });

    const logoUrl = `${process.env.APP_URL}/favicon.ico`;
    const loginUrl = `${process.env.APP_URL}/`;
    const studentCnic = "UIN" + rollNo.toString();
    const studentPassword = body.cnicNumber || '';

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
        from: process.env.GMAIL_USER,
        to: body.email || '',
        subject: '🎓 Welcome Aboard! Your Portal Login Details',
        html: htmlTemplate,
    });

    console.log('Email sent:', info.messageId);


    return NextResponse.json({ student }, { status: 201 });
  } catch (error) {
    console.error("Failed to add student:", error);

    // Prisma unique constraint error
    if (error?.code === "P2002") {
        return NextResponse.json({ error: "Duplicate CNIC found!" }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}
