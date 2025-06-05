// app/api/cron/daily/route.js

import nodemailer from 'nodemailer';
import jsPDF from 'jspdf';
import prisma from "./prisma";


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

function addColoredSection(doc, title, yPos, bgColor, textColor = [255, 255, 255], topMargin = 0) {
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
}

  const addTableRow = (doc, label, value, yPos, isEven = false) => {
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

  const addRedHighlight = (doc, text, x, y) => {
    doc.setTextColor(220, 20, 20); // Red color
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10); // Consistent font size
    doc.text(text, x, y);
    doc.setTextColor(0, 0, 0); // Reset to black
    doc.setFont("helvetica", "normal");
  };

export async function generatePDFDocument(id, exams,student) {
 const doc = new jsPDF();
    // Page 1 - Student Information
    doc.setFillColor(52, 152, 219); // Steel blue background
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
      { label: 'Category/Class:', value: student?.category  + " " + student?.grade },
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
    
    // Multiple Test Information Sections with page breaking
    exams.forEach((test, testIndex) => {
      if (test.subject) {
        // Check if we need a new page for the test section
        if (yPosition > 200) {
          doc.addPage();
          yPosition = 30;
        }
        
        yPosition = addColoredSection(doc, `TEST INFORMATION - ${test.subject.toUpperCase()}`, yPosition, [46, 204, 113]); // Purple
        
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
    doc.setFillColor(231, 76, 60); // Tomato red background
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
    doc.setFillColor(52, 152, 219 ); // Purple background
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
    doc.setFillColor(52, 152, 219); // Green background
    doc.rect(0, 0, 210, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text('ADDITIONAL INFORMATION', 105, 17, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    
    // Contact Information Section with increased top margin
    yPosition = addColoredSection(doc, 'CONTACT INFORMATION', yPosition, [46, 204, 113], [255, 255, 255], 15); // Purple with 15px top margin
    
    yPosition = addTableRow(doc, 'Technical Support:', '+1-800-EXAM-HELP', yPosition, true);
    yPosition = addTableRow(doc, 'Email Support:', 'support@examcenter.edu', yPosition, false);
    yPosition = addTableRow(doc, 'Emergency Contact:', '+1-800-EMERGENCY', yPosition, true);
    yPosition = addTableRow(doc, 'Exam Center Website:', 'www.examcenter.edu', yPosition, false);
    
    yPosition += 25;
    
    // What to Bring Section with increased top margin
    yPosition = addColoredSection(doc, 'WHAT TO BRING ON EXAM DAY', yPosition, [231, 76, 60], [255, 255, 255], 15); // Orange with 15px top margin
    
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

  const arrayBuffer = doc.output('arraybuffer');
  const buffer = Buffer.from(arrayBuffer);
  return buffer;
}



export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  console.log("✅Every Day 12 pm Cron job triggered at", new Date());

  const dateOnly = new Date(today.toISOString().split('T')[0]);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yes_dateOnly = new Date(yesterday.toISOString().split('T')[0]); 
    await prisma.exam.updateMany({
      where: {
        startTime: dateOnly, // exactly today
        endTime: {
          gte: today, // still ongoing or ends today
        },
      },
      data: {
        status: 'IN_PROGRESS',
      },
    });
  
    await prisma.exam.updateMany({
      where: {
        endTime: yes_dateOnly,
      },
      data: {
        status: 'COMPLETED',
      },
    });
  
    await prisma.result.updateMany({
      where: {
        status: "NOT_GRADED",
        endTime: yes_dateOnly,
      },
      data: {
        status: 'ABSENT',
      },
    });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const examsToday = await prisma.exam.findMany({
        where: {
            createdAt: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
        include: {
            id:true,
            title:true,
            startTime:true,
            endTime:true,
            totalMCQ:true,
            totalMarks:true,
            subject:{
                select:{
                    name:true,
                }
            },
            grade: {
                include: {
                    level:true,
                    category: {
                        select:{
                            catName:true,
                        }
                    },
                },
            },
            registrations: {
                include: {
                    catGrade:true,
                    olympiadCategory:true,
                    status:true,
                },
            },
    
        },
    });
    const examResults = [];
    const regId = [];
    const studentList = [];
    examsToday.forEach(exam => {
        const { grade } = exam;
        const examCategory = grade.category.catName;
        const examGradeLevel = grade.level;

        const matchingRegistrations = exam.registrations.filter(reg => {
            return (
                reg.status === 'APPROVED' &&
                reg.grade.level === examGradeLevel &&
                reg.grade.category.catName === examCategory
            );
        });
        if (matchingRegistrations.length > 0) {
            matchingRegistrations.forEach(async matchReg => {
                const matchingExamonRegistration = matchReg.examOnRegistration.filter(exmreg => {
                    const examregId = exmreg.id;
                    return (
                        exmreg.registrationId === examregId
                    );
                });
                if(matchingExamonRegistration.length === 0)
                {
                    await prisma.examOnRegistration.upsert({
                    where: {
                        examId_registrationId: {
                            examId: exam.id,
                            registrationId:examregId,
                        },
                    },
                    update: {}, // Do nothing if already exists
                    create: {
                        examId: exam.id,
                        registrationId: examregId,
                    },
                    });
                    examResults.push({
                        id:exam.id, 
                        title:exam.title, 
                        startTime:new Date(exam.startTime).toLocaleString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
                        endTime:new Date(exam.endTime).toLocaleString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
                        category:exmreg.olympiadCategory, 
                        grade:exmreg.catGrade,
                        subject:exam.subject.name, 
                        totalMCQ:exam.totalMCQ, 
                        totalMarks:exam.totalMarks,
                        studentId: exmreg.studentId, 
                        regsId:exmreg.id
                    });
                    if (!regId.includes(examregId)) {
                        regId.push(examregId);
                        const user = await prisma.student.findUnique({
                            where: { cnicNumber: exmreg.studentId },
                        });
                        if (user?.id) {
                            studentList.push({
                                examregId:examregId, 
                                name:user.name, 
                                fatherName:user.fatherName,
                                cnicNumber:user.cnicNumber,
                                rollNo:user.rollNo,
                                category:exmreg.olympiadCategory, 
                                grade:exmreg.catGrade, 
                                instituteName:user.instituteName
                            })
                        }
                    }    
                }
            });
        }
    });
    regId.forEach(async reg => {
        const examList = examResults.find(result => result.regsId === reg);
        const student = studentList.find(result => result.examregId === reg);
        const logoUrl = `${process.env.APP_URL}/favicon.ico`;
        const loginUrl = `${process.env.APP_URL}/`;
        const studentCnic =  student.rollNo || '';
        const studentPassword = student.cnicNumber || '';

        const htmlTemplate = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <title>Payment Accepted</title>
            <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f6f8;
                padding: 20px;
            }
            .container {
                max-width: 600px;
                background: #ffffff;
                margin: auto;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                background-color: #28a745; /* ✅ GREEN */
                color: #ffffff;
                text-align: center;
                padding: 20px;
            }
            .header img {
                max-width: 100px;
                margin-bottom: 10px;
            }
            .content {
                padding: 30px;
                color: #333333;
                line-height: 1.6;
            }
            .login-box {
                background-color: #f0f0f0;
                padding: 15px;
                border-radius: 6px;
                margin-top: 20px;
                font-family: monospace;
            }
            .btn {
                background-color: #28a745;
                color: #ffffff !important;
                text-decoration: none;
                padding: 12px 20px;
                border-radius: 5px;
                display: inline-block;
                margin-top: 20px;
            }
            .footer {
                text-align: center;
                font-size: 12px;
                color: #999999;
                padding: 15px;
            }
            </style>
        </head>
        <body>
            <div class="container">
            <div class="header">
                <img src="`+logoUrl+`" alt="Olympiad Logo" />
                <h2>Olympiad Registration Confirmed</h2>
            </div>
            <div class="content">
                <p>Dear Student,</p>
                <p>We are pleased to inform you that your payment for the Olympiad registration has been <strong>successfully accepted</strong>.</p>
                <p>You can now log in to your student dashboard to view your exams, results, and other details.</p>

                <div class="login-box">
                <p><strong>Login Portal:</strong> <a href="`+loginUrl+`" target="_blank">`+loginUrl+`</a></p>
                <p><strong>Username:</strong> `+studentCnic+`</p>
                <p><strong>Password:</strong> `+studentPassword+`</p>
                </div>

                <a href="`+loginUrl+`" class="btn">Go to Student Portal</a>

                <p>If you have any questions or need assistance, feel free to contact our support team at <a href="mailto:support@yourdomain.com">support@yourdomain.com</a>.</p>

                <p>Best regards,<br />Olympiad Registration Team</p>
            </div>
            <div class="footer">
                &copy; 2025 Olympiad Organization. All rights reserved.
            </div>
            </div>
        </body>
        </html>
        `;
        const buffer = await generatePDFDocument(id, examList,student);
        const fileName = `Test-slip-${user.rollNo || 'student'}-${Date.now()}.pdf`;
        const info = await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: user.email || '',
            subject: 'Payment Confirmation: Your Registration Has Been Approved',
            html: htmlTemplate,
            attachments: [
            {
                filename: fileName,
                content: buffer,
                contentType: "application/pdf",
            },
            ],
        });
        console.log('Email sent:', info.messageId);
    });


  return new Response(JSON.stringify({ message: "Cron executed" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
