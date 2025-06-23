// app/api/cron/daily/route.js

import nodemailer from 'nodemailer';
import prisma from "@/lib/prisma";
import { generatePDFDocument } from "@/lib/actions";
import { startOfMinute, endOfMinute } from 'date-fns';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  console.log("✅ Step: Cron job triggered at", new Date());
  const now = new Date();
  const startOfCurrentMinute = startOfMinute(now); // e.g., 2025-06-19T10:15:00.000Z
  const endOfCurrentMinute = endOfMinute(now);     // e.g., 2025-06-19T10:15:59.999Z

  await prisma.exam.updateMany({
    where: {
      status: "NOT_STARTED",
      startTime: {
        gte: startOfCurrentMinute,
        lte: endOfCurrentMinute,
      },
    },
    data: {
      status: 'IN_PROGRESS',
    },
  });

await prisma.exam.updateMany({
  where: {
    status: "IN_PROGRESS",
    endTime: {
      gte: startOfCurrentMinute,
      lte: endOfCurrentMinute,
    },
  },
  data: {
    status: 'COMPLETED',
  },
});

  await prisma.result.updateMany({
    where: {
      status: "NOT_GRADED",
      endTime: {
        gte: startOfCurrentMinute,
        lte: endOfCurrentMinute,
      },
    },
    data: {
      status: 'ABSENT',
    },
  });

  console.log("✅ Step: Cron job finished successfully");

  return new Response(JSON.stringify({ message: "Cron executed" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
