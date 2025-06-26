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
  gradeId: z.coerce.number({ message: "Grade is required!" }),
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
  timeLimit: z.coerce.number().min(1, { message: "Time Limit is required!" }),
  categoryId: z.coerce.number({ message: "Category is required!" }),
  subjectId: z.coerce.number({ message: "Subject is required!" }),
  grades: z.array(z.coerce.number()).min(1, { message: "At least one grade must be selected!" }),
  status: z.string().optional(),
});

export type ExamSchema = z.infer<typeof examSchema>;

