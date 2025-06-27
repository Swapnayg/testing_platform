"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller  } from "react-hook-form";
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
import { useWatch } from "react-hook-form";
import Select from 'react-select';
import { Grade } from "@prisma/client";

type GradeOption = { value: number; label: string };

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
const { categories, grades, subjects } = relatedData;

const {
  register,
  handleSubmit,
  formState: { errors },
  control,
  setValue, // 👈 Add this
} = useForm<ExamSchema>({
  resolver: zodResolver(examSchema),
  defaultValues: {
    categoryId: data?.categoryId ?? categories[0]?.id ?? 0, // Fallback to 0 if category list is empty
    grades: data?.grades?.map((g: { id: number }) => g.id) ?? [], 
    title: data?.title ?? "",
    totalMCQ: data?.totalMCQ ?? 0,
    totalMarks: data?.totalMarks ?? 0,
    timeLimit: data?.timeLimit ?? 0,
    subjectId: data?.subjectId ?? 0,
    startTime: data?.startTime ?? "",
    endTime: data?.endTime ?? "",
    status: data?.status ?? "DRAFT",
  },
});

// AFTER REACT 19 IT'LL BE USEACTIONSTATE

const [isLoading, setIsLoading] = useState(false);

const [state, formAction] = useActionState(
  type === "create" ? createExam : updateExam,
  {
    success: false,
    error: false,
  }
);

  const startTime = useWatch({ control, name: "startTime" });
  const endTime = useWatch({ control, name: "endTime" });

  const [timeLimit, setTimeLimit] = useState<number | undefined>(data?.timeLimit);


const handleSubmit1 = async (formData: ExamSchema) => {
  setIsLoading(true);
  try {
    const {
      startTime,
      endTime,
      title,
      totalMCQ,
      totalMarks,
      timeLimit,
      categoryId,
      subjectId,
      id,
      grades,
    } = formData;

    if (!startTime || !endTime || !title.trim() || !totalMCQ || !totalMarks) {
      toast.error("All fields are required.");
      return;
    }

    if (new Date(startTime).getTime() <= new Date().getTime()) {
      toast.error("Start Date must be greater than today's date.");
      return;
    }

    if (new Date(endTime).getTime() <= new Date(startTime).getTime()) {
      toast.error("End Date must be after Start Date.");
      return;
    }

    const parsedData = {
      title,
      startTime,
      endTime,
      totalMCQ,
      totalMarks,
      timeLimit,
      categoryId,
      subjectId,
      id,
      grades,
    };

    formAction(parsedData);
  } catch (err) {
    console.error("Error in submission", err);
    toast.error("Something went wrong.");
  } finally {
    setIsLoading(false);
  }
};


const formatDateTimeLocal = (date?: string | Date) => {
  if (!date) return "";
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

  const [selectedCategoryId, setSelectedCategoryId] = useState(
    data?.categoryId ?? categories[0]?.id
  );
  const router = useRouter();

  useEffect(() => {
    if (startTime && endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.max(Math.floor(diffMs / (1000 * 60)), 0); // prevent negatives
    setTimeLimit(diffMins);
    setValue("timeLimit", diffMins); // 👈 this tells RHF
  }
    if (state.success) {
      toast(`Exam has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen,startTime,endTime]);
  const gradesList: Grade[] = relatedData.grades.filter(
  (grade: Grade) => grade.categoryId === selectedCategoryId
);

  const gradeOptions: GradeOption[] = gradesList.map((g) => ({
    value: g.id,
    label: g.level,
  }));

  useEffect(() => {
    if (data?.startTime) {
      setValue("startTime", formatDateTimeLocal(data.startTime) as any, { shouldValidate: true });
    }
    if (data?.endTime) {
      setValue("endTime", formatDateTimeLocal(data.endTime) as any, { shouldValidate: true });
    }
  }, [data, setValue]);

  return (
    <form
      className="space-y-8 p-6 bg-white shadow-xl rounded-2xl border border-gray-100"
      onSubmit={handleSubmit(handleSubmit1, (errors) => { console.warn("❌ Form validation failed:", errors); })}// ✅ this is correct
    >
      <h1 className="text-2xl font-semibold text-gray-700">
        {type === "create" ? "📘 Create a New Exam" : "📝 Update the Exam"}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InputField
          label="Exam Title"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors?.title}
        />

        {/* Category */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600 font-medium">Category</label>
          <select
          className="ring-1 ring-gray-300 px-3 py-2 rounded-md text-sm focus:ring-2 focus:ring-blue-500 transition"
          {...register("categoryId")}
          onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
        >
          {categories.map((category: { id: number; catName: string }) => (
            <option value={category.id} key={category.id}>
              {category.catName}
            </option>
          ))}
        </select>
          {errors.categoryId?.message && (
            <p className="text-xs text-red-500">{errors.categoryId.message.toString()}</p>
          )}
        </div>

        {/* Grades (Multiple Select) */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600 font-medium">Grade(s)</label>
          <Controller
            control={control}
            name="grades"
            rules={{ required: "Please select at least one grade" }}
            render={({ field }) => {
              const selectedOptions = gradeOptions.filter(opt =>
                Array.isArray(field.value) && field.value.includes(opt.value)
              );

              return (
                <Select
                  isMulti
                  options={gradeOptions}
                  value={selectedOptions}
                  onChange={(selectedOptions) => {
                    const selectedValues = selectedOptions
                      ? selectedOptions.map((opt) => opt.value)
                      : [];
                    field.onChange(selectedValues);    
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  className="react-select-container"
                  classNamePrefix="select"
                  placeholder="Select grades..."
                  ref={field.ref}
                />
              );
            }}
          />
          {errors.grades?.message && (
            <p className="text-xs text-red-500">{errors.grades.message.toString()}</p>
          )}
        </div>

        {/* Subject */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600 font-medium">Subject</label>
          <select
            className="ring-1 ring-gray-300 px-3 py-2 rounded-md text-sm focus:ring-2 focus:ring-blue-500 transition"
            {...register("subjectId")}
            defaultValue={data?.subjectId}
          >
            {subjects.map((subject: { id: number; name: string }) => (
              <option value={subject.id} key={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          {errors.subjectId?.message && (
            <p className="text-xs text-red-500">{errors.subjectId.message.toString()}</p>
          )}
        </div>

        {/* Date & Time Inputs */}
        <InputField
          label="Start Date"
          name="startTime"
          type="datetime-local"
          register={register}
          error={errors?.startTime}
        />
        <InputField
          label="End Date"
          name="endTime"
          type="datetime-local"
          register={register}
          error={errors?.endTime}
        />

        {/* Numeric Inputs */}
        <InputField
          label="Total MCQs"
          name="totalMCQ"
          type="number"
          defaultValue={data?.totalMCQ}
          register={register}
          error={errors?.totalMCQ}
        />
        <InputField
          label="Total Marks"
          name="totalMarks"
          type="number"
          defaultValue={data?.totalMarks}
          register={register}
          error={errors?.totalMarks}
        />
        <InputField
          label="Time Limit (minutes)"
          name="timeLimit"
          type="number"
          readOnly
          defaultValue={timeLimit !== undefined ? String(timeLimit) : undefined}
          register={register}
          error={errors?.timeLimit}
        />

        {/* Hidden Fields */}
        <InputField type="hidden" label="" name="dummy" register={register} />
        {data && (
          <InputField
            hidden
            label="Id"
            name="id"
            defaultValue={data.id}
            register={register}
            error={errors?.id}
          />
        )}
      </div>

      {/* Error Message */}
      {state.error && (
        <span className="text-red-600 text-sm font-medium">❌ Something went wrong!</span>
      )}

      {/* Submit Button */}
      <div className="flex justify-end z-50 relative">
        <button
          type="submit"
          disabled={isLoading}
          className={`${
            isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          } text-white font-semibold px-6 py-2 rounded-md transition shadow flex items-center justify-center gap-2`}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Processing...
            </>
          ) : (
            <>
              {type === "create" ? "Create Exam" : "Update Exam"}
            </>
          )}
        </button>
      </div>
    </form>

  );
};

export default ExamForm;
