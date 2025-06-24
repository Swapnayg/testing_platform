import prisma from "@/lib/prisma";

export async function POST(request) {
  const { examId, examIds } = await request.json();

  if (!examId) {
    return new Response("Missing examId", { status: 400 });
  }

  try {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        grade: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!exam) {
      return new Response("Exam not found", { status: 404 });
    }

    const examCategory = exam.grade.category.catName;
    const examGradeLevel = exam.grade.level;

    const matchingRegistrations = await prisma.registration.findMany({
      where: {
        status: 'APPROVED',
        catGrade: examGradeLevel,
        olympiadCategory: examCategory,
        exams: {
          none: {
            examId: exam.id,
          },
        },
      },
      select: {
        id: true,
        studentId: true,
      },
    });

    let created = 0;

    for (const reg of matchingRegistrations) {
      const exists = await prisma.examOnRegistration.findFirst({
        where: {
          registrationId: reg.id,
        },
      });

      if (!exists) {
        await prisma.examOnRegistration.create({
          data: {
            examId: exam.id,
            registrationId: reg.id,
          },
        });
        created++;
      } else if (examIds && Array.isArray(examIds)) {
        const existingExamRegs = await prisma.examOnRegistration.findMany({
          where: {
            registrationId: reg.id,
            examId: { in: examIds },
          },
        });

        const existingExamIds = existingExamRegs.map(e => e.examId);

        if (!existingExamIds.includes(exam.id)) {
          await prisma.examOnRegistration.create({
            data: {
              examId: exam.id,
              registrationId: reg.id,
            },
          });
          created++;
        }
      }
    }

    return new Response(JSON.stringify({ success: true, created }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("❌ Failed to process exam:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
