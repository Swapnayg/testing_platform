
import prisma from '@/lib/prisma';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  console.log("🧪 Runtime ENV:", {
  NODE_ENV: process.env.NODE_ENV,
  CRON_SECRET: !!process.env.CRON_SECRET,
  GMAIL_USER: !!process.env.GMAIL_USER,
  DATABASE_URL: !!process.env.DATABASE_URL,
});

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

  const results = [];

  for (const exam of examsToday) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/cron/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId: exam.id, examIds:examIds }),
      });
      const data = await res.json();
      results.push({ examId: exam.id, status: res.status, data });
    } catch (err) {
      console.error(`Failed to process exam ${exam.id}`, err);
    }
  }

  return new Response(JSON.stringify({ message: "Triggered", results }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

