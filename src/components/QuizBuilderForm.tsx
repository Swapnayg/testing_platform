"use client";
import React, { useState, useEffect } from 'react';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui2/button';
import { Input } from '@/components/ui2/input';
import { Label } from '@/components/ui2/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui2/card';
import { Plus, Eye, BookOpen, Hash, Award, ArrowRight, ArrowLeft, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import QuestionBuilder from './QuestionBuilder';
import QuizReview from './QuizReview';
import { DateTimePicker } from './DateTimePicker';
import { quizSchema, type QuizFormData } from '@/lib/formValidationSchemas';
import { PrismaQuizData } from '@/types/quiz';

const QuizBuilderForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [reviewData, setReviewData] = useState<QuizFormData | null>(null);

  const methods = useForm<QuizFormData>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: '',
      subject: '',
      totalMarks: 100,
      totalQuestions: 5,
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      questions: [
        {
          id: crypto.randomUUID(),
          type: 'multiple_choice',
          question: '',
          required: true,
          options: ['', ''],
          correctAnswer: '',
          marks: 20,
        },
      ],
    },
  });

  const { register, handleSubmit, control, setValue, watch, formState: { errors, isSubmitting }, trigger } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  const watchedQuestions = watch('questions');
  const totalQuestions = watch('totalQuestions');
  const totalMarks = watch('totalMarks');

  // Auto-distribute marks equally among questions when totalMarks or totalQuestions change
  useEffect(() => {
    if (totalMarks && totalQuestions) {
      const marksPerQuestion = Math.floor(totalMarks / totalQuestions);
      const remainder = totalMarks % totalQuestions;
      
      // Update each existing question's marks
      watchedQuestions.forEach((_, index) => {
        // Give extra marks to first few questions if there's a remainder
        const questionMarks = marksPerQuestion + (index < remainder ? 1 : 0);
        setValue(`questions.${index}.marks`, questionMarks);
      });
    }
  }, [totalMarks, totalQuestions, setValue, watchedQuestions]);

  const addQuestion = () => {
    if (fields.length < totalQuestions) {
      const marksPerQuestion = Math.floor(totalMarks / totalQuestions);
      const remainder = totalMarks % totalQuestions;
      const questionMarks = marksPerQuestion + (fields.length < remainder ? 1 : 0);
      
      append({
        id: crypto.randomUUID(),
        type: 'multiple_choice',
        question: '',
        required: true,
        options: ['', ''],
        correctAnswer: '',
        marks: questionMarks,
      });
    }
  };

  const formatForPrisma = (data: QuizFormData): PrismaQuizData => {
    return {
      title: data.title,
      subject: data.subject,
      totalMarks: data.totalMarks,
      totalQuestions: data.totalQuestions,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate.toISOString(),
      questions: {
        create: data.questions.map((question, index) => ({
          type: question.type,
          question: question.question,
          required: question.required,
          options: question.type === 'multiple_choice' ? question.options || [] : null,
          correctAnswer: String(question.correctAnswer),
          marks: question.marks,
          order: index + 1,
        })),
      },
    };
  };

  const handleNextStep = async () => {
    const fieldsToValidate = ['title', 'subject', 'startDate', 'endDate'] as const;
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid) {
      setCurrentStep(2);
    }
  };

  const handleReviewStep = async () => {
    const isValid = await trigger();
    
    if (isValid) {
      const formData = methods.getValues();
      
      // Additional validation: check if number of questions matches total questions
      if (formData.questions.length !== formData.totalQuestions) {
        toast({
          title: "Validation Error",
          description: `Number of questions (${formData.questions.length}) must match total questions (${formData.totalQuestions})`,
          variant: "destructive",
        });
        return;
      }
      
      setReviewData(formData as QuizFormData);
      setCurrentStep(3);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!reviewData) return;
    
    try {
      const prismaData = formatForPrisma(reviewData);
      console.log('Quiz data formatted for Prisma:', JSON.stringify(prismaData, null, 2));
      
      toast({
        title: "Quiz Saved Successfully!",
        description: "Your quiz has been saved. Check the console for the Prisma-formatted data.",
      });
      
      setReviewData(null);
      setCurrentStep(1);
      methods.reset();
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast({
        title: "Error",
        description: "Failed to save quiz. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (currentStep === 3 && reviewData) {
    return (
      <QuizReview
        quizData={reviewData}
        onBack={() => setCurrentStep(2)}
        onSave={handleSubmitQuiz}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-8 bg-slate-800 text-white border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold mb-2">Quiz Builder</CardTitle>
            <p className="text-slate-300">Create engaging quizzes with ease</p>
          </CardHeader>
        </Card>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-slate-800' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep >= 1 ? 'bg-slate-800 border-slate-800 text-white' : 'border-slate-400'
              }`}>
                1
              </div>
              <span className="ml-2 font-medium">Quiz Information</span>
            </div>
            <div className={`w-16 h-0.5 ${currentStep >= 2 ? 'bg-slate-800' : 'bg-slate-300'}`}></div>
            <div className={`flex items-center ${currentStep >= 2 ? 'text-slate-800' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep >= 2 ? 'bg-slate-800 border-slate-800 text-white' : 'border-slate-400'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium">Questions</span>
            </div>
            <div className={`w-16 h-0.5 ${currentStep >= 3 ? 'bg-slate-800' : 'bg-slate-300'}`}></div>
            <div className={`flex items-center ${currentStep >= 3 ? 'text-slate-800' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep >= 3 ? 'bg-slate-800 border-slate-800 text-white' : 'border-slate-400'
              }`}>
                3
              </div>
              <span className="ml-2 font-medium">Review</span>
            </div>
          </div>
        </div>

        <FormProvider {...methods}>
          <form className="space-y-8">
            {/* Step 1: Basic Quiz Information */}
            {currentStep === 1 && (
              <Card className="bg-white shadow-lg border border-slate-200">
                <CardHeader className="bg-slate-100 border-b border-slate-200">
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <BookOpen className="h-5 w-5" />
                    Quiz Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-slate-700 font-semibold">Quiz Title *</Label>
                      <Input
                        id="title"
                        placeholder="Enter quiz title"
                        {...register('title')}
                        className={`bg-white border ${errors.title ? 'border-red-500' : 'border-slate-300'} focus:border-slate-800`}
                      />
                      {errors.title && (
                        <p className="text-sm text-red-600 font-medium">{errors.title.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-slate-700 font-semibold">Subject *</Label>
                      <Input
                        id="subject"
                        placeholder="Enter subject"
                        {...register('subject')}
                        className={`bg-white border ${errors.subject ? 'border-red-500' : 'border-slate-300'} focus:border-slate-800`}
                      />
                      {errors.subject && (
                        <p className="text-sm text-red-600 font-medium">{errors.subject.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="totalQuestions" className="text-slate-700 font-semibold flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Total Questions *
                      </Label>
                      <Input
                        id="totalQuestions"
                        type="number"
                        min="1"
                        placeholder="Total questions"
                        {...register('totalQuestions', { valueAsNumber: true })}
                        className="bg-white border border-slate-300 focus:border-slate-800"
                      />
                      <p className="text-xs text-slate-600">Set how many questions you want to create</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="totalMarks" className="text-slate-700 font-semibold flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Total Marks *
                      </Label>
                      <Input
                        id="totalMarks"
                        type="number"
                        min="1"
                        placeholder="Total marks"
                        {...register('totalMarks', { valueAsNumber: true })}
                        className="bg-white border border-slate-300 focus:border-slate-800"
                      />
                      <p className="text-xs text-slate-600">Will be divided equally among questions</p>
                    </div>
                  </div>

                  {/* ... keep existing code (date pickers and next button) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-semibold">Start Date & Time *</Label>
                      <DateTimePicker
                        value={watch('startDate')}
                        onChange={(date) => setValue('startDate', date!)}
                        placeholder="Select start date"
                        className="border border-slate-300 focus:border-slate-800"
                      />
                      {errors.startDate && (
                        <p className="text-sm text-red-600 font-medium">{errors.startDate.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-semibold">End Date & Time *</Label>
                      <DateTimePicker
                        value={watch('endDate')}
                        onChange={(date) => setValue('endDate', date!)}
                        placeholder="Select end date"
                        className="border border-slate-300 focus:border-slate-800"
                      />
                      {errors.endDate && (
                        <p className="text-sm text-red-600 font-medium">{errors.endDate.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={handleNextStep}
                      className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3"
                    >
                      Next Step
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Questions */}
            {currentStep === 2 && (
              <>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                      <Hash className="h-6 w-6 text-slate-600" />
                      Questions ({fields.length} of {totalQuestions})
                    </h3>
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      variant="outline"
                      className="border-slate-300 text-slate-700 hover:bg-slate-100"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                  </div>

                  {/* Validation Message */}
                  {fields.length !== totalQuestions && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-amber-800 font-medium">
                        {fields.length < totalQuestions 
                          ? `You need to add ${totalQuestions - fields.length} more question${totalQuestions - fields.length !== 1 ? 's' : ''}`
                          : `You have ${fields.length - totalQuestions} extra question${fields.length - totalQuestions !== 1 ? 's' : ''}. Consider removing some.`
                        }
                      </p>
                    </div>
                  )}

                  {errors.questions && (
                    <p className="text-sm text-red-600 font-medium bg-red-50 p-3 rounded-lg border border-red-200">{errors.questions.message}</p>
                  )}

                  <div className="space-y-6">
                    {fields.map((field, index) => (
                      <QuestionBuilder
                        key={field.id}
                        questionIndex={index}
                        onRemove={() => remove(index)}
                      />
                    ))}
                  </div>

                  <Card className={`border border-dashed ${fields.length >= totalQuestions ? 'border-slate-200 bg-slate-100' : 'border-slate-300 bg-slate-50'}`}>
                    <CardContent className="p-6 text-center">
                      <Button
                        type="button"
                        onClick={addQuestion}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3"
                        disabled={fields.length >= totalQuestions}
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Question
                      </Button>
                      {fields.length >= totalQuestions && (
                        <p className="text-slate-600 mt-2 text-sm">
                          Youve reached the maximum number of questions ({totalQuestions})
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Review Button */}
                <Card className="bg-slate-800 text-white border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <Button
                      type="button"
                      onClick={handleReviewStep}
                      className="bg-white text-slate-800 hover:bg-slate-100 px-12 py-4 text-xl font-bold"
                      disabled={isSubmitting || fields.length !== totalQuestions}
                      size="lg"
                    >
                      {isSubmitting ? 'Processing...' : (
                        <>
                          <Eye className="h-6 w-6 mr-3" />
                          Review Quiz
                        </>
                      )}
                    </Button>
                    {fields.length !== totalQuestions && (
                      <p className="text-slate-300 mt-2 text-sm">
                        Please ensure you have exactly {totalQuestions} question{totalQuestions !== 1 ? 's' : ''} before proceeding
                      </p>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default QuizBuilderForm;
