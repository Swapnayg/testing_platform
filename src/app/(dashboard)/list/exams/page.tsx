import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Exam, Prisma, Subject, Category, ExamStatus } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from 'next';

type ExamList = Exam & {
  grade: {
    level: string;
    category: Category;
  };
  subject: Subject;
  approvedCount:number;
};


export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const page = params.page ?? '1';
  const search = params.search ?? 'none';

  return {
    title: `Exams - Page ${page}`,
    description: `Search results for "${search}" on page ${page}`,
  };
}


export default async function ExamListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
const { userId, sessionClaims } = auth();
const role = (sessionClaims?.metadata as { role?: string })?.role;
const currentUserId = userId;


const columns = [
  {
    header: "Title",
    accessor: "title",
  },
  {
    header: "Subject Name",
    accessor: "subject.name",
    className: "hidden md:table-cell",
  },
  {
    header: "Category",
    accessor: "grade.category.catName",
  },
  {
    header: "Grade",
    accessor: "grade.level",
    className: "hidden md:table-cell",
  },
  {
    header: "MCQ's Count",
    accessor: "mcqCount",
  },
  {
    header: "Total Marks",
    accessor: "totalMarks",
  },
  {
    header: "Start Date",
    accessor: "startTime",
  },
  {
    header: "Students",
    accessor: "_count",
  },
  {
    header: "Status",
    accessor: "status",
  },
  ...(role === "admin" || role === "teacher"
    ? [
        {
          header: "Actions",
          accessor: "action",
        },
      ]
    : []),
];

const renderRow = (item: ExamList) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
  >
    <td className="flex items-center gap-4 p-4"> { item.title!.charAt(0).toLocaleUpperCase() + item.title!.slice(1)}</td>
    <td className="hidden md:table-cell">{ item.subject.name!.charAt(0).toLocaleUpperCase() + item.subject.name!.slice(1)}</td>
    <td>{item.grade.category.catName}</td>
    <td className="hidden md:table-cell">{item.grade.level}</td>
    <td>{item.totalMCQ}</td>
    <td>{item.totalMarks}</td>
    <td>{new Intl.DateTimeFormat().format(item.startTime)}</td>
    <td className="text-center">{item.approvedCount}</td>
    <td>
      {item.status === "NOT_STARTED" && (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
          Not Started
        </span>
      )}
      {item.status === "IN_PROGRESS" && (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
          In Progress
        </span>
      )}
      {item.status === "COMPLETED" && (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          Completed
        </span>
      )}
    </td>
    {(role === "admin" || role === "teacher") && item.status === "NOT_STARTED" && (
      <td className="flex items-center gap-2">
        <FormContainer table="exam" type="update" data={item} />
        <FormContainer table="exam" type="delete" id={item.id} />
      </td>
    )}
  </tr>
);
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const queryParams = params.search || '';

  const p = page;

  const where = {
    OR: [
        { title: { contains: queryParams.trim() } },
        { grade: {
            level: { contains: queryParams.trim() },
            category: { catName: { contains: queryParams.trim()  } }
          }
        },
        { subject: { name: { contains: queryParams.trim()  } } },
        ...(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"].includes(queryParams.trim())
      ? [{ status: { equals: queryParams.trim() as ExamStatus } }]
      : []),
      
      ...( !isNaN(Number(queryParams.trim()))
      ? [
          { totalMCQ: Number(queryParams.trim()) },      // example numeric field
          { totalMarks: Number(queryParams.trim()) },     // another example field
        ]
      : []),


      ],
  };
  
var [data, count] = await prisma.$transaction([
  prisma.exam.findMany({
    where,
    select: {
      id: true,
      title: true,
      status: true,
      totalMCQ: true,
      totalMarks: true,
      timeLimit: true,
      startTime: true,
      endTime: true,
      createdAt: true,
      categoryId: true,
      gradeId: true,
      subjectId: true,
      grade: {
        select: {
          level: true,
          category: {
            select: {
              id: true,
              catName: true
            }
          }
        }
      },
      subject: {
        select: {
          id: true,
          name: true
        }
      },
      registrations: {
        select: {
          registration: {
            select: {
              status: true,
            },
          },
        },
      },
    },
    take: ITEM_PER_PAGE,
    skip: ITEM_PER_PAGE * (p - 1),
  }),
  prisma.exam.count({ where }),
]);


const exams: ExamList[] = data.map(exam => ({
  ...exam,
  approvedCount: exam.registrations.filter(
    r => r.registration.status === 'APPROVED'
  ).length
}));

  if (data.length === 0) {
  //throw new Error('No exams found.');
  data = []
}


  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Exams</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            {/* <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button> */}
            {(role === "admin" || role === "teacher") && (
              <FormContainer table="exam" type="create" />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={exams} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

