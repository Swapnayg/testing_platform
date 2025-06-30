import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const type = searchParams.get("type"); // "student" | "group"
  const id = parseInt(searchParams.get("id") || "0");
  const senderId = parseInt(searchParams.get("senderId") || "0");

  if (!type || !id || !senderId) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  if (type === "group") {
    // Fetch group with chatId
    const group = await prisma.groupChat.findUnique({
      where: { id },
      include: { chat: true },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // If chat already exists, return it
    if (group.chatId) {
      return NextResponse.json({ chatId: group.chatId });
    }

    // Create chat
    const chat = await prisma.chat.create({
      data: {
        name: group.name,
        isGroup: true,
      },
    });

    // Link chatId to GroupChat
    await prisma.groupChat.update({
      where: { id },
      data: { chatId: chat.id },
    });

    // Add participants (assumes ChatParticipant already links User + Chat)
    const groupParticipants = await prisma.chatParticipant.findMany({
      where: { groupId: id },
      select: { userId: true },
    });

    await prisma.chatParticipant.createMany({
      data: groupParticipants.map((p) => ({
        userId: p.userId,
        chatId: chat.id,
        groupId: id,
      })),
      skipDuplicates: true,
    });

    return NextResponse.json({ chatId: chat.id });
  }

  // Handle direct student chat (optional logic)
  if (type === "student") {
    const receiverId = id;

    // Check if chat already exists
    let chat = await prisma.chat.findFirst({
      where: {
        isGroup: false,
        participants: {
          every: {
            OR: [
              { userId: senderId },
              { userId: receiverId },
            ],
          },
        },
      },
      include: { participants: true },
    });

    if (chat) {
      return NextResponse.json({ chatId: chat.id });
    }

    // Create new 1-1 chat
    chat = await prisma.chat.create({
      data: {
        isGroup: false,
        participants: {
          create: [
            { user: { connect: { id: senderId } } },
            { user: { connect: { id: receiverId } } },
          ],
        },
      },
    });

    return NextResponse.json({ chatId: chat.id });
  }

  return NextResponse.json({ error: "Invalid chat type" }, { status: 400 });
}
