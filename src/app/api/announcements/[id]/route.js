import prisma from "@/lib/prisma";
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
  const body = await req.json();
  const { id } = params;
  const {
    title,
    description,
    resultDate,
    type, // GENERAL or EXAM_RESULT
    gradeIds = [],
    examIds = [],
    isForAll,
  } = body;

  // Step 1: Clear and update the announcement
  const updatedAnnouncement = await prisma.announcement.update({
    where: { id: parseInt(id) },
    data: {
      title,
      description,
      resultDate: type === "EXAM_RESULT" ? new Date(resultDate) : null, // ✅ Set null for GENERAL
      announcementType: type,
      isForAll: !!gradeIds?.length && type === "GENERAL",
      grades: {
        set: gradeIds.map(id => ({ id })), // 👈 Clears and sets new grades
      },
      exams: {
        set: examIds.map(id => ({ id })), // 👈 Clears and sets new exams
      },
    },
  });

  // Step 2: If EXAM_RESULT, update resultDate on selected exams
  if (type === "EXAM_RESULT" && resultDate && examIds.length > 0) {
    await prisma.exam.updateMany({
      where: {
        id: { in: examIds },
        resultDate: null,
        status: "COMPLETED",
      },
      data: {
        resultDate: new Date(resultDate),
      },
    });
  }

  return NextResponse.json(updatedAnnouncement);
}

export async function DELETE(req, { params }) {
  const { id } = params;

  if (!id) {
    return new Response(JSON.stringify({ error: "ID not provided" }), { status: 400 });
  }

  try {
    await prisma.announcement.delete({
      where: { id: parseInt(id) },
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to delete" }), { status: 500 });
  }
}

