import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// 🔄 Reusable email sender
async function sendLoginDetailsEmail(student) {
  const logoUrl = `${process.env.APP_URL}/favicon.ico`;
  const loginUrl = `${process.env.APP_URL}/`;
  const studentCnic = "UIN" + (student.rollNo || "");
  const studentPassword = student.cnicNumber || "";

  const htmlTemplate = `
  <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto;">
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="${logoUrl}" alt="School Logo" style="max-height: 60px;" />
    </div>

    <h2 style="color: #4CAF50;">Welcome to the Student Portal 🎓</h2>

    <p>Dear Student,</p>
    <p>Your login details are as follows:</p>

    <table style="margin: 15px 0; border-collapse: collapse; width: 100%;">
      <tr>
        <td style="padding: 8px; font-weight: bold;">🔗 Login URL:</td>
        <td style="padding: 8px;">
          <a href="${loginUrl}" target="_blank" style="color: #1a73e8;">${loginUrl}</a>
        </td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: bold;">👤 Username (CNIC):</td>
        <td style="padding: 8px;">${studentCnic}</td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: bold;">🔐 Password:</td>
        <td style="padding: 8px;">${studentPassword}</td>
      </tr>
    </table>

    <p>✅ Please log in and change your password on first use.</p>
    <p>For help, contact <a href="mailto:support@yourschool.edu">support@yourschool.edu</a>.</p>

    <br />
    <p>Best regards,<br /><strong>Your School Administration</strong></p>
    <hr style="margin-top: 30px;" />
    <p style="font-size: 12px; color: #888;">This is an automated message. Please do not reply.</p>
  </div>
  `;

  const info = await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: student.email || '',
    subject: '🎓 Your Student Portal Login Details',
    html: htmlTemplate,
  });

  console.log('Email sent:', info.messageId);
}

export async function POST(req) {
  const body = await req.json();
  const { type, cnicNumber, rollNo } = body;

  if (!type || (type !== "recover-username" && type !== "reset-password")) {
    return NextResponse.json({ error: "Invalid request type." }, { status: 400 });
  }

  try {
    let student;

    if (type === "recover-username") {
      if (!cnicNumber) {
        return NextResponse.json({ error: "cnicNumber is required." }, { status: 400 });
      }

      student = await prisma.student.findUnique({
        where: { cnicNumber },
        include: { user: true },
      });

      if (!student || !student.user) {
        return NextResponse.json({ error: "User not found for CNIC." }, { status: 404 });
      }

      await sendLoginDetailsEmail(student);

      return NextResponse.json({
        type: "recover-username",
        message: `Username found and sent to ${student.email}`,
        username: student.user.username,
        email: student.email,
      });
    }

    if (type === "reset-password") {
      if (!rollNo) {
        return NextResponse.json({ error: "rollNo is required." }, { status: 400 });
      }

      student = await prisma.student.findFirst({
        where: { rollNo },
        include: { user: true },
      });

      if (!student || !student.user) {
        return NextResponse.json({ error: "User not found for Roll No." }, { status: 404 });
      }

      await sendLoginDetailsEmail(student);

      return NextResponse.json({
        type: "reset-password",
        message: `Password reset email sent to ${student.email}`,
        userId: student.user.id,
        cnicNumber: student.cnicNumber,
        email: student.email,
      });
    }

  } catch (error) {
    console.error("Recovery error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
