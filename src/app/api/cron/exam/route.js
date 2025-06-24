import prisma from '@/lib/prisma';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    console.log("⛔ Unauthorized access attempt with secret:", secret);
    return new Response("Unauthorized", { status: 401 });
  }

  console.log("✅ Cron job authorized and triggered.");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  console.log(`🗓️ Fetching exams created between ${todayStart.toISOString()} and ${todayEnd.toISOString()}`);

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
  console.log(`📋 Found ${examIds.length} exam(s) today:`, examIds);

  const results = await Promise.allSettled(
    examsToday.map(exam => {
      console.log(`🚀 Triggering process for exam ID: ${exam.id}`);
      return fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/cron/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId: exam.id, examIds }),
      })
        .then(async res => {
          const data = await res.json();
          console.log(`✅ Response for exam ${exam.id}:`, data);
          return {
            examId: exam.id,
            status: res.status,
            data,
          };
        })
        .catch(err => {
          console.error(`❌ Failed to process exam ${exam.id}`, err);
          return {
            examId: exam.id,
            status: 500,
            data: { error: err.message },
          };
        });
    })
  );

  console.log("🏁 Cron job completed. Final results:", results);

  return new Response(JSON.stringify({ message: "Triggered", results }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
