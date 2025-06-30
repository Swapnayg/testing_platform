import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";

export async function POST(req) {
  const body = await req.json();
  const { content, senderId, receiverId, chatId, groupId, chatType } = body;

  const message = await prisma.message.create({
    data: {
      content,
      senderId,
      receiverId,
      chatId,
      groupId,
      chatType,
      isRead: false, // Set isRead explicitly
    },
    include: { sender: true },
  });

  await pusherServer.trigger(`chat-${message.chatId}`, "new-message", message);

  return NextResponse.json(message);
}
