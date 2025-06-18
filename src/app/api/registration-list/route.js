import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";// adjust this path based on your project structure

export async function GET() {
  try {
    const registrations = await prisma.registration.findMany({
      include: {
        student: true,
        exams: {
          include: {
            exam: {
              include:{
                subject:true,
              }
            },
          },
        },
      },
      orderBy: {
        registerdAt: 'desc',
      },
    });

    const enrichedData = registrations.map((reg, index) => {
      const student = reg.student;
      const quizzes = reg.exams.map(e => e.exam.title).join(', ');
      const subjects = reg.exams.map(e => e.exam.subject.name).join(', ');
      const quizCount = reg.exams.length;
      const fee = parseFloat(reg.totalAmount || '0') || 0;
      const revenue = reg.status === 'APPROVED' ? fee : 0;

       // Normalize and capitalize status
      let paymentStatus = 'Pending';
      if (reg.status === 'APPROVED') paymentStatus = 'Approved';
      else if (reg.status === 'REJECTED') paymentStatus = 'Rejected';

      return {
        id: index + 1,
        name: student?.name || 'N/A',
        studentId: `ST-2024-${String(index + 1).padStart(3, '0')}`,
        rollNumber: student?.rollNo || 'N/A',
        type: quizCount > 1 ? 'Returning' : 'First Time',
        email: student?.email || 'N/A',
        phone: student?.mobileNumber || 'N/A',
        regNumber: student?.cnicNumber || '',
        quiz: quizzes || 'No quiz',
        date: reg.registerdAt.toLocaleDateString('en-US'),
        fee: `Rs. ${fee}`,
        paymentStatus: paymentStatus,
        revenue: `Rs. ${revenue}`,
        quizzes: `${quizCount} quiz${quizCount !== 1 ? 'zes' : ''}`,
        avatar: student?.profilePicture || '/default-avatar.png',
        subject:subjects || 'No subject',
      };
    });

    return NextResponse.json(enrichedData);
  } catch (error) {
    console.error('Error generating registration list:', error);
    return NextResponse.json(
      { error: 'Failed to load registration list' },
      { status: 500 }
    );
  }
}
