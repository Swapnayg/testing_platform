import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Exam, Prisma, Subject, Teacher, Category} from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

type ExamList = Exam & {
  grade: {
    level: string;
    category: Category;
  };
  subject: Subject;
};

const ExamListPage = async () => {

const { userId, sessionClaims } = auth();
const role = (sessionClaims?.metadata as { role?: string })?.role;
const currentUserId = userId;


const columns = [
  {
    header: "Subject Name",
    accessor: "name",
  },
  {
    header: "Class",
    accessor: "class",
  },
  {
    header: "Teacher",
    accessor: "teacher",
    className: "hidden md:table-cell",
  },
  {
    header: "Date",
    accessor: "date",
    className: "hidden md:table-cell",
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
    <td className="flex items-center gap-4 p-4">{item.grade.level}</td>
    <td>{item.grade.category.catName}</td>

    <td className="hidden md:table-cell">
      {new Intl.DateTimeFormat("en-US").format(item.startTime)}
    </td>
    <td>
      <div className="flex items-center gap-2">
        {(role === "admin" || role === "teacher") && (
          <>
            <FormContainer table="exam" type="update" data={item} />
            <FormContainer table="exam" type="delete" id={item.id} />
          </>
        )}
      </div>
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

  const query: Prisma.ExamWhereInput = {};

  query.grade = {};
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "catId":
            query.grade.category = parseInt(value);
            break;
          case "subId":
            query.grade.subjectId = value;
            break;
          case "search":
            query.grade.subject = {
              name: { contains: value },
            };
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
            category: { select: { catName: true } },
          },
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

export default ExamListPage;
