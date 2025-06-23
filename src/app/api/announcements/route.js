// Handles: GET (list), POST (create)

import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma"; // or wherever your prisma client is

export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      include: { grades: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(announcements);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
        const { title, description, gradeIds = [], resultDate } = await req.json();

        const isForAll = gradeIds.length === 0;

        // ✅ Create announcement with optional grade associations
        const announcement = await prisma.announcement.create({
        data: {
            title,
            description,
            isForAll,
            resultDate: resultDate ? new Date(resultDate) : null, // ensure date is valid
            grades: {
            connect: isForAll ? [] : gradeIds.map((id) => ({ id })),
            },
        },
        });

        // ✅ Optionally update resultDate in exams (if given)
        if (resultDate && !isForAll) {
        await prisma.exam.updateMany({
            where: {
            gradeId: { in: gradeIds },
            resultDate: null, // only update if not set
            },
            data: {
            resultDate: new Date(resultDate),
            },
        });
        }
    return NextResponse.json(announcement);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
  }
}
