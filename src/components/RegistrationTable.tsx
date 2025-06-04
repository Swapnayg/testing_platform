/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import {updateReject, updateAccept} from "@/lib/actions";
import jsPDF from 'jspdf';
import prisma from "@/lib/prisma";
import { Student, Exam, ExamOnRegistration } from "@prisma/client";

interface Registration {
  id: number;
  olympiadCategory?: string;
  catGrade?: string;
  paymentOption?: string;
  otherName?: string;
  transactionId?: string;
  totalAmount?: string;
  dateOfPayment: string;
  transactionReceipt?: string;
}


export default function RegistrationTable({ registrations }: { registrations: Registration[] }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const addColoredSection = (doc: jsPDF, title: string, yPos: number, bgColor: [number, number, number], textColor: [number, number, number] = [255, 255, 255], topMargin: number = 0) => {
    const adjustedYPos = yPos + topMargin;
    
    // Check if we need a new page (section header + some content space)
    if (adjustedYPos > 250) {
      doc.addPage();
      return addColoredSection(doc, title, 30, bgColor, textColor, topMargin);
    }
    
    // Add colored background for section
    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.rect(15, adjustedYPos - 8, 180, 12, 'F');
    
    // Add section title
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(title, 20, adjustedYPos);
    
    // Reset text color to black
    doc.setTextColor(0, 0, 0);
    
    return adjustedYPos + 15;
  };

  const addTableRow = (doc: jsPDF, label: string, value: string, yPos: number, isEven: boolean = false) => {
    // Check if we need a new page
    if (yPos > 270) {
      doc.addPage();
      yPos = 40;
    }
    
    // Alternate row colors
    if (isEven) {
      doc.setFillColor(245, 245, 245);
      doc.rect(15, yPos - 6, 180, 10, 'F');
    }
    
    // Add table borders
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.rect(15, yPos - 6, 90, 10);
    doc.rect(105, yPos - 6, 90, 10);
    
    // Add content with consistent font size
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(label, 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(value || 'N/A', 110, yPos);
    
    return yPos + 10;
  };

  const addRedHighlight = (doc: jsPDF, text: string, x: number, y: number) => {
    doc.setTextColor(220, 20, 20); // Red color
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10); // Consistent font size
    doc.text(text, x, y);
    doc.setTextColor(0, 0, 0); // Reset to black
    doc.setFont("helvetica", "normal");
  };
    const generatePDFDocument = async (id: number)  => {
    const doc = new jsPDF();
    const register = await prisma.registration.findUnique({
      where: { id: id }
    });
    const student = await prisma.student.findUnique({
      where: { cnicNumber: register?.studentId }
    });

    // Page 1 - Student Information
    doc.setFillColor(70, 130, 180); // Steel blue background
    doc.rect(0, 0, 210, 40, 'F');
    
    // Main title with white text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text('TEST INFORMATION CARD', 105, 25, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    let yPosition = 60;
    
    // Student Information Section
    yPosition = addColoredSection(doc, 'STUDENT INFORMATION', yPosition, [52, 152, 219]); // Blue
    
    const studentFields = [
      { label: 'Roll No:', value: student?.rollNo },
      { label: 'CNIC Number:', value: student?.cnicNumber},
      { label: 'Name:', value: student?.name},
      { label: 'Father Name:', value: student?.fatherName },
      { label: 'Category/Class:', value: register?.olympiadCategory  + " " + register?.catGrade },
      { label: 'School/College Name:', value: student?.instituteName}
    ];
    
    studentFields.forEach((field, index) => {
      return yPosition = addTableRow(
        doc,
        field.label,
        field.value !== undefined && field.value !== null ? String(field.value) : '',
        yPosition,
        index % 2 === 0
      );
    });
    
    yPosition += 15;

const exams = [
  {
    title: "Mid-Term Assessment",
    subject: "Mathematics",
    startTime: "July 10, 2025, 09:00 AM",
    endTime: "July 10, 2025, 11:00 AM",
    totalMCQ: 40,
    totalMarks: 80,
  },
  {
    title: "Science Fundamentals Quiz",
    subject: "Science",
    startTime: "July 12, 2025, 01:00 PM",
    endTime: "July 12, 2025, 02:30 PM",
    totalMCQ: 30,
    totalMarks: 60,
  },
  {
    title: "Grammar Skills Test",
    subject: "English",
    startTime: "July 14, 2025, 10:00 AM",
    endTime: "July 14, 2025, 11:00 AM",
    totalMCQ: 25,
    totalMarks: 50,
  },
  {
    title: "World History Mock",
    subject: "Social Studies",
    startTime: "July 16, 2025, 08:30 AM",
    endTime: "July 16, 2025, 10:00 AM",
    totalMCQ: 35,
    totalMarks: 70,
  },
  {
    title: "Physics Practice Exam",
    subject: "Physics",
    startTime: "July 18, 2025, 02:00 PM",
    endTime: "July 18, 2025, 04:00 PM",
    totalMCQ: 50,
    totalMarks: 100,
  },
];
    
    // Multiple Test Information Sections with page breaking
    exams.forEach((test, testIndex) => {
      if (test.subject) {
        // Check if we need a new page for the test section
        if (yPosition > 200) {
          doc.addPage();
          yPosition = 30;
        }
        
        yPosition = addColoredSection(doc, `TEST INFORMATION - ${test.subject.toUpperCase()}`, yPosition, [155, 89, 182]); // Purple
        
        const testFields = [
          { label: 'Test Subject:', value: test.subject },
          { label: 'Start Time:', value: test.startTime },
          { label: 'End Time:', value: test.endTime },
          { label: 'Total Marks:', value: test.totalMCQ },
          { label: 'Total MCQs:', value: test.totalMarks },
        ];
        
        testFields.forEach((field, index) => {
          return yPosition = addTableRow(
            doc,
            field.label,
            field.value !== undefined && field.value !== null ? String(field.value) : '',
            yPosition,
            index % 2 === 0
          );
        });
        
        yPosition += 15;
      }
    });
    
    // Check if we need a new page for the important notice
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 30;
    }
    
    // Important Notice
    yPosition += 5;
    doc.setFillColor(255, 99, 71); // Tomato red background
    doc.rect(15, yPosition - 8, 180, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text('IMPORTANT: Keep this document safe for exam day', 105, yPosition, { align: 'center' });
    doc.text('Bring a valid ID and arrive 30 minutes early', 105, yPosition + 8, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    
    // Add new page for instructions
    doc.addPage();
    
    // Page 2 - Instructions
    yPosition = 30;
    
    // Page header
    doc.setFillColor(142, 68, 173); // Purple background
    doc.rect(0, 0, 210, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text('EXAMINATION GUIDELINES', 105, 17, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    
    // Exam Instructions Section with increased top margin
    yPosition = addColoredSection(doc, 'EXAM INSTRUCTIONS', yPosition, [231, 76, 60], [255, 255, 255], 10); // Red with 10px top margin
    
    doc.setFontSize(10); // Consistent font size
    doc.setFont("helvetica", "normal");
    
    const examInstructions = [
      'Read all instructions carefully before starting the exam.',
      'Fill in your personal details completely and correctly.',
      'Use only black or blue pen for marking answers.',
      'Mark only one answer for each question.',
      'Avoid overwriting or erasing answers.',
      'Mobile phones and electronic devices are strictly prohibited.',
      'Do not leave your seat without permission.',
      'Submit your answer sheet before time expires.',
      'Any form of cheating will result in disqualification.',
      'Remain silent throughout the examination.'
    ];
    
    examInstructions.forEach((instruction, index) => {
      if (index === 5 || index === 8) { // Highlight important rules in red
        addRedHighlight(doc, `${index + 1}. ${instruction}`, 20, yPosition);
      } else {
        doc.setFontSize(10); // Consistent font size
        doc.text(`${index + 1}. ${instruction}`, 20, yPosition);
      }
      yPosition += 8;
    });
    
    yPosition += 10;
    
    // Online Guidelines Section
    yPosition = addColoredSection(doc, 'ONLINE GUIDELINES', yPosition, [52, 152, 219]); // Blue
    
    const onlineGuidelines = [
      'Ensure stable internet connection before starting.',
      'Use updated browser (Chrome, Firefox, Safari).',
      'Close all unnecessary applications and browser tabs.',
      'Keep your device charged or connected to power.',
      'Test your webcam and microphone if required.',
      'Find a quiet, well-lit environment for the exam.',
      'Keep your ID document ready for verification.',
      'Do not refresh the browser during the exam.',
      'Submit answers before the timer expires.',
      'Contact technical support immediately if issues arise.'
    ];
    
    onlineGuidelines.forEach((guideline, index) => {
      if (index === 0 || index === 7 || index === 8) { // Highlight critical guidelines in red
        addRedHighlight(doc, `${index + 1}. ${guideline}`, 20, yPosition);
      } else {
        doc.setFontSize(10); // Consistent font size
        doc.text(`${index + 1}. ${guideline}`, 20, yPosition);
      }
      yPosition += 8;
    });
    
    // Add third page for additional information
    doc.addPage();
    
    // Page 3 - Additional Information
    yPosition = 30;
    
    // Page header
    doc.setFillColor(46, 204, 113); // Green background
    doc.rect(0, 0, 210, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text('ADDITIONAL INFORMATION', 105, 17, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    
    // Contact Information Section with increased top margin
    yPosition = addColoredSection(doc, 'CONTACT INFORMATION', yPosition, [155, 89, 182], [255, 255, 255], 15); // Purple with 15px top margin
    
    yPosition = addTableRow(doc, 'Technical Support:', '+1-800-EXAM-HELP', yPosition, true);
    yPosition = addTableRow(doc, 'Email Support:', 'support@examcenter.edu', yPosition, false);
    yPosition = addTableRow(doc, 'Emergency Contact:', '+1-800-EMERGENCY', yPosition, true);
    yPosition = addTableRow(doc, 'Exam Center Website:', 'www.examcenter.edu', yPosition, false);
    
    yPosition += 25;
    
    // What to Bring Section with increased top margin
    yPosition = addColoredSection(doc, 'WHAT TO BRING ON EXAM DAY', yPosition, [230, 126, 34], [255, 255, 255], 15); // Orange with 15px top margin
    
    const bringItems = [
      'Valid photo identification (ID card, passport, or driver\'s license)',
      'This printed test information card',
      'Black or blue pens (at least 2)',
      'Pencils and eraser for rough work',
      'Water bottle (clear, label removed)',
      'Any permitted calculators or tools (if applicable)'
    ];
    
    bringItems.forEach((item, index) => {
      if (index === 0 || index === 1) { // Highlight essential items in red
        addRedHighlight(doc, `• ${item}`, 20, yPosition);
      } else {
        doc.setFontSize(10); // Consistent font size
        doc.text(`• ${item}`, 20, yPosition);
      }
      yPosition += 8;
    });
    
    yPosition += 15;
    
    // Final Important Notice
    doc.setFillColor(231, 76, 60); // Red background
    doc.rect(15, yPosition - 8, 180, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text('FAILURE TO FOLLOW THESE GUIDELINES', 105, yPosition, { align: 'center' });
    doc.text('MAY RESULT IN EXAM DISQUALIFICATION', 105, yPosition + 10, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    
    // Add footer to all pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 285);
      doc.text(`Page ${i} of ${totalPages}`, 170, 285);
      doc.text('Please keep this document for your records.', 20, 290);
    }
    
    return doc;
  };


  const handleAccept = async (id: number) => {
    try {
    const doc = await generatePDFDocument(id);
    const pdfBlob = doc.output('blob');
    const fileName = `Test-slip-${id || 'student'}-${Date.now()}.pdf`;

    const pdfFile = new File([pdfBlob], fileName, { type: "application/pdf" });

    const formData = new FormData();
    formData.append("pdf", pdfFile);
    const res = await updateAccept(formData,fileName, id)
    if(res && res.success)
    {
        window.location.reload(); 
    } 
    } catch (error: any) {
      console.error('Error generating PDF:', error);
    }
  };

  const handleReject = async (id: number) => {
    const res = await updateReject(id)
    if(res && res.success)
    {
        window.location.reload(); 
    }
  };

  return (
    <div className="p-4">
      <table className="w-full border border-gray-200 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Category</th>
            <th className="p-2 border">Grade</th>
            <th className="p-2 border">Payment Option</th>
            <th className="p-2 border">Other Name</th>
            <th className="p-2 border">Trans-ID</th>
            <th className="p-2 border">Amount</th>
            <th className="p-2 border">Paid On</th>
            <th className="p-2 border">Receipt</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((reg) => (
            <tr key={reg.id} className="even:bg-gray-50 text-center">
              <td className="p-2 border">{reg.olympiadCategory}</td>
              <td className="p-2 border">{reg.catGrade}</td>
              <td className="p-2 border">{reg.paymentOption}</td>
              <td className="p-2 border">{reg.otherName}</td>
              <td className="p-2 border">{reg.transactionId}</td>
              <td className="p-2 border">{reg.totalAmount}</td>
              <td className="p-2 border">{new Date(reg.dateOfPayment).toLocaleDateString()}</td>
              <td className="p-2 border">
                {reg.transactionReceipt ? (
                  <button
                    onClick={() => setSelectedImage(reg.transactionReceipt!)}
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    View Receipt
                  </button>
                ) : (
                  'N/A'
                )}
              </td>
              <td className="p-2 border flex gap-2 justify-center">
                <button
                  onClick={() => handleAccept(reg.id)}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleReject(reg.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg relative max-w-lg w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              ✕
            </button>
            <img src={selectedImage} alt="Receipt" className="w-full max-h-[70vh] object-contain rounded" />
          </div>
        </div>
      )}
    </div>
  );
}
