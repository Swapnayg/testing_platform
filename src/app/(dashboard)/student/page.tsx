import Announcements from "@/components/Announcements";
import BigCalendar from "@/components/BigCalender";
import WelcomeCard from "@/components/WelcomCard";
import UpcomingQuizzes from "@/components/UpcomingQuizzes";
import { Student } from "@prisma/client";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GetServerSideProps } from 'next';
import { auth,getAuth, clerkClient } from "@clerk/nextjs/server";
import { Eye } from "lucide-react";


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
            grade: true,
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
const registrations = await prisma.registration.findMany({
  where: { 
    studentId:student?.cnicNumber,
    status: 'APPROVED', // 👈 filter for approved payments
   },
  select: { id: true },
});
const registrationIds = registrations.map(r => r.id);

// STEP 2: Get all Exam IDs student registered for
const examRegistrations = await prisma.examOnRegistration.findMany({
  where: {
    registrationId: { in: registrationIds },
  },
  select: {
    examId: true,
  },
});
const registeredExamIds = examRegistrations.map(er => er.examId);

// STEP 3: Get Attempted Exams (has result)
const attemptedExams = await prisma.exam.findMany({
  where: {
    results: {
      some: {
        studentId:student?.cnicNumber,
        quizAttemptId: {
          not: null,
        },
        quizAttempt: {
          answers: {
            some: {}, // 👈 ensures at least one answer exists
          },
        },
      },
    },
  },
  include: {
    grade: {
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

// STEP 4: Get Upcoming Exams (registered, not attempted, future)
const upcomingExams = await prisma.exam.findMany({
  where: {
    id: {
      in: registeredExamIds,
      notIn: attemptedExamIds,
    },
    OR: [
      { startTime: { gt: now } },
      { endTime: { gt: now } },
    ],   // AND has not ended
  },
  include: {
    grade: {
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
const [notApplied, pendingApproval] = await Promise.all([
  prisma.exam.findMany({
    where: {
      startTime: { gt: new Date() },
      registrations: {
        none: {
          registration: {
            studentId: student?.cnicNumber,
          },
        },
      },
    },
    include: { 
      grade: {
        include: {
          category: true,
        },
      },
      subject: true,
      quizzes: {
        select: { id: true }, // 👈 get Quiz ID
      },
     },
  }),
  prisma.exam.findMany({
    where: {
      startTime: { gt: new Date() },
      registrations: {
        some: {
          registration: {
            studentId: student?.cnicNumber,
            status: 'PENDING',
          },
        },
      },
    },
    include: { 
        grade: {
          include: {
            category: true,
          },
        },
        subject: true,
        quizzes: {
          select: { id: true }, // 👈 get Quiz ID
        },
     },
  }),
]);

const formattedNotApplied = notApplied.map((exam) => ({ ...exam, status: 'not_applied' }));
const formattedPending = pendingApproval.map((exam) => ({ ...exam, status: 'pending_approval' }));

const combinedExams = [
  // Attempted Exams
  ...attemptedExams.map(exam => ({
    id: exam.id,
    startTime: exam.startTime,
    quizId: exam.quizzes[0]?.id || null,
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
    grade: exam.grade?.level || "N/A",
    category: exam.grade?.category?.catName || "N/A",
  })),

  // Upcoming Exams
  ...upcomingExams.map(exam => ({
    id: exam.id,
    startTime: exam.startTime,
    quizId: exam.quizzes[0]?.id || null,
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
    grade: exam.grade?.level || "N/A",
    category: exam.grade?.category?.catName || "N/A",
  })),

  // Not Applied Exams
  ...formattedNotApplied.map(exam => ({
    id: exam.id,
    startTime: exam.startTime,
    quizId: exam.quizzes[0]?.id || null,
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
    grade: exam.grade?.level || "N/A",
    category: exam.grade?.category?.catName || "N/A",
  })),

  // Pending Approval Exams
  ...formattedPending.map(exam => ({
    id: exam.id,
    startTime: exam.startTime,
    quizId: exam.quizzes[0]?.id || null,
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
    grade: exam.grade?.level || "N/A",
    category: exam.grade?.category?.catName || "N/A",
  })),
];

const hasPendingApproval = combinedExams.some(exam => exam.status === "pending_approval");

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Welcome Card at the top */}
      <WelcomeCard username={username} />

      {/* Main content: Left and Right sections side by side */}
      <div className="flex flex-col xl:flex-row gap-4">
        {/* LEFT */}
        <div className="w-full xl:w-2/3">
          <div className="h-full bg-white p-4 rounded-md">
          <UpcomingQuizzes quizzes={combinedExams} studentId={student?.cnicNumber ?? ""} hasPendingApproval={hasPendingApproval} />

          
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
