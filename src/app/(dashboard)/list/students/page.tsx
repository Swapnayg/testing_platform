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

type StudentList = Student & { };

const StudentListPage = async () => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
  {
    header: "",
    accessor: "id",
    className: "hidden md:table-cell",
  },
  {
    header: "Father Name",
    accessor:"fatherName",
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
          src={item.profilePicture ||  "/noAvatar.png"}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-500">{item.rollNo}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.fatherName}</td>
      <td className="hidden md:table-cell">{item.email}</td>
      <td className="hidden md:table-cell">{item.mobileNumber}</td>
      <td className="hidden md:table-cell">{item.cnicNumber}</td>
      <td>
          {role === "admin" && (
            <div className="flex items-center gap-2">
            <Link href={`/list/students/${item.id}`}>
              <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
                <Image src="/view.png" alt="" width={16} height={16} />
              </button>
            </Link>
            <FormContainer table="student" type="delete" id={item.id} />
            </div>
          )}
      </td>
    </tr>
  );

    const searchParams = typeof window === "undefined"
    ? new URLSearchParams("") // fallback for SSR, replace with actual params if available
    : new URLSearchParams(window.location.search);

  const page = searchParams.get("page");
  const p = page ? parseInt(page) : 1;

  // Convert searchParams to an object for queryParams
  const queryParams: Record<string, string | undefined> = {};
  searchParams.forEach((value, key) => {
    if (key !== "page") {
      queryParams[key] = value;
    }
  });

  // URL PARAMS CONDITION

  const query: Prisma.StudentWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "name":
            (query as any).name = { contains: value };
            break;
          case "fatherName":
            (query as any).fatherName = { contains: value };
            break;
          case "email":
            (query as any).email = { contains: value };
            break;
          case "mobileNumber":
            (query as any).mobileNumber = { contains: value };
            break;
          case "cnicNumber":
            (query as any).cnicNumber = { contains: value };
            break;
          case "search":
            query.name = { contains: value };
            break;
          default:
            break;
        }
      }
    }
  }

  var [data, count] = await prisma.$transaction([
    prisma.student.findMany({
      where: query,
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
    prisma.student.count({ where: query }),
  ]);
  if (data.length === 0) {
    //throw new Error('No exams found.');
    data = []
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Students</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
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
};

export default StudentListPage;
