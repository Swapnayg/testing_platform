// app/api/students/[id]/route.js

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // adjust this path if needed
import { clerkClient } from '@clerk/nextjs/server';

export async function DELETE(req, context) {
  const { id } = context.params;

  try {
    const user = await prisma.student.findFirst({
      where: { id },
    });

    if (user?.id) {
      // Delete user from Clerk
      await clerkClient.users.deleteUser(id);

      // Delete from local database using CNIC
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
