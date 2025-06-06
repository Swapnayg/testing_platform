

import React from 'react';
import { Button } from '@/components/ui2/button';
import { Input } from '@/components/ui2/input';
import { Label } from '@/components/ui2/label';
import { Textarea } from '@/components/ui2/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui2/card';
import { Badge } from '@/components/ui2/badge';
import { QuizFormData } from '@/types/quiz';
import { ArrowLeft, Send, Clock, BookOpen, Hash, Award } from 'lucide-react';

interface QuizReviewProps {
  quizData: QuizFormData;
  onBack: () => void;
  onSave: () => void;
}

const QuizReview: React.FC<QuizReviewProps> = ({ quizData, onBack, onSave }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  const renderAnswerInput = (question: any, index: number) => {
    switch (question.type) {
      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option: string, optionIndex: number) => (
              <div key={optionIndex} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`answer-${index}`}
                  value={option}
                  className="text-slate-800 focus:ring-slate-500"
                />
                <Label className="text-slate-700">{option}</Label>
              </div>
            ))}
          </div>
        );
      case 'true_false':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                name={`answer-${index}`}
                value="true"
                className="text-slate-800 focus:ring-slate-500"
              />
              <Label className="text-slate-700">True</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                name={`answer-${index}`}
                value="false"
                className="text-slate-800 focus:ring-slate-500"
              />
              <Label className="text-slate-700">False</Label>
            </div>
          </div>
        );
      case 'numerical':
        return (
          <Input
            type="number"
            placeholder="Enter your answer"
            className="bg-white border border-slate-300 focus:border-slate-800"
          />
        );
      case 'long_text':
        return (
          <Textarea
            placeholder="Enter your answer..."
            className="bg-white border border-slate-300 focus:border-slate-800"
          />
        );
      default:
        return (
          <Input
            placeholder="Enter your answer"
            className="bg-white border border-slate-300 focus:border-slate-800"
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-8 bg-slate-800 text-white border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold mb-2">Quiz Review</CardTitle>
            <p className="text-slate-300">Review your quiz before submitting</p>
          </CardHeader>
        </Card>

        {/* Quiz Information */}
        <Card className="mb-8 bg-white shadow-lg border border-slate-200">
          <CardHeader className="bg-slate-100 border-b border-slate-200">
            <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <BookOpen className="h-5 w-5" />
              Quiz Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">{quizData.title}</h3>
                <Badge variant="secondary" className="mb-4 bg-slate-100 text-slate-800 border border-slate-300">
                  {quizData.subject}
                </Badge>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <Hash className="h-4 w-4" />
                  <span>Questions: {quizData.totalQuestions}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Award className="h-4 w-4" />
                  <span>Total Marks: {quizData.totalMarks}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="h-4 w-4" />
                  <span>Start: {formatDate(quizData.startDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="h-4 w-4" />
                  <span>End: {formatDate(quizData.endDate)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions Form */}
        <form className="space-y-6">
          {quizData.questions.map((question, index) => (
            <Card key={question.id} className="bg-white shadow-lg border border-slate-200 overflow-hidden">
              <CardHeader className="bg-slate-200 border-b border-slate-300">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-bold text-slate-800">
                    Question {index + 1}
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 border border-slate-300">
                      {question.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 border border-amber-300">
                      {question.marks} marks
                    </Badge>
                    {question.required && (
                      <Badge variant="destructive" className="bg-red-100 text-red-800 border border-red-300">
                        Required
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-lg font-semibold text-slate-800 mb-2 block">
                      {question.question}
                    </Label>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600 mb-2 block">
                      Your Answer:
                    </Label>
                    {renderAnswerInput(question, index)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </form>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1 h-12 text-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Edit
          </Button>
          <Button
            onClick={onSave}
            className="flex-1 h-12 text-lg bg-slate-800 hover:bg-slate-700 text-white"
          >
            <Send className="h-5 w-5 mr-2" />
            Submit Quiz
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizReview;
