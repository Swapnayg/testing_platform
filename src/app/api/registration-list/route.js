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
                include: {
                  subject: true,
                },
              },
            },
          },
        },
        orderBy: {
          registerdAt: 'desc', // latest registrations come first
        },
      });

      // Step 1: Track total registrations per student
      const studentRegCount = {};
      registrations.forEach((reg) => {
        const studentId = reg.student?.cnicNumber;
        if (studentId) {
          studentRegCount[studentId] = (studentRegCount[studentId] || 0) + 1;
        }
      });

      // Step 2: Build unique latest registrations
      const uniqueStudentMap = new Map();

      for (const [index, reg] of registrations.entries()) {
        const student = reg.student;
        const studentId = student?.cnicNumber;
        if (!studentId || uniqueStudentMap.has(studentId)) continue;

        const quizzes = reg.exams.map((e) => e.exam.title).join(', ');
        const subjects = reg.exams.map((e) => e.exam.subject.name).join(', ');
        const quizCount = reg.exams.length;
        const fee = parseFloat(reg.totalAmount || '0') || 0;
        const revenue = reg.status === 'APPROVED' ? fee : 0;

        let paymentStatus = 'Pending';
        if (reg.status === 'APPROVED') paymentStatus = 'Approved';
        else if (reg.status === 'REJECTED') paymentStatus = 'Rejected';

        uniqueStudentMap.set(studentId, {
          id: index + 1,
          name: student?.name || 'N/A',
          studentId: student?.id,
          rollNumber: student?.rollNo || 'N/A',
          type: studentRegCount[studentId] > 1 ? 'Returning' : 'First Time',
          email: student?.email || 'N/A',
          phone: student?.mobileNumber || 'N/A',
          regNumber: student?.cnicNumber || '',
          quiz: quizzes || 'No quiz',
          date: reg.registerdAt.toLocaleDateString('en-US'),
          fee: `Rs. ${fee}`,
          paymentStatus,
          revenue: `Rs. ${revenue}`,
          quizzes: `${quizCount} quiz${quizCount !== 1 ? 'zes' : ''}`,
          avatar: student?.profilePicture || '/default-avatar.png',
          subject: subjects || 'No subject',
          transactionReceipt: reg.transactionReceipt?.toString() || '',
        });
      }

      // Step 3: Convert map values to array
      const uniqueStudents = Array.from(uniqueStudentMap.values());

      return NextResponse.json(uniqueStudents);

  } catch (error) {
    console.error('Error generating registration list:', error);
    return NextResponse.json(
      { error: 'Failed to load registration list' },
      { status: 500 }
    );
  }
}
