import prisma from "@/lib/prisma";

export async function POST(request) {
  const { examId, examIds } = await request.json();

  console.log("📥 Received POST request with:", { examId, examIds });

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

    console.log(`✅ Found ${matchingRegistrations.length} matching registrations.`);

    let created = 0;

    for (const reg of matchingRegistrations) {
      console.log(`🔍 Checking registration ${reg.id} for student ${reg.studentId}`);

      const exists = await prisma.examOnRegistration.findFirst({
        where: {
          registrationId: reg.id,
        },
      });

      if (!exists) {
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
      } else if (examIds && Array.isArray(examIds)) {
        const existingExamRegs = await prisma.examOnRegistration.findMany({
          where: {
            registrationId: reg.id,
            examId: { in: examIds },
          },
        });

        const existingExamIds = existingExamRegs.map(e => e.examId);
        console.log(`🧾 Existing exams for registration ${reg.id}:`, existingExamIds);

        if (!existingExamIds.includes(exam.id)) {
          console.log(`🆕 Adding missing examOnRegistration for exam ${exam.id} to registration ${reg.id}`);
          await prisma.examOnRegistration.create({
            data: {
              examId: exam.id,
              registrationId: reg.id,
            },
          });
          try {
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

            console.log(`📊 Result created for ${reg.studentId}`);
          } catch (err) {
            console.error(`❌ Failed to upsert result for ${reg.studentId}`, err);
          }
          created++;
        } else {
          console.log(`⚠️ Exam ${exam.id} already exists for registration ${reg.id}`);
        }
      } else {
        console.log(`ℹ️ Registration ${reg.id} already processed, skipping.`);
      }
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
