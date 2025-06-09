
import React from 'react';
import { Clock, BookOpen, Award, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  timeLimit: number;
  totalQuestions: number;
  totalMarks: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface QuizStartPageProps {
  onStartQuiz: (quizId: string) => void;
}

const QuizStartPage: React.FC<QuizStartPageProps> = ({ onStartQuiz }) => {
  // Mock quiz data - replace with actual data fetching
  const quizzes: Quiz[] = [
    {
      id: "quiz-1",
      title: "Advanced Mathematics Quiz",
      description: "Test your knowledge in calculus, algebra, and geometry. This comprehensive quiz covers fundamental mathematical concepts and problem-solving techniques.",
      subject: "Mathematics",
      timeLimit: 30,
      totalQuestions: 10,
      totalMarks: 100,
      difficulty: "Hard"
    },
    {
      id: "quiz-2",
      title: "Science Fundamentals",
      description: "Explore the basics of physics, chemistry, and biology. Perfect for testing your understanding of scientific principles and natural phenomena.",
      subject: "Science",
      timeLimit: 25,
      totalQuestions: 8,
      totalMarks: 80,
      difficulty: "Medium"
    },
    {
      id: "quiz-3",
      title: "World Geography Challenge",
      description: "Test your knowledge of world capitals, countries, landmarks, and geographical features from around the globe.",
      subject: "Geography",
      timeLimit: 20,
      totalQuestions: 12,
      totalMarks: 60,
      difficulty: "Easy"
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Hard': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getSubjectIcon = (subject: string) => {
    switch (subject.toLowerCase()) {
      case 'mathematics': return '📐';
      case 'science': return '🔬';
      case 'geography': return '🌍';
      default: return '📚';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Quiz Portal</h1>
            <p className="text-slate-600">Choose a quiz to test your knowledge</p>
          </div>
        </div>
      </div>

      {/* Quiz Grid */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="group hover:shadow-lg transition-all duration-200 border-slate-200 bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getSubjectIcon(quiz.subject)}</span>
                    <Badge variant="outline" className="text-xs font-medium text-slate-600 border-slate-300">
                      {quiz.subject}
                    </Badge>
                  </div>
                  <Badge className={`text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                    {quiz.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
                  {quiz.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                  {quiz.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 py-3 border-t border-slate-100">
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-700 font-medium">{quiz.timeLimit} min</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <BookOpen className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-700 font-medium">{quiz.totalQuestions} questions</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Award className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-700 font-medium">{quiz.totalMarks} marks</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-700 font-medium">Solo</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => onStartQuiz(quiz.id)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 group transition-all duration-200"
                >
                  Start Quiz
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizStartPage;
