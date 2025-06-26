/* eslint-disable @next/next/no-img-element */

import type { Metadata } from 'next';
import { Pencil } from "lucide-react";
import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import BigCalendar from "@/components/BigCalender";
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
import { GetServerSideProps } from 'next';

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

  const registrations = await prisma.registration.findMany({
    where: {
      studentId: id,
      status: 'PENDING',
    },
    orderBy: {
      id: 'desc', // optional, if you have a timestamp field
    },
    select:
    {
      id: true,
      olympiadCategory:true,
      catGrade:true,
      paymentOption:true,
      otherName:true,
      transactionId:true,
      totalAmount:true,
      dateOfPayment:true,
      transactionReceipt:true,
    }
  });
  console.log("student id" + id);
   const attempts = await prisma.quizAttempt.findMany({
    where: {
      studentId: id,
    },
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
  });

  if (!student) {
    return notFound();
  }
  console.log(registrations);

return (
 <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* USER INFO CARD */}
          <div className="bg-rose-200 w-1/3 py-6 px-4 rounded-md flex-1 flex gap-3">
           <div className="w-1/3 py-10">
              <Image
                src={student.profilePicture || "/noAvatar.png"}
                alt=""
                width={144}
                height={144}
                className="w-36 h-36 rounded-full object-cover"
              />
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">
                  {student.name!.charAt(0).toLocaleUpperCase() + student.name!.slice(1)}  {student.fatherName!.charAt(0).toLocaleUpperCase() + student.fatherName!.slice(1)}
                </h1>
                 
                {role === "admin" && (
                  <FormContainer table="student" type="update" data={student} />
                )}
              </div>
              <p className="text-sm text-gray-500">
                {student.rollNo!}
              </p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/maleFemale.png" alt="" width={14} height={14} />
                  <span>{student.gender!.charAt(0).toLocaleUpperCase() + student.gender!.slice(1)}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/date.png" alt="" width={14} height={14} />
                  <span>
                    {new Intl.DateTimeFormat("en-GB").format(student.dateOfBirth)}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/mail.png" alt="" width={14} height={14} />
                  <span>{student.email!.charAt(0).toLocaleUpperCase() + student.email!.slice(1) || "-"}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/phone.png" alt="" width={14} height={14} />
                  <span>{student.mobileNumber || "-"}</span>
                </div>

                <div className="w-full md:w-1/2 lg:w-full 2xl:w-1/2 flex items-center gap-2">
                  <Image src="/id-card.png" alt="" width={14} height={14} />
                  <span>{student.cnicNumber!.charAt(0).toLocaleUpperCase() + student.cnicNumber!.slice(1) || "-"}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/religion.png" alt="" width={14} height={14} />
                  <span>{student.religion!.charAt(0).toLocaleUpperCase() + student.religion!.slice(1) || "-"}</span>
                </div>
                 <div className="w-full flex items-center gap-2">
                  <Image src="/location-pin.png" alt="" width={14} height={14} />
                  <span>{student.addressLine1!.charAt(0).toLocaleUpperCase() + student.addressLine1!.slice(1) || "-"} {student.city!.charAt(0).toLocaleUpperCase() + student.city!.slice(1) || "-"} {student.stateProvince!.charAt(0).toLocaleUpperCase() + student.stateProvince!.slice(1) || "-"}</span>
                </div>
              </div>
            </div>
            </div>
          {/* SMALL CARDS */}
          <div className="flex-1 flex gap-4 justify-between flex-wrap">
            {/* CARD */}
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleAttendance.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div className="">
                <h1 className="text-xl font-semibold">90%</h1>
                <span className="text-sm text-gray-400">Attendance</span>
              </div>
            </div>
            {/* CARD */}
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleBranch.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div className="">
                <h1 className="text-xl font-semibold">6th</h1>
                <span className="text-sm text-gray-400">Grade</span>
              </div>
            </div>
            {/* CARD */}
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleLesson.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div className="">
                <h1 className="text-xl font-semibold">18</h1>
                <span className="text-sm text-gray-400">Lessons</span>
              </div>
            </div>
            {/* CARD */}
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleClass.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div className="">
                <h1 className="text-xl font-semibold">6A</h1>
                <span className="text-sm text-gray-400">Class</span>
              </div>
            </div>
          </div>
        </div>
        {/* BOTTOM */}
        <div className="mt-4 bg-white rounded-md p-4 h-[800px]">
          <h1>Student&apos;s Schedule</h1>
          <BigCalendar data={[]} />
        </div>

        <div className="mt-4 bg-white rounded-md p-4 h-[200px] w-full">
          <h1>Payment Details</h1>
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
          }))} />
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
            {attempts.map((attempt) => (
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
                  <Link href={`/list/students/${attempt.quiz.id}/quiz?studentName=${attempt.studentId}`} className="w-full flex items-center justify-center text-red-600 hover:text-red-800 transition">
                    <Pencil className="w-5 h-5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
          </div>
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Shortcuts</h1>
          <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
            <Link className="p-3 rounded-md bg-lamaSkyLight" href="/">
              Student&apos;s Lessons
            </Link>
            <Link className="p-3 rounded-md bg-lamaPurpleLight" href="/">
              Student&apos;s Teachers
            </Link>
            <Link className="p-3 rounded-md bg-pink-50" href="/">
              Student&apos;s Exams
            </Link>
            <Link className="p-3 rounded-md bg-lamaSkyLight" href="/">
              Student&apos;s Assignments
            </Link>
            <Link className="p-3 rounded-md bg-lamaYellowLight" href="/">
              Student&apos;s Results
            </Link>
          </div>
        </div>
        <Performance />
        <Announcements />
      </div>
    </div>
  );
};

