// app/api/students/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";// adjust path to your prisma instance



function getUnreadSummaryForUser(userId, messages, users) {
  const senderMap = new Map();

  // Initialize senderMap with all users EXCEPT the logged-in user
  for (const user of users.filter((u) => u.id !== userId)) {
    senderMap.set(user.id, {
      id: user.id,
      name: user.name,
      role: user.role,
      unreadByChat: [],
    });
  }

  // Group unread messages RECEIVED by logged-in user
  for (const msg of messages) {
    if (
      msg.receiver?.id !== userId || // Must be received by current user
      msg.sender?.id === undefined ||
      !senderMap.has(msg.sender.id)
    ) {
      continue;
    }

    const senderData = senderMap.get(msg.sender.id);
    if (!senderData) continue;
    const chatId = msg.chatId;

    const existing = senderData.unreadByChat.find((c) => c.chatId === chatId);
    if (existing) {
      if (!msg.isRead) existing.count += 1;
    } else {
      senderData.unreadByChat.push({
        chatId,
        count: msg.isRead ? 0 : 1,
      });
    }
  }

  return Array.from(senderMap.values());
}


export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = parseInt(searchParams.get("userId") || "", 10);

  if (isNaN(userId)) {
    return new Response(JSON.stringify({ error: "Invalid userId" }), { status: 400 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        role: true,
      },
    });

    const messages = await prisma.message.findMany({
      where: {
        chatType: 'STUDENT',
      },
      select: {
        chatId: true,
        isRead: true,
        sender: {
          select: { id: true, name: true },
        },
        receiver: {
          select: { id: true, name: true },
        },
      },
    });
    

    const result = getUnreadSummaryForUser(userId, messages, users);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}
