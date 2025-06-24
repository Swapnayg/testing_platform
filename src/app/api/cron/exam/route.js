
import prisma from '@/lib/prisma';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const examsToday = await prisma.exam.findMany({
    where: {
      createdAt: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
    select: { id: true },
  });

  const examIds = examsToday.map(exam => exam.id);

  const results = await Promise.allSettled(
    examsToday.map(exam =>
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/cron/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId: exam.id, examIds }),
      }).then(async res => ({
        examId: exam.id,
        status: res.status,
        data: await res.json(),
      }))
    )
  );

  return new Response(JSON.stringify({ message: "Triggered", results }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

}

