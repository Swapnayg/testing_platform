import React, { useState } from 'react';
import { Button } from '@/components/ui2/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui2/card';
import { Badge } from '@/components/ui2/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui2/tabs';
import { Plus, Edit, AlertCircle } from 'lucide-react';
import { QuizData, Question } from './types';
import QuestionForm from './QuestionForm';
import EditQuestionForm from './EditQuestionForm';

interface QuestionsStepProps {
  questions: Question[];
  setQuestions: (questions: Question[]) => void;
  quizData: QuizData;
}

const QuestionsStep = ({ questions, setQuestions, quizData }: QuestionsStepProps) => {
  const [activeTab, setActiveTab] = useState('list');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  const marksPerQuestion = quizData.totalMarks / quizData.totalQuestions;

  // Validation function to check if a question is complete
  const isQuestionComplete = (question: Question): boolean => {
    // Check if question text is filled
    if (!question.text || question.text.trim() === '') {
      return false;
    }

    // Check based on question type
    switch (question.type) {
      case 'MULTIPLE_CHOICE':
        // Must have at least 2 options, all options filled, and one marked as correct
        if (!question.options || question.options.length < 2) {
          return false;
        }
        const hasAllOptionsFilled = question.options.every(option => option.text && option.text.trim() !== '');
        const hasCorrectOption = question.options.some(option => option.isCorrect);
        return hasAllOptionsFilled && hasCorrectOption;

      case 'TRUE_FALSE':
        // Must have a correct answer selected
        return question.correctAnswer === 'true' || question.correctAnswer === 'false';

      case 'SHORT_TEXT':
      case 'LONG_TEXT':
      case 'NUMERICAL':
        // Must have a correct answer provided
        return question.correctAnswer !== undefined && question.correctAnswer.trim() !== '';

      default:
        return false;
    }
  };

  // Get validation status for all questions
  const getValidationStatus = () => {
    const incompleteQuestions = questions.filter(q => !isQuestionComplete(q));
    const hasRequiredNumberOfQuestions = questions.length === quizData.totalQuestions;
    
    return {
      incompleteQuestions,
      hasRequiredNumberOfQuestions,
      canProceedToReview: incompleteQuestions.length === 0 && hasRequiredNumberOfQuestions
    };
  };

  const validationStatus = getValidationStatus();

  const addQuestion = (question: Question) => {
    const questionWithMarks = {
      ...question,
      marks: marksPerQuestion,
    };
    setQuestions([...questions, questionWithMarks]);
    setActiveTab('list');
  };

  const updateQuestion = (updatedQuestion: Question) => {
    setQuestions(questions.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
    setEditingQuestionId(null);
    setActiveTab('list');
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const startEditingQuestion = (id: string) => {
    setEditingQuestionId(id);
    setActiveTab('edit');
  };

  const canAddMore = questions.length < quizData.totalQuestions;
  const editingQuestion = questions.find(q => q.id === editingQuestionId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Badge variant="outline" className="border-slate-300 text-slate-700">
            {questions.length} of {quizData.totalQuestions} questions added
          </Badge>
          <p className="text-sm text-slate-600 mt-1">
            {marksPerQuestion.toFixed(1)} marks per question
          </p>
        </div>
        

      </div>

      {/* Validation Status */}
      {!validationStatus.canProceedToReview && questions.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-orange-600 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-orange-800 mb-2">Complete All Questions Before Review</h3>
                <div className="text-sm text-orange-700 space-y-1">
                  {!validationStatus.hasRequiredNumberOfQuestions && (
                    <p>• You need {quizData.totalQuestions} questions, but only have {questions.length}</p>
                  )}
                  {validationStatus.incompleteQuestions.length > 0 && (
                    <div>
                      <p>• The following questions need to be completed:</p>
                      <ul className="ml-4 mt-1 space-y-1">
                        {validationStatus.incompleteQuestions.map((q, index) => {
                          const questionNumber = questions.indexOf(q) + 1;
                          return (
                            <li key={q.id} className="text-orange-600">
                              Question {questionNumber}: Missing required information
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100">
          <TabsTrigger value="list" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white">
            Questions List
          </TabsTrigger>
          <TabsTrigger 
            value="add" 
            disabled={!canAddMore}
            className="data-[state=active]:bg-slate-600 data-[state=active]:text-white"
          >
            <Plus size={16} className="mr-1" />
            Add Question
          </TabsTrigger>
          {editingQuestion && (
            <TabsTrigger 
              value="edit"
              className="data-[state=active]:bg-slate-600 data-[state=active]:text-white"
            >
              <Edit size={16} className="mr-1" />
              Edit Question
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {questions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-slate-500">No questions added yet.</p>
                <Button
                  onClick={() => setActiveTab('add')}
                  disabled={!canAddMore}
                  className="mt-4 bg-slate-600 hover:bg-slate-700 text-white"
                >
                  <Plus size={16} className="mr-1" />
                  Add Your First Question
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => {
                const isComplete = isQuestionComplete(question);
                return (
                  <Card key={question.id} className={!isComplete ? 'border-orange-200' : ''}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                          Question {index + 1}
                          {!isComplete && (
                            <Badge variant="outline" className="border-orange-300 text-orange-700 bg-orange-50">
                              Incomplete
                            </Badge>
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-slate-600 text-white">
                            {question.type.replace('-', ' ')}
                          </Badge>
                          <Badge variant="outline" className="border-slate-300 text-slate-700">
                            {question.marks} marks
                          </Badge>
                          <Button
                            onClick={() => startEditingQuestion(question.id)}
                            variant="outline"
                            size="sm"
                            className="border-slate-300 text-slate-700 hover:bg-slate-50"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            onClick={() => deleteQuestion(question.id)}
                            variant="outline"
                            size="sm"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700 mb-2">{question.text || 'No question text provided'}</p>
                      {question.options && (
                        <div className="space-y-1">
                          {question.options.map((option) => (
                            <div
                              key={option.id}
                              className={`p-2 rounded ${
                                option.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-slate-50'
                              }`}
                            >
                              {option.text || 'Empty option'} {option.isCorrect && <Badge className="ml-2 bg-green-600">Correct</Badge>}
                            </div>
                          ))}
                        </div>
                      )}
                      {question.correctAnswer && !question.options && (
                        <div className="bg-green-50 border border-green-200 p-2 rounded">
                          <strong>Correct Answer:</strong> {question.type === 'TRUE_FALSE' ? (question.correctAnswer === 'true' ? 'True' : 'False') : question.correctAnswer}
                        </div>
                      )}
                      {!isComplete && (
                        <div className="bg-orange-50 border border-orange-200 p-2 rounded mt-2">
                          <p className="text-sm text-orange-700">
                            <strong>⚠️ This question is incomplete:</strong> Please ensure all required fields are filled out.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              
              {canAddMore && (
                <Button
                  onClick={() => setActiveTab('add')}
                  variant="outline"
                  className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  <Plus size={16} className="mr-1" />
                  Add Another Question
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="add">
          <QuestionForm
            onSubmit={addQuestion}
            marksPerQuestion={marksPerQuestion}
          />
        </TabsContent>

        {editingQuestion && (
          <TabsContent value="edit">
            <EditQuestionForm
              question={editingQuestion}
              onSubmit={updateQuestion}
              onCancel={() => {
                setEditingQuestionId(null);
                setActiveTab('list');
              }}
              marksPerQuestion={marksPerQuestion}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default QuestionsStep;
