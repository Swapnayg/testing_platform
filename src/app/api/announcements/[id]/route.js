import prisma from "@/lib/prisma";
import { NextResponse } from 'next/server';
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
    senderId: adminUserId,
    senderRole: 'admin',
    receiverId: student.user.id,
    receiverRole: 'student',
    type: announcement.announcementType === 'GENERAL'
      ? NotificationType.GENERAL
      : NotificationType.RESULT_ANNOUNCED,
    title: `${announcement.title} (Updated)`, // Optional: show that it's updated
    message:
      announcement.announcementType === 'GENERAL'
        ? `📢 The announcement titled "${announcement.title}" has been updated.`
        : `📊 The result announcement for "${announcement.title}" has been updated.`,
  }));

  await prisma.notification.createMany({
    data: notifications,
    skipDuplicates: true,
  });
}


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
        status: "COMPLETED",
      },
      data: {
        resultDate: new Date(resultDate),
      },
    });
  }

  await notifyStudentsForAnnouncement(updatedAnnouncement.id);

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

