
"use client"
import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui2/button';
import { Input } from '@/components/ui2/input';
import { Label } from '@/components/ui2/label';
import { Textarea } from '@/components/ui2/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui2/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui2/card';
import { Trash, Plus } from 'lucide-react';
import { QuizFormData } from '@/types/quiz';

interface QuestionBuilderProps {
  questionIndex: number;
  onRemove: () => void;
}

const QuestionBuilder: React.FC<QuestionBuilderProps> = ({ questionIndex, onRemove }) => {
  const { register, watch, setValue, formState: { errors } } = useFormContext<QuizFormData>();
  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
    name: `questions.${questionIndex}.options` as const,
  });

  const questionType = watch(`questions.${questionIndex}.type`);
  const questionError = errors.questions?.[questionIndex];

  const handleTypeChange = (value: string) => {
    setValue(
      `questions.${questionIndex}.type` as const,
      value as 'multiple_choice' | 'short_text' | 'long_text' | 'numerical' | 'true_false'
    );
    if (value === 'multiple_choice') {
      setValue(`questions.${questionIndex}.options` as const, ['', '']);
      setValue(`questions.${questionIndex}.correctAnswer` as const, '');
    } else if (value === 'true_false') {
      setValue(`questions.${questionIndex}.options` as const, undefined);
      setValue(`questions.${questionIndex}.correctAnswer` as const, true);
    } else {
      setValue(`questions.${questionIndex}.options` as const, undefined);
      setValue(`questions.${questionIndex}.correctAnswer` as const, '');
    }
  };

  const addOption = () => {
    appendOption('');
  };

  return (
    <Card className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-l-blue-500 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="text-lg font-bold">Question {questionIndex + 1}</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRemove}
          className="text-red-600 hover:text-red-700 bg-white"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`question-${questionIndex}`} className="text-gray-700 font-semibold">Question Text</Label>
            <Textarea
              id={`question-${questionIndex}`}
              placeholder="Enter your question..."
              {...register(`questions.${questionIndex}.question` as const)}
              className={`bg-white border-2 ${questionError?.question ? 'border-red-500' : 'border-gray-200'} focus:border-blue-500`}
            />
            {questionError?.question && (
              <p className="text-sm text-red-600 font-medium">{questionError.question.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`marks-${questionIndex}`} className="text-gray-700 font-semibold">Marks</Label>
            <Input
              id={`marks-${questionIndex}`}
              type="number"
              min="1"
              placeholder="Enter marks"
              {...register(`questions.${questionIndex}.marks` as const, { valueAsNumber: true })}
              className={`bg-white border-2 ${questionError?.marks ? 'border-red-500' : 'border-gray-200'} focus:border-blue-500`}
            />
            {questionError?.marks && (
              <p className="text-sm text-red-600 font-medium">{questionError.marks.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`type-${questionIndex}`} className="text-gray-700 font-semibold">Answer Type</Label>
          <Select onValueChange={handleTypeChange} value={questionType}>
            <SelectTrigger className="bg-white border-2 border-gray-200 focus:border-blue-500">
              <SelectValue placeholder="Select answer type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
              <SelectItem value="true_false">True/False</SelectItem>
              <SelectItem value="short_text">Short Text</SelectItem>
              <SelectItem value="long_text">Long Text</SelectItem>
              <SelectItem value="numerical">Numerical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {questionType === 'multiple_choice' && (
          <div className="space-y-3">
            <Label className="text-gray-700 font-semibold">Answer Options</Label>
            <div className="space-y-2">
              {optionFields.map((field, optionIndex) => (
                <div key={field.id} className="flex gap-2">
                  <Input
                    placeholder={`Option ${optionIndex + 1}`}
                    {...register(`questions.${questionIndex}.options.${optionIndex}` as const)}
                    className="bg-white border-2 border-gray-200 focus:border-blue-500"
                  />
                  {optionFields.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(optionIndex)}
                      className="text-red-600 hover:text-red-700 border-red-300"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              className="w-full border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor={`correct-answer-${questionIndex}`} className="text-gray-700 font-semibold">Correct Answer</Label>
          {questionType === 'multiple_choice' ? (
            <Select onValueChange={(value) => setValue(`questions.${questionIndex}.correctAnswer` as const, value)}>
              <SelectTrigger className="bg-white border-2 border-gray-200 focus:border-blue-500">
                <SelectValue placeholder="Select correct answer" />
              </SelectTrigger>
              <SelectContent>
                {optionFields.map((_, optionIndex) => {
                  const optionValue = watch(`questions.${questionIndex}.options.${optionIndex}`);
                  return (
                    <SelectItem key={optionIndex} value={optionValue || `Option ${optionIndex + 1}`}>
                      {optionValue || `Option ${optionIndex + 1}`}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          ) : questionType === 'true_false' ? (
            <Select onValueChange={(value) => setValue(`questions.${questionIndex}.correctAnswer` as const, value === 'true')}>
              <SelectTrigger className="bg-white border-2 border-gray-200 focus:border-blue-500">
                <SelectValue placeholder="Select correct answer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
          ) : questionType === 'numerical' ? (
            <Input
              id={`correct-answer-${questionIndex}`}
              type="number"
              placeholder="Enter correct numerical answer"
              {...register(`questions.${questionIndex}.correctAnswer` as const, {
                valueAsNumber: true,
              })}
              className="bg-white border-2 border-gray-200 focus:border-blue-500"
            />
          ) : questionType === 'long_text' ? (
            <Textarea
              id={`correct-answer-${questionIndex}`}
              placeholder="Enter correct answer..."
              {...register(`questions.${questionIndex}.correctAnswer` as const)}
              className="bg-white border-2 border-gray-200 focus:border-blue-500"
            />
          ) : (
            <Input
              id={`correct-answer-${questionIndex}`}
              placeholder="Enter correct answer"
              {...register(`questions.${questionIndex}.correctAnswer` as const)}
              className="bg-white border-2 border-gray-200 focus:border-blue-500"
            />
          )}
          {questionError?.correctAnswer && (
            <p className="text-sm text-red-600 font-medium">{questionError.correctAnswer.message}</p>
          )}
        </div>

        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id={`required-${questionIndex}`}
            {...register(`questions.${questionIndex}.required` as const)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <Label htmlFor={`required-${questionIndex}`} className="text-gray-700 font-medium">Required Question</Label>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionBuilder;
