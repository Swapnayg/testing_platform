
export interface QuizData {
  title: string;
  category: string;
  grades: string;
  subject: string;
  totalQuestions: number;
  totalMarks: number;
  timeLimit: number;
  startDateTime: Date;
  endDateTime: Date;
  examId: string;
}

export interface MultipleChoiceOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  type: 'MULTIPLE_CHOICE' | 'SHORT_TEXT' | 'LONG_TEXT' | 'NUMERICAL' | 'TRUE_FALSE';
  text: string;
  marks: number;
  correctAnswer?: string;
  options?: MultipleChoiceOption[];
}
