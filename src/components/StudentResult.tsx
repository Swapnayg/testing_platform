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
import {  getFilteredStudentDetails } from "@/lib/actions";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { auth } from "@clerk/nextjs/server";
import { Exam } from "@prisma/client";
import { Eye, Download, Award, Trophy, Flower, Flower2} from "lucide-react"; 
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';

const PAGE_SIZE = 10;

const StudentResultsList = ({ username }: { username: string;  }) => {
  const [results, setResults] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const [selectedAttempt, setSelectedAttempt] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalStudents, setTotalStudents] = useState(0);



const loadFilteredResults = async (examId: string) => {
  setLoading(true);

  try {
    const rawResults = await getFilteredStudentDetails({ username });
    console.log(rawResults);
    setFilteredResults(rawResults);
    setResults(rawResults.slice(0, PAGE_SIZE));
    setCurrentPage(1);
  } catch (error) {
    console.error("Error loading filtered results:", error);
    setFilteredResults([]);
  }
  finally {
      setLoading(false);
  }
};

  useEffect(() => {
    if (username) {
      loadFilteredResults(username);
    }
  }, [username]);


  const handlePageChange = (page: number) => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    setResults(filteredResults.slice(start, end));
    setCurrentPage(page);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownload = async ( studentName: string, examTitle: string, ranking: number, totalStudents: number, declaredOn: Date ) => {
    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const centerX = pageWidth / 2;

      // Create gradient background
      pdf.setFillColor(240, 248, 255); // Light blue
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // Add gradient overlay
      pdf.setFillColor(255, 240, 245); // Light pink
      pdf.rect(0, 0, pageWidth, pageHeight * 0.5, 'F');
      
      pdf.setFillColor(240, 255, 240); // Light green
      pdf.rect(0, pageHeight * 0.5, pageWidth, pageHeight * 0.5, 'F');

      // Main certificate background
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(10, 10, pageWidth - 20, pageHeight - 20, 12, 12, 'F');
      
      // Gradient border effect - multiple layers for gradient appearance
      pdf.setDrawColor(147, 112, 219); // Light violet
      pdf.setLineWidth(3);
      pdf.roundedRect(10, 10, pageWidth - 20, pageHeight - 20, 12, 12);
      
      pdf.setDrawColor(219, 112, 147); // Light pink
      pdf.setLineWidth(1);
      pdf.roundedRect(11, 11, pageWidth - 22, pageHeight - 22, 11, 11);

      // Add colorful decorative bubbles (completely removed all symbols)
      const bubbles = [
        { x: 25, y: 25, r: 4, color: [255, 182, 193] },
        { x: pageWidth - 25, y: 25, r: 3.5, color: [221, 160, 221] },
        { x: 20, y: pageHeight - 25, r: 3, color: [173, 216, 230] },
        { x: pageWidth - 20, y: pageHeight - 25, r: 4.5, color: [144, 238, 144] },
        { x: 35, y: 50, r: 2.5, color: [255, 255, 224] },
        { x: pageWidth - 35, y: 50, r: 3, color: [255, 218, 185] },
        { x: 30, y: 70, r: 2, color: [255, 160, 122] },
        { x: pageWidth - 30, y: 70, r: 2.8, color: [176, 196, 222] },
        { x: 25, y: pageHeight - 50, r: 2.3, color: [255, 192, 203] },
        { x: pageWidth - 25, y: pageHeight - 50, r: 3.2, color: [152, 251, 152] },
        { x: 40, y: pageHeight - 35, r: 2.7, color: [255, 228, 181] },
        { x: pageWidth - 40, y: pageHeight - 35, r: 2.1, color: [230, 230, 250] },
      ];

      bubbles.forEach(bubble => {
        pdf.setFillColor(bubble.color[0], bubble.color[1], bubble.color[2]);
        pdf.circle(bubble.x, bubble.y, bubble.r, 'F');
      });

      // Header - moved up
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(36);
      pdf.setTextColor(80, 80, 80);
      pdf.text('CERTIFICATE OF ACHIEVEMENT', centerX, 45, { align: 'center' });

      // Line under header - changed to dark pink color for better highlighting
      pdf.setLineWidth(2);
      pdf.setDrawColor(219, 112, 147); // Dark pink color
      pdf.line(centerX - 90, 55, centerX + 90, 55);

      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(18);
      pdf.setTextColor(120, 120, 120);
      pdf.text('This is to certify that', centerX, 70, { align: 'center' });

      // Student name - moved up
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(44);
      pdf.setTextColor(147, 51, 234);
      pdf.text(studentName.toUpperCase(), centerX, 90, { align: 'center' });

      // Course info - moved up
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(20);
      pdf.setTextColor(80, 80, 80);
      pdf.text('has successfully completed the examination for', centerX, 110, { align: 'center' });

      // Subject title with dark pink color for better highlighting
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(26);
      pdf.setTextColor(219, 112, 147); // Dark pink color
      pdf.text(examTitle.toUpperCase(), centerX, 125, { align: 'center' });

      // Ranking badge with only light violet color (removed light pink gradient)
      const badgeWidth = 160;
      const badgeHeight = 24;
      const badgeX = centerX - badgeWidth/2;
      const badgeY = 135;

      // Create solid light violet background
      pdf.setFillColor(221, 160, 221); // Light violet only
      pdf.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 12, 12, 'F');
      
      // Simple border
      pdf.setDrawColor(147, 51, 234);
      pdf.setLineWidth(2);
      pdf.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 12, 12);

      // White text
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.setTextColor(255, 255, 255);
      pdf.text(`Ranked #${ranking} out of ${totalStudents}`, centerX, badgeY + 15, { align: 'center' });

      // Certified date moved down with 10px gap (MOVED DOWN WITH 10PX GAP)
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(16);
      pdf.setTextColor(120, 120, 120);
      const certDate = declaredOn ? formatDate(declaredOn.toISOString()) : 'June 20, 2024';
      pdf.text(`Certified on ${certDate}`, centerX, badgeY + 33, { align: 'center' }); // Changed from +27 to +33 for 10px gap

      // Signature section - moved down to create more space
      const sigY = pageHeight - 20;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(16);
      pdf.setTextColor(100, 100, 100);
      
      // Director signature with 1px black line
      pdf.text('Director', 80, sigY, { align: 'center' });
      pdf.setDrawColor(0, 0, 0); // Black color
      pdf.setLineWidth(1);
      pdf.line(45, sigY - 10, 115, sigY - 10);

      // Academic Officer signature with 1px black line
      pdf.text('Academic Officer', pageWidth - 80, sigY, { align: 'center' });
      pdf.setDrawColor(0, 0, 0); // Black color
      pdf.setLineWidth(1);
      pdf.line(pageWidth - 115, sigY - 10, pageWidth - 45, sigY - 10);

      // Add decorative flower symbols in corners (no @ symbols)
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(24);
      pdf.setTextColor(255, 105, 180);
      pdf.text('❀', 30, 40, { align: 'center' });
      pdf.setTextColor(138, 43, 226);
      pdf.text('❀', pageWidth - 30, 40, { align: 'center' });
      pdf.setTextColor(50, 205, 50);
      pdf.text('❀', 35, pageHeight - 40, { align: 'center' });
      pdf.setTextColor(255, 140, 0);
      pdf.text('❀', pageWidth - 35, pageHeight - 40, { align: 'center' });

      pdf.save(`${studentName.replace(/\s+/g, '_')}_Certificate.pdf`);

      toast({
        title: "Certificate Downloaded!",
        description: `${studentName}'s certificate has been generated successfully.`,
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Download Failed",
        description: "There was an error generating the certificate. Please try again.",
        variant: "destructive",
      });
    }
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
    XLSX.writeFile(wb, `quiz-results-${username}.xlsx`);
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
    pdf.save("quiz-results.pdf");
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
                    <div className="inline-flex items-center gap-2">
                      {/* View Button */}
                      <Link
                        href={`/list/students/${r.quizAttempt.quizId}/quizview?studentName=${r.student.cnicNumber}&userRole=student`}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="inline-flex items-center gap-1 text-slate-700 border-slate-300 hover:bg-slate-100 hover:border-slate-400 transition"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">View</span>
                        </Button>
                      </Link>

                      {/* Download Certificate Button */}
                     
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(r.student.cnicNumber,r.exam.title,r.grade,r.exam.totalParticipants,r.declaredOn)}
                          className="inline-flex items-center gap-1 text-green-700 border-green-300 hover:bg-green-100 hover:border-green-400 transition"
                        >
                          <Download className="w-4 h-4" />
                          <span className="text-sm">Certificate</span>
                        </Button>
                    </div>
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

export default StudentResultsList;
