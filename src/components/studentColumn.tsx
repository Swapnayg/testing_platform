// columns.ts
import { ColumnDef } from "@tanstack/react-table";

export type Announcement = {
  id: number;
  title: string;
  description: string;
  date: string;
  resultDate?: string;
  announcementType: "GENERAL" | "EXAM_RESULT";
  isForAll: boolean;
  grades: { id: number; level: string }[];
  exams: { id: string; title: string; resultDate: string }[];
};

export function createColumns(): ColumnDef<Announcement>[] {
  return [
    {
      accessorKey: "title",
      header: "Title",
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "description",
      header: "Description",
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "resultDate",
      header: "Result Date",
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ getValue }) => {
        const dateStr = getValue() as string | undefined;
        return dateStr ? new Date(dateStr).toLocaleDateString() : "-";
      },
    },
  ];
}
