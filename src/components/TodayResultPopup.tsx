/* eslint-disable @next/next/no-async-client-component */
"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose,} from "@/components/ui/dialog";

export default function TodayResultPopup({ username }: { username: string }) {

  const [open, setOpen] = useState(false);
  type Result = {
    id: string | number;
    exam?: { title?: string };
    student?: { name?: string; cnicNumber?: string };
    score?: number;
    totalScore?: number;
    status?: string;
    declaredOn?: string | Date;
  };

  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    if (!username) return;
    fetch(`/api/results/declared-today?username=${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setResults(data);
          setOpen(true);
        }
      });
  }, []);

  if (!results.length) return null;

  return (

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent
    className="max-w-xl w-full rounded-lg p-6 pt-4 pb-6 relative"
    style={{
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      margin: 0,
      position: "fixed",
    }}
  >

    {/* Title */}
    <DialogHeader>
      <DialogTitle className="text-lg font-semibold text-green-600 flex items-center gap-2">
        📣 Results Declared Today
      </DialogTitle>
      <p className="text-sm text-muted-foreground">
        The following results have been published.
      </p>
    </DialogHeader>

    {/* Result List */}
    <div className="mt-4 max-h-[300px] overflow-y-auto space-y-4 pr-1">
      {results.map((res) => (
        <div
          key={res.id}
          className="border border-gray-200 rounded-md p-4 bg-white shadow-sm"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-base font-semibold text-primary flex items-center gap-1">
              📘 {res.exam?.title}
            </h3>
            <span className="text-xs text-gray-500">
              {res.declaredOn
                ? new Date(res.declaredOn).toLocaleString()
                : "N/A"}
            </span>
          </div>
          <div className="text-sm text-gray-700 space-y-1">
            <p>
              <strong>👤 Student:</strong>{" "}
              {res.student?.name || res.student?.cnicNumber}
            </p>
            <p>
              <strong>📊 Score:</strong> {res.score} / {res.totalScore}
            </p>
            <p>
              <strong>📌 Status:</strong>{" "}
              <span
                className={`font-bold ${
                  res.status === "PASSED"
                    ? "text-green-600"
                    : res.status === "FAILED"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}
              >
                {res.status}
              </span>
            </p>
          </div>
        </div>
      ))}
    </div>

    {/* Footer Button */}
    <div className="mt-6 flex justify-end">
      <button
        onClick={() => setOpen(false)}
        className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md"
      >
        Close
      </button>
    </div>
  </DialogContent>
</Dialog>


  );
}
