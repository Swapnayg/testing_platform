// /app/api/cron/declare-results/route.js

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const now = new Date();
  const todayStart = new Date(now).setHours(0, 0, 0, 0);
  const todayEnd   = new Date(now).setHours(23, 59, 59, 999);

  // 1️⃣ Fetch all exam IDs to process
  const exams = await prisma.exam.findMany({
    where: {
      resultDate: { gte: new Date(todayStart), lte: new Date(todayEnd) },
    },
    select: { id: true },
  });
  const examIds = exams.map(e => e.id);
  console.log("🧪 Exams to process:", examIds);

  if (examIds.length === 0) {
    return NextResponse.json({ message: "No exams with resultDate today." });
  }

  const declaredAt = new Date();

  // 2️⃣ Split into two roughly equal batches
  const mid = Math.ceil(examIds.length / 2);
  const batch1 = examIds.slice(0, mid);
  const batch2 = examIds.slice(mid);

  // 3️⃣ Define a helper to process one batch
  const processBatch = async (ids) => {
    for (const examId of ids) {
      const results = await prisma.result.findMany({
        where: { examId, status: { in: ["PASSED", "FAILED" ] } },
        orderBy: { score: "desc" },
        select: { id: true, score: true },
      });
      console.log(`📊 Found ${results.length} results for ${examId}`);

      let rank = 1, lastScore = null;
      for (let i = 0; i < results.length; i++) {
        const { id, score } = results[i];
        if (score == null) { console.warn(`⚠️ Skipping ${id}, null score`); continue; }

        const same = score === lastScore;
        const currentRank = same ? rank : i + 1;

        try {
          await prisma.result.update({
            where: { id },
            data: { grade: `${currentRank}`, resultDeclared: true, declaredOn: declaredAt },
          });
        } catch (err) {
          console.error(`❌ Error updating ${id}:`, err);
        }

        if (!same) rank = i + 1;
        lastScore = score;
      }
    }
  };

  // 4️⃣ Run both batches in parallel
  await Promise.all([processBatch(batch1), processBatch(batch2)]);
  console.log("🎉 All batches complete");

  return NextResponse.json({ message: "Results ranked in two parallel batches." });
}
