// Handles: GET (list), POST (create)

import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma"; // or wherever your prisma client is
import { UserRole, NotificationType } from '@prisma/client';


async function getUserIdByNameAndRole(name, role) {
  const user = await prisma.user.findFirst({
    where: {
      name,
      role: role,
    },
    select: {
      id: true,
    },
  });

  return user?.id ?? null;
}

async function notifyStudentsForAnnouncement(announcementId) {
  const adminUserId = await getUserIdByNameAndRole("admin", "admin");
    if (adminUserId === null) {
      throw new Error("Admin user not found. Cannot send notification.");
  }
  const announcement = await prisma.announcement.findUnique({
    where: { id: announcementId },
    include: {
      grades: true,
      exams: true,
    },
  });

  if (!announcement) return;

  let students = [];

  if (announcement.announcementType === 'GENERAL') {
    const gradeIds = announcement.grades.map((g) => g.id);

    if (gradeIds.length === 0) return;

    students = await prisma.student.findMany({
      where: {
        gradeId: { in: gradeIds },
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  if (announcement.announcementType === 'EXAM_RESULT') {
    const examIds = announcement.exams.map((e) => e.id);

    if (examIds.length === 0) return;

    students = await prisma.student.findMany({
      where: {
        Registration: {
          some: {
            exams: {
              some: {
                examId: { in: examIds },
              },
            },
          },
        },
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  if (!students.length) return;

  const notifications = students.map((student) => ({
    senderId: adminUserId, // admin/system
    senderRole: UserRole.admin,
    receiverId: student.user.id,
    receiverRole: UserRole.student,
    type: announcement.announcementType === 'GENERAL' ? NotificationType.GENERAL : NotificationType.RESULT_ANNOUNCED,
    title: announcement.title,
    message:
      announcement.announcementType === 'GENERAL'
        ? `New announcement: ${announcement.title}`
        : `Result has been declared for: ${announcement.title}`,
  }));

  await prisma.notification.createMany({
    data: notifications,
    skipDuplicates: true,
  });
}


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

  await notifyStudentsForAnnouncement(newAnnouncement.id);

  return NextResponse.json(newAnnouncement);
}