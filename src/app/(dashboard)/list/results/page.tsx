/* eslint-disable @next/next/no-async-client-component */
"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getAllExams, getFilteredExamResults,getacceptedCount,getExamDetails } from "@/lib/actions";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { auth } from "@clerk/nextjs/server";
import { Exam } from "@prisma/client";
import { Eye } from 'lucide-react';
import Link from 'next/link';

const PAGE_SIZE = 10;

const ResultListPage = () => {
  const [exams, setExams] = useState<{ id: string; title: string }[]>([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const [selectedAttempt, setSelectedAttempt] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalStudents, setTotalStudents] = useState(0);
  const [selectedExamDetails, setSelectedExamDetails] = useState<Exam | null>(null);


const loadFilteredResults = async (examId: string) => {
  setLoading(true);

  try {
    const filter = {
      examId,
      grade,
      subject,
    };
    const rawResults = await getFilteredExamResults(filter);
    const getcount = await getacceptedCount({ examId });
    setTotalStudents(getcount);
    // Add percentage and rank
    const getExam = await getExamDetails({ examId });
    // Store in state
    setFilteredResults(rawResults);
    setResults(rawResults.slice(0, PAGE_SIZE));
    setCurrentPage(1);
    setSelectedExamDetails(getExam);
  } catch (error) {
    console.error("Error loading filtered results:", error);
    setFilteredResults([]);
  }
  finally {
      setLoading(false);
  }
};

  useEffect(() => {
    getAllExams().then(setExams);
  }, []);

  useEffect(() => {
    if (selectedExam) {
      loadFilteredResults(selectedExam);
    }
  }, [selectedExam, grade, subject]);


  const handlePageChange = (page: number) => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    setResults(filteredResults.slice(start, end));
    setCurrentPage(page);
  };

  const handleExportAll = () => {
    const data = filteredResults.map((r) => ({
      Student: r.student.name,
      CNIC: r.student.cnicNumber,
      Grade: r.exam.grades.map((g: { level: any; }) => g.level).join(", "),
      Subject: r.exam.subject.name,
      Score: r.score,
      SubmittedAt: new Date(r.gradedAt).toLocaleString(),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Results");
    XLSX.writeFile(wb, `exam-results-${selectedExam}.xlsx`);
  };

  const handlePrint = async () => {
    const table = document.getElementById("results-table");
    if (!table) return;
    const canvas = await html2canvas(table);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("exam-results.pdf");
  };

  const totalPages = Math.ceil(filteredResults.length / PAGE_SIZE);

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Results Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
       <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        {/* Left: Filters */}
        <div className="flex flex-wrap gap-4">
          <select
            value={selectedExam}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedExam(id);
            }}
            className="px-3 py-2 border rounded-md w-60"
          >
            <option value="">Select Exam</option>
            {exams.map((e) => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>

          {/* Uncomment if needed later
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All Grades</option>
            <option value="Grade 10">Grade 10</option>
            <option value="Grade 11">Grade 11</option>
            <option value="Grade 12">Grade 12</option>
          </select>

          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All Subjects</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Science">Science</option>
            <option value="English">English</option>
          </select>
          */}
        </div>

        {/* Right: Buttons */}
        <div className="flex gap-3">
          <Button onClick={handleExportAll} disabled={!filteredResults.length}>
            Export Excel
          </Button>
          <Button onClick={handlePrint} disabled={!filteredResults.length}>
            Print / PDF
          </Button>
        </div>
      </div>

      {selectedExamDetails && (
        <div className="bg-slate-50 px-4 py-2 rounded-md mb-4 shadow-sm border">
          <h2 className="text-lg font-semibold mb-3">{selectedExamDetails.title}</h2>
          <div className="flex flex-wrap items-center gap-x-10 gap-y-3 text-sm text-slate-700">
            <div>
              <span className="font-medium">Total Marks:</span> {selectedExamDetails.totalMarks}
            </div>
            <div>
              <span className="font-medium">Total MCQs:</span> {selectedExamDetails.totalMCQ}
            </div>
            <div>
              <span className="font-medium">Time Limit:</span> {selectedExamDetails.timeLimit} min
            </div>
            <div>
              <span className="font-medium">Registered:</span> {totalStudents}
            </div>
            <div>
              <span className="font-medium">Attempted:</span> {filteredResults.length}
            </div>
            <div>
              <span className="font-medium">Not Attempted:</span> {totalStudents - filteredResults.length}
            </div>
            <div>
              <span className="font-medium">Result Announced:</span>{" "}
              {selectedExamDetails.resultDate ? (
                <span className="text-slate-700">
                  {new Date(selectedExamDetails.resultDate).toLocaleDateString()}
                </span>
              ) : (
                <span className="text-red-600 font-semibold ml-1">Not Declared</span>
              )}
            </div>
          </div>
        </div>
      )}

        {/* Results Table */}
        <div id="results-table">
          {loading ? (
            <p>Loading...</p>
          ) : results.length === 0 ? (
            <p>No results found.</p>
          ) : (
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-2 text-left">Student</th>
                  <th className="p-2 text-left">Grade</th>
                  <th className="p-2 text-left">Subject</th>
                  <th className="p-2 text-left">Score</th>
                  <th className="p-2 text-left">Correct</th>
                  <th className="p-2 text-left">Incorrect</th>
                  <th className="p-2 text-left">Submitted</th>
                  <th className="p-2 text-left">Rank</th>
                  <th className="p-2 text-center">Actions</th>    
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={r.id} className="border-t">
                    
                    <td className="p-2">{r.student.name}</td>
                    <td className="p-2">{r.exam.grades.map((g: { level: any; }) => g.level).join(", ")}</td>
                    <td className="p-2">{r.exam.subject.name}</td>
                    <td className="p-2">{r.score}</td>
                    <td className="p-2">{r.correctAnswers}</td>
                    <td className="p-2">{r.exam.totalMCQ - r.correctAnswers}</td>
                    <td className="p-2">{new Date(r.gradedAt).toLocaleString()}</td>
                    <td className="p-2">{r.grade}</td>
                    <td className="p-2 text-center">
                     <Link href={`/list/students/${r.quizAttempt.quizId}/quizview?studentName=${r.student.cnicNumber}&userRole=admin`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="inline-flex items-center gap-1 text-slate-700 border-slate-300 hover:bg-slate-100 hover:border-slate-400 transition"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                    </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <Button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
            Previous
          </Button>
          <span className="text-sm text-slate-700">
            Page {currentPage} of {totalPages || 1}
          </span>
          <Button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>
            Next
          </Button>
        </div>

        {/* Answer View Modal */}
        {selectedAttempt && (
          <Dialog open={true} onOpenChange={() => setSelectedAttempt(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Answers - {selectedAttempt.student.name}</DialogTitle>
              </DialogHeader>
              <div className="max-h-[400px] overflow-y-auto space-y-3 mt-2">
                {selectedAttempt.answers.map((a: any) => (
                  <div key={a.id} className="bg-slate-50 p-3 border rounded">
                    <p className="font-semibold mb-1">{a.question.text}</p>
                    <p>Answer: {a.answerText}</p>
                    {a.question.type === "MULTIPLE_CHOICE" && (
                      <p>Option: {a.QuestionOption?.text}</p>
                    )}
                    <p className="text-sm text-slate-500">Points: {a.pointsEarned}</p>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default ResultListPage;
