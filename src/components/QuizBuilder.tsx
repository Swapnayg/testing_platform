"use client"
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MetadataStep from './quiz/MetadataStep';
import QuestionsStep from './quiz/QuestionsStep';
import ReviewStep from './quiz/ReviewStep';
import { QuizData, Question } from './quiz/types';
import { saveQuizToDatabase } from '@/lib/actions';

const QuizBuilder = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [quizData, setQuizData] = useState<QuizData>({
    title: '',
    category: '',
    grade: '',
    subject: '',
    totalQuestions: 5,
    totalMarks: 100,
    startDateTime: '',
    endDateTime: '',
    examId:'',
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const steps = [
    { id: 1, name: 'Quiz Metadata', description: 'Basic quiz information' },
    { id: 2, name: 'Questions', description: 'Create your questions' },
    { id: 3, name: 'Review', description: 'Review and submit' },
  ];

  // Validation function to check if a question is complete
  const isQuestionComplete = (question: Question): boolean => {
    if (!question.text || question.text.trim() === '') {
      return false;
    }

    switch (question.type) {
      case 'multiple-choice':
        if (!question.options || question.options.length < 2) {
          return false;
        }
        const hasAllOptionsFilled = question.options.every(option => option.text && option.text.trim() !== '');
        const hasCorrectOption = question.options.some(option => option.isCorrect);
        return hasAllOptionsFilled && hasCorrectOption;

      case 'true-false':
        return question.correctAnswer === 'true' || question.correctAnswer === 'false';

      case 'short-text':
      case 'long-text':
      case 'numerical':
        return question.correctAnswer !== undefined && question.correctAnswer.trim() !== '';

      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedToNext = () => {
    if (currentStep === 1) {
      return quizData.title && quizData.totalQuestions > 0 && quizData.totalMarks > 0;
    }
    if (currentStep === 2) {
      // Check if we have the required number of questions and all are complete
      const hasRequiredNumberOfQuestions = questions.length === quizData.totalQuestions;
      const allQuestionsComplete = questions.every(q => isQuestionComplete(q));
      return hasRequiredNumberOfQuestions && allQuestionsComplete;
    }
    return true;
  };

  const resetForm = () => {
    setQuizData({
      title: '',
      category: '',
      grade: '',
      subject: '',
      totalQuestions: 5,
      totalMarks: 100,
      startDateTime: '',
      endDateTime: '',
      examId:'',
    });
    setQuestions([]);
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const completeQuizData = {
        quiz: quizData,
        questions: questions,
      };

      console.log('Saving quiz to database...');
     // const savedData = await saveQuizToDatabase(completeQuizData);
      
      //console.log('Quiz saved successfully:', savedData);
      
      toast({
        title: "Quiz Saved Successfully! 🎉",
        description: `Your quiz "${quizData.title}" with ${questions.length} questions has been saved to the database.`,
      });

      // Reset the form after successful submission
      resetForm();
      
    } catch (error) {
      console.error('Failed to save quiz:', error);
      toast({
        title: "Error Saving Quiz",
        description: "There was an error saving your quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Quiz Builder</h1>
        <p className="text-slate-600">Create engaging quizzes with multiple question types</p>
      </div>

      {/* Step Indicators */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    step.id < currentStep
                      ? 'bg-slate-600 text-white'
                      : step.id === currentStep
                      ? 'bg-slate-600 text-white'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {step.id < currentStep ? <Check size={18} /> : step.id}
                </div>
                <div>
                  <p className={`font-medium ${
                    step.id <= currentStep ? 'text-slate-900' : 'text-slate-400'
                  }`}>
                    {step.name}
                  </p>
                  <p className="text-sm text-slate-500">{step.description}</p>
                </div>
              </div>
              
              {/* Connecting line between steps */}
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  step.id < currentStep ? 'bg-slate-600' : 'bg-slate-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-slate-900">
            Step {currentStep}: {steps[currentStep - 1].name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <MetadataStep quizData={quizData} setQuizData={setQuizData} />
          )}
          {currentStep === 2 && (
            <QuestionsStep
              questions={questions}
              setQuestions={setQuestions}
              quizData={quizData}
            />
          )}
          {currentStep === 3 && (
            <ReviewStep quizData={quizData} questions={questions} />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        {currentStep > 1 && (
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isSubmitting}
            className="border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Back
          </Button>
        )}
        
        {currentStep === 1 && <div />}
        
        {currentStep < 3 ? (
          <Button
            onClick={handleNext}
            disabled={!canProceedToNext() || isSubmitting}
            className="bg-slate-600 hover:bg-slate-700 text-white disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {currentStep === 1 ? 'Next Step' : 'Review Quiz'}
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-slate-600 hover:bg-slate-700 text-white disabled:bg-slate-300"
          >
            {isSubmitting ? 'Saving...' : 'Submit Quiz'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuizBuilder;
