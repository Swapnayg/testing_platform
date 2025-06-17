import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from 'next/server';


const generateApplicationId = () => {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 15; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return result;
  };

export async function POST(req) {
  try {
    const body = await req.json(); // ✅ fix: extract body properly
    const { data,studentId } = body;

    if (!data) {
      return NextResponse.json({ message: 'Student is required' }, { status: 400 });
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
        studentId: studentId
      },
    });
    
    await prisma.examOnRegistration.create({
      data: {
        examId: data.examId,
        registrationId: newRegistration.id,
      }
    });
      
    return NextResponse.json({ success: true, error: false }, { status: 200 });
  } catch (error) {
    console.error("POST /quiz error:", error); // ✅ debug logging
    return NextResponse.json({ error: 'Failed to fetch quiz data' }, { status: 500 });
  }
}
