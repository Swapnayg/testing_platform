// app/api/chat/group/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

export async function POST(req) {
  try {
    const { groupName, participantIds, createdBy, role } = await req.json();

    const adminUserId = await getUserIdByNameAndRole(createdBy, role);
      if (adminUserId === null) {
        throw new Error("Admin user not found. Cannot send notification.");
    }

    // Basic validation
    if (!groupName || !participantIds || participantIds.length < 1) {
      return NextResponse.json(
        { error: "Group name and at least one participant are required." },
        { status: 400 }
      );
    }

    // Create the group chat
    const chat = await prisma.chat.create({
      data: {
        name: groupName,
        isGroup: true,
        createdAt: new Date(),
        participants: {
          create: participantIds.map((userId) => ({ userId })),
        },
      },
      include: {
        participants: {
          include: { user: true },
        },
      },
    });

    // Step 2: Create GroupChat entry linked to the above Chat
    const groupChat = await prisma.groupChat.create({
      data: {
        name: groupName,
        createdById: adminUserId,
        chatId: chat.id, // 🔗 Link the Chat
      },
    });

    return NextResponse.json(chat, { status: 201 });
  } catch (error) {
    console.error("Error creating group chat:", error);
    return NextResponse.json(
      { error: "Failed to create group chat." },
      { status: 500 }
    );
  }
}
