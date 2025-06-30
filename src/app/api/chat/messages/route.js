// /api/chat/messages/route.ts
import { NextResponse } from "next/server";
import prisma from '@/lib/prisma';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  
  const chatId = Number(searchParams.get("chatId"));
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

  return NextResponse.json(messages);
}
