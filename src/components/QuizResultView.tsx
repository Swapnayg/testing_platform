"use client"
import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Clock, User, Award, ChevronLeft, ChevronRight, Eye, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation'; 
import Link from 'next/link';
interface QuizAttempt {
  id: string;
  studentName: string;
  quizTitle: string;
  subject: string;
  grade: string;
  startTime: string;
  endTime: string;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  totalMarks: number;
  obtainedMarks: number;
  timeSpent: number;
  status: 'completed' | 'in_progress' | 'abandoned';
  questions: AttemptQuestion[];
}

interface AttemptQuestion {
  id: string;
  questionNumber: number;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_TEXT' | 'LONG_TEXT' | 'NUMERICAL';
  options?: string[];
  correctAnswer: string;
  studentAnswer: string;
  isCorrect: boolean;
  points: number;
  obtainedPoints: number;
}

interface QuizResultsViewerProps {
  quizId: string;
  username:string;
  userRole:string;
}

const QuizResultsViewer: React.FC<QuizResultsViewerProps> = ({ quizId,username,userRole }) => {
  const { toast } = useToast();
  const [selectedAttempt, setSelectedAttempt] = useState<QuizAttempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const onBackToStart = () => {
    setTimeout(() => {
      router.back(); // or router.push('/your-target-page')
    }, 1000); // Delay optional
  };

  const handleClick = () => {
    setLoading(true);
    router.push(`/list/students/${quizId}/quiz?studentName=${username}`);
  };


  const fetchAttempt = async (attemptId: string) => {
  try {
    const response = await fetch('/api/getQuizView', {
      method: 'POST',
      headers: {
            'Content-Type': 'application/json',
      },
      body: JSON.stringify({quizid:quizId}), // data you want to send
    });
    if (!response.ok) throw new Error("Attempt not found");
    const data = await response.json();
    setSelectedAttempt(data.quizData);
  } catch (error) {
    console.error("Failed to fetch attempt:", error);
  }
  finally {
      setIsLoading(false);
  }
};


  // Mock data - In real app, this would come from an API
  useEffect(() => {
    const loadAttempts = async () => {
      setIsLoading(true);
      if (quizId)
      {
        fetchAttempt(quizId);
      } 
    };

    loadAttempts();


  }, [quizId]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const renderQuestionNavigator = () => {
    if (!selectedAttempt) return null;

    const totalQuestions = selectedAttempt.questions.length;
    const questionsPerRow = 10;
    const rows = Math.ceil(totalQuestions / questionsPerRow);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Question Navigator</h3>
          <div className="text-sm text-slate-600">
            {currentQuestionIndex + 1} of {totalQuestions}
          </div>
        </div>
        
        <div className="space-y-2">
          {Array.from({ length: rows }, (_, rowIndex) => (
            <div key={rowIndex} className="flex flex-wrap gap-1">
              {selectedAttempt.questions
                .slice(rowIndex * questionsPerRow, (rowIndex + 1) * questionsPerRow)
                .map((question, index) => {
                  const questionIndex = rowIndex * questionsPerRow + index;
                  const isCurrent = questionIndex === currentQuestionIndex;
                  const isCorrect = question.isCorrect;
                  const isAnswered = question.studentAnswer.length > 0;
                  
                  return (
                    <button
                      key={question.id}
                      onClick={() => setCurrentQuestionIndex(questionIndex)}
                      className={`
                        w-8 h-8 text-xs font-medium rounded-md border transition-all duration-200
                        flex items-center justify-center relative
                        ${isCurrent 
                          ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                          : isCorrect
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200"
                            : isAnswered
                              ? "bg-red-100 text-red-800 border-red-300 hover:bg-red-200"
                              : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
                        }
                      `}
                    >
                      {question.questionNumber}
                      {isCorrect && !isCurrent && (
                        <CheckCircle className="absolute -top-1 -right-1 w-3 h-3 text-emerald-600 bg-white rounded-full" />
                      )}
                      {!isCorrect && isAnswered && !isCurrent && (
                        <XCircle className="absolute -top-1 -right-1 w-3 h-3 text-red-600 bg-white rounded-full" />
                      )}
                    </button>
                  );
                })}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-emerald-100 border border-emerald-300 rounded"></div>
            <span className="text-slate-600">Correct</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
            <span className="text-slate-600">Incorrect</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
            <span className="text-slate-600">Unanswered</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <div className="text-xs text-slate-500 mb-2">Progress</div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-slate-900 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderQuestionDetail = () => {
    if (!selectedAttempt) return null;
    
    const question = selectedAttempt.questions[currentQuestionIndex];
    if (!question) return null;

    return (
      <Card className="border-slate-200">
        <CardHeader className="bg-slate-50/50 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-slate-900">
              Question {question.questionNumber}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-slate-600 border-slate-300">
                {question.questionType.replace('_', ' ')}
              </Badge>
              <Badge 
                variant={question.isCorrect ? 'default' : 'destructive'} 
                className={question.isCorrect ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : ''}
              >
                {question.isCorrect ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Correct
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 mr-1" />
                    Incorrect
                  </>
                )}
              </Badge>
              <Badge variant="outline" className="text-slate-600 border-slate-300">
                {question.obtainedPoints}/{question.points} marks
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 p-6">
          <div>
            <h4 className="text-base font-medium text-slate-900 mb-3">Question</h4>
            <p className="text-slate-700 leading-relaxed">{question.questionText}</p>
          </div>

          {question.options && (
            <div>
              <h4 className="text-base font-medium text-slate-900 mb-3">Options</h4>
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-md border border-slate-200">
                    <span className="text-sm font-medium text-slate-600 min-w-[20px]">
                      {String.fromCharCode(65 + index)})
                    </span>
                    <span className="text-slate-700">{option}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-base font-medium text-slate-900 mb-2">Student Answer</h4>
              <div className={`p-3 rounded-md border ${
                question.isCorrect 
                  ? 'bg-emerald-50 border-emerald-200' 
                  : question.studentAnswer 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-gray-50 border-gray-200'
              }`}>
                <p className="text-slate-700">
                  {question.studentAnswer || 'No answer provided'}
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="text-base font-medium text-slate-900 mb-2">Correct Answer</h4>
              <div className="p-3 rounded-md border bg-emerald-50 border-emerald-200">
                <p className="text-slate-700">{question.correctAnswer}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="border-slate-300"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(Math.min(selectedAttempt.questions.length - 1, currentQuestionIndex + 1))}
              disabled={currentQuestionIndex === selectedAttempt.questions.length - 1}
              className="border-slate-300"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading quiz results...</p>
        </div>
      </div>
    );
  }

  if (!selectedAttempt) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No quiz results found</h3>
          <p className="text-slate-600 mb-4">Unable to load quiz results data.</p>
          <Button onClick={onBackToStart} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quizzes
          </Button>
        </div>
      </div>
    );
  }
  const percentage = Math.round((selectedAttempt.obtainedMarks / selectedAttempt.totalMarks) * 100);
  
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Sidebar - Question Navigator */}


      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={onBackToStart}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Quizzes
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                    <Eye className="w-6 h-6 mr-2" />
                    {selectedAttempt.quizTitle}
                  </h1>
                  <div className="flex items-center space-x-3 mt-1">
                    <Badge variant="outline" className="text-slate-600 border-slate-300">
                      <User className="w-3 h-3 mr-1" />
                      {selectedAttempt.studentName}
                    </Badge>
                    <Badge 
                      variant={percentage >= 80 ? 'default' : percentage >= 60 ? 'secondary' : 'destructive'} 
                      className={percentage >= 80 ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : ''}
                    >
                      <Award className="w-3 h-3 mr-1" />
                      {selectedAttempt.obtainedMarks}/{selectedAttempt.totalMarks} ({percentage}%)
                    </Badge>
                    <Badge variant="outline" className="text-slate-500 border-slate-200">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTime(selectedAttempt.timeSpent)}
                    </Badge>
                  </div>
                </div>
              </div>
              {/* Right: Modify Button for Admins */}
              {userRole === 'admin' && (
                <Button
                  onClick={handleClick}
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "✏️ Modify Quiz"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="p-6">
          {renderQuestionDetail()}
        </div>
      </div>
      <div className="w-80 bg-white border-r border-slate-200 p-6">
        <ScrollArea className="h-full">
          {renderQuestionNavigator()}
        </ScrollArea>
      </div>
    </div>
  );
};

export default QuizResultsViewer;