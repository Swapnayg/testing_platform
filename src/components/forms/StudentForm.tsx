"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import TextareaField from "../TextareaField";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  studentSchema,
  StudentSchema,
  teacherSchema,
  TeacherSchema,
} from "@/lib/formValidationSchemas";
import { useActionState } from 'react';
import {
  createStudent,
  updateStudent,
} from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";
import { Textarea } from "../ui/textarea";

const StudentForm = ({
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
  } = useForm<StudentSchema>({
    resolver: zodResolver(studentSchema),
  });

  const [img, setImg] = useState<any>();

  const [state, formAction] = useActionState(
    type === "create" ? createStudent : updateStudent,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    console.log("hello");
    console.log(data);
    formAction({ ...data, profilePicture: img?.secure_url });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Student has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);


  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new student" : "Update the student"}
      </h1>
      <span className="text-xs text-gray-400 font-medium">
        Authentication Information
      </span>
      {data && (
       <div className="flex justify-between flex-wrap gap-4">
        
      <InputField
          label="CNIC Number"
          name="cnicNumber"
          readOnly={true}
          defaultValue={data?.cnicNumber}
          register={register}
          error={errors.cnicNumber} 
        />
      <InputField
          label="Roll Number"
          name="rollNo"
          readOnly={true}
          defaultValue={data?.rollNo}
          register={register}
          error={errors.rollNo} 
        />
        <InputField
          label="Gender"
          name="gender"
          readOnly={true}
          defaultValue={ data?.gender.charAt(0).toLocaleUpperCase() + data?.gender.slice(1) }
          register={register}
          error={errors.gender} 
        />
        
      </div>
       )} : (
        <InputField
          label="CNIC Number"
          name="cnicNumber"
          defaultValue={data?.cnicNumber}
          register={register}
          error={errors.cnicNumber} 
        />

        <InputField
          label="Roll Number"
          name="rollNo"
          defaultValue={data?.rollNo}
          register={register}
          error={errors.rollNo} 
        />
        <InputField
          label="Gender"
          name="gender"
          defaultValue={ data?.gender.charAt(0).toLocaleUpperCase() + data?.gender.slice(1) }
          register={register}
          error={errors.gender} 
        />
        )

      <span className="text-xs text-gray-400 font-medium">
        Personal Information
      </span>
      <CldUploadWidget
        uploadPreset="school"
        onSuccess={(result, { widget }) => {
          setImg(result.info);
          widget.close();
        }}
      >
        {({ open }) => {
          return (
            <div
              className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer"
              onClick={() => open()}
            >
              <Image src="/upload.png" alt="" width={28} height={28} />
              <span>Upload a photo</span>
            </div>
          );
        }}
      </CldUploadWidget>
      <div className="flex justify-between flex-wrap gap-3">
        <InputField
          label="First Name"
          name="name"
          defaultValue={data?.name.charAt(0).toLocaleUpperCase() + data?.name.slice(1)}
          register={register}
          error={errors.name}
        />
        <InputField
          label="Father Name"
          name="fatherName"
          defaultValue={data?.fatherName.charAt(0).toLocaleUpperCase() + data?.fatherName.slice(1)}
          register={register}
          error={errors.fatherName}
        />
         <InputField
          label="Email"
          name="email"
          defaultValue={data?.email.charAt(0).toLocaleUpperCase() + data?.email.slice(1)}
          register={register}
          error={errors?.email}
        />
        <InputField
          label="Phone"
          name="mobileNumber"
          defaultValue={data?.mobileNumber.charAt(0).toLocaleUpperCase() + data?.mobileNumber.slice(1)}
          register={register}
          error={errors.mobileNumber}
        />
        <InputField
          label="Date of Birth"
          name="dateOfBirth"
          defaultValue={data?.dateOfBirth.toISOString().split("T")[0]}
          register={register}
          error={errors.dateOfBirth}
          type="date"
        />
        <InputField
          label="Institute Name"
          name="instituteName"
          defaultValue={data?.instituteName.charAt(0).toLocaleUpperCase() + data?.instituteName.slice(1)}
          register={register}
          error={errors.instituteName}
        />
      <TextareaField
          label="Address Line"
          name="addressLine1"
          defaultValue={ data?.addressLine1.charAt(0).toLocaleUpperCase() + data?.addressLine1.slice(1)}
          register={register}
          error={errors.addressLine1}
        /> 
        <InputField
          label="City"
          name="city"
          defaultValue={data?.city.charAt(0).toLocaleUpperCase() + data?.city.slice(1)}
          register={register}
          error={errors.city}
        />
        <InputField
          label="State / Province / Region "
          name="stateProvince"
          defaultValue={data?.stateProvince.charAt(0).toLocaleUpperCase() + data?.stateProvince.slice(1)}
          register={register}
          error={errors.stateProvince}
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
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Religion</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("religion")}
            defaultValue={data?.religion}
          >
            <option value="islam">Islam</option>
            <option value="christianity">Christianity</option>
            <option value="hinduism">Hinduism</option>
            <option value="sikhism">Sikhism</option>
            <option value="buddhism">Buddhism</option>
            <option value="other">Other</option>
          </select>
          {errors.religion?.message && (
            <p className="text-xs text-red-400">
              {errors.religion.message.toString()}
            </p>
          )}
        </div>
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

export default StudentForm;
