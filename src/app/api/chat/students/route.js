// app/api/students/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";// adjust path to your prisma instance

export async function GET() {
  try {
    // Step 1: Get all students
    const students = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        role: true,
      },
    });

    // Step 2: Group unread messages by senderId and chatId
    const unreadGrouped = await prisma.message.groupBy({
      by: ['chatId', 'senderId'],
      where: {
        isRead: false,
      },
      _count: {
        _all: true,
      },
    });

    // Step 3: Merge counts with student list
    const studentsWithUnread = students.map(student => {
      const studentChats = unreadGrouped.filter(g => g.senderId === student.id);
      return {
        ...student,
        unreadByChat: studentChats.map(chat => ({
          chatId: chat.chatId,
          count: chat._count._all,
        })),
        totalUnread: studentChats.reduce((sum, c) => sum + c._count._all, 0),
      };
    });

    console.log(studentsWithUnread);

    return NextResponse.json(studentsWithUnread);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}
