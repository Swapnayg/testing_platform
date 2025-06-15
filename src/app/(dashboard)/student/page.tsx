// // import Announcements from "@/components/Announcements";
// // import BigCalendarContainer from "@/components/BigCalendarContainer";
// // import BigCalendar from "@/components/BigCalender";
// // import EventCalendar from "@/components/EventCalendar";
// // import prisma from "@/lib/prisma";
// // import { auth } from "@clerk/nextjs/server";

// // const StudentPage = async () => {
// //   const { userId } = auth();

// //   const classItem = await prisma.class.findMany({
// //     where: {
// //       students: { some: { id: userId! } },
// //     },
// //   });

// //   console.log(classItem);
// //   return (
// //     <div className="p-4 flex gap-4 flex-col xl:flex-row">
// //       {/* LEFT */}
// //       <div className="w-full xl:w-2/3">
// //         <div className="h-full bg-white p-4 rounded-md">
// //           <h1 className="text-xl font-semibold">Schedule (4A)</h1>
// //           <BigCalendarContainer type="classId" id={classItem[0].id} />
// //         </div>
// //       </div>
// //       {/* RIGHT */}
// //       <div className="w-full xl:w-1/3 flex flex-col gap-8">
// //         <EventCalendar />
// //         <Announcements />
// //       </div>
// //     </div>
// //   );
// // };

// // export default StudentPage;


// import Announcements from "@/components/Announcements";
// import BigCalendar from "@/components/BigCalender";
// import EventCalendar from "@/components/EventCalendar";
// import WelcomeCard from "@/components/WelcomCard";

// const StudentPage = () => {
//   return (
//     <div className="p-4 flex gap-4 flex-col xl:flex-row">
//       <WelcomeCard />
//       {/* LEFT */}
//       <div className="w-full xl:w-2/3">
//         <div className="h-full bg-white p-4 rounded-md">
//           <h1 className="text-xl font-semibold">Schedule (4A)</h1>
//           <BigCalendar data={[]}/>
//         </div>
//       </div>
//       {/* RIGHT */}
//       <div className="w-full xl:w-1/3 flex flex-col gap-8">
        
//         <EventCalendar />
//         <Announcements />
//       </div>
//     </div>
//   );
// };

// export default StudentPage;
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

const upcomingQuizzes = [
  {
    id: "c1b5c9c6-8e29-49e9-b6cb-77b8b9b5e2d3",
    title: "Quiz #1",
    difficulty: "Beginner" as "Beginner",
    subject: "Science",
    instructor: "Dr. Smith",
    timeRemaining: "5 days",
    questions: 12,
    duration: "75 mins",
    totalMarks: 80,
    progress: 67,
    status: "in-progress" as "in-progress"
  },
  {
    id: "d2a4f8e0-91a6-4c2e-97c7-b3e2df0e9f4a",
    title: "Quiz #2",
    difficulty: "Advanced" as "Advanced",
    subject: "Mathematics",
    instructor: "Prof. Johnson",
    timeRemaining: "2 days",
    questions: 15,
    duration: "90 mins",
    totalMarks: 100,
    progress: 0,
    status: "not-started" as "not-started"
  },
  {
    id: "e3d7b5fa-4b6c-41d8-90fb-a5c7c9fe2e34",
    title: "Quiz #3",
    difficulty: "Expert" as "Expert",
    subject: "History",
    instructor: "Ms. Patel",
    timeRemaining: "1 day",
    questions: 10,
    duration: "60 mins",
    totalMarks: 85,
    progress: 100,
    status: "in-progress" as "in-progress"
  }
];


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

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Welcome Card at the top */}
      <WelcomeCard />

      {/* Main content: Left and Right sections side by side */}
      <div className="flex flex-col xl:flex-row gap-4">
        {/* LEFT */}
        <div className="w-full xl:w-2/3">
          <div className="h-full bg-white p-4 rounded-md">
          <UpcomingQuizzes quizzes={upcomingQuizzes} />
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

      <div className="mt-4 bg-white rounded-md p-4 h-[200px] w-full">
                <h1>Quiz Attempts</h1>
                <div className="p-4">
                  <table className="min-w-full border rounded-lg bg-white text-sm">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="px-4 py-2 border">Title</th>
                    <th className="px-4 py-2 border">Category</th>
                    <th className="px-4 py-2 border">Grade</th>
                    <th className="px-4 py-2 border">Start Time</th>
                    <th className="px-4 py-2 border">Total Marks</th>
                    <th className="px-4 py-2 border">Questions</th>
                    <th className="px-4 py-2 border">Time Limit (min)</th>
                    <th className="px-4 py-2 border">Score</th>
                    <th className="px-4 py-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {student?.attempts.map((attempt) => (
                    <tr key={attempt.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2 border capitalize">{attempt.quiz.title}</td>
                      <td className="px-4 py-2 border">{attempt.quiz.category}</td>
                      <td className="px-4 py-2 border">{attempt.quiz.grade}</td>
                      <td className="px-4 py-2 border">
                        {new Date(attempt.quiz.startDateTime).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-2 border">{attempt.quiz.totalMarks}</td>
                      <td className="px-4 py-2 border">{attempt.quiz.questions.length}</td>
                      <td className="px-4 py-2 border">{attempt.quiz.timeLimit} min</td>
                      <td className="px-4 py-2 border">{attempt.totalScore ?? "N/A"}</td>
                      <td className="px-4 py-2 border">
                        <Link href={`/student/${attempt.quiz.id}?studentName=${attempt.studentId}`} className="w-full flex items-center justify-center text-blue-600 hover:text-blue-800 transition">
                          <Eye className="w-5 h-5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
                </div>
    </div>
    </div>
  );
};

export default StudentPage;
