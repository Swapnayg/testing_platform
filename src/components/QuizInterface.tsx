"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { Clock, ChevronLeft, ChevronRight, Check, AlertTriangle, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  questionNumber: number;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_TEXT' | 'LONG_TEXT' | 'NUMERICAL';
  options?: string[];
  points: number;
  correctAnswer?: string;
}

interface QuizDataModal {
  id: string;
  title: string;
  timeLimit: number; // in minutes
  questions: Question[];
  category: string;
  grade: string;
  subject: string;
  totalMarks: number;
  startTime: string; // ISO string or Date, depending on your backend
  endTime: string;   // ISO string or Date, depending on your backend
}

interface Answer {
  questionId: string;
  answerText: string;
}

interface QuizInterfaceProps {
  quizId?: string;
  username?:string;
  totalMarks?:number;
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({ quizId,username,totalMarks   }) => {
  const { toast } = useToast();
  // Get quiz data from the generator
  const [quizData, setQuizData] = useState<QuizDataModal | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

   const getQuestionsbyId = async () => {
    try {
      const response = await fetch('/api/getQuestions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({quizid:quizId}), // data you want to send
        });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const results = await response.json();
      return results;
    } catch (error) {
      return null;
    }
  };

  
  function capitalizeSentences(text: string) {
    return text.split(/([.!?]\s*)/) // Split by sentence-ending punctuation and keep it
    .map((segment, index, arr) => {
          // Only capitalize the actual sentence part, not the punctuation
      if (index % 2 === 0) {
        return segment.charAt(0).toUpperCase() + segment.slice(1).trimStart();
      }
    return segment;
    }).join('');
  }


  function getTimeRemaining(startTime: Date, endTime: Date): number {
  const now = new Date();

  if (now >= startTime && now <= endTime) {
    const diffMs = endTime.getTime() - now.getTime();
    const mins = Math.floor(diffMs / (1000 * 60));
    return mins;
  } 
  // Not ongoing or already ended
  return 0;
}
  // Load quiz data
    useEffect(() => {
      const fetchStudentQuizzes = async () => {
        const loadedQuiz = await getQuestionsbyId();
        const data = JSON.parse(JSON.stringify(loadedQuiz));
      if (data) {
        setQuizData(data.quizData);
        const remainingMinutes = getTimeRemaining(new Date(data.quizData.startTime), new Date(data.quizData.endTime));
        setTimeRemaining(remainingMinutes * 60); // Convert to seconds
      } 
       else {
        toast({
          title: "Error",
          description: "Quiz not found",
          variant: "destructive",
        });
      }
      };
    if (quizId) {
      fetchStudentQuizzes();
    }
  }, [quizId,username,totalMarks]);

  // Initialize quiz attempt
  useEffect(() => {
    if (!quizData) return;
    
  
  const initializeAttempt = async () => {
      try {
        const res = await fetch('/api/quizz', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({type:"create",quizId:quizId, rollNo: username,totalMarks:totalMarks }), // data you want to send
        });
        const attempt = await res.json();
        setAttemptId(attempt.id);
        toast({
          title: "Quiz Started",
          description: `Good luck, ${username}!`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to start quiz. Please try again.",
          variant: "destructive",
        });

      }
    };

    initializeAttempt();
  }, [quizData]);

  // Timer effect
  useEffect(() => {
    if (isQuizCompleted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmitQuiz(true); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isQuizCompleted]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle answer change
  const handleAnswerChange = useCallback((questionId: string, answerText: string) => {
    setAnswers(prev => new Map(prev.set(questionId, { questionId, answerText })));
  }, []);

  // Get question status
  const getQuestionStatus = (questionIndex: number): 'current' | 'answered' | 'unanswered' => {
    if (questionIndex === currentQuestionIndex) return 'current';
    const question = quizData!.questions[questionIndex];
    return answers.has(question.id) ? 'answered' : 'unanswered';
  };

  // Navigate to question
  const navigateToQuestion = (index: number) => {
    if (index >= 0 && index < quizData!.questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  // Check if all questions are answered
  const getAllUnansweredQuestions = (): number[] => {
    return quizData!.questions
      .filter(q => !answers.has(q.id))
      .map(q => q.questionNumber);
  };

  // Handle quiz submission
const handleSubmitQuiz = async (autoSubmit: boolean = false) => {
  const unansweredQuestions = getAllUnansweredQuestions();
  const unansweredCount = unansweredQuestions.length;
  const totalQuestions = quizData?.questions.length || 0;
  const answeredCount = totalQuestions - unansweredCount;

  if (!autoSubmit && unansweredQuestions.length > 0) {
    toast({
      title: "Incomplete Quiz",
      description: `Please answer questions: ${unansweredQuestions.join(', ')}`,
      variant: "destructive",
    });
    return;
  }

  if (!attemptId) {
    toast({
      title: "Error",
      description: "Quiz attempt not found. Please restart the quiz.",
      variant: "destructive",
    });
    return;
  }

  setIsSubmitting(true); // disable button

  try {
    toast({
      title: "Submitting Quiz",
      description: "Please wait while we save your answers...",
    });
    const remainingMinutes = getTimeRemaining(
      new Date(quizData?.startTime ?? ''),
      new Date(quizData?.endTime ?? '')
    );

    const submissionData = {
      attemptId,
      answers: Array.from(answers.values()),
      timeSpent: (remainingMinutes) - timeRemaining,
      endTime: new Date().toISOString(),
      unansweredCount,
      answeredCount 
    };

    const result = await fetch('/api/quizz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: "answers", aquizId: quizId, arollNo: username, data: submissionData }),
    });

    const attempt = await result.json();
    if (!result.ok) {
      console.error('Quiz submission failed:');
      toast({
        title: "Submission Failed",
        description: "Failed to save your quiz. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false); // allow retry
    }
    setIsQuizCompleted(true);
    toast({
      title: autoSubmit ? "Time's Up!" : "Quiz Submitted Successfully",
      description: autoSubmit 
        ? "Quiz has been automatically submitted with your current answers."
        : "Your quiz has been submitted and saved to the database!",
    });

    // ✅ Reload parent and close popup
    setTimeout(() => {
      if (window.opener) {
        window.opener.location.reload(); // Refresh the page that opened this popup
      }
      window.close(); // Close this popup
    }, 300);
  } catch (error) {
    console.error('Quiz submission failed:', error);
    toast({
      title: "Submission Failed",
      description: "Failed to save your quiz. Please try again.",
      variant: "destructive",
    });
    setIsSubmitting(false); // allow retry
  }
};


  // Render question based on type
  const renderQuestion = (question: Question) => {
    const currentAnswer = answers.get(question.id)?.answerText || '';

    switch (question.questionType) {
      case 'MULTIPLE_CHOICE':
        return (
          <RadioGroup
            value={currentAnswer}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
            className="space-y-3"
          >
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <RadioGroupItem value={option} id={`${question.id}-${index}`} className="border-slate-300" />
                <Label htmlFor={`${question.id}-${index}`} className="cursor-pointer text-slate-700 flex-1">
                  {capitalizeSentences(option)} 
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'TRUE_FALSE':
        return (
          <div className="space-y-4">
            <RadioGroup
              value={currentAnswer}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
              className="flex space-x-6"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <RadioGroupItem value="True" id={`${question.id}-true`} className="border-slate-300" />
                <Label htmlFor={`${question.id}-true`} className="cursor-pointer text-slate-700">True</Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <RadioGroupItem value="False" id={`${question.id}-false`} className="border-slate-300" />
                <Label htmlFor={`${question.id}-false`} className="cursor-pointer text-slate-700">False</Label>
              </div>
            </RadioGroup>
          </div>
        );

      case 'SHORT_TEXT':
        return (
          <Input
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your answer..."
            className="max-w-md border-slate-300 focus:border-slate-500 focus:ring-slate-500"
          />
        );

      case 'LONG_TEXT':
        return (
          <Textarea
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your detailed answer..."
            rows={6}
            className="border-slate-300 focus:border-slate-500 focus:ring-slate-500"
          />
        );

      case 'NUMERICAL':
        return (
          <Input
            type="number"
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter a number..."
            className="max-w-xs border-slate-300 focus:border-slate-500 focus:ring-slate-500"
          />
        );

      default:
        return <div>Unsupported question type</div>;
    }
  };

  // Loading state
  if (!quizData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (isQuizCompleted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center border-slate-200">
          <CardHeader>
            <CardTitle className="text-2xl text-emerald-600">Quiz Completed!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Check className="w-16 h-16 text-emerald-600 mx-auto" />
            <p className="text-slate-600">
              Thank you for completing the quiz. Your answers have been submitted.
            </p>
            <div className="text-sm text-slate-500">
              Questions answered: {answers.size} / {quizData.questions.length}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;
  const unansweredCount = getAllUnansweredQuestions().length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-slate-900">{capitalizeSentences(quizData.title)}</h1>
              <Badge variant="outline" className="text-slate-600 border-slate-300">
                Question {currentQuestionIndex + 1} of {quizData.questions.length}
              </Badge>
              <Badge variant="outline" className="text-slate-500 border-slate-200">
                {quizData.subject} • {quizData.grade}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={timeRemaining < 300 ? "destructive" : "secondary"} className="text-sm bg-slate-100 text-slate-800 border-slate-300">
                <Clock className="w-4 h-4 mr-1" />
                {formatTime(timeRemaining)}
              </Badge>
              {unansweredCount > 0 && (
                <Badge variant="outline" className="text-sm text-amber-600 border-amber-300 bg-amber-50">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {unansweredCount} unanswered
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="flex gap-6">
          {/* Main Content - Left Side */}
          <div className="flex-1">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-slate-900">
                    Question {currentQuestion.questionNumber}
                  </CardTitle>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="text-slate-600 border-slate-300">
                      {currentQuestion.questionType.replace('_', ' ').toLowerCase()}
                    </Badge>
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                      <Award className="w-3 h-3 mr-1" />
                      {currentQuestion.points} marks
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <p className="text-lg leading-relaxed text-slate-800">{capitalizeSentences(currentQuestion.questionText)}</p>
                
                <div className="space-y-4">
                  {renderQuestion(currentQuestion)}
                </div>

                {/* Navigation buttons */}
                <div className="flex items-center justify-between pt-8 border-t border-slate-200">
                  <Button
                    variant="outline"
                    onClick={() => navigateToQuestion(currentQuestionIndex - 1)}
                    disabled={currentQuestionIndex === 0}
                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex gap-2">
                    {!isLastQuestion ? (
                      <Button
                        onClick={() => navigateToQuestion(currentQuestionIndex + 1)}
                        className="bg-slate-900 hover:bg-slate-800 text-white"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleSubmitQuiz()}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        disabled={!attemptId || isSubmitting}
                      >
                       {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Side */}
          <div className="w-80 shrink-0">
            <Card className="sticky top-6 border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b border-slate-200">
                <CardTitle className="text-lg text-slate-900">Question Navigator</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-5 gap-3">
                  {quizData.questions.map((question, index) => {
                    const status = getQuestionStatus(index);
                    return (
                      <div key={index} className="flex flex-col items-center space-y-1">
                        <Button
                          variant={status === 'current' ? 'default' : status === 'answered' ? 'secondary' : 'outline'}
                          size="sm"
                          className={`h-10 w-10 text-sm font-medium transition-all ${
                            status === 'current' 
                              ? 'bg-slate-900 hover:bg-slate-800 text-white' 
                              : status === 'answered' 
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200' 
                                : 'border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100'
                          }`}
                          onClick={() => navigateToQuestion(index)}
                        >
                          {index + 1}
                          {status === 'answered' && <Check className="w-3 h-3 ml-1" />}
                        </Button>
                        <span className="text-xs text-slate-500 font-medium">{question.points}m</span>
                      </div>
                    );
                  })}
                </div> 
                
                <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Total Questions:</span>
                    <span className="font-medium text-slate-900">{quizData.questions.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Answered:</span>
                    <span className="font-medium text-emerald-600">{answers.size}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Remaining:</span>
                    <span className="font-medium text-amber-600">{unansweredCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Total Marks:</span>
                    <span className="font-medium text-slate-900">{quizData.totalMarks}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizInterface;