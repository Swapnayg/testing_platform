import prisma from "@/lib/prisma";

export async function POST(request) {
  const { examId } = await request.json();

  console.log("📥 Received POST request with:", { examId });

  if (!examId) {
    console.warn("⚠️ Missing examId in request body.");
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
      console.warn(`⚠️ Exam not found for ID: ${examId}`);
      return new Response("Exam not found", { status: 404 });
    }

    console.log("📄 Exam fetched:", {
      id: exam.id,
      category: exam.grade.category.catName,
      gradeLevel: exam.grade.level,
    });

    const examCategory = exam.grade.category.catName;
    const examGradeLevel = exam.grade.level;

    const existingExamOnRegs = await prisma.examOnRegistration.findMany({
      select: { registrationId: true },
    });

    const existingRegistrationIds = existingExamOnRegs.map(e => e.registrationId);

    const matchingRegistrations = await prisma.registration.findMany({
      where: {
        status: 'APPROVED',
        catGrade: examGradeLevel,
        olympiadCategory: examCategory,
        id: {
          notIn: existingRegistrationIds, // 👈 manual exclusion
        },
      },
      select: {
        id: true,
        studentId: true,
      },
    });

    console.log(`✅ Found ${matchingRegistrations.length} matching registrations.`);

    let created = 0;

    for (const reg of matchingRegistrations) {
        console.log(`🔍 Checking registration ${reg.id} for student ${reg.studentId}`);
        console.log(`🆕 Creating new examOnRegistration for registration ${reg.id}`);
        await prisma.examOnRegistration.create({
          data: {
            examId: exam.id,
            registrationId: reg.id,
          },
        });

        // 👇 Insert result record too
        await prisma.result.upsert({
          where: {
            examId_studentId: {
              examId: exam.id,
              studentId: reg.studentId,
            },
          },
          update: {}, // do nothing if exists
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
        console.log(`📊 Upserted result for student ${reg.studentId}`);

        created++;
    }

    console.log(`🏁 Finished processing. Total created: ${created}`);

    return new Response(JSON.stringify({ success: true, created }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("❌ Failed to process exam:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
