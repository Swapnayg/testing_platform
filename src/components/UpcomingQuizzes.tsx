// components/UpcomingQuizzes.tsx

"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, Clock } from "lucide-react";

type Quiz = {
  id: string;
  title: string;
  difficulty: "Beginner" | "Advanced" | "Expert";
  subject: string;
  instructor: string;
  timeRemaining: string;
  questions: number;
  duration: string;
  totalMarks: number;
  progress: number;
  status: "not-started" | "in-progress";
};

interface UpcomingQuizzesProps {
  quizzes: Quiz[];
}

const UpcomingQuizzes: React.FC<UpcomingQuizzesProps> = ({ quizzes }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Clock className="w-6 h-6 text-emerald-600" />
          Upcoming Quizzes
        </h2>
        <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
          View All
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        {quizzes.map((quiz) => (
          <Card
            key={quiz.id}
            className="bg-white border-emerald-100 shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-gray-900 text-lg">{quiz.title}</h3>
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
                    {quiz.subject} • {quiz.instructor}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 font-medium">Time Left</p>
                      <p className="text-sm font-bold text-gray-900">{quiz.timeRemaining}</p>
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
                  className={`ml-6 group-hover:scale-105 transition-transform ${
                    quiz.status === "in-progress"
                      ? "bg-orange-500 hover:bg-orange-600"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  } text-white shadow-lg`}
                >
                  {quiz.status === "in-progress" ? "Continue" : "Start Quiz"}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UpcomingQuizzes;
