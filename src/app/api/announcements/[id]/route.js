import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function POST(req, { params }) {
  const { id } = params;
  try {
    const { title, description, gradeIds, resultDate } = await req.json();

    const isForAll = gradeIds.length === 0;

    // Step 1: Get previous gradeIds linked to this announcement
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id: parseInt(id) },
      include: { grades: true },
    });

    const previousGradeIds = existingAnnouncement?.grades.map((g) => g.id) || [];

    // Step 2: Clear resultDate for exams of previous grades
    if (previousGradeIds.length > 0) {
      await prisma.exam.updateMany({
        where: {
          status: 'COMPLETED',
          grades: {
            some: {
              id: { in: previousGradeIds },
            },
          },
        },
        data: {
          resultDate: null,
        },
      });
    }

    const updated = await prisma.announcement.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        isForAll,
        resultDate: resultDate ? new Date(resultDate) : null, 
        grades: {
          set: gradeIds.map((gid) => ({ id: gid })), // reset relation
        },
      },
    });
    if (resultDate && gradeIds.length > 0) {
      await prisma.exam.updateMany({
        status: 'COMPLETED',
        where: {
          grades: {
            some: {
              id: { in: gradeIds },
            },
          },
          resultDate: null, // only update if not already set
        },
        data: {
          resultDate: new Date(resultDate),
        },
      });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  const { id } = params;
  try {
    await prisma.announcement.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 });
  }
}
