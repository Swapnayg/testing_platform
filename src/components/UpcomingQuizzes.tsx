// components/UpcomingQuizzes.tsx

"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { differenceInSeconds, formatDuration, intervalToDuration, isBefore } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, Clock } from "lucide-react";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, CreditCard, User, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CldUploadWidget } from "next-cloudinary";

type PaymentOption = "Easypaisa" | "JazzCash" | "ATM Transfer" | "Online Bank Transfer" | "RAAST ID" | "Other";


export type ExamType = {
  id: string;
  title: string;
  startTime: string;     // Use `Date` if you're parsing it
  endTime: string;
  status: 'NOT_STARTED' | 'STARTED' | 'COMPLETED'; // Match your enum if known
  createdAt: string;
  timeLimit: number;
  totalMCQ: number;
  totalMarks: number;

  category: {
    id: number;
    catName: string;
  };

  grade: {
    id: number;
    level: string;
  };

  subject: {
    id: number;
    name: string;
  };
};

type Quiz = {
  id: string;
  title: string;
  startTime: Date;
  quizId:string | null; // ✅ Now accepts null
  difficulty: "Beginner" | "Advanced" | "Expert";
  subject: string;
  instructor: string;
  timeRemaining: string;
  questions: number;
  duration: string;
  totalMarks: number;
  progress: number;
  status: "not_applied" | "pending_approval" | "upcoming" | "attempted" | "absent";
  grade: string;
  category: string;
};

interface ExamFormData {
  examId: string;
  title: string;
  subject: string;
  grade: string;
  category: string;
  totalMarks: number;
  totalMCQ: number;
  timeLimit: number;
  totalAmount: string;
  paymentOption?: PaymentOption;
  transactionId?: string;
  transactionReceipt?: string;
  dateOfPayment: string;
  bankName: string;
  accountTitle?: string;
  accountNumber?: string;
  otherName?: string;
}

interface UpcomingQuizzesProps {
  quizzes: Quiz[];
  studentId:string,
  hasPendingApproval: boolean;
  studentGrade:string;
}

const UpcomingQuizzes: React.FC<UpcomingQuizzesProps> = ({ quizzes , studentId, hasPendingApproval,studentGrade}) => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizTimers, setQuizTimers] = useState<Record<string, string>>({});
  const [readyQuizzes, setReadyQuizzes] = useState<Record<string, boolean>>({});

  const { toast } = useToast();
  const [formData, setFormData] = useState<ExamFormData>({
    examId: "EX001",
    title: "Mathematics Advanced Level",
    subject: "Mathematics",
    grade: "Grade 12",
    category: "Science",
    bankName:"Bank of Punjab",
    accountTitle:"Great Future (SMC) Private Limited",
    accountNumber:"6020293165600018",
    totalMarks: 100,
    totalMCQ: 50,
    timeLimit: 180,
    totalAmount: "Rs 330/-",
    dateOfPayment: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const paymentOptions: PaymentOption[] = [
    "Easypaisa",
    "JazzCash", 
    "ATM Transfer",
    "Online Bank Transfer",
    "RAAST ID",
    "Other"
  ];

  const handleInputChange = (field: keyof ExamFormData, value: string | File) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };


const handleStartQuizInPopup = (quizId: string, username: string, totalMarks: number) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const popup = window.open(
    `${baseUrl}/startquiz/${quizId}?id=${quizId}&username=${username}&totalMarks=${totalMarks}`,
    'QuizWindow',
    'width=1200,height=800,scrollbars=yes,resizable=yes,status=no,location=no,toolbar=no,menubar=no,directories=no'
  );

  if (popup) {
    popup.focus();
    popup.addEventListener('load', () => {
      popup.document.addEventListener('contextmenu', (e) => e.preventDefault());
    });
  } else {
    alert('Please allow popups for this site to start the quiz');
  }
};


  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.paymentOption) {
      newErrors.paymentOption = 'Please select a payment option';
    }

    if (formData.paymentOption) {
      if (!formData.transactionId?.trim()) {
        newErrors.transactionId = 'Transaction ID is required';
      }
      if (!formData.accountTitle?.trim()) {
        newErrors.accountTitle = 'Account title is required';
      }
      if (!formData.accountNumber?.trim()) {
        newErrors.accountNumber = 'Account number is required';
      }
      if (!formData.transactionReceipt?.trim()) {
        newErrors.transactionReceipt = 'Transaction Receipt is required';
      }
      if (formData.paymentOption === 'Other' && !formData.otherName?.trim()) {
        newErrors.otherName = 'Please specify the payment method';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Prevent multiple submissions
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      if (validateForm()) {
        // Prepare data for database submission
        const submissionData = {
          examId: formData.examId,
          title: formData.title,
          subject: formData.subject,
          grade: formData.grade,
          category: formData.category,
          totalMarks: formData.totalMarks,
          totalMCQ: formData.totalMCQ,
          timeLimit: formData.timeLimit,
          totalAmount: formData.totalAmount,
          paymentOption: formData.paymentOption,
          transactionId: formData.transactionId,
          dateOfPayment: formData.dateOfPayment,
          bankName: formData.bankName,
          accountTitle: formData.accountTitle,
          accountNumber: formData.accountNumber,
          otherName: formData.otherName,
          transactionReceiptName: formData.transactionReceipt,
          submittedAt: new Date().toISOString()
        };
        console.log('Form data ready for database submission:', submissionData);

        const result = await fetch('/api/reapplySave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({  studentId:studentId, data: submissionData }),
        });

        const attempt = await result.json();
        setSelectedQuizId(null); 
        setOpenModal(false);
        // ✅ Delay to allow reload before closing
        setTimeout(() => {
          window.location.reload(); 
          window.close();
        }, 300);
        toast({
          title: "Registration Submitted",
          description: "Your exam registration has been submitted successfully!",
        });
      } else {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields correctly.",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Submission failed', error);
    } finally {
      setIsSubmitting(false);
    }
  };


async function getExamById(examId: string) {
  const response = await fetch('/api/studentReApply', {
    method: 'POST',
    headers: {
            'Content-Type': 'application/json',
    },
    body: JSON.stringify({quizid:examId}), // data you want to send
  });
  if (!response.ok) throw new Error("Attempt not found");
  const data = await response.json();
  return data.exam;
}

useEffect(() => {
  if (!selectedQuizId) return;
  const fetchExam = async () => {
    try {
      const data = await getExamById(selectedQuizId);
      console.log("Fetched Exam:", data);

      if (!data) return;

      setFormData({
        examId: data?.id ?? "",
        title: data?.title ?? "",
        subject: data?.subject?.name ?? "",
        category: data?.grades?.[0]?.category?.catName ?? "",
        bankName: "Bank of Punjab",
        accountTitle: "Great Future (SMC) Private Limited",
        accountNumber: "6020293165600018",
        totalMarks: data?.totalMarks ?? 0,
        totalMCQ: data?.totalMCQ ?? 0,
        timeLimit: data?.timeLimit ?? 0,
        totalAmount: "Rs 330/-",
        dateOfPayment: new Date().toISOString().split("T")[0],
        grade: studentGrade,
      });
    } catch (error) {
      console.error("Error fetching exam:", error);
    }
  };

  fetchExam();
}, [selectedQuizId]);

useEffect(() => {
    const interval = setInterval(() => {
      const updates: Record<string, string> = {};
      const ready: Record<string, boolean> = {};

      quizzes.forEach((quiz) => {
        if (quiz.status === "upcoming") {
          const start = new Date(quiz.startTime);
          const now = new Date();

          const secondsLeft = differenceInSeconds(start, now);

          if (secondsLeft <= 0) {
            updates[quiz.id] = "Ready";
            ready[quiz.id] = true;
          } else {
            const duration = intervalToDuration({ start: now, end: start });
            updates[quiz.id] = formatDuration(duration, { format: ["hours", "minutes", "seconds"] });
            ready[quiz.id] = false;
          }
        }
      });

      setQuizTimers((prev) => ({ ...prev, ...updates }));
      setReadyQuizzes((prev) => ({ ...prev, ...ready }));
    }, 1000);

    return () => clearInterval(interval);
  }, [quizzes]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Clock className="w-6 h-6 text-emerald-600" />
          Upcoming Quizzes
        </h2>
        {/* <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
          View All
        </Button> */}
      </div>

     <div className="flex flex-col gap-6">
      {quizzes.map((quiz) => (
        <Card key={quiz.id} className="bg-white border-emerald-100 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-gray-900 text-lg capitalize">{quiz.title}</h3>
                  <Badge
                    variant="outline"
                    className={`${
                      quiz.difficulty === "Expert"
                        ? "border-red-200 text-red-700 bg-red-50"
                        : quiz.difficulty === "Advanced"
                        ? "border-orange-200 text-orange-700 bg-orange-50"
                        : "border-emerald-200 text-emerald-700 bg-emerald-50"
                    }`}
                  >
                    {quiz.difficulty}
                  </Badge>
                </div>
                <p className="text-emerald-600 font-medium mb-3">
                  {quiz.subject} • {quiz.category} • {quiz.grade}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 font-medium">Quiz Date</p>
                    <p className="text-sm font-bold text-gray-900">
                      {new Date(quiz.startTime).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true, // optional: use false for 24-hour format
                      })}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 font-medium">Questions</p>
                    <p className="text-sm font-bold text-gray-900">{quiz.questions}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 font-medium">Duration</p>
                    <p className="text-sm font-bold text-gray-900">{quiz.duration}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 font-medium">Total Marks</p>
                    <p className="text-sm font-bold text-gray-900">{quiz.totalMarks}</p>
                  </div>
                </div>

                {quiz.progress > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className="text-emerald-600 font-medium">{quiz.progress}%</span>
                    </div>
                    <Progress value={quiz.progress} className="h-2" />
                  </div>
                )}
              </div>

            <Button
              onClick={() => {
                console.log("🔍 Quiz Clicked", {
                  status: quiz.status,
                  isReady: readyQuizzes[quiz.id],
                  quizId: quiz.quizId,
                });

                // 1. If already attempted or absent — block action
                if (quiz.status === "attempted" || quiz.status === "absent") {
                  console.log("❌ Quiz already attempted or student marked absent.");
                  return;
                }

                // 2. Ready to start and has quizId — proceed
                if (quiz.status === "upcoming" && readyQuizzes[quiz.id]) {
                  if (quiz.quizId) {
                    console.log("✅ Starting quiz now...");
                    handleStartQuizInPopup(quiz.quizId, studentId, quiz.totalMarks);
                  } else {
                    console.log("⚠️ Quiz ID is missing.");
                    toast({
                      title: "Quiz Error",
                      description: "Quiz ID is missing. Please contact support.",
                      variant: "destructive",
                    });
                  }
                } else {
                  // 3. Not ready — open the modal
                  console.log("⏳ Not ready or awaiting approval — opening modal.");
                  setSelectedQuizId(quiz.id);
                  setOpenModal(true);
                }
              }}
              className={`ml-6 group-hover:scale-105 transition-transform shadow-lg text-white ${
                quiz.status === "attempted"
                  ? "bg-gray-500 hover:bg-gray-600 cursor-not-allowed"
                  : quiz.status === "absent"
                  ? "bg-red-500 hover:bg-red-600 cursor-not-allowed"
                  : quiz.status === "upcoming" && !readyQuizzes[quiz.id]
                  ? "bg-orange-500 hover:bg-orange-600"
                  : hasPendingApproval &&
                    (quiz.status === "not_applied" || quiz.status === "pending_approval")
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
              disabled={
                quiz.status === "attempted" ||
                quiz.status === "absent" ||
                (quiz.status === "upcoming" && !readyQuizzes[quiz.id]) ||
                (hasPendingApproval &&
                  (quiz.status === "not_applied" || quiz.status === "pending_approval"))
              }
            >
              {quiz.status === "attempted" && "Attempted"}
              {quiz.status === "absent" && "Absent"}
              {quiz.status === "upcoming" &&
                (readyQuizzes[quiz.id]
                  ? "Start Now"
                  : `Starts in ${quizTimers[quiz.id] || "..."}`)}
              {quiz.status === "not_applied" && "Apply Now"}
              {quiz.status === "pending_approval" && "Pending Approval"}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>

            </div>
          </CardContent>
        </Card>
      ))}
    </div>

      {openModal && (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white rounded-xl shadow-xl w-[95%] max-w-4xl relative overflow-y-auto max-h-[90vh] custom-scroll">
    <button
      className="absolute top-3 right-3 text-gray-600 hover:text-red-600 text-xl font-bold"
      onClick={() => setOpenModal(false)}
    >
      ×
    </button>

    <Card className="border-0">

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* SECTION: Exam Info */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
              Exam Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="examId" className="text-sm hidden">Exam ID</Label>
                <Input id="examId" value={formData.examId} readOnly className="bg-gray-50 text-sm hidden" />

                <Label htmlFor="title" className="text-sm">Title</Label>
                <Input id="title" value={formData.title} readOnly className="bg-gray-50 text-sm" />
                
                <Label htmlFor="totalMarks" className="text-sm">Total Marks</Label>
                <Input id="totalMarks" value={formData.totalMarks} readOnly className="bg-gray-50 text-sm" />

                <Label htmlFor="timeLimit" className="text-sm">Time Limit (min)</Label>
                <Input id="timeLimit" value={formData.timeLimit} readOnly className="bg-gray-50 text-sm" />

                <Label htmlFor="totalMCQ" className="text-sm">Total MCQs</Label>
                <Input id="totalMCQ" value={formData.totalMCQ} readOnly className="bg-gray-50 text-sm" />
              </div>

              <div className="space-y-3">
                <Label htmlFor="subject" className="text-sm">Subject</Label>
                <Input id="subject" value={formData.subject} readOnly className="bg-gray-50 text-sm" />

                <Label htmlFor="grade" className="text-sm">Grade</Label>
                <Input id="grade" value={formData.grade} readOnly className="bg-gray-50 text-sm" />

                <Label htmlFor="category" className="text-sm">Category</Label>
                <Input id="category" value={formData.category} readOnly className="bg-gray-50 text-sm" />

              </div>
            </div>
          </section>

          {/* SECTION: Payment Info */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
              Payment Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="bankName" className="text-sm">Bank Name</Label>
                <Input id="bankName" value={formData.bankName} readOnly className="bg-gray-50 text-sm" />
              
                <Label htmlFor="accountTitle" className="text-sm">Account Title</Label>
                <Input id="accountTitle" value={formData.accountTitle} readOnly className="bg-gray-50 text-sm" />
                
              </div>

              <div className="space-y-3">

                <Label htmlFor="accountNumber" className="text-sm">Account Title</Label>
                <Input id="accountNumber" value={formData.accountNumber} readOnly className="bg-gray-50 text-sm" />

                <Label htmlFor="totalAmount" className="text-sm">Amount (Rs.)</Label>
                <Input id="totalAmount" value={formData.totalAmount} readOnly className="bg-gray-50 text-sm font-semibold text-green-600" />  
              </div>
            </div>
             <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mt-4 space-y-4">
                <Label className="text-sm font-medium">Payment Option *</Label>
                <RadioGroup value={formData.paymentOption} onValueChange={(value) => handleInputChange('paymentOption', value)} className="grid grid-cols-3 gap-2">
                  {paymentOptions.map(option => (
                    <div key={option} className="flex items-center space-x-2 border rounded p-2 hover:bg-gray-50">
                      <RadioGroupItem value={option} id={option} />
                      <Label htmlFor={option} className="text-xs cursor-pointer">{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
                 {errors.paymentOption && <p className="text-red-500 text-xs">{errors.paymentOption}</p>}
            </div>

            {/* Dynamic Payment Fields */}
            {formData.paymentOption && (
              <div className="border rounded-lg p-4 mt-4 space-y-4">
                <h4 className="text-indigo-800 font-semibold text-sm">Payment Details</h4>

                {formData.paymentOption === 'Other' && (
                  <div>
                    <Label htmlFor="otherName" className="text-sm">Other Name *</Label>
                    <Input id="otherName" value={formData.otherName || ''} onChange={(e) => handleInputChange('otherName', e.target.value)} placeholder="Enter payment method" className={`text-sm ${errors.otherName ? 'border-red-500' : ''}`} />
                    {errors.otherName && <p className="text-red-500 text-xs">{errors.otherName}</p>}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="transactionId" className="text-sm">Transaction ID *</Label>
                    <Input id="transactionId" value={formData.transactionId || ''} onChange={(e) => handleInputChange('transactionId', e.target.value)} className={`text-sm ${errors.transactionId ? 'border-red-500' : ''}`} />
                    {errors.transactionId && <p className="text-red-500 text-xs">{errors.transactionId}</p>}
                  </div>

                  <div>
                    <Label htmlFor="dateOfPayment" className="text-sm">Date of Payment *</Label>
                    <Input type="date" id="dateOfPayment" value={formData.dateOfPayment || ''} onChange={(e) => handleInputChange('dateOfPayment', e.target.value)} className={`text-sm ${errors.dateOfPayment ? 'border-red-500' : ''}`} />
                    {errors.dateOfPayment && <p className="text-red-500 text-xs">{errors.dateOfPayment}</p>}
                  </div>
                </div>
                <div>
                  <Label htmlFor="transactionReceipt" className="text-sm">Transaction Receipt</Label>
                  <div className="flex items-center justify-center min-h-[150px]"> {/* Adjust min-h as needed */}
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <div className="space-y-2">
                      <CldUploadWidget
                        uploadPreset="school"
                        onSuccess={(result: { info: { url?: string } } | any, { widget }) => {
                          const url = typeof result.info === 'object' && 'url' in result.info ? result.info.url : '';
                          setFormData((prev) => ({
                            ...prev,
                            transactionReceipt: url,
                          }));
                          widget.close();
                        }}
                      >
                        {({ open }) => (
                          <div
                            className="text-xs text-gray-500 flex flex-col items-center justify-center gap-2 cursor-pointer"
                            onClick={() => open()}
                          >
                            <Label htmlFor="profilePicture" className="cursor-pointer">
                              <span className="text-blue-600 hover:text-blue-500">
                                Click to upload
                              </span>
                              <span className="text-gray-600"> or drag and drop</span>
                            </Label>
                            <p className="text-xs text-gray-500 mt-2">
                              PNG, JPG, GIF up to 10MB
                            </p>
                          </div>
                        )}
                      </CldUploadWidget>
                    </div>
                  </div>
                </div>

                    {formData.transactionReceipt && (
                      <p className="text-green-600 text-xs mt-1">
                        File: {formData.transactionReceipt}
                      </p>
                    )}
                    {errors.transactionReceipt && <p className="text-red-500 text-xs">{errors.transactionReceipt}</p>}             
                  </div>
              </div>
            )}
          </section>

          {/* Submit Button */}
          <div className="flex justify-center">
          <Button
            type="submit"
            disabled={isSubmitting}
            className={`bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white px-8 py-2 font-semibold rounded-lg shadow-md transform transition hover:scale-105 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <User className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Submitting...' : 'Submit Registration'}
          </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</div>

)}

    </div>
  );
};

export default UpcomingQuizzes;
