import Announcements from "@/components/Announcements";
import WelcomeCard from "@/components/WelcomCard";
import UpcomingQuizzes from "@/components/UpcomingQuizzes";
import prisma from "@/lib/prisma";
import { auth,getAuth, clerkClient } from "@clerk/nextjs/server";
import TodayResultPopup from "@/components/TodayResultPopup";
import ExamCalendarStudent from '@/components/ExamCalendarStudent';
import { getUpcomingExams } from "@/lib/actions";
import { duration } from "moment";

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
  where: { rollNo: username },
  include: {
    grade: true,
  },
});
if (!student) throw new Error("Student not found");

const allExams = await prisma.exam.findMany({
  where: {
    grades: {
      some: { id: student.gradeId ?? undefined },
    },
  },
  include: {
    results: {
      where: {
        studentId: student.cnicNumber,
      },
      select: {
        id: true,
        quizAttemptId: true,
        quizAttempt: {
          select: {
            answers: { select: { id: true }, take: 1 },
          },
        },
      },
    },
    registrations: {
      where: {
        registration: {
          studentId: student.cnicNumber,
        },
      },
      include: {
        registration: true,
      },
    },
    grades: { include: { category: true } },
    subject: { select: { name: true } },
    quizzes: { select: { id: true } },
  },
});

const now = new Date();
const classified: {
  attempted: typeof allExams;
  upcoming: typeof allExams;
  absent: typeof allExams;
  pending_approval: typeof allExams;
  not_applied: typeof allExams;
} = {
  attempted: [],
  upcoming: [],
  absent: [],
  pending_approval: [],
  not_applied: [],
};

for (const exam of allExams) {
  const result = exam.results[0];
  const isAttempted = !!(result?.quizAttemptId && result.quizAttempt?.answers?.length && result.quizAttempt?.answers?.length > 0);

  const reg = exam.registrations[0]?.registration;
  const isRegistered = !!reg;
  const regStatus = reg?.status;

  if (isAttempted) {
    classified.attempted.push(exam);
  } else if (regStatus === "APPROVED") {
    if (exam.endTime < now) {
      classified.absent.push(exam); // Missed it
    } else {
      classified.upcoming.push(exam); // Coming up
    }
  } else if (regStatus === "PENDING") {
    classified.pending_approval.push(exam);
  } else {
    classified.not_applied.push(exam);
  }
}

type ExamType = typeof allExams[number];

const makeExamObj = (
  exam: ExamType,
  status: "attempted" | "upcoming" | "absent" | "pending_approval" | "not_applied"
) => ({
  id: exam.id,
  startTime: exam.startTime,
  endTime: exam.endTime, // <-- Add this line
  quizId: exam.quizzes?.id ?? null,
  title: exam.title,
  difficulty: "Beginner" as const,
  subject: exam.subject?.name ?? "Unknown",
  instructor: "TBD",
  timeRemaining: getTimeRemaining(exam.startTime),
  questions: exam.totalMCQ ?? 0,
  duration: `${exam.timeLimit ?? 0} Mins`,
  totalMarks: exam.totalMarks,
  progress: status === "attempted" ? 100 : 0,
  status,
  grade:  exam.grades?.map((g) => g.level).join(", ") || "N/A", // ✅ Updated line
  category: exam.grades?.[0]?.category?.catName ?? "N/A",
});

const combinedExams = [
  ...classified.attempted.map(e => makeExamObj(e, "attempted")),
  ...classified.upcoming.map(e => makeExamObj(e, "upcoming")),
  ...classified.absent.map(e => makeExamObj(e, "absent")),
  ...classified.pending_approval.map(e => makeExamObj(e, "pending_approval")),
  ...classified.not_applied.map(e => makeExamObj(e, "not_applied")),
];

const hasPendingApproval = combinedExams.some(exam => exam.status === "pending_approval");

const calendarData = combinedExams.map((exam) => ({
  id: exam.id,
  title: exam.title,
  startTime: exam.startTime,
  endTime: exam.endTime,
  status: exam.status,
  category: exam.category,
  grade: exam.grade,
  subject: exam.subject || '', // ✅ Subject name
  duration:exam.duration,
  totalMarks:exam.totalMarks,
}));

  return (
    <div className="p-4 flex flex-col gap-4">

      <TodayResultPopup  username={student?.cnicNumber ?? ""}/>
      {/* Welcome Card at the top */}
      <WelcomeCard username={student?.name ?? ""}  studentId= {student?.cnicNumber ?? ""}/>

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
        <ExamCalendarStudent
            exams={calendarData}
        />

          <Announcements username={student?.name ?? ""}  studentId= {student?.cnicNumber ?? ""}/>
        </div>
      </div>
    </div>
  );
};

export default StudentPage;
