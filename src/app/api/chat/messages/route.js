// /api/chat/messages/route.ts
import { NextResponse } from "next/server";
import prisma from '@/lib/prisma';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  
  const chatId = Number(searchParams.get("chatId"));
  const currentUserId = Number(searchParams.get("currentUserId"));

  if (!chatId || !currentUserId) {
    return NextResponse.json({ error: "chatId and currentUserId are required" }, { status: 400 });
  }


  // Mark unread messages from the opposite person as read
  await prisma.message.updateMany({
    where: {
      chatId,
      isRead: false,
      receiverId: currentUserId, // ✅ Not "not"
    },
    data: {
      isRead: true,
    },
  });


  // Fetch all messages
  const messages = await prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: "asc" },
    include: {
      sender: {
        select: { id: true, name: true },
      },
      receiver: {
        select: { id: true, name: true },
      },
    },
  });

  console.log(messages);

  return NextResponse.json(messages);
}
