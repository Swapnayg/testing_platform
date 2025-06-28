// columns.ts
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

export type Grade = { id: number; level: string };
export type Exam = { id: string; title: string; resultDate: string };

export type Announcement = {
  id: number;
  title: string;
  description: string;
  date: string;
  resultDate?: string;
  announcementType: "GENERAL" | "EXAM_RESULT";
  isForAll: boolean;
  grades: Grade[];
  exams: Exam[];
};

export function createColumns(
  handleEdit: (announcement: Announcement) => void,
  handleRequestDelete: (announcement: Announcement) => void
): ColumnDef<Announcement>[] {
  return [
    {
      accessorKey: "title",
      header: "Title",
      enableSorting: true,
    },
    {
      accessorKey: "announcementType",
      header: "Type",
      enableSorting: true,
    },
    {
      accessorFn: row => row.announcementType === "GENERAL"
        ? row.grades.map(g => g.level).join(", ")
        : row.exams.map(e => e.title).join(", "),
      id: "target",
      header: "Targets",
      enableSorting: false,
      cell: info => info.getValue() || "N/A",
    },
    {
      accessorKey: "resultDate",
      header: "Result Date",
      enableSorting: true,
      cell: ({ getValue, row }) => {
        if (row.original.announcementType === "EXAM_RESULT") {
          const val = getValue() as string;
          return val ? new Date(val).toLocaleDateString() : "-";
        }
        return "-";
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      enableSorting: false,
    },
    {
      accessorKey: "date",
      header: "Created On",
      enableSorting: true,
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => {
        const announcement = row.original;
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleEdit(announcement)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleRequestDelete(announcement)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}
