import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from 'next/server';
import { UserRole, NotificationType } from '@prisma/client';
// import { getIO } from "@/lib/socket";


const generateApplicationId = () => {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 15; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return result;
  };

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

export async function POST(req) {
  try {
    const body = await req.json(); // ✅ fix: extract body properly
    const { data,studentId } = body;

    if (!data) {
      return NextResponse.json({ message: 'Student is required' }, { status: 400 });
    }
    const studentByRoll = await prisma.student.findFirst({
      where: { rollNo: studentId },
      select: {
        id: true,
        rollNo: true,
        cnicNumber: true,
        user: {
          select: {
            id: true, // User.id
          },
        },
      },
    });

    const adminUserId = await getUserIdByNameAndRole("admin", "admin");
      if (adminUserId === null) {
        throw new Error("Admin user not found. Cannot send notification.");
    }
    const applicationId = generateApplicationId();
    const newRegistration = await prisma.registration.create({
      data: {
        olympiadCategory: data.category || '',
        catGrade : data.grade || '',
        bankName: data.bankName || '',
        accountTitle: data.accountTitle || '',
        accountNumber: data.accountNumber || '',
        totalAmount: data.totalAmount || '',
        transactionId: data.transactionId || '',
        dateOfPayment: data.dateOfPayment ?  new Date(data.dateOfPayment).toISOString() : '',
        paymentOption: data.paymentOption || null,
        otherName: data.otherName || '',
        transactionReceipt: data.transactionReceiptName || '',
        applicationId: applicationId,
        status: 'PENDING',
        registerdAt : new Date().toISOString(),
        studentId: studentByRoll.cnicNumber,
      },
    });
    
    await prisma.examOnRegistration.create({
      data: {
        examId: data.examId,
        registrationId: newRegistration.id,
      }
    });

    const notification = await prisma.notification.create({
      data: {
        senderId: studentByRoll.user.id,
        senderRole: UserRole.student,
        receiverId: adminUserId,
        receiverRole: UserRole.admin,
        type: NotificationType.QUIZ_APPLIED,
        title: "Quiz Applied",
        message: `${studentId.toUpperCase()} has applied for the upcoming quiz.`,
      },
    });
    // const io = getIO();
    // io.to(`user_${adminUserId}`).emit("new-notification", {
    //   id: notification.id,
    //   title: notification.title,
    //   message: notification.message,
    //   createdAt: notification.createdAt,
    // });
      
    return NextResponse.json({ success: true, error: false }, { status: 200 });
  } catch (error) {
    console.error("POST /quiz error:", error); // ✅ debug logging
    return NextResponse.json({ error: 'Failed to fetch quiz data' }, { status: 500 });
  }
}
