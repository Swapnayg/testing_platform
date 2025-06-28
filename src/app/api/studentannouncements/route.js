// Handles: GET (list), POST (create)

import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma"; // or wherever your prisma client is

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

 // Get student by roll number
  const student = await prisma.student.findFirst({
    where: { rollNo: username.toUpperCase() },
    select: {
      id: true,
      gradeId: true,
      cnicNumber:true,
    },
  });

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }
  // Get approved registrations for the student
  const registrations = await prisma.registration.findMany({
    where: {
      studentId: student?.cnicNumber,
      status: "APPROVED",
    },
    select: {
      id: true,
      exams: {
        select: {
          examId: true,
        },
      },
    },
  });

  const examIds = registrations
    .flatMap((reg) => reg.exams.map((e) => e.examId));

  // Fetch announcements relevant to student
  const announcements = await prisma.announcement.findMany({
    where: {
      OR: [
        {
          announcementType: "GENERAL",
          grades: {
            some: { id: student.gradeId },
          },
        },
        {
          announcementType: "EXAM_RESULT",
          exams: {
            some: {
              id: {
                in: examIds,
              },
            },
          },
        },
      ],
    },
    include: {
      grades: true,
      exams: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  return NextResponse.json(announcements);
}
