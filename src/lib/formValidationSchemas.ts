import { z } from "zod";
import {formSchema} from "@/components/MultiStepForm";

export const subjectSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  teachers: z.array(z.string()), //teacher ids
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

export const classSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  capacity: z.coerce.number().min(1, { message: "Capacity name is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade name is required!" }),
  supervisorId: z.coerce.string().optional(),
});

export type ClassSchema = z.infer<typeof classSchema>;

export const teacherSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  subjects: z.array(z.string()).optional(), // subject ids
});

export type TeacherSchema = z.infer<typeof teacherSchema>;

export const studentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "First name is required!" }),
  fatherName: z.string().min(1, { message: "Father name is required!" }),
  dateOfBirth:z.coerce.date({ message: "Birthday is required!" }),
  religion: z.string().min(1, { message: "Religion is required!" }),
  cnicNumber: z.string().min(1, { message: "CNIC Number is required!" }),
  gender: z.string().min(1, { message: "Gender is required!" }),
  profilePicture: z.string().min(1, { message: "Profile Picture is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  mobileNumber: z.string().optional(),
  city: z.string().min(1, { message: "City is required!" }),
  stateProvince: z.string().min(1, { message: "State is required!" }),
  addressLine1: z.string().min(1, { message: "Address is required!" }),
  instituteName: z.string().min(1, { message: "Institute Name is required!" }),
  others: z.string(),
  rollNo: z.string(),
});

export type StudentSchema = z.infer<typeof studentSchema>;
export type FormSchema = z.infer<typeof formSchema>;

export const examSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, { message: "Title name is required!" }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  totalMCQ: z.coerce.number().min(1, { message: "Total MCQ is required!" }),
  totalMarks: z.coerce.number().min(1, { message: "Total Marks is required!" }),
  categoryId: z.coerce.number({ message: "Category is required!" }),
  gradeId: z.coerce.number({ message: "Grade is required!" }),
  subjectId: z.coerce.number({ message: "Subject is required!" }),
  lessonId: z.coerce.number({ message: "Lesson is required!" }),
  status: z.string(),
});

export type ExamSchema = z.infer<typeof examSchema>;


export const questionSchema = z.object({
  id: z.string(),
  type: z.enum(['multiple_choice', 'short_text', 'long_text', 'numerical', 'true_false']),
  question: z.string().min(1, 'Question is required'),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.number(), z.boolean()]).refine((val) => {
    if (typeof val === 'string') return val.trim().length > 0;
    if (typeof val === 'number') return !isNaN(val);
    return typeof val === 'boolean';
  }, 'Correct answer is required'),
  marks: z.number().min(1, 'Marks must be at least 1'),
});

export const quizSchema = z.object({
  title: z.string().min(1, 'Quiz title is required').max(100, 'Title too long'),
  subject: z.string().min(1, 'Subject is required').max(50, 'Subject too long'),
  totalMarks: z.number().min(1, 'Total marks must be at least 1'),
  totalQuestions: z.number().min(1, 'Total questions must be at least 1'),
  startDate: z.date({
    required_error: 'Start date is required',
  }),
  endDate: z.date({
    required_error: 'End date is required',
  }),
  questions: z.array(questionSchema).min(1, 'At least one question is required'),
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
}).refine((data) => data.questions.length === data.totalQuestions, {
  message: 'Number of questions must match total questions',
  path: ['totalQuestions'],
}).refine((data) => {
  const totalMarks = data.questions.reduce((sum, q) => sum + q.marks, 0);
  return totalMarks === data.totalMarks;
}, {
  message: 'Sum of question marks must equal total marks',
  path: ['totalMarks'],
});

export type QuizFormData = z.infer<typeof quizSchema>;
