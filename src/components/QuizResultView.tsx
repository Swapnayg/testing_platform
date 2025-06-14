"use client"
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, CheckCircle, XCircle, Clock, User, Calendar, Award, ChevronLeft, ChevronRight, Eye, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

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
}

const QuizResultsViewer: React.FC<QuizResultsViewerProps> = ({ quizId,username }) => {
  const { toast } = useToast();
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [selectedAttempt, setSelectedAttempt] = useState<QuizAttempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const onBackToStart = () => {
    setTimeout(() => {
      router.back(); // or router.push('/your-target-page')
    }, 1000); // Delay optional
  };


  // Mock data - In real app, this would come from an API
  useEffect(() => {
    const loadAttempts = async () => {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockAttempts: QuizAttempt[] = [
          {
            id: 'attempt_1',
            studentName: 'John Smith',
            quizTitle: 'Mathematics Quiz - Algebra',
            subject: 'Mathematics',
            grade: 'Grade 10',
            startTime: '2024-06-14T10:00:00Z',
            endTime: '2024-06-14T10:45:00Z',
            totalQuestions: 25,
            answeredQuestions: 24,
            correctAnswers: 20,
            totalMarks: 100,
            obtainedMarks: 80,
            timeSpent: 2700, // 45 minutes in seconds
            status: 'completed',
            questions: Array.from({ length: 25 }, (_, i) => ({
              id: `q_${i + 1}`,
              questionNumber: i + 1,
              questionText: `Question ${i + 1}: What is the solution to ${i + 1}x + 5 = ${(i + 1) * 3}?`,
              questionType: 'MULTIPLE_CHOICE' as const,
              options: ['A) 1', 'B) 2', 'C) 3', 'D) 4'],
              correctAnswer: 'B) 2',
              studentAnswer: Math.random() > 0.2 ? 'B) 2' : 'A) 1',
              isCorrect: Math.random() > 0.2,
              points: 4,
              obtainedPoints: Math.random() > 0.2 ? 4 : 0
            }))
          },
          {
            id: 'attempt_2',
            studentName: 'Sarah Johnson',
            quizTitle: 'Science Quiz - Physics',
            subject: 'Physics',
            grade: 'Grade 11',
            startTime: '2024-06-13T14:00:00Z',
            endTime: '2024-06-13T15:30:00Z',
            totalQuestions: 30,
            answeredQuestions: 30,
            correctAnswers: 25,
            totalMarks: 120,
            obtainedMarks: 100,
            timeSpent: 5400, // 90 minutes
            status: 'completed',
            questions: Array.from({ length: 30 }, (_, i) => ({
              id: `q_${i + 1}`,
              questionNumber: i + 1,
              questionText: `Physics Question ${i + 1}: Calculate the velocity when acceleration is ${i + 2} m/s²`,
              questionType: 'NUMERICAL' as const,
              correctAnswer: `${(i + 2) * 5}`,
              studentAnswer: `${(i + 2) * 5 + (Math.random() > 0.17 ? 0 : 2)}`,
              isCorrect: Math.random() > 0.17,
              points: 4,
              obtainedPoints: Math.random() > 0.17 ? 4 : 0
            }))
          }
        ];
        setAttempts(mockAttempts);
        setIsLoading(false);
      }, 1000);
    };

    loadAttempts();
  }, []);

  const filteredAttempts = attempts.filter(attempt => {
    const matchesSearch = attempt.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attempt.quizTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || attempt.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (percentage: number): string => {
    if (percentage >= 80) return 'text-emerald-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (percentage: number) => {
    if (percentage >= 80) return 'default';
    if (percentage >= 60) return 'secondary';
    return 'destructive';
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

  if (selectedAttempt) {
    const percentage = Math.round((selectedAttempt.obtainedMarks / selectedAttempt.totalMarks) * 100);
    
    return (
      <div className="min-h-screen bg-slate-50 flex">
        {/* Left Sidebar - Question Navigator */}
        <div className="w-80 bg-white border-r border-slate-200 p-6">
          <ScrollArea className="h-full">
            {renderQuestionNavigator()}
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="bg-white border-b border-slate-200 shadow-sm">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedAttempt(null)}
                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Results
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
                      <Badge variant={getScoreBadgeVariant(percentage)} className={percentage >= 80 ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : ''}>
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
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="p-6">
            {renderQuestionDetail()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
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
              <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                <BookOpen className="w-6 h-6 mr-2" />
                Quiz Results
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search by student or quiz name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80 border-slate-300"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40 border-slate-300">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="abandoned">Abandoned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="container mx-auto p-6">
        {filteredAttempts.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No quiz results found</h3>
            <p className="text-slate-600">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAttempts.map((attempt) => {
              const percentage = Math.round((attempt.obtainedMarks / attempt.totalMarks) * 100);
              
              return (
                <Card key={attempt.id} className="border-slate-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedAttempt(attempt)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-slate-900 line-clamp-2 mb-1">
                          {attempt.quizTitle}
                        </CardTitle>
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <User className="w-4 h-4" />
                          <span>{attempt.studentName}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className={`${getScoreColor(percentage)} border-current`}>
                        {percentage}%
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="flex items-center text-slate-600 mb-1">
                          <Award className="w-4 h-4 mr-1" />
                          Score
                        </div>
                        <div className="font-medium text-slate-900">
                          {attempt.obtainedMarks}/{attempt.totalMarks}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center text-slate-600 mb-1">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Correct
                        </div>
                        <div className="font-medium text-slate-900">
                          {attempt.correctAnswers}/{attempt.totalQuestions}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <div className="flex items-center text-slate-600 mb-1">
                        <Clock className="w-4 h-4 mr-1" />
                        Time Spent
                      </div>
                      <div className="font-medium text-slate-900">
                        {formatTime(attempt.timeSpent)}
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <div className="flex items-center text-slate-600 mb-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        Completed
                      </div>
                      <div className="font-medium text-slate-900">
                        {formatDate(attempt.endTime)}
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">{attempt.subject}</Badge>
                          <Badge variant="outline" className="text-xs">{attempt.grade}</Badge>
                        </div>
                        <Button size="sm" variant="outline" className="text-xs">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizResultsViewer;