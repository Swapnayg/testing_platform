// pages/api/grades.ts
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from 'next/server';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const grades = await prisma.grade.findMany({
      select: {
        id: true,
        level: true,
        category: {
          select: {
            catName: true,
          },
        },
      },
    });

    return NextResponse.json({ grades }, { status: 200 });
  } catch (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json({ error: 'Error fetching grades.' }, { status: 500 });
  }
}
