// app/api/results/declared-today/route.js
import prisma from '@/lib/prisma';
import { NextResponse } from "next/server";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return new Response(JSON.stringify({ error: 'Username is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const today = new Date();
  const start = startOfDay(today);
  const end = endOfDay(today);

  const results = await prisma.result.findMany({
    where: {
      resultDeclared: true,
      declaredOn: {
        gte: start,
        lte: end,
      },
      studentId: username, // 👈 Add this line
    },
    include: {
      exam: true,
      student: true,
    },
  });

  return NextResponse.json(results);
}
