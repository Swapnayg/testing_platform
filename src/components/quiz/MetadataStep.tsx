
"use client"
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui2/input';
import { Label } from '@/components/ui2/label';
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui2/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui2/select';
import { QuizData ,Question} from './types';
import { QuizExistsDialog } from '../QuizPrompt';
// date-fns is useful for manipulating dates

interface MetadataStepProps {
  quizData: QuizData;
  setQuizData: (data: QuizData) => void;
  questions: Question[];
  setQuestions:React.Dispatch<React.SetStateAction<Question[]>>
}

const MetadataStep = ({ quizData, setQuizData ,questions, setQuestions}: MetadataStepProps) => {
  const [quizCount, setquizCount] = useState(0);
  const [examValue, setExamValue] = useState("");
  const [randomQuestions, setRandomQuestions] = useState<Question[]>([]);
  const [showPrompt, setShowPrompt] = useState(false);
  const handleInputChange = (field: keyof QuizData, value: string | number | string[] | number[]) => {
      setQuizData({ ...quizData, [field]: value });
    };
  type ExamType = {
    id: string;
    title: string;
    totalMarks?: number;
    timeLimit?: number;
    startTime?: Date;
    endTime?: Date;
    status?: string;
    createdAt?: Date;
    categoryId?: string;
    gradeId?: string;
    subjectId?: string;
    totalMCQ?: number;
    category?: string;
    level?: string;
    subject?: string;
  };
  const [exams, setExams] = useState<ExamType[]>([]);


  const formatDateTime = (dateInput: string | Date) => {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return date.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };



  const handleExamOnchange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    createQuiz(selectedId);
    setExamValue(selectedId);
  };

const handleConfirm = () => {
    setShowPrompt(false);
    const selectedExam = exams.find((exam) => exam.id === examValue);
    setQuizData({
      title: selectedExam?.title !== undefined ? String(selectedExam.title) : "",
      category: selectedExam ? String(selectedExam.category ?? "") : "",
      grades: selectedExam && Array.isArray((selectedExam as any).grades) ? (selectedExam as any).grades : [], // string list of grades
      subject: selectedExam?.subject !== undefined ? String(selectedExam?.subject) : "",
      totalQuestions: selectedExam && selectedExam.totalMCQ !== undefined ? Number(selectedExam.totalMCQ) : 0,
      totalMarks: selectedExam && selectedExam.totalMarks !== undefined ? Number(selectedExam.totalMarks) : 0,
      timeLimit: selectedExam && selectedExam.timeLimit !== undefined ? Number(selectedExam.timeLimit) : 0,
      startDateTime: selectedExam?.startTime ? new Date(selectedExam.startTime) : new Date(),
      endDateTime: selectedExam?.endTime ? new Date(selectedExam.endTime) : new Date(),
      examId: examValue,
    });
    const randomQuestions1: Question[] = [];
    randomQuestions.forEach((question2) => {
      const question: Question = {
        id: question2.id,
        type:question2.type,
        text: question2.text,
        marks: question2.marks,
      };

      if (question2.type === 'MULTIPLE_CHOICE') {
        var options_data: any[] = [];
        if (question2.options) {
          question2.options.forEach((option2) => {
            options_data.push({id: option2.id, text: option2.text, isCorrect: option2.isCorrect})
          });
        }
        question.options = options_data;
      } else if (question2.type === 'TRUE_FALSE') {
        question.correctAnswer = question2.correctAnswer;
      } else if (question2.type === 'SHORT_TEXT') {
        question.correctAnswer =  question2.correctAnswer;
      } else if (question2.type === 'LONG_TEXT') {
        question.correctAnswer = question2.correctAnswer;
      } else if (question2.type === 'NUMERICAL') {
        question.correctAnswer =  question2.correctAnswer;
      }
      randomQuestions1.push(question);
    });
    setQuestions(randomQuestions1);
  };

  const handleCancel = () => {
    setShowPrompt(false);
  };

const createQuiz = async (exmId: string) => {
  const res = await fetch('/api/exams/quizzCount', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      examId: exmId,
    }),
  });

  // Read response data
  const data = await res.json();
  if (!data.lattestQuiz) {
    const selectedExam = exams.find((exam) => exam.id === exmId);
    setQuizData({
      title: selectedExam?.title !== undefined ? String(selectedExam.title) : "",
      category: selectedExam ? String(selectedExam.category ?? "") : "",
      grades: selectedExam && Array.isArray((selectedExam as any).grades) ? (selectedExam as any).grades : [],  // string list of grades
      subject: selectedExam?.subject !== undefined ? String(selectedExam?.subject) : "",
      totalQuestions: selectedExam && selectedExam.totalMCQ !== undefined ? Number(selectedExam.totalMCQ) : 0,
      totalMarks: selectedExam && selectedExam.totalMarks !== undefined ? Number(selectedExam.totalMarks) : 0,
      timeLimit: selectedExam && selectedExam.timeLimit !== undefined ? Number(selectedExam.timeLimit) : 0,
      startDateTime: selectedExam?.startTime ? new Date(selectedExam.startTime) : new Date(),
      endDateTime: selectedExam?.endTime ? new Date(selectedExam.endTime) : new Date(),
      examId: exmId,
    });
    setQuestions([]);
  } else {
    setShowPrompt(true);
    setRandomQuestions(data.questions)
  }
};


  const capitalizeWords = (str: string) =>
  str.replace(/\b\w/g, (char) => char.toUpperCase());

  // Auto-populate dates on component mount
  useEffect(() => {
  fetch("/api/exams/upcoming")
    .then((res) => res.json())
    .then((data) => {
      const formattedExams = data.map((exam: any) => ({
        id: exam.id,
        title: capitalizeWords(exam.title),
        totalMarks: exam.totalMarks,
        timeLimit: exam.timeLimit,
        startTime: new Date(exam.startTime),
        endTime: new Date(exam.endTime),
        status: exam.status,
        createdAt: new Date(exam.createdAt),
        categoryId: exam.categoryId,
        subjectId: exam.subjectId,
        totalMCQ: exam.totalMCQ,
        subject: exam.subject?.name ?? "",
        category: exam.grades[0]?.category?.catName ?? "", // from first grade's category
        // ✅ Grades (Array of Grade Objects)
        grades: exam.grades.map((g: any) => g.level), // array of grade levels

      }));

      setExams(formattedExams);
    });

}, [quizData, setQuizData]);

  return (
    <div className="space-y-6">
       <QuizExistsDialog
        open={showPrompt}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />


      <Card>
        <CardHeader>
          <CardTitle className="text-slate-800">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-slate-700">Exam</Label>

          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
            onChange={handleExamOnchange} value={quizData.examId}
          >
            <option value="" disabled selected className="text-gray-400">
              Select an Exam
            </option>
              {exams.map((exam: { id: string; title: string }) => (
                <option
                  key={exam.id}
                  value={exam.id}
                  className="text-sm text-gray-700 hover:bg-blue-100 px-3 py-1"
                >
                  {exam.title}
                </option>
              ))}
          </select>
          </div>
          <div>
            <Label htmlFor="title" className="text-slate-700">Quiz Title *</Label>
            <Input
              id="title"
              value={quizData.title}
              readOnly
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter quiz title"
              className="border-slate-300 focus:border-slate-500"
            />
          </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="category" className="text-slate-700">Category</Label>
              <Input
                id="category"
                value={quizData.category}
                readOnly
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="e.g., Science"
                className="border-slate-300 focus:border-slate-500"
              />
            </div>

            <div>
              <Label htmlFor="grade" className="text-slate-700">Grade</Label>
              <Input
                id="grades"
                value={Array.isArray(quizData.grades) ? quizData.grades.join(", ") : quizData.grades}
                readOnly
                onChange={(e) => handleInputChange('grades', e.target.value.split(", ").map(Number))}
                placeholder="e.g., 10th Grade"
                className="border-slate-300 focus:border-slate-500"
              />
            </div>

            <div>
              <Label htmlFor="subject" className="text-slate-700">Subject</Label>
              <Input
                id="subject"
                value={quizData.subject}
                readOnly
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="e.g., Physics"
                className="border-slate-300 focus:border-slate-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-slate-800">Quiz Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="totalQuestions" className="text-slate-700">Total Questions *</Label>
              <Input
                id="totalQuestions"
                type="number"
                min="1"
                value={quizData.totalQuestions}
                readOnly
                onChange={(e) => handleInputChange('totalQuestions', parseInt(e.target.value) || 0)}
                className="border-slate-300 focus:border-slate-500"
              />
            </div>

            <div>
              <Label htmlFor="totalMarks" className="text-slate-700">Total Marks *</Label>
              <Input
                id="totalMarks"
                type="number"
                min="1"
                value={quizData.totalMarks}
                readOnly
                onChange={(e) => handleInputChange('totalMarks', parseInt(e.target.value) || 0)}
                className="border-slate-300 focus:border-slate-500"
              />
            </div>
             <div>
              <Label htmlFor="timeLimit" className="text-slate-700">Time Limit *</Label>
              <Input
                id="timeLimit"
                value={quizData.timeLimit}
                readOnly
                onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value) || 0)}
                className="border-slate-300 focus:border-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDateTime" className="text-slate-700">Start Date/Time</Label>
              <Input
                id="startDateTime"
                type="datetime-local"
                value={
                  quizData.startDateTime instanceof Date
                    ? quizData.startDateTime.toISOString().slice(0, 16)
                    : quizData.startDateTime
                }
                readOnly
                className="border-slate-300 bg-slate-50 text-slate-600"
              />
            </div>

            <div>
              <Label htmlFor="endDateTime" className="text-slate-700">End Date/Time</Label>
              <Input
                id="endDateTime"
                type="datetime-local"
                 value={
                  quizData.endDateTime instanceof Date
                    ? quizData.endDateTime.toISOString().slice(0, 16)
                    : quizData.endDateTime
                }
                readOnly
                className="border-slate-300 bg-slate-50 text-slate-600"
              />
            </div>
          </div>

          {quizData.totalQuestions > 0 && quizData.totalMarks > 0 && (
            <div className="bg-slate-100 p-4 rounded-lg">
              <p className="text-slate-700">
                <strong>Marks per question:</strong> {(quizData.totalMarks / quizData.totalQuestions).toFixed(1)} marks
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MetadataStep;
