import prisma from "@/lib/prisma";
import { subHours } from "date-fns";
import { NextResponse } from "next/server";

export async function GET() {
  const nowMinusOneHour = subHours(new Date(), 1);

  const exams = await prisma.exam.findMany({
    where: {
      startTime: {
        gte: nowMinusOneHour,
      },
      status: "NOT_STARTED", 
    },
    select: {
      id: true,
      title: true,
      totalMarks: true,
      timeLimit: true,
      startTime: true,
      endTime: true,
      status: true,
      createdAt: true,
      categoryId: true,
      subjectId: true,
      totalMCQ: true,
      grades: {
        select: {
          level: true,
          category: {
            select: {
              catName: true,
            }
          }
        }
      },
      subject: {
        select: {
          name: true,
        }
      },
    },
  });
  return NextResponse.json(exams);
}