import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const registrations = await prisma.registration.findMany({
      select: {
        studentId: true,
        status: true,
        totalAmount: true,
      },
    });

    const studentCounts = {};
    let totalRevenue = 0;
    let approvedCount = 0;
    let pendingCount = 0;

    for (const reg of registrations) {
      studentCounts[reg.studentId] = (studentCounts[reg.studentId] || 0) + 1;

      if (reg.status === 'APPROVED') {
        approvedCount++;
        const cleanedAmount = parseFloat((reg.totalAmount || '0').replace(/[^0-9.]/g, ''));
        totalRevenue += cleanedAmount;
      } else if (reg.status === 'PENDING') {
        pendingCount++;
      }
    }

    const totalUniqueStudents = Object.keys(studentCounts).length;
    const firstTimeStudents = Object.values(studentCounts).filter(c => c === 1).length;
    const repeatedStudents = Object.values(studentCounts).filter(c => c > 1).length;

    return NextResponse.json({
      totalUniqueStudents,
      firstTimeStudents,
      repeatedStudents,
      approvedPayments: approvedCount,
      pendingPayments: pendingCount,
      totalRevenue,
    });
  } catch (error) {
    console.error('Error fetching student summary:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
