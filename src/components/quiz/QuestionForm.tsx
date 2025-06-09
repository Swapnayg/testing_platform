
import React, { useState } from 'react';
import { Button } from '@/components/ui2/button';
import { Input } from '@/components/ui2/input';
import { Label } from '@/components/ui2/label';
import { Textarea } from '@/components/ui2/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui2/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui2/select';
import { Checkbox } from '@/components/ui2/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui2/radio-group';
import { Plus, X, AlertCircle } from 'lucide-react';
import { Question, MultipleChoiceOption } from './types';

interface QuestionFormProps {
  onSubmit: (question: Question) => void;
  marksPerQuestion: number;
}

interface ValidationErrors {
  questionText?: string;
  correctAnswer?: string;
  options?: string;
  noCorrectOption?: string;
}

const QuestionForm = ({ onSubmit, marksPerQuestion }: QuestionFormProps) => {
  const [questionType, setQuestionType] = useState<Question['type']>('MULTIPLE_CHOICE');
  const [questionText, setQuestionText] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<'true' | 'false'>('true');
  const [options, setOptions] = useState<MultipleChoiceOption[]>([
    { id: '1', text: '', isCorrect: false },
    { id: '2', text: '', isCorrect: false },
  ]);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const addOption = () => {
    if (options.length < 6) {
      setOptions([
        ...options,
        { id: (options.length + 1).toString(), text: '', isCorrect: false },
      ]);
    }
  };

  const removeOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter(option => option.id !== id));
    }
  };

  const updateOption = (id: string, text: string) => {
    setOptions(options.map(option =>
      option.id === id ? { ...option, text } : option
    ));
    // Clear options error when user starts typing
    if (text.trim() && errors.options) {
      setErrors(prev => ({ ...prev, options: undefined }));
    }
  };

  const toggleCorrectOption = (id: string) => {
    setOptions(options.map(option => ({
      ...option,
      isCorrect: option.id === id,
    })));
    // Clear no correct option error when user selects one
    if (errors.noCorrectOption) {
      setErrors(prev => ({ ...prev, noCorrectOption: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validate question text
    if (!questionText.trim()) {
      newErrors.questionText = 'Question text is required';
    }

    // Validate based on question type
    if (questionType === 'MULTIPLE_CHOICE') {
      const hasCorrectOption = options.some(option => option.isCorrect);
      const allOptionsFilled = options.every(option => option.text.trim());
      
      if (!allOptionsFilled) {
        newErrors.options = 'All options must be filled';
      }
      
      if (!hasCorrectOption) {
        newErrors.noCorrectOption = 'Please mark one option as correct';
      }
    } else if (questionType !== 'TRUE_FALSE') {
      if (!correctAnswer.trim()) {
        newErrors.correctAnswer = 'Correct answer is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setQuestionText('');
    setCorrectAnswer('');
    setTrueFalseAnswer('true');
    setOptions([
      { id: '1', text: '', isCorrect: false },
      { id: '2', text: '', isCorrect: false },
    ]);
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const question: Question = {
      id: Date.now().toString(),
      type: questionType,
      text: questionText,
      marks: marksPerQuestion,
      correctAnswer: questionType === 'MULTIPLE_CHOICE' ? undefined : 
                    questionType === 'TRUE_FALSE' ? trueFalseAnswer : correctAnswer,
      options: questionType === 'MULTIPLE_CHOICE' ? options : undefined,
    };

    onSubmit(question);
    resetForm();
  };

  // Clear question text error when user starts typing
  const handleQuestionTextChange = (value: string) => {
    setQuestionText(value);
    if (value.trim() && errors.questionText) {
      setErrors(prev => ({ ...prev, questionText: undefined }));
    }
  };

  // Clear correct answer error when user starts typing
  const handleCorrectAnswerChange = (value: string) => {
    setCorrectAnswer(value);
    if (value.trim() && errors.correctAnswer) {
      setErrors(prev => ({ ...prev, correctAnswer: undefined }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-slate-800">Add New Question</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-slate-700">Question Type</Label>
            <Select value={questionType} onValueChange={(value: Question['type']) => setQuestionType(value)}>
              <SelectTrigger className="border-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-300">
                <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                <SelectItem value="SHORT_TEXT">Short Text</SelectItem>
                <SelectItem value="LONG_TEXT">Long Text</SelectItem>
                <SelectItem value="NUMERICAL">Numerical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="questionText" className="text-slate-700">Question Text *</Label>
            <Textarea
              id="questionText"
              value={questionText}
              onChange={(e) => handleQuestionTextChange(e.target.value)}
              placeholder="Enter your question here..."
              className={`border-slate-300 focus:border-slate-500 ${
                errors.questionText ? 'border-red-500 focus:border-red-500' : ''
              }`}
              rows={3}
            />
            {errors.questionText && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle size={14} />
                {errors.questionText}
              </div>
            )}
          </div>

          {questionType === 'MULTIPLE_CHOICE' ? (
            <div>
              <Label className="text-slate-700">Options (Select the correct answer)</Label>
              <div className="space-y-3 mt-2">
                {options.map((option, index) => (
                  <div key={option.id} className="flex items-center gap-3">
                    <Checkbox
                      checked={option.isCorrect}
                      onCheckedChange={() => toggleCorrectOption(option.id)}
                      className="border-slate-300"
                    />
                    <Input
                      value={option.text}
                      onChange={(e) => updateOption(option.id, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      className={`flex-1 border-slate-300 focus:border-slate-500 ${
                        errors.options ? 'border-red-500 focus:border-red-500' : ''
                      }`}
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        onClick={() => removeOption(option.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <X size={16} />
                      </Button>
                    )}
                  </div>
                ))}
                
                {(errors.options || errors.noCorrectOption) && (
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle size={14} />
                    {errors.options || errors.noCorrectOption}
                  </div>
                )}
                
                {options.length < 6 && (
                  <Button
                    type="button"
                    onClick={addOption}
                    variant="outline"
                    size="sm"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Option
                  </Button>
                )}
              </div>
            </div>
          ) : questionType === 'TRUE_FALSE' ? (
            <div>
              <Label className="text-slate-700">Correct Answer</Label>
              <RadioGroup
                value={trueFalseAnswer}
                onValueChange={(value: 'true' | 'false') => setTrueFalseAnswer(value)}
                className="flex gap-6 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="true" className="border-slate-300" />
                  <Label htmlFor="true" className="text-slate-700">True</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="false" className="border-slate-300" />
                  <Label htmlFor="false" className="text-slate-700">False</Label>
                </div>
              </RadioGroup>
            </div>
          ) : (
            <div>
              <Label htmlFor="correctAnswer" className="text-slate-700">Correct Answer *</Label>
              {questionType === 'LONG_TEXT' ? (
                <Textarea
                  id="correctAnswer"
                  value={correctAnswer}
                  onChange={(e) => handleCorrectAnswerChange(e.target.value)}
                  placeholder="Enter the correct answer..."
                  className={`border-slate-300 focus:border-slate-500 ${
                    errors.correctAnswer ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                  rows={3}
                />
              ) : (
                <Input
                  id="correctAnswer"
                  type={questionType === 'NUMERICAL' ? 'number' : 'text'}
                  value={correctAnswer}
                  onChange={(e) => handleCorrectAnswerChange(e.target.value)}
                  placeholder={
                    questionType === 'NUMERICAL'
                      ? 'Enter the correct number'
                      : 'Enter the correct answer'
                  }
                  className={`border-slate-300 focus:border-slate-500 ${
                    errors.correctAnswer ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                />
              )}
              {errors.correctAnswer && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <AlertCircle size={14} />
                  {errors.correctAnswer}
                </div>
              )}
            </div>
          )}

          <div className="bg-slate-100 p-3 rounded">
            <p className="text-sm text-slate-600">
              This question will be worth <strong>{marksPerQuestion.toFixed(1)} marks</strong>
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-slate-600 hover:bg-slate-700 text-white"
          >
            Add Question
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default QuestionForm;
