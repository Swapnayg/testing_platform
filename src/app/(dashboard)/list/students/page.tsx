import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";

import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import {Prisma, Student } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from 'next';

type StudentList = Student & {registrationCount: number;  };


export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const page = params.page ?? '1';
  const search = params.search ?? 'none';

  return {
    title: `Students - Page ${page}`,
    description: `Search results for "${search}" on page ${page}`,
  };
}



export default async function StudentListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string; })?.role;

  const columns = [
    {
      header: "",
      accessor: "id",
      className: "hidden md:table-cell",
    },
    {
      header: "Father Name",
      accessor: "fatherName",
    },
    {
      header: "Email",
      accessor: "email",
    },
    {
      header: "Phone",
      accessor: "mobileNumber",
    },
    {
      header: "CNIC Number",
      accessor: "cnicNumber",
    },
    ...(role === "admin"
      ? [
        {
          header: "Actions",
          accessor: "action",
        },
      ]
      : []),
  ];

  const renderRow = (item: StudentList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.profilePicture || "/noAvatar.png"}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover" />
        <div className="flex flex-col">
          <h3 className="font-semibold">{ item.name!.charAt(0).toLocaleUpperCase() + item.name!.slice(1)}</h3>
          <p className="text-xs text-gray-500">{item.rollNo}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{ item.fatherName!.charAt(0).toLocaleUpperCase() + item.fatherName!.slice(1)}</td>
      <td className="hidden md:table-cell"> { item.email!.charAt(0).toLocaleUpperCase() + item.email!.slice(1)}</td>
      <td className="hidden md:table-cell">{item.mobileNumber}</td>
      <td className="hidden md:table-cell">{item.cnicNumber}</td>
      <td>
        {role === "admin" && (
          <div className="flex items-center gap-2">
            <Link href={`/list/students/${item.cnicNumber}`}>
              <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
                <Image src="/view.png" alt="" width={16} height={16} />
              </button>
            </Link>
            <FormContainer table="student" type="delete" id={item.id} />
            {item.registrationCount > 0 && (

             <Link href={`/list/students/${item.cnicNumber}`}>
              <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
                <Image src="/atm-card.png" alt="" width={16} height={16} />
              </button>
            </Link>
            )}
          </div>
        )}
      </td>
    </tr>
  );
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const queryParams = params.search || '';

  const p = page;




  const where = {
    OR: [
      { name: { contains: queryParams } },
      { fatherName: { contains: queryParams } },
      { cnicNumber: { contains: queryParams } },
      { religion: { contains: queryParams } },
      { email: { contains: queryParams } },
      { mobileNumber: { contains: queryParams } },
      { city: { contains: queryParams } },
      { stateProvince: { contains: queryParams } },
      { addressLine1: { contains: queryParams } },
      { instituteName: { contains: queryParams } },
      { rollNo: { contains: queryParams } },
    ],
  };

  var [students, count] = await prisma.$transaction([
    prisma.student.findMany({
      where,
      select: {
        id: true,
        name: true,
        fatherName: true,
        dateOfBirth: true,
        religion: true,
        cnicNumber: true,
        profilePicture: true,
        email: true,
        mobileNumber: true,
        city: true,
        stateProvince: true,
        addressLine1: true,
        instituteName: true,
        rollNo: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.student.count({ where }),
  ]);

    var data = await Promise.all(
    students.map(async (student) => {
    const registrationCount = await prisma.registration.count({
      where: {
        studentId: student.cnicNumber,
        status: 'PENDING', // <-- Customize this condition as needed
      },
    });

    return {
      ...student,
      registrationCount,
    };
  })
  );
  if (data.length === 0) {
    //throw new Error('No exams found.');
    data = [];
  }

  
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Students</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            {/* <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button> */}
            {role === "admin" && (
              // <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              //   <Image src="/plus.png" alt="" width={14} height={14} />
              // </button>
              <FormContainer table="student" type="create" />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
}
