// app/api/students/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma"; // adjust this path based on your project setup
import { clerkClient } from "@clerk/nextjs/server";

type Context = {
  params: {
    id: string;
  };
};

export async function DELETE(req: Request, context: Context) {
  const { id } = await context.params;

  try {
    const user = await prisma.student.findFirst({
      where: { id },
    })
    if (user?.id) {
      await clerkClient.users.deleteUser(id);
      await prisma.student.delete({
        where: {
          cnicNumber: user.cnicNumber,
        },
      });
    }

    return NextResponse.json({ message: 'Student deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}
