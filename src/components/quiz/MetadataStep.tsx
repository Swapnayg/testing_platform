
import React, { useEffect } from 'react';
import { Input } from '@/components/ui2/input';
import { Label } from '@/components/ui2/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui2/card';
import { QuizData } from './types';

interface MetadataStepProps {
  quizData: QuizData;
  setQuizData: (data: QuizData) => void;
}

const MetadataStep = ({ quizData, setQuizData }: MetadataStepProps) => {
  const handleInputChange = (field: keyof QuizData, value: string | number) => {
    setQuizData({ ...quizData, [field]: value });
  };

  // Auto-populate dates on component mount
  useEffect(() => {
    if (!quizData.startDateTime || !quizData.endDateTime) {
      const now = new Date();
      const endDate = new Date();
      endDate.setDate(now.getDate() + 5);
      
      // Format for datetime-local input (YYYY-MM-DDTHH:MM)
      const formatDateTime = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      setQuizData({
        ...quizData,
        startDateTime: formatDateTime(now),
        endDateTime: formatDateTime(endDate)
      });
    }
  }, [quizData, setQuizData]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-800">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-slate-700">Quiz Title *</Label>
            <Input
              id="title"
              value={quizData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter quiz title"
              className="border-slate-300 focus:border-slate-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="category" className="text-slate-700">Category</Label>
              <Input
                id="category"
                value={quizData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="e.g., Science"
                className="border-slate-300 focus:border-slate-500"
              />
            </div>

            <div>
              <Label htmlFor="grade" className="text-slate-700">Grade</Label>
              <Input
                id="grade"
                value={quizData.grade}
                onChange={(e) => handleInputChange('grade', e.target.value)}
                placeholder="e.g., 10th Grade"
                className="border-slate-300 focus:border-slate-500"
              />
            </div>

            <div>
              <Label htmlFor="subject" className="text-slate-700">Subject</Label>
              <Input
                id="subject"
                value={quizData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="e.g., Physics"
                className="border-slate-300 focus:border-slate-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-slate-800">Quiz Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="totalQuestions" className="text-slate-700">Total Questions *</Label>
              <Input
                id="totalQuestions"
                type="number"
                min="1"
                value={quizData.totalQuestions}
                onChange={(e) => handleInputChange('totalQuestions', parseInt(e.target.value) || 0)}
                className="border-slate-300 focus:border-slate-500"
              />
            </div>

            <div>
              <Label htmlFor="totalMarks" className="text-slate-700">Total Marks *</Label>
              <Input
                id="totalMarks"
                type="number"
                min="1"
                value={quizData.totalMarks}
                onChange={(e) => handleInputChange('totalMarks', parseInt(e.target.value) || 0)}
                className="border-slate-300 focus:border-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDateTime" className="text-slate-700">Start Date/Time</Label>
              <Input
                id="startDateTime"
                type="datetime-local"
                value={quizData.startDateTime}
                readOnly
                className="border-slate-300 bg-slate-50 text-slate-600"
              />
              <p className="text-xs text-slate-500 mt-1">Auto-set to today</p>
            </div>

            <div>
              <Label htmlFor="endDateTime" className="text-slate-700">End Date/Time</Label>
              <Input
                id="endDateTime"
                type="datetime-local"
                value={quizData.endDateTime}
                readOnly
                className="border-slate-300 bg-slate-50 text-slate-600"
              />
              <p className="text-xs text-slate-500 mt-1">Auto-set to 5 days from today</p>
            </div>
          </div>

          {quizData.totalQuestions > 0 && quizData.totalMarks > 0 && (
            <div className="bg-slate-100 p-4 rounded-lg">
              <p className="text-slate-700">
                <strong>Marks per question:</strong> {(quizData.totalMarks / quizData.totalQuestions).toFixed(1)} marks
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MetadataStep;
