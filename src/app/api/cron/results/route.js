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

  console.log("✅ Step: Results Cron job triggered at", new Date());
  const now = new Date();
  const tomorrowStart = new Date(now);
  tomorrowStart.setDate(now.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setHours(23, 59, 59, 999);
  try {
    // Step 1: Get exam IDs with resultDate == tomorrow
    const exams = await prisma.exam.findMany({
      where: {
        resultDate: {
          gte: tomorrowStart,
          lte: tomorrowEnd,
        },
      },
      select: {
        id: true,
      },
    });

    const examIds = exams.map((e) => e.id);
    if (examIds.length === 0) {
      return Response(JSON.stringify({ message: "No exams with resultDate tomorrow." }));
    }
    // Step 2: Update related results
    const updateResult = await prisma.result.updateMany({
      where: {
        examId: {
          in: examIds,
        },
      },
      data: {
        resultDeclared: true,
      },
    });
    console.log("✅ Step: Cron job finished successfully");
    return Response(JSON.stringify({message: "Results declared successfully.", updatedCount: updateResult.count, examIds,}));
  } catch (error) {
    return Response(JSON.stringify({ error: error instanceof Error ? error.message : error,status: 500 }));
  }
}

