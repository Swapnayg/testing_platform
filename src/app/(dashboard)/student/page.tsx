import Announcements from "@/components/Announcements";
import BigCalendar from "@/components/BigCalender";
import EventCalendar from "@/components/EventCalendar";
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

const upcomingExams = await prisma.exam.findMany({
  where: {
    startTime: {
      gt: new Date(),
    },
    registrations: {
      none: {
        registration: {
          studentId: student?.cnicNumber,
        },
      },
    },
  },
  include: {
    subject: true,
    grade:{
      include:{
        category:true,
      }
    }
  },
});


const notAttemptedExams = await prisma.exam.findMany({
  where: {
    results: {
      none: {
        studentId: student?.cnicNumber,
        quizAttemptId: { not: null },
      },
    },
  },
  include: {
    subject: true,
    grade: {
      include: {
        category: true,
      },
    },
  },
});

const attemptedQuizzes = await prisma.result.findMany({
  where: {
    studentId:  student?.cnicNumber, // <-- your input
    quizAttemptId: {
      not: null, // Ensures it was attempted
    },
  },
  include: {
    exam: {
      include: {
        subject: true,
        grade: {
          include: {
            category: true,
          },
        },
      },
    },
    quizAttempt: true,
  },
});

const upcomingQuizzes =  [
  // Already known upcoming exams
  ...upcomingExams.map((exam) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const timeDiffMs = startTime.getTime() - now.getTime();
    const timeRemaining = timeDiffMs > 0
      ? Math.ceil(timeDiffMs / (1000 * 60 * 60 * 24)) + " days"
      : "Starts today";

    return {
      id: exam.id,
      title: exam.title,
      difficulty: "Beginner" as "Beginner", // can change per exam.difficulty
      subject: exam.subject?.name || "Unknown",
      instructor: "TBD",
      timeRemaining,
      questions: exam.totalMCQ ?? 0,
      duration: `${exam.timeLimit ?? 0} mins`,
      totalMarks: exam.totalMarks,
      progress: 0,
      status: "not-started" as "not-started", // or "in-progress" if dynamically determined
      grade: exam.grade?.level || "N/A",
      category: exam.grade?.category?.catName || "N/A",
    };
  }),
  // Not attempted exams (default to status: "not-started")
  ...notAttemptedExams.map((exam) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const timeDiffMs = startTime.getTime() - now.getTime();
    const timeRemaining = timeDiffMs > 0
      ? Math.ceil(timeDiffMs / (1000 * 60 * 60 * 24)) + " days"
      : "Starts today";

    return {
      id: exam.id,
      title: exam.title,
      difficulty: "Beginner" as "Beginner", // use actual difficulty if available
      subject: exam.subject?.name || "Unknown",
      instructor: "TBD", // or exam.instructor?.name
      timeRemaining,
      questions: exam.totalMCQ ?? 0,
      duration: `${exam.timeLimit ?? 0} mins`,
      totalMarks: exam.totalMarks,
      progress: 0,
      status: "upcoming" as "upcoming",
      grade: exam.grade?.level || "N/A",
      category: exam.grade?.category?.catName || "N/A",
    };
  }),
   // ✅ Attempted quizzes
  ...attemptedQuizzes.map((res) => {
    const exam = res.exam!;
    const startTime = new Date(res.startTime);
    const endTime = new Date(res.endTime);
    const timeDiffMins = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

    return {
      id: exam.id,
      title: exam.title,
      difficulty: "Beginner" as const,
      subject: exam.subject?.name || "Unknown",
      instructor: "TBD",
      timeRemaining: "Attempted",
      questions: res.answeredQuestions ?? 0,
      duration: `${timeDiffMins} mins`,
      totalMarks: res.totalScore,
      progress: Math.round((res.score / res.totalScore) * 100), // show % score
      status: "completed" as const, // or "completed" if you extend the type
      grade: exam.grade?.level || "N/A",
      category: exam.grade?.category?.catName || "N/A",
    };
  }),
];

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Welcome Card at the top */}
      <WelcomeCard />

      {/* Main content: Left and Right sections side by side */}
      <div className="flex flex-col xl:flex-row gap-4">
        {/* LEFT */}
        <div className="w-full xl:w-2/3">
          <div className="h-full bg-white p-4 rounded-md">
          <UpcomingQuizzes quizzes={upcomingQuizzes} studentId={student?.cnicNumber ?? ""} />

          
            {/* <h1 className="text-xl font-semibold">Schedule (4A)</h1> */}
            
            {/* <BigCalendar data={[]} /> */}
          </div>
        </div>

        {/* RIGHT */}
        <div className="w-full xl:w-1/3 flex flex-col gap-8">
          <EventCalendar />
          <Announcements />
        </div>
      </div>
    </div>
  );
};

export default StudentPage;
