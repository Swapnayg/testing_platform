import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function POST(req, { params }) {
  const { id } = params;
  try {
    const { title, description, gradeIds, resultDate } = await req.json();

    const isForAll = gradeIds.length === 0;

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
            where: {
            gradeId: { in: gradeIds },
            resultDate: null,
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
