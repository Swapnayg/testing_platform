/* eslint-disable react/no-unescaped-entities */
// AnnouncementsTable.tsx
"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { createColumns, Announcement } from "./studentColumn";
import { Button } from "@/components/ui/button";

export default function StudentAnnouncementsTable({
  data,
}: {
  data: Announcement[];
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [alertOpen, setAlertOpen] = useState(false);

  const columns = createColumns();
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // return (
  //   <>
  //     <div className="border rounded-lg overflow-x-auto">
  //       <table className="w-full text-sm">
  //         <thead className="bg-gray-100 text-gray-700">
  //           {table.getHeaderGroups().map((group) => (
  //             <tr key={group.id}>
  //               {group.headers.map((header) => {
  //                 const isSorted = header.column.getIsSorted();
  //                 return (
  //                   <th
  //                     key={header.id}
  //                     className={`px-4 py-2 text-left font-medium ${
  //                       header.column.getCanSort() ? "cursor-pointer select-none" : ""
  //                     }`}
  //                     onClick={
  //                       header.column.getCanSort()
  //                         ? () => header.column.toggleSorting(isSorted === "asc")
  //                         : undefined
  //                     }
  //                   >
  //                     <div className="flex items-center gap-1">
  //                       {flexRender(header.column.columnDef.header, header.getContext())}
  //                       {isSorted === "asc" && <ArrowUp className="w-3 h-3" />}
  //                       {isSorted === "desc" && <ArrowDown className="w-3 h-3" />}
  //                     </div>
  //                   </th>
  //                 );
  //               })}
  //             </tr>
  //           ))}
  //         </thead>
  //         <tbody>
  //           {table.getRowModel().rows.map((row) => (
  //             <tr key={row.id} className="border-b hover:bg-gray-50">
  //               {row.getVisibleCells().map((cell) => (
  //                 <td key={cell.id} className="px-4 py-2">
  //                   {flexRender(cell.column.columnDef.cell, cell.getContext())}
  //                 </td>
  //               ))}
  //             </tr>
  //           ))}
  //         </tbody>
  //       </table>
  //     </div>

  //     <div className="mt-4 flex justify-between items-center">
  //       <div className="text-sm text-gray-600">
  //         Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
  //       </div>
  //       <div className="space-x-2">
  //         <Button
  //           variant="outline"
  //           size="sm"
  //           onClick={() => table.previousPage()}
  //           disabled={!table.getCanPreviousPage()}
  //         >
  //           Previous
  //         </Button>
  //         <Button
  //           variant="outline"
  //           size="sm"
  //           onClick={() => table.nextPage()}
  //           disabled={!table.getCanNextPage()}
  //         >
  //           Next
  //         </Button>
  //       </div>
  //     </div>
  //   </>
  // );

return (
<div className="w-full">
  {/* Table Container */}
  <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm bg-white">
    <table className="min-w-[600px] w-full text-sm text-slate-700">
      <thead className="bg-slate-100 text-slate-800 uppercase text-xs">
        {table.getHeaderGroups().map((group) => (
          <tr key={group.id}>
            {group.headers.map((header) => {
              const isSorted = header.column.getIsSorted()
              return (
                <th
                  key={header.id}
                  className={`px-4 py-3 text-left font-semibold whitespace-nowrap border-b border-slate-200 ${
                    header.column.getCanSort()
                      ? "cursor-pointer select-none hover:text-emerald-700 transition-colors"
                      : ""
                  }`}
                  onClick={
                    header.column.getCanSort()
                      ? () => header.column.toggleSorting(isSorted === "asc")
                      : undefined
                  }
                >
                  <div className="flex items-center gap-1">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {isSorted === "asc" && <ArrowUp className="w-3 h-3 text-emerald-600" />}
                    {isSorted === "desc" && <ArrowDown className="w-3 h-3 text-emerald-600" />}
                  </div>
                </th>
              )
            })}
          </tr>
        ))}
      </thead>

      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr
            key={row.id}
            className="border-b border-slate-100 hover:bg-emerald-50/30 transition-all"
          >
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="px-4 py-3 whitespace-nowrap text-slate-700">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Pagination */}
  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
    <span className="text-sm text-slate-600 text-center sm:text-left">
      Page <strong>{table.getState().pagination.pageIndex + 1}</strong> of{" "}
      <strong>{table.getPageCount()}</strong>
    </span>

    <div className="flex gap-2">
      <Button
        size="sm"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
        className="bg-slate-400 text-white hover:bg-slate-500 disabled:opacity-50"
      >
        Previous
      </Button>
      <Button
        size="sm"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
        className="bg-slate-400 text-white hover:bg-slate-500 disabled:opacity-50"
      >
        Next
      </Button>
    </div>
  </div>
</div>

)

}
