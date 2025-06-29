import Announcements from "@/components/Announcements";
import WelcomeCard from "@/components/WelcomCard";
import UpcomingQuizzes from "@/components/UpcomingQuizzes";
import prisma from "@/lib/prisma";
import { auth,getAuth, clerkClient } from "@clerk/nextjs/server";
import TodayResultPopup from "@/components/TodayResultPopup";

function getTimeRemaining(startTime: Date) {
  const diff = new Date(startTime).getTime() - Date.now();
  if (diff <= 0) return "Started";
  const mins = Math.floor(diff / 60000);
  return `${mins} min${mins !== 1 ? "s" : ""} left`;
}


const StudentPage = async () => {

const { userId, sessionClaims } = auth();
const role = (sessionClaims?.metadata as { role?: string })?.role;
const currentUserId = userId;
const client = clerkClient();

let user = null;
var username = "";
if (userId) {
  user = await client.users.getUser(userId);
  username = user.username?.toString() ?? "";
}

const student = await prisma.student.findFirst({
  where: {
    rollNo: username,  // Replace with actual roll number
  },
  include: {
    grade: {
      select: {
        id: true,
        level: true,
      },
    },
    Result: true,
    Attendance: true,
    Registration: true,
    attempts: {
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            category: true,
            grades: true,
            startDateTime: true,
            totalMarks: true,
            timeLimit: true,
            questions: {
              select: { id: true },
            },
          },
        },
    },
    },
  },
});

const now = new Date();

  // STEP 1: Get all Registration IDs for this student
  // STEP 1: Get approved registrations
  const registrations = await prisma.registration.findMany({
    where: { 
      studentId: student?.cnicNumber,
      status: 'APPROVED',
    },
    select: { id: true },
  });
  const registrationIds = registrations.map(r => r.id);

  // STEP 2: Get exam IDs from those registrations
  const examRegistrations = await prisma.examOnRegistration.findMany({
    where: {
      registration: {
        status: 'APPROVED',
        studentId: student?.cnicNumber,
      },
    },
    select: {
      examId: true,
    },
  });

const registeredExamIds = examRegistrations.map(er => er.examId);

// STEP 3: Get attempted exams
const attemptedExams = await prisma.exam.findMany({
  where: {
    results: {
      some: {
        studentId: student?.cnicNumber,
        quizAttemptId: { not: null },
        quizAttempt: {
          answers: { some: {} },
        },
      },
    },
  },
  include: {
    grades: {
      include: {
        category: true,
      },
    },
    subject: true,
    quizzes: {
      select: { id: true }, // 👈 get Quiz ID
    },
  },
});
const attemptedExamIds = attemptedExams.map(e => e.id);



// STEP 5: Get absent exams (registered, not attempted, already ended)
const absentExams = await prisma.exam.findMany({
  where: {
    id: {
      in: registeredExamIds,
      notIn: attemptedExamIds,
    },
    endTime: { lt: now }, // 🕒 already ended
  },
  include: {
    grades: {
      include: {
        category: true,
      },
    },
    subject: true,
    quizzes: {
      select: { id: true }, // 👈 get Quiz ID
    },
  },
});



// STEP 1: Get all future exams
const allUpcomingExams = await prisma.exam.findMany({
  where: {
    startTime: { gt: new Date() },
    grades: {
      some: {
        id: student?.gradeId ?? undefined,
      },
    },
  },
  include: {
    registrations: {
      include: {
        registration: true, // ✅ fetch all, filter manually
      },
    },
    grades: { include: { category: true } },
    subject: true,
    quizzes: { select: { id: true } },
  },
});


  const notApplied: typeof allUpcomingExams = [];
  const pendingApproval: typeof allUpcomingExams = [];

  for (const exam of allUpcomingExams) {
    const studentRegs = exam.registrations.filter(
      (r) => r.registration?.studentId === student?.cnicNumber
    );

    // ✅ If any registration is APPROVED, skip the exam
    if (studentRegs.some((r) => r.registration?.status === 'APPROVED')) {
      continue;
    }

    // ✅ If any is PENDING (and no approved), mark as pending
    if (studentRegs.some((r) => r.registration?.status === 'PENDING')) {
      pendingApproval.push(exam);
      continue;
    }

    // ✅ If no registration or all are REJECTED (and no approved), mark as not applied
    notApplied.push(exam);
  }


const formattedNotApplied = notApplied.map((exam) => ({ ...exam, status: 'not_applied' }));
const formattedPending = pendingApproval.map((exam) => ({ ...exam, status: 'pending_approval' }));

const pendingIds = formattedPending.map(e => e.id);

// STEP 4: Get upcoming exams (registered, not attempted, future)
const upcomingExams = await prisma.exam.findMany({
  where: {
    id: { notIn: pendingIds }, // 🚫 Exclude pending manually
    results: {
      none: {
        studentId: student?.cnicNumber,
        quizAttemptId: { not: null },
        quizAttempt: {
          answers: { some: {} },
        },
      },
    },
    registrations: {
      some: {
        registration: {
          studentId: student?.cnicNumber,
          status: 'APPROVED',
        },
      },
    },
    grades: {
      some: {
        id: student?.gradeId ?? undefined,
      },
    },
    OR: [
      { startTime: { gt: now } },
      { endTime: { gt: now } },
    ],
  },
  include: {
    grades: { include: { category: true } },
    subject: true,
    quizzes: { select: { id: true } },
  },
});

console.log("Attempted exams", attemptedExams);
console.log("UpcomingExams exams", upcomingExams);
console.log("AbsentExams exams", absentExams);
console.log("NotApplied exams", notApplied);
console.log("PendingApproval exams", pendingApproval);

const combinedExams = [
  // Attempted Exams
  ...attemptedExams.map(exam => ({
    id: exam.id,
    startTime: exam.startTime,
    quizId:  exam.quizzes?.id || null,
    title: exam.title,
    difficulty: "Beginner" as const,
    subject: exam.subject?.name || "Unknown",
    instructor: "TBD",
    timeRemaining: "N/A",
    questions: exam.totalMCQ ?? 0,
    duration: `${exam.timeLimit ?? 0} mins`,
    totalMarks: exam.totalMarks,
    progress: 100,
    status: "attempted" as const,
    grade: student?.grade?.level || "N/A",
    category: exam.grades?.[0]?.category?.catName || "N/A",
  })),

  // Upcoming Exams
  ...upcomingExams.map(exam => ({
    id: exam.id,
    startTime: exam.startTime,
    quizId:   exam.quizzes?.id || null,
    title: exam.title,
    difficulty: "Beginner" as const,
    subject: exam.subject?.name || "Unknown",
    instructor: "TBD",
    timeRemaining: getTimeRemaining(exam.startTime),
    questions: exam.totalMCQ ?? 0,
    duration: `${exam.timeLimit ?? 0} mins`,
    totalMarks: exam.totalMarks,
    progress: 0,
    status: "upcoming" as const,
    grade: student?.grade?.level || "N/A",
    category: exam.grades?.[0]?.category?.catName || "N/A",
  })),

    // Absent Exams
  ...absentExams.map(exam => ({
    id: exam.id,
    startTime: exam.startTime,
    quizId:  exam.quizzes?.id || null,
    title: exam.title,
    difficulty: "Beginner" as const,
    subject: exam.subject?.name || "Unknown",
    instructor: "TBD",
    timeRemaining: getTimeRemaining(exam.startTime),
    questions: exam.totalMCQ ?? 0,
    duration: `${exam.timeLimit ?? 0} mins`,
    totalMarks: exam.totalMarks,
    progress: 0,
    status: "absent" as const,
    grade: student?.grade?.level || "N/A",
    category: exam.grades?.[0]?.category?.catName || "N/A",
  })),

  // Not Applied Exams
  ...formattedNotApplied.map(exam => ({
    id: exam.id,
    startTime: exam.startTime,
    quizId:  exam.quizzes?.id || null,
    title: exam.title,
    difficulty: "Beginner" as const,
    subject: exam.subject?.name || "Unknown",
    instructor: "TBD",
    timeRemaining: getTimeRemaining(exam.startTime),
    questions: exam.totalMCQ ?? 0,
    duration: `${exam.timeLimit ?? 0} mins`,
    totalMarks: exam.totalMarks,
    progress: 0,
    status: "not_applied" as const,
    grade: student?.grade?.level || "N/A",
    category: exam.grades?.[0]?.category?.catName || "N/A",
  })),

  // Pending Approval Exams
  ...formattedPending.map(exam => ({
    id: exam.id,
    startTime: exam.startTime,
    quizId:  exam.quizzes?.id || null,
    title: exam.title,
    difficulty: "Beginner" as const,
    subject: exam.subject?.name || "Unknown",
    instructor: "TBD",
    timeRemaining: getTimeRemaining(exam.startTime),
    questions: exam.totalMCQ ?? 0,
    duration: `${exam.timeLimit ?? 0} mins`,
    totalMarks: exam.totalMarks,
    progress: 0,
    status: "pending_approval" as const,
    grade: student?.grade?.level || "N/A",
    category: exam.grades?.[0]?.category?.catName || "N/A",
  })),
];

const hasPendingApproval = combinedExams.some(exam => exam.status === "pending_approval");

  return (
    <div className="p-4 flex flex-col gap-4">

      <TodayResultPopup  username={student?.cnicNumber ?? ""}/>
      {/* Welcome Card at the top */}
      <WelcomeCard username={username} />

      {/* Main content: Left and Right sections side by side */}
      <div className="flex flex-col xl:flex-row gap-4">
        {/* LEFT */}
        <div className="w-full xl:w-2/3">
          <div className="h-full bg-white p-4 rounded-md">
          <UpcomingQuizzes quizzes={combinedExams} studentId={username} hasPendingApproval={hasPendingApproval} studentGrade={student?.grade?.level || "N/A"}/>

          
            {/* <h1 className="text-xl font-semibold">Schedule (4A)</h1> */}
            
            {/* <BigCalendar data={[]} /> */}
          </div>
        </div>

        {/* RIGHT */}
        <div className="w-full xl:w-1/3 flex flex-col gap-8">
          <Announcements />
        </div>
      </div>
    </div>
  );
};

export default StudentPage;
