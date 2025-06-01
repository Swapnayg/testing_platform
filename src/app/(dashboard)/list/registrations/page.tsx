import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Registration, Prisma} from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

type RegistrationList = Registration & {
  catGrade: string;
  olympiadCategory: string;
};

const RegistrationListPage = async () => {

const { userId, sessionClaims } = auth();
const role = (sessionClaims?.metadata as { role?: string })?.role;
const currentUserId = userId;


const columns = [
  {
    header: "Full Name",
    accessor: "name" + " " + "fatherName",
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
  {
    header: "Category",
    accessor: "olympiadCategory",
  },
  {
    header: "Grade",
    accessor: "catGrade",
  },
  {
    header: "Payment Method",
    accessor: "paymentOption",
  },
  {
    header: "Registration Date",
    accessor: "registerdAt",
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

const renderRow = (item: RegistrationList) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
  >
    <td>{item.olympiadCategory}</td>
    <td>{item.catGrade}</td>
    <td>{item.paymentOption}</td>
    <td>{new Intl.DateTimeFormat("en-US").format(item.registerdAt)}</td>
    {(role === "admin") && (
      <td className="flex items-center gap-2">

      </td>
    )}
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

  const query: Prisma.RegistrationWhereInput = {};

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
          case "paymentOption":
            (query as any).paymentOption = { contains: value };
            break;
          case "catGrade":
            (query as any).catGrade = { contains: value };
            break;
          case "category":
            (query as any).olympiadCategory = { contains: value };
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
    default:
      break;
  }

  var [data, count] = await prisma.$transaction([
    prisma.registration.findMany({
      where: query,
      select: {
        id: true,
        paymentOption: true,
        olympiadCategory: true,
        catGrade: true,
        registerdAt: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.registration.count({ where: query }),
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

export default RegistrationListPage;
