"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function TodayResultPopup() {
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
    fetch("/api/results/declared-today")
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
    <Dialog open={open} onOpenChange={() => {}}>
    <DialogContent className="max-w-xl p-6">
        <DialogHeader>
        <DialogTitle className="text-xl font-bold text-green-600 flex items-center gap-2">
            🧾 Results Declared Today
        </DialogTitle>
        <p className="text-sm text-muted-foreground mt-1">
            The following results have been published.
        </p>
        </DialogHeader>

        <div className="mt-4 space-y-4 max-h-[350px] overflow-y-auto">
        {results.map((res) => (
            <div
            key={res.id}
            className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow transition"
            >
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-base font-semibold text-primary flex items-center gap-1">
                📘 {res.exam?.title}
                </h3>
                <span className="text-xs text-gray-500">
                {res.declaredOn ? new Date(res.declaredOn).toLocaleString() : "N/A"}
                </span>
            </div>
            <div className="text-sm text-gray-700 space-y-1">
                <p>
                <span className="font-medium">👤 Student:</span> {res.student?.name || res.student?.cnicNumber}
                </p>
                <p>
                <span className="font-medium">📊 Score:</span> {res.score} / {res.totalScore}
                </p>
                <p>
                <span className="font-medium">📌 Status:</span>{" "}
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

        <div className="mt-6 text-right">
        <button
            onClick={() => setOpen(false)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md shadow"
        >
            Close
        </button>
        </div>
    </DialogContent>
    </Dialog>

  );
}
