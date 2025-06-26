/* eslint-disable @next/next/no-async-client-component */
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
    grades: '',
    subject: '',
    totalQuestions: 5,
    totalMarks: 100,
    timeLimit:30,
    startDateTime: new Date(),
    endDateTime: new Date(),
    examId:'',
  });


  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const steps = [
    { number: 1, name: 'Quiz Information', description: '' },
    { number: 2, name: 'Questions', description: '' },
    { number: 3, name: 'Review', description: '' },
  ];

  // Validation function to check if a question is complete
  const isQuestionComplete = (question: Question): boolean => {
    if (!question.text || question.text.trim() === '') {
      return false;
    }

    switch (question.type) {
      case 'MULTIPLE_CHOICE':
        if (!question.options || question.options.length < 2) {
          return false;
        }
        const hasAllOptionsFilled = question.options.every(option => option.text && option.text.trim() !== '');
        const hasCorrectOption = question.options.some(option => option.isCorrect);
        return hasAllOptionsFilled && hasCorrectOption;

      case 'TRUE_FALSE':
        return question.correctAnswer === 'true' || question.correctAnswer === 'false';

      case 'SHORT_TEXT':
      case 'LONG_TEXT':
      case 'NUMERICAL':
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
      grades: '',
      subject: '',
      totalQuestions: 5,
      totalMarks: 100,
      timeLimit:30,
      startDateTime: new Date(),
      endDateTime: new Date(),
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
      console.log(completeQuizData);

      console.log('Saving quiz to database...');
      const savedData = await saveQuizToDatabase(completeQuizData);
      
      console.log('Quiz saved successfully:', savedData);
      
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
        {/* Header */}
        <Card className="mb-8 bg-slate-800 text-white border-0 shadow-lg flex justify-center items-center min-h-[150px]">
  <CardHeader className="text-center">
    <CardTitle className="text-3xl font-bold mb-2">Quiz Builder</CardTitle>
    <p className="text-slate-300">Create engaging quizzes with ease</p>
  </CardHeader>
</Card>

      </div>

      {/* Step Indicators */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-8">
          {steps.map((step, index) => (
             <React.Fragment key={step.number}>
            <div className={`flex items-center ${currentStep >= step.number ? 'text-slate-800' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep >= step.number ? 'bg-slate-800 border-slate-800 text-white' : 'border-slate-400'
              }`}>
                {step.number}
              </div>
              <span className="ml-2 font-medium">{step.name}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 ${currentStep >= step.number + 1 ? 'bg-slate-800' : 'bg-slate-300'}`}></div>
            )}
          </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
     
        {/* <CardHeader>
          {/* <CardTitle className="text-slate-900">
            Step {currentStep}: {steps[currentStep - 1].name}
          </CardTitle>
        </CardHeader> */}
      
          {currentStep === 1 && (
            <MetadataStep quizData={quizData} setQuizData={setQuizData} questions={questions} setQuestions={setQuestions}  />
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
       

      {/* Navigation */}
      <div className="flex justify-between mt-5">
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
