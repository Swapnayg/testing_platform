/* eslint-disable @next/next/no-img-element */

import type { Metadata } from 'next';
import { Pencil } from "lucide-react";
import Announcements from "@/components/Announcements";
import FormContainer from "@/components/FormContainer";
import Performance from "@/components/Performance";
import StudentAttendanceCard from "@/components/StudentAttendanceCard";
import RegistrationTable from '@/components/RegistrationTable';
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Student } from "@prisma/client";
import { Item } from "@radix-ui/react-select";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStudentQuizStats } from "@/lib/actions";
import { ArrowUp, ArrowDown, BookOpen, CalendarCheck, Clock, Star } from "lucide-react";
import ExamCalendar from '@/components/ExamCalendar';
import { getUpcomingExamsByStudentId } from "@/lib/actions";


export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Student ID: ${id}`,
    description: `Details for student ${id}`,
  };
}

export default async function SingleStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const student:
    | (Student)
    | null = await prisma.student.findUnique({
    where: { cnicNumber: id },
    select: {
      id: true,
      name: true,
      fatherName: true,
      dateOfBirth: true,
      religion: true,
      gender: true,
      cnicNumber: true,
      profilePicture: true,
      email: true,
      mobileNumber: true,
      city: true,
      stateProvince: true,
      addressLine1: true,
      instituteName: true,
      others: true,
      rollNo: true,
      gradeId: true,
    }
  });

  const exams = student?.cnicNumber
    ? await getUpcomingExamsByStudentId(student.cnicNumber)
    : [];

  const stats = student?.cnicNumber
    ? await getStudentQuizStats(student.cnicNumber)
    : {
        quizCompleted: 0,
        upcomingQuizzes: [],
        averageScore: 0,
        overallScore: 0,
        bestSubject: "N/A",
      };

  const cardData = [
  {
    icon: <BookOpen className="w-6 h-6 text-blue-600" />,
    value: stats.quizCompleted,
    label: 'Quiz Completed',
    bg: 'bg-gradient-to-r from-blue-200 to-indigo-200',
  },
  {
    icon: <CalendarCheck className="w-6 h-6 text-green-600" />,
    value: stats.upcomingQuizzes.length ?? 0,
    label: 'Upcoming Quiz',
    bg: 'bg-gradient-to-r from-green-200 to-emerald-200',
  },
  {
    icon: <Clock className="w-6 h-6 text-yellow-600" />,
    value: stats.averageScore,
    label: 'Average Quiz Score',
    bg: 'bg-gradient-to-r from-yellow-200 to-orange-200',
  },
  {
    icon: <Star className="w-6 h-6 text-purple-600" />,
    value: stats.bestSubject,
    label: 'Best Performing Subject',
    bg: 'bg-gradient-to-r from-purple-200 to-pink-200',
  },
];
const registrations = await prisma.registration.findMany({
  where: {
    studentId: id, // ✅ Match by student ID
  },
  orderBy: {
    id: 'desc', // Optional: latest first
  },
  select: {
    id: true,
    olympiadCategory: true,
    catGrade: true,
    paymentOption: true,
    otherName: true,
    transactionId: true,
    totalAmount: true,
    dateOfPayment: true,
    transactionReceipt: true,
    status: true, // ✅ Include status if needed
  }
});


const results = await prisma.result.findMany({
    where: {
      studentId: student?.cnicNumber,
    },
    select: {
      id: true,
      score: true,
      totalScore: true,
      grade: true,
      status: true,
      resultDeclared: true,
      declaredOn: true,
      exam: {
        select: {
          id: true,
          title: true,
          category: true,
          grades: {
            select: {
              id: true,
              level: true,
            },
          },
          startTime: true,
          totalMarks: true,
          timeLimit: true,
          totalMCQ: true,
          quizzes: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

   const attempts = results
    .map((result) => result.exam)
    .filter((exam): exam is NonNullable<typeof exam> => !!exam);

  if (!student) {
    return notFound();
  }

return (
 <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* USER INFO CARD */}
          <div className="bg-gradient-to-r from-purple-100 via-violet-200 to-indigo-100 rounded-xl shadow-md p-4 mx-auto w-full max-w-[500px]">
            {/* Top Section */}
            <div className="flex items-center gap-4">
              {/* Profile Image */}
              <Image
                src={student.profilePicture || "/noAvatar.png"}
                alt="Profile"
                width={100}
                height={100}
                className="w-24 h-24 rounded-full object-cover border-2 border-white shadow"
              />

              {/* Name & RollNo + Edit */}
              <div className="flex-1">
                <h1 className="text-lg font-semibold text-gray-800 capitalize">
                  {student.name} {student.fatherName}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <span>{student.rollNo}</span>
                </div>
              </div>
            </div>

            {/* Grid Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm text-gray-700 font-medium">
              <div className="flex items-center gap-2">
                <Image src="/maleFemale.png" alt="" width={16} height={16} />
                <span className="capitalize">{student.gender}</span>
              </div>

              <div className="flex items-center gap-2">
                <Image src="/date.png" alt="" width={16} height={16} />
                <span>{new Intl.DateTimeFormat("en-GB").format(student.dateOfBirth)}</span>
              </div>

              <div className="flex items-center gap-2 break-all">
                <Image src="/mail.png" alt="" width={16} height={16} />
                <span>{student.email || "-"}</span>
              </div>

              <div className="flex items-center gap-2">
                <Image src="/phone.png" alt="" width={16} height={16} />
                <span>{student.mobileNumber || "-"}</span>
              </div>

              <div className="flex items-center gap-2">
                <Image src="/id-card.png" alt="" width={16} height={16} />
                <span>{student.cnicNumber || "-"}</span>
              </div>

              <div className="flex items-center gap-2">
                <Image src="/religion.png" alt="" width={16} height={16} />
                <span className="capitalize">{student.religion || "-"}</span>
              </div>

              <div className="flex items-center gap-2 col-span-1 sm:col-span-2">
                <Image src="/location-pin.png" alt="" width={16} height={16} />
                <span className="capitalize break-words">
                  {student.addressLine1}, {student.city}, {student.stateProvince}
                </span>
              </div>
            </div>
          </div>

          {/* SMALL CARDS */}
         <div className="flex-1 flex gap-4 justify-between flex-wrap">
             {cardData.map((card, index) => (
              <div
                key={index}
                className={`rounded-md flex gap-4 items-start w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%] p-4 shadow-sm ${card.bg}`}
              >
                <div className="p-2 rounded-md bg-white">
                  {card.icon}
                </div>
                <div className="flex flex-col">
                  <h1
                    className={`text-xl font-semibold text-gray-800`}
                    title={String(card.value)}
                  >
                    {card.value}
                  </h1>
                  <span className="text-sm text-gray-500 mt-">{card.label}</span>
                </div>
              </div>
            ))}
        </div>
        </div>
        {/* BOTTOM */}
        <div className="mt-4 bg-white rounded-md p-4 h-[600px]">
          <h1>Exam&apos;s Schedule</h1>
          <ExamCalendar exams={exams}/>
        </div>

        <div className="mt-4 bg-white rounded-md p-4 h-[200px] w-full">
          <h2 className="text-lg font-semibold text-indigo-800 mb-4">📝 Payment History</h2>
          <RegistrationTable registrations={registrations.map(r => ({
            ...r,
            id:r.id ?? "",
            olympiadCategory: r.olympiadCategory ?? "",
            catGrade: r.catGrade ?? "",
            totalAmount: r.totalAmount ?? "",
            transactionId: r.transactionId ?? "",
            paymentOption: r.paymentOption ?? "",
            otherName: r.otherName === null ? "" : r.otherName,
            dateOfPayment: r.dateOfPayment ? r.dateOfPayment.toISOString() : "",
            transactionReceipt:  r.transactionReceipt ?? "",
            status: r.status ?? "",
          }))} />
        </div>

        <div className="bg-gradient-to-br from-purple-50 via-white to-indigo-50 rounded-xl shadow-md p-4 w-full">
  <h1 className="text-xl font-semibold text-indigo-700 mb-4">📊 Quiz Attempts</h1>

  <div className="overflow-auto rounded-lg border border-gray-200 shadow-sm">
    <table className="min-w-full text-sm text-gray-800">
      <thead className="bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 text-indigo-800">
        <tr>
          <th className="px-4 py-2 border">Title</th>
          <th className="px-4 py-2 border">Category</th>
          <th className="px-4 py-2 border">Grade</th>
          <th className="px-4 py-2 border">Start Time</th>
          <th className="px-4 py-2 border">Marks</th>
          <th className="px-4 py-2 border">Questions</th>
          <th className="px-4 py-2 border">Time</th>
          <th className="px-4 py-2 border">Score</th>
          <th className="px-4 py-2 border">Status</th>
          <th className="px-4 py-2 border">Actions</th>
        </tr>
      </thead>

      <tbody>
        {results.map((result) => {
          const exam = result.exam;
          if (!exam) return null;

          // Status logic
          let status = "NOT_GRADED";
          if (result.status === "NOT_GRADED") status = "NOT_GRADED";
          else if (result.score === 0) status = "ABSENT";
          else if (result.score != null) {
            const percentage = (result.score / (exam.totalMarks || 1)) * 100;
            status = percentage >= 40 ? "PASSED" : "FAILED";
          }

          // Status styling
          const statusColors: Record<string, string> = {
            PASSED: "bg-green-100 text-green-800",
            FAILED: "bg-red-100 text-red-800",
            NOT_GRADED: "bg-yellow-100 text-yellow-800",
            ABSENT: "bg-gray-100 text-gray-700",
          };

          const showEdit = status === "PASSED" || status === "FAILED";

          return (
            <tr key={result.id} className="odd:bg-white even:bg-gray-50 text-center">
              <td className="px-4 py-2 border capitalize">{exam.title}</td>
              <td className="px-4 py-2 border">{exam.category.catName}</td>
              <td className="px-4 py-2 border">
                {exam.grades.map((g) => g.level).join(", ")}
              </td>
              <td className="px-4 py-2 border">
                {new Date(exam.startTime).toLocaleString("en-IN")}
              </td>
              <td className="px-4 py-2 border">{exam.totalMarks}</td>
              <td className="px-4 py-2 border">{exam.totalMCQ}</td>
              <td className="px-4 py-2 border">{exam.timeLimit} min</td>
              <td className="px-4 py-2 border">{result.score ?? "N/A"}</td>
              <td className="px-4 py-2 border">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[status]}`}
                >
                  {status}
                </span>
              </td>
              <td className="px-4 py-2 border">
                {showEdit && (
                  <Link
                    href={`/list/students/${exam.id}/quiz?studentName=${student?.cnicNumber ?? ""}`}
                    className="flex justify-center text-indigo-600 hover:text-indigo-800 transition"
                  >
                    <Pencil className="w-5 h-5" />
                  </Link>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
</div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <Performance studentId={student?.cnicNumber ?? ""} />
        <Announcements username={student?.name ?? ""}  studentId= {student?.cnicNumber ?? ""}/>
      </div>
    </div>
  );
};

