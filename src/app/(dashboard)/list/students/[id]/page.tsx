import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import FormContainer from "@/components/FormContainer";
import Performance from "@/components/Performance";
import StudentAttendanceCard from "@/components/StudentAttendanceCard";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Student } from "@prisma/client";
import { Item } from "@radix-ui/react-select";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

const SingleStudentPage = async () => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const searchParams = typeof window === "undefined"
    ? new URLSearchParams("") // fallback for SSR, replace with actual params if available
    : new URLSearchParams(window.location.search);
  const id = searchParams.get("id") || undefined;
  const student:
    | (Student)
    | null = await prisma.student.findFirst({
    where: { id },
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
    }
  });

  if (!student) {
    return notFound();
  }

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-3">
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

                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/id-card.png" alt="" width={14} height={14} />
                  <span>{student.cnicNumber!.charAt(0).toLocaleUpperCase() + student.cnicNumber!.slice(1) || "-"}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/religion.png" alt="" width={14} height={14} />
                  <span>{student.religion!.charAt(0).toLocaleUpperCase() + student.religion!.slice(1) || "-"}</span>
                </div>
                 <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/location-pin.png" alt="" width={14} height={14} />
                  <span>{student.addressLine1!.charAt(0).toLocaleUpperCase() + student.addressLine1!.slice(1) || "-"} {student.city!.charAt(0).toLocaleUpperCase() + student.city!.slice(1) || "-"} {student.stateProvince!.charAt(0).toLocaleUpperCase() + student.stateProvince!.slice(1) || "-"}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="w-1/3 flex-1 flex gap-9 justify-between flex-wrap">
            {/* CARD */}
            <div className="bg-white p-4 rounded-md flex w-full">
              <Image
                src="/singleAttendance.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <Suspense fallback="loading...">
                <StudentAttendanceCard id={student.id} />
              </Suspense>
            </div>
          </div>
        </div>
        {/* BOTTOM */}
        <div className="mt-4 bg-white rounded-md p-4 h-[800px]">
          <h1>Student&apos;s Schedule</h1>
        </div>
      </div>
      {/* RIGHT */}
    </div>
  );
};

export default SingleStudentPage;
