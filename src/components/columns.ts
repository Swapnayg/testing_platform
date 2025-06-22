import { ColumnDef } from "@tanstack/react-table";

type Grade = { id: number; name: string };
export type Announcement = {
  id: number;
  title: string;
  description: string;
  date: string;
  grades: Grade[];
};

export const columns: ColumnDef<Announcement>[] = [
  {
    accessorKey: "title",
    header: "Title",
    enableSorting: true,
  },
  {
    accessorKey: "description",
    header: "Description",
    enableSorting: false,
  },
  {
    accessorKey: "grades",
    header: "Grades",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.grades.map((g) => g.name).join(", ") || "N/A",
  },
  {
    accessorKey: "date",
    header: "Date",
    enableSorting: true,
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return date.toLocaleDateString();
    },
  },
];
