// columns.ts
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

export type Grade = { id: number; level: string };

export type Announcement = {
  id: number;
  title: string;
  description: string;
  resultDate: string;
  grades: Grade[];
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
      accessorFn: row => row.grades.map(g => g.level).join(", "),
      id: "grades",
      header: "Grades",
      enableSorting: true,
      sortingFn: (a, b, columnId) =>
        String(a.getValue(columnId)).localeCompare(String(b.getValue(columnId))),
      cell: info => info.getValue() || "N/A",
    },
    {
      accessorKey: "resultDate",
      header: "Date",
      enableSorting: true,
      cell: ({ getValue }) => {
        const date = new Date(getValue() as string);
        return date.toLocaleDateString();
      },
    },
    {
      accessorFn: row => row.description,
      id: "description",
      header: "Description",
      enableSorting: false,
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
