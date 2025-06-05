// app/api/cron/daily/route.js
import prisma from "./prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  console.log("✅ Every Day 12 pm Exam Cron job triggered at", new Date());

 
  return new Response(JSON.stringify({ message: "Cron executed" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
