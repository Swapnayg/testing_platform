// app/api/cron/daily/route.js
import prisma from "./prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  console.log("✅ Cron job triggered at", new Date());

  const dateOnly = new Date(today.toISOString().split('T')[0]);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yes_dateOnly = new Date(yesterday.toISOString().split('T')[0]); 
    await prisma.exam.updateMany({
      where: {
        startTime: dateOnly, // exactly today
        endTime: {
          gte: today, // still ongoing or ends today
        },
      },
      data: {
        status: 'IN_PROGRESS',
      },
    });
  
    await prisma.exam.updateMany({
      where: {
        endTime: yes_dateOnly,
      },
      data: {
        status: 'COMPLETED',
      },
    });
  
    await prisma.result.updateMany({
      where: {
        status: "NOT_GRADED",
        endTime: yes_dateOnly,
      },
      data: {
        status: 'ABSENT',
      },
    });

  return new Response(JSON.stringify({ message: "Cron executed" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
