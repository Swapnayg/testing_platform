
export interface QuizData {
  title: string;
  category: string;
  grade: string;
  subject: string;
  totalQuestions: number;
  totalMarks: number;
  startDateTime: string;
  endDateTime: string;
  examId: string;
}

export interface MultipleChoiceOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'short-text' | 'long-text' | 'numerical' | 'true-false';
  text: string;
  marks: number;
  correctAnswer?: string;
  options?: MultipleChoiceOption[];
}
