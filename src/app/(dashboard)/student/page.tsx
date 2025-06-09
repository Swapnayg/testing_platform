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
const StudentPage = () => {

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
    </div>
  );
};

export default StudentPage;
