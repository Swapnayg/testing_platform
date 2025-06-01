"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  examSchema,
  ExamSchema,
  subjectSchema,
  SubjectSchema,
} from "@/lib/formValidationSchemas";
import {
  createExam,
  createSubject,
  updateExam,
  updateSubject,
} from "@/lib/actions";
import { useActionState,useState  } from 'react';
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const ExamForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExamSchema>({
    resolver: zodResolver(examSchema),
  });

  // AFTER REACT 19 IT'LL BE USEACTIONSTATE

  const [state, formAction] = useActionState(
    type === "create" ? createExam : updateExam,
    {
      success: false,
      error: false,
    }
  );

const handleSubmit1 = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  const data = Object.fromEntries(formData.entries());

  // Convert FormDataEntryValue to correct types
  if (!data.startTime || !data.endTime || !data.title.toString().trim() || !data.totalMCQ.toString().trim() || !data.totalMarks.toString().trim()) {
    toast.error("All Fields are required.");
    return;
  }
  console.log(new Date(data.endTime as string).getTime());
  console.log(new Date(data.startTime as string).getTime());
  if (new Date(data.endTime as string).getTime() <= new Date(data.startTime as string).getTime()) {
    toast.error("End Date must be greater than Start Date.");
    return;
  }
  const parsedData = {
    title: data.title as string,
    startTime: new Date(data.startTime as string),
    endTime: new Date(data.endTime as string),
    totalMCQ: data.totalMCQ ? Number(data.totalMCQ) : 0,
    totalMarks: data.totalMarks ? Number(data.totalMarks) : 0,
    categoryId: data.categoryId ? Number(data.categoryId) : 0,
    gradeId: data.gradeId ? Number(data.gradeId) : 0,
    subjectId: data.subjectId ? Number(data.subjectId) : 0,
    lessonId: data.lessonId ? Number(data.lessonId) : 0,
    id: data.id ? Number(data.id) : undefined,
  };

  formAction(parsedData);

};

  const [selectedCategoryId, setSelectedCategoryId] = useState(1);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Exam has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { lessons, categories, grades, subjects } = relatedData;
  const gradesList = grades.filter((grade: { categoryId: number; }) => grade.categoryId === selectedCategoryId);
  console.log(data)
  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit1}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new exam" : "Update the exam"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Exam title"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors?.title}
        />
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Category</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("categoryId")}
            onChange={e => setSelectedCategoryId(Number(e.target.value))}
          >
            {categories.map((category: { id: number; catName: string }) => (
              <option
                value={category.id}
                key={category.id}
              >
                {category.catName}
              </option>
            ))}
          </select>
          {errors.categoryId?.message && (
            <p className="text-xs text-red-400">
              {errors.categoryId.message.toString()}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Grade</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("gradeId")}
          >
            {gradesList.map((grade: { id: number; level: string }) => (
              <option
                value={grade.id}
                key={grade.id}
              >
                {grade.level}
              </option>
            ))}
          </select>
          {errors.gradeId?.message && (
            <p className="text-xs text-red-400">
              {errors.gradeId.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Subject</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("subjectId")}
            defaultValue={data?.subjectId}
          >
            {subjects.map((subject: { id: number; name: string }) => (
              <option
                value={subject.id}
                key={subject.id}
                selected={data && subject.id === data.subjectId}
              >
                {subject.name}
              </option>
            ))}
          </select>
          {errors.subjectId?.message && (
            <p className="text-xs text-red-400">
              {errors.subjectId.message.toString()}
            </p>
          )}
        </div>
        
        <InputField
          label="Start Date"
          name="startTime"
          defaultValue={data?.startTime}
          register={register}
          error={errors?.startTime}
          type="datetime-local"
        />
        <InputField
          label="End Date"
          name="endTime"
          defaultValue={data?.endTime}
          register={register}
          error={errors?.endTime}
          type="datetime-local"
        />
        <InputField
          type="number"
          label="Total Mcq's"
          name="totalMCQ"
          defaultValue={data?.totalMCQ}
          register={register}
          error={errors?.totalMCQ}
        />
        <InputField
          type="number"
          label="Total Marks"
          name="totalMarks"
          defaultValue={data?.totalMarks}
          register={register}
          error={errors?.totalMarks}
        />
      <InputField
          type="hidden"
          label=""
          name="dummy"
          register={register}
        />
        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}
      </div>
      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}
      <button type="submit" className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default ExamForm;
