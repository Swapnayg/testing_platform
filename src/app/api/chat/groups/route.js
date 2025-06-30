// app/api/chat/groups/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const groups =  await prisma.groupChat.findMany({
      include: {
        chat: {
          include: {
            participants: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(groups);
  } catch (err) {
    return NextResponse.json({ error: "Failed to load groups" }, { status: 500 });
  }
}
