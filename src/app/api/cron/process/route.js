export async function POST(request) {
  const { examId } = await request.json();

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
          examId: exam.id,
        },
      });

      if (!exists) {
        await prisma.examOnRegistration.create({
          data: {
            examId: exam.id,
            registrationId: reg.id,
          },
        });

        await prisma.result.upsert({
          where: {
            examId_studentId: {
              examId: exam.id,
              studentId: reg.studentId,
            },
          },
          update: {},
          create: {
            examId: exam.id,
            studentId: reg.studentId,
            status: "NOT_GRADED",
            score: 0,
            totalScore: exam.totalMarks,
            grade: '',
            startTime: new Date(exam.startTime),
            endTime: new Date(exam.endTime),
          },
        });

        created++;
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
