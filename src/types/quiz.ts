
export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'short_text' | 'long_text' | 'numerical' | 'true_false';
  question: string;
  required: boolean;
  options?: string[];
  correctAnswer: string | number | boolean;
  marks: number;
}

export interface QuizFormData {
  title: string;
  subject: string;
  totalMarks: number;
  totalQuestions: number;
  startDate: Date;
  endDate: Date;
  questions: QuizQuestion[];
}

export interface PrismaQuizData {
  title: string;
  subject: string;
  totalMarks: number;
  totalQuestions: number;
  startDate: string;
  endDate: string;
  questions: {
    create: {
      type: string;
      question: string;
      required: boolean;
      options: string[] | null;
      correctAnswer: string;
      marks: number;
      order: number;
    }[];
  };
}
