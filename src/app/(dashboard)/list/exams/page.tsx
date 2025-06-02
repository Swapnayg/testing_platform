import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Exam, Prisma, Subject, Category} from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from 'next';

type ExamList = Exam & {
  grade: {
    level: string;
    category: Category;
  };
  subject: Subject
};


export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const { page } = await searchParams;
  return {
    title: `Students - Page ${page ?? 1}`,
    description: `Viewing students on page ${page ?? 1}`,
  };
}


export default async function ExamListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
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
    <td className="flex items-center gap-4 p-4">{item.title}</td>
    <td className="hidden md:table-cell">{item.subject.name}</td>
    <td>{item.grade.category.catName}</td>
    <td className="hidden md:table-cell">{item.grade.level}</td>
    <td>{item.totalMCQ}</td>
    <td>{item.totalMarks}</td>
    <td>{new Intl.DateTimeFormat("en-US").format(item.startTime)}</td>
    {(role === "admin" || role === "teacher") && (
      <td className="flex items-center gap-2">
        <FormContainer table="exam" type="update" data={item} />
        <FormContainer table="exam" type="delete" id={item.id} />
      </td>
    )}
  </tr>
);

  const { page, ...queryParams } = await searchParams;
  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.ExamWhereInput = {};

  query.grade = {};
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "category":
            if (!query.grade) query.grade = {};
            if (!query.grade.category) query.grade.category = {};
            (query.grade.category as any).catName = value;
            break;
          case "subject":
            if (!query.subject) query.subject = {};
            (query.subject as any).name = value;
            break;
          case "search":
            query.title = { contains: value as string };
            break;
          default:
            break;
        }
      }
    }
  }

  // ROLE CONDITIONS

  switch (role) {
    case "admin":
      break;
    case "teacher":
      //query.lesson.teacherId = currentUserId!;
      break;
    case "student":
      // query.lesson.class = {
      //   students: {
      //     some: {
      //       id: currentUserId!,
      //     },
      //   },
      // };
      break;
    case "parent":
      // query.lesson.class = {
      //   students: {
      //     some: {
      //       parentId: currentUserId!,
      //     },
      //   },
      // };
      break;

    default:
      break;
  }

  var [data, count] = await prisma.$transaction([
    prisma.exam.findMany({
      where: query,
      include: {
        grade: {
          select: {
            level: true,
            category: { select: { catName: true } },
          },
        },
        subject: {
          select: { id: true, name: true },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.exam.count({ where: query }),
  ]);
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
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {(role === "admin" || role === "teacher") && (
              <FormContainer table="exam" type="create" />
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

