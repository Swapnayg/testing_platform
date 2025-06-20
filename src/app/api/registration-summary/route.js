import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const registrations = await prisma.registration.findMany({
      select: {
        status: true,
        totalAmount: true,
      },
    });

    let total = registrations.length;
    let approved = 0;
    let pending = 0;
    let rejected = 0;
    let revenue = 0;

    for (const reg of registrations) {
      const cleanedAmount = parseFloat((reg.totalAmount || '0').replace(/[^0-9.]/g, ''));
      const amount = cleanedAmount || 0;

      switch (reg.status) {
        case 'APPROVED':
          approved++;
          revenue += amount;
          break;
        case 'PENDING':
          pending++;
          break;
        case 'REJECTED':
          rejected++;
          break;
      }
    }

    return NextResponse.json({
      totalRegistrations: total,
      approved,
      pending,
      rejected,
      totalRevenue: revenue,
    });
  } catch (error) {
    console.error('Error fetching registration summary:', error);
    return NextResponse.json({ error: 'Failed to load summary' }, { status: 500 });
  }
}
