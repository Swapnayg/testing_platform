/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users  } from "lucide-react";


interface Student {
  id: string;
  name: string;
  fatherName: string;
  dateOfBirth: string;
  religion: string;
  gender: string;
  cnicNumber: string;
  email: string;
  mobileNumber: string;
  city: string;
  stateProvince: string;
  addressLine1: string;
  instituteName: string;
  others: string;
  rollNo: string;
  profilePicture?: string;
}

const genderOptions = [
  { key: "male", label: "Male" },
  { key: "female", label: "Female" },
  { key: "other", label: "Other" },
];
const religionOptions = [
  { value: "islam", label: "Islam" },
  { value: "christianity", label: "Christianity" },
  { value: "hinduism", label: "Hinduism" },
  { value: "sikhism", label: "Sikhism" },
  { value: "buddhism", label: "Buddhism" },
  { value: "other", label: "Other" },
];


export default function StudentEditForm({ studentId }: { studentId: string }) {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/studentData/${studentId}`)
      .then((res) => res.json())
      .then(setStudent);
  }, [studentId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!student) return;
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    const requiredFields = [
      "name", "fatherName", "dateOfBirth", "religion", "gender", "cnicNumber",
      "email", "mobileNumber", "city", "stateProvince", "addressLine1", "instituteName", "rollNo"
    ];

    const missingFields = requiredFields.filter((field) => !(student as any)[field]?.trim());

    if (missingFields.length > 0) {
      setErrors(missingFields.map((f) => `${f} is required.`));
      return;
    }

    setErrors([]);
    setIsSubmitting(true);

    const formData = new FormData();
    for (const key in student) {
      formData.append(key, (student as any)[key]);
    }
    if (profileFile) formData.append("profilePicture", profileFile);

    await fetch(`/api/studentData/${studentId}`, {
        method: 'POST', // ✅
        body: formData,
    });

    router.refresh();
    setIsSubmitting(false);
  };

  if (!student) return <div>Loading...</div>;

//   return (
//     <div className="m-4">
//         <form onSubmit={handleSubmit} className="bg-white shadow rounded-md p-6 space-y-6">
//             <h2 className="text-xl font-semibold mb-4">Edit Student</h2>

//             {errors.length > 0 && (
//             <div className="bg-red-100 text-red-700 border border-red-300 p-3 rounded">
//                 <ul className="list-disc ml-5">
//                 {errors.map((err, i) => <li key={i}>{err}</li>)}
//                 </ul>
//             </div>
//             )}

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {/* Left Column */}

//             <div className="space-y-1">
//                 <Label htmlFor="rollNo">Roll Number</Label>
//                 <Input id="rollNo" name="rollNo" readOnly value={student.rollNo} onChange={handleChange} required />
//             </div>
//             <div className="space-y-1">
//                 <Label htmlFor="cnicNumber">CNIC Number</Label>
//                 <Input id="cnicNumber" name="cnicNumber" readOnly value={student.cnicNumber} onChange={handleChange} required />
//             </div>

//              <div className="space-y-1">
//                 <Label htmlFor="name">Name</Label>
//                 <Input id="name" name="name" value={student.name} onChange={handleChange} required />
//             </div>

//             <div className="space-y-1">
//                 <Label htmlFor="fatherName">Father Name</Label>
//                 <Input id="fatherName" name="fatherName" value={student.fatherName} onChange={handleChange} required />
//             </div>

//             <div className="space-y-1">
//                 <Label htmlFor="email">Email</Label>
//                 <Input type="email" id="email" name="email" value={student.email} onChange={handleChange} required />
//             </div>

//             <div className="space-y-1">
//                 <Label htmlFor="mobileNumber">Mobile Number</Label>
//                 <Input id="mobileNumber" name="mobileNumber" value={student.mobileNumber} onChange={handleChange} required />
//             </div>

//             <div className="space-y-1">
//                 <Label htmlFor="dateOfBirth">Date of Birth</Label>
//                 <Input
//                 type="date"
//                 id="dateOfBirth"
//                 name="dateOfBirth"
//                 value={student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split("T")[0] : ""}
//                 onChange={handleChange}
//                 required
//                 />
//             </div>

//             <div className="space-y-1">
//                 <Label htmlFor="gender">Gender</Label>
//                 <select
//                 name="gender"
//                 value={student.gender}
//                 onChange={handleChange}
//                 required
//                 className="w-full border border-slate-300 rounded-md p-2 bg-white"
//                 >
//                 <option value="">Select Gender</option>
//                 {genderOptions.map((g) => (
//                     <option key={g.key} value={g.key}>{g.label}</option>
//                 ))}
//                 </select>
//             </div>

//             <div className="space-y-1">
//                 <Label htmlFor="religion">Religion</Label>
//                 <select
//                 name="religion"
//                 value={student.religion}
//                 onChange={handleChange}
//                 required
//                 className="w-full border border-slate-300 rounded-md p-2 bg-white"
//                 >
//                 <option value="">Select Religion</option>
//                 {religionOptions.map((r) => (
//                     <option key={r.value} value={r.value}>{r.label}</option>
//                 ))}
//                 </select>
//             </div>

//             <div className="space-y-1">
//                 <Label htmlFor="instituteName">Institute Name</Label>
//                 <Input id="instituteName" name="instituteName" value={student.instituteName} onChange={handleChange} required />
//             </div>

//             <div className="space-y-1">
//                 <Label htmlFor="city">City</Label>
//                 <Input id="city" name="city" value={student.city} onChange={handleChange} required />
//             </div>

//             <div className="space-y-1">
//                 <Label htmlFor="stateProvince">State/Province</Label>
//                 <Input id="stateProvince" name="stateProvince" value={student.stateProvince} onChange={handleChange} required />
//             </div>

//             <div className="space-y-1 md:col-span-2 lg:col-span-3">
//                 <Label htmlFor="addressLine1">Address</Label>
//                 <Textarea
//                 id="addressLine1"
//                 name="addressLine1"
//                 value={student.addressLine1}
//                 onChange={handleChange}
//                 required
//                 rows={3}
//                 className="w-full border-slate-300"
//                 />
//             </div>

//             <div className="space-y-1 md:col-span-2 lg:col-span-3">
//             <Label htmlFor="profilePicture">Profile Picture</Label>
//             <Input
//                 type="file"
//                 accept="image/*"
//                 onChange={async (e) => {
//                 const file = e.target.files?.[0];
//                 if (!file) return;

//                 const formData = new FormData();
//                 formData.append("file", file);
//                 formData.append("upload_preset", "school"); // 🔁 your preset

//                 try {
//                     const res = await fetch("https://api.cloudinary.com/v1_1/ds50k7ryy/image/upload", {
//                     method: "POST",
//                     body: formData,
//                     });

//                     const data = await res.json();
//                     if (data.secure_url) {
//                     setStudent((prev) => prev ? { ...prev, profilePicture: data.secure_url } : prev);
//                     }
//                 } catch (err) {
//                     console.error("Cloudinary upload error:", err);
//                 }
//                 }}
//             />
//             {student.profilePicture && (
//                 <img
//                 src={student.profilePicture}
//                 alt="Profile"
//                 className="mt-2 w-24 h-24 object-cover rounded-full border"
//                 />
//             )}
//             </div>

//             </div>

//             <div className="flex justify-end">
//             <Button
//                 type="submit"
//                 className="bg-blue-600 text-white hover:bg-blue-700"
//                 disabled={isSubmitting}
//                 >
//                 {isSubmitting ? "Updating..." : "Update Student"}
//             </Button>

//             </div>
//         </form>
//         </div>

//   );
return (
  <div className="m-4">
    {/* 🟢 Header */}
     <div className="rounded-t-lg bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-600 px-4 sm:px-6 py-5 shadow-md text-white">
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="bg-white/20 p-2 rounded-full">
        <Users className="w-6 h-6" />
      </div>
      <div>
        <h2 className="text-2xl font-bold">Edit Student</h2>
        <p className="text-sm text-emerald-100">Update the student profile and academic details</p>
      </div>
    </div>
  </div>


    {/* Form */}
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-lg border-t-0 rounded-b-lg p-6 mt-0"
    >
      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-100 text-red-700 border border-red-300 p-3 rounded">
          <ul className="list-disc ml-5">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-1">
          <Label htmlFor="rollNo">Roll Number</Label>
          <Input id="rollNo" name="rollNo" readOnly value={student.rollNo} onChange={handleChange} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="cnicNumber">CNIC Number</Label>
          <Input id="cnicNumber" name="cnicNumber" readOnly value={student.cnicNumber} onChange={handleChange} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" value={student.name} onChange={handleChange} required />
        </div>

        <div className="space-y-1">
          <Label htmlFor="fatherName">Father Name</Label>
          <Input id="fatherName" name="fatherName" value={student.fatherName} onChange={handleChange} required />
        </div>

        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input type="email" id="email" name="email" value={student.email} onChange={handleChange} required />
        </div>

        <div className="space-y-1">
          <Label htmlFor="mobileNumber">Mobile Number</Label>
          <Input id="mobileNumber" name="mobileNumber" value={student.mobileNumber} onChange={handleChange} required />
        </div>

        <div className="space-y-1">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split("T")[0] : ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="gender">Gender</Label>
          <select
            name="gender"
            value={student.gender}
            onChange={handleChange}
            required
            className="w-full border border-slate-300 rounded-md p-2 bg-white"
          >
            <option value="">Select Gender</option>
            {genderOptions.map((g) => (
              <option key={g.key} value={g.key}>{g.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="religion">Religion</Label>
          <select
            name="religion"
            value={student.religion}
            onChange={handleChange}
            required
            className="w-full border border-slate-300 rounded-md p-2 bg-white"
          >
            <option value="">Select Religion</option>
            {religionOptions.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="instituteName">Institute Name</Label>
          <Input id="instituteName" name="instituteName" value={student.instituteName} onChange={handleChange} required />
        </div>

        <div className="space-y-1">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" value={student.city} onChange={handleChange} required />
        </div>

        <div className="space-y-1">
          <Label htmlFor="stateProvince">State/Province</Label>
          <Input id="stateProvince" name="stateProvince" value={student.stateProvince} onChange={handleChange} required />
        </div>

        <div className="space-y-1 md:col-span-2 lg:col-span-3">
          <Label htmlFor="addressLine1">Address</Label>
          <Textarea
            id="addressLine1"
            name="addressLine1"
            value={student.addressLine1}
            onChange={handleChange}
            required
            rows={3}
            className="w-full border-slate-300"
          />
        </div>

        <div className="space-y-1 md:col-span-2 lg:col-span-3">
          <Label htmlFor="profilePicture">Profile Picture</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              const formData = new FormData();
              formData.append("file", file);
              formData.append("upload_preset", "school");

              try {
                const res = await fetch("https://api.cloudinary.com/v1_1/ds50k7ryy/image/upload", {
                  method: "POST",
                  body: formData,
                });

                const data = await res.json();
                if (data.secure_url) {
                  setStudent((prev) => prev ? { ...prev, profilePicture: data.secure_url } : prev);
                }
              } catch (err) {
                console.error("Cloudinary upload error:", err);
              }
            }}
          />
          {student.profilePicture && (
            <img
              src={student.profilePicture}
              alt="Profile"
              className="mt-2 w-24 h-24 object-cover rounded-full border"
            />
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-emerald-600 text-white hover:bg-emerald-700 px-6 py-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Updating..." : "Update Student"}
        </Button>
      </div>
    </form>
  </div>
)

}
