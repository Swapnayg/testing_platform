// /api/schedule/updateExamStatus.ts
export const runtime = 'edge';

import prisma from '@/lib/prisma'; // adjust this to your setup

export async function declareResultsForTomorrow() {
  const now = new Date();
  const tomorrowStart = new Date(now);
  tomorrowStart.setDate(now.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setHours(23, 59, 59, 999);

  // 1. Find exams whose resultDate is tomorrow
  const exams = await prisma.exam.findMany({
    where: {
      resultDate: {
        gte: tomorrowStart,
        lte: tomorrowEnd,
      },
    },
    select: { id: true },
  });

  const examIds = exams.map((exam) => exam.id);
  if (examIds.length === 0) return { message: "No exams found for tomorrow." };

  // 2. Update all results for those exams
  const updated = await prisma.result.updateMany({
    where: {
      examId: {
        in: examIds,
      },
    },
    data: {
      resultDeclared: true,
    },
  });

  return {
    updatedCount: updated.count,
    exams: examIds,
  };
}

export default async function handler() {
  const result = await declareResultsForTomorrow();
  return new Response(JSON.stringify(result), { status: 200 });
}
