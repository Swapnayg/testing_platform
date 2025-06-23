// app/api/results/declared-today/route.js
import prisma from '@/lib/prisma';
import { NextResponse } from "next/server";
import { startOfDay, endOfDay } from "date-fns";

export async function GET() {
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
    },
    include: {
      exam: true,
      student: true,
    },
  });

  return NextResponse.json(results);
}
