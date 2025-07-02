import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // adjust path if needed

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      select: { id: true, name: true }, // change `name` to your actual column name
    });

    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}
