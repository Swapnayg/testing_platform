// Handles: GET (list), POST (create)

import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma"; // or wherever your prisma client is

export async function GET() {
  const data = await prisma.announcement.findMany({
    include: {
      grades: true,
      exams: true,
    },
    orderBy: { date: 'desc' },
  });
  return NextResponse.json(data);
}

export async function POST(req) {
  const body = await req.json();
  const { title, description, resultDate, type, gradeIds, examIds } = body;

  const newAnnouncement = await prisma.announcement.create({
    data: {
      title,
      description,
      resultDate: type === "EXAM_RESULT" ? new Date(resultDate) : null, // ✅ Set null for GENERAL
      announcementType: type,
      isForAll: !!gradeIds?.length && type === "GENERAL",
      grades: gradeIds ? { connect: gradeIds.map(id => ({ id })) } : undefined,
      exams: examIds ? { connect: examIds.map(id => ({ id })) } : undefined,
    },
  });


  // Step 2: If EXAM_RESULT, update resultDate in associated exams
  if (type === "EXAM_RESULT" && resultDate) {
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


  return NextResponse.json(newAnnouncement);
}