"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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

const genderOptions = ["Male", "Female", "Other"];
const religionOptions = ["Islam", "Christianity", "Hinduism", "Other"];

export default function StudentEditForm({ studentId }: { studentId: string }) {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/studentData/${studentId}`)
      .then((res) => res.json())
      .then(setStudent);
  }, [studentId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!student) return;
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    return data.secure_url as string;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    setIsSubmitting(true);

    let profilePictureUrl = student.profilePicture;

    if (profileFile) {
      try {
        profilePictureUrl = await uploadToCloudinary(profileFile);
      } catch (err) {
        alert("Image upload failed");
        setIsSubmitting(false);
        return;
      }
    }

    const updatedStudent = { ...student, profilePicture: profilePictureUrl };

    const res = await fetch(`/api/studentData/${studentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedStudent),
    });

    setIsSubmitting(false);

    if (res.ok) {
      alert("Student updated!");
      router.refresh();
    } else {
      alert("Failed to update student.");
    }
  };

  if (!student) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-semibold">Edit Student</h2>

      {Object.entries({
        name: "Name",
        fatherName: "Father's Name",
        dateOfBirth: "Date of Birth",
        cnicNumber: "CNIC Number",
        email: "Email",
        mobileNumber: "Mobile Number",
        city: "City",
        stateProvince: "State/Province",
        addressLine1: "Address",
        instituteName: "Institute Name",
        others: "Others",
        rollNo: "Roll Number",
      }).map(([key, label]) => (
        <div key={key}>
          <Label htmlFor={key}>{label}</Label>
          <Input
            required
            id={key}
            name={key}
            value={(student as any)[key] || ""}
            onChange={handleChange}
            type={key === "dateOfBirth" ? "date" : "text"}
          />
        </div>
      ))}

      <div>
        <Label htmlFor="gender">Gender</Label>
        <select
          name="gender"
          value={student.gender}
          onChange={handleChange}
          required
          className="w-full border rounded-md p-2"
        >
          {genderOptions.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="religion">Religion</Label>
        <select
          name="religion"
          value={student.religion}
          onChange={handleChange}
          required
          className="w-full border rounded-md p-2"
        >
          {religionOptions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="profilePicture">Profile Picture</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setProfileFile(e.target.files?.[0] || null)}
        />
        {student.profilePicture && (
          <img src={student.profilePicture} alt="Profile" className="mt-2 w-24 h-24 object-cover rounded-full" />
        )}
      </div>

      <Button type="submit" className="mt-4 bg-blue-600 text-white hover:bg-blue-700" disabled={isSubmitting}>
        {isSubmitting ? "Updating..." : "Update Student"}
      </Button>
    </form>
  );
}
