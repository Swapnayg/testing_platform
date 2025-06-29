"use client"
import React from 'react';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, } from '@/components/ui/alert-dialog';
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Select from 'react-select';

const genders = [
  { key: "male", label: "Male" },
  { key: "female", label: "Female" },
  { key: "other", label: "Other" },
];

interface Grade {
  id: number;
  level: string;
}

const religions = [
  { value: "islam", label: "Islam" },
  { value: "christianity", label: "Christianity" },
  { value: "hinduism", label: "Hinduism" },
  { value: "sikhism", label: "Sikhism" },
  { value: "buddhism", label: "Buddhism" },
  { value: "other", label: "Other" },
];

const fields = [
  { label: "Name", name: "name" },
  { label: "Father Name", name: "fatherName" },
  { label: "CNIC Number", name: "cnicNumber" },
  { label: "Email", name: "email" },
  { label: "Date of Birth", name: "dateOfBirth", type: "date" },
  { label: "Mobile Number", name: "mobileNumber" },
  { label: "City", name: "city" },
  { label: "State/Province", name: "stateProvince" },
  { label: "Address Line 1", name: "addressLine1" },
  { label: "Institute Name", name: "instituteName" },
];

type FormFields = {
  name: string;
  fatherName: string;
  cnicNumber: string;
  email: string;
  dateOfBirth: string;
  mobileNumber: string;
  city: string;
  stateProvince: string;
  addressLine1: string;
  instituteName: string;
  gender: string;
  religion: string;
  gradeId: string;
  [key: string]: string; // Add index signature
};

const DashboardHeader = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormFields>(() =>
    fields.reduce((acc, f) => ({ ...acc, [f.name]: "" }), { gender: "", religion: "" } as FormFields)
  );
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: false }));
  };

  const validate = () => {
    const requiredFields = [...fields.map(f => f.name), "gender", "religion"];
    const newErrors: Record<string, boolean> = {};
    requiredFields.forEach(field => {
      if (!form[field]) {
        newErrors[field] = true;
      }
    });

    // ✅ CNIC pattern check
    const cnicRegex = /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/;
    if (form.cnicNumber && !cnicRegex.test(form.cnicNumber)) {
      newErrors.cnicNumber = true;
      setAlertMessage("CNIC format must be #####-#######-#");
    }

    setErrors(newErrors);
    setImageError(!imageFile);
    return Object.keys(newErrors).length === 0 && imageFile !== null;
  };


  const fetchGrades = async () => {
    const res = await fetch('/api/grades');
    const data = await res.json();
    setGrades(data);
  };

const handleSubmit = async () => {
  if (!validate()) {
    setAlertMessage("Please fill out all required fields.");
    setAlertOpen(true);
    return;
  }

  setLoading(true); // Start loading

  try {
    const imageForm = new FormData();
    imageForm.append("file", imageFile!);
    imageForm.append("upload_preset", "school");

    const imageRes = await fetch("https://api.cloudinary.com/v1_1/ds50k7ryy/image/upload", {
      method: "POST",
      body: imageForm,
    });

    const imageData = await imageRes.json();
    if (!imageData.secure_url) {
      setAlertMessage("Image upload failed.");
      setAlertOpen(true);
      return;
    }

    const res = await fetch("/api/add-student", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        profilePicture: imageData.secure_url,
      }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.status === 201) {
      setAlertMessage("Student added successfully.");
      setAlertOpen(true);
      setForm(fields.reduce((acc, f) => ({ ...acc, [f.name]: "" }), { gender: "", religion: "" } as FormFields));
      setImageFile(null);
      setImagePreview(null);
      setOpen(false);
      router.refresh();
    } else if (res.status === 400) {
      setAlertMessage("Student already exists.");
      setAlertOpen(true);
    } else {
      setAlertMessage("Internal server error. Please try again.");
      setAlertOpen(true);
    }
  } catch (err) {
    console.error(err);
    setAlertMessage("Unexpected error. Please try again.");
    setAlertOpen(true);
  } finally {
    setLoading(false); // Stop loading
  }
};

  useEffect(() => {
    fetchGrades();
  }, []);

  const gradeOptions = grades.map((grade) => ({
    value: grade.id,
    label: grade.level,
  }));

  return (
    <div className="flex justify-between items-start mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Management</h1>
        <p className="text-gray-600">Manage quiz registrations and payment approvals</p>
      </div>
 <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl px-6 py-6">
        <DialogHeader>
          <DialogTitle className="text-lg">Add Student</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">

             {/* Then Name */}
            <div>
              <Label>Name <span className="text-red-500">*</span></Label>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-xs text-red-600">Required</p>}
            </div>
            {/* Father Name */}
            <div>
              <Label>Father Name <span className="text-red-500">*</span></Label>
              <Input
                name="fatherName"
                value={form.fatherName}
                onChange={handleChange}
                className={errors.fatherName ? "border-red-500" : ""}
              />
              {errors.fatherName && <p className="text-xs text-red-600">Required</p>}
            </div>

            {/* Grade */}
            <div>
              <Label>Grade <span className="text-red-500">*</span></Label>
             <Select
                id="gradeId"
                name="gradeId"
                options={gradeOptions}
                value={gradeOptions.find((opt) => opt.value === Number(form.gradeId)) || null}
                onChange={(selected) => {
                  setForm(prev => ({
                    ...prev,
                    gradeId: selected ? String(selected.value) : ""
                  }));
                  setErrors(prev => ({
                    ...prev,
                    gradeId: false
                  }));
                }}
                placeholder="Select Grade"
                className="mt-1 text-sm"
                classNamePrefix="react-select"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderColor: errors.gradeId ? '#f87171' : '#d1d5db', // red-500 or gray-300
                    boxShadow: 'none',
                    '&:hover': {
                      borderColor: errors.gradeId ? '#f87171' : '#9ca3af', // hover: red or gray-400
                    },
                  }),
                }}
              />

              {errors.gradeId && <p className="text-xs text-red-600">Required</p>}
            </div>

            {/* Date of Birth */}
            <div>
              <Label>Date of Birth <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                className={errors.dateOfBirth ? "border-red-500" : ""}
              />
              {errors.dateOfBirth && <p className="text-xs text-red-600">Required</p>}
            </div>
            {/* Mixed Order: Start with Email */}
            <div>
              <Label>Email <span className="text-red-500">*</span></Label>
              <Input
                name="email"
                value={form.email}
                onChange={handleChange}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-xs text-red-600">Required</p>}
            </div>

            {/* Mobile Number */}
            <div>
              <Label>Mobile Number <span className="text-red-500">*</span></Label>
              <Input
                name="mobileNumber"
                value={form.mobileNumber}
                onChange={handleChange}
                className={errors.mobileNumber ? "border-red-500" : ""}
              />
              {errors.mobileNumber && <p className="text-xs text-red-600">Required</p>}
            </div>

            {/* Gender */}
            <div>
              <Label>Gender <span className="text-red-500">*</span></Label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className={`mt-1 w-full rounded border px-3 py-2 text-sm ${errors.gender ? "border-red-500" : "border-gray-300"}`}
              >
                <option value="">Select Gender</option>
                {genders.map(({ key, label }) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              {errors.gender && <p className="text-xs text-red-600">Required</p>}
            </div>

            {/* CNIC */}
            <div>
              <Label>CNIC Number <span className="text-red-500">*</span></Label>
              <Input
                name="cnicNumber"
                value={form.cnicNumber}
                onChange={handleChange}
                className={errors.cnicNumber ? "border-red-500" : ""}
                placeholder="12345-1234567-1"
              />
              {errors.cnicNumber && <p className="text-xs text-red-600">Required and must match CNIC format</p>}
            </div>

            {/* Religion */}
            <div>
              <Label>Religion <span className="text-red-500">*</span></Label>
              <select
                name="religion"
                value={form.religion}
                onChange={handleChange}
                className={`mt-1 w-full rounded border px-3 py-2 text-sm ${errors.religion ? "border-red-500" : "border-gray-300"}`}
              >
                <option value="">Select Religion</option>
                    {religions.map((r) => (
                    <option key={r.value} value={r.value}>
                    {r.label}
                </option>
                ))}
              </select>
              {errors.religion && <p className="text-xs text-red-600">Required</p>}
            </div>

            {/* City */}
            <div>
              <Label>City <span className="text-red-500">*</span></Label>
              <Input
                name="city"
                value={form.city}
                onChange={handleChange}
                className={errors.city ? "border-red-500" : ""}
              />
              {errors.city && <p className="text-xs text-red-600">Required</p>}
            </div>

            {/* State Province */}
            <div>
              <Label>State/Province <span className="text-red-500">*</span></Label>
              <Input
                name="stateProvince"
                value={form.stateProvince}
                onChange={handleChange}
                className={errors.stateProvince ? "border-red-500" : ""}
              />
              {errors.stateProvince && <p className="text-xs text-red-600">Required</p>}
            </div>

            {/* Address Line 1 */}
            <div>
              <Label>Address Line 1 <span className="text-red-500">*</span></Label>
              <Input
                name="addressLine1"
                value={form.addressLine1}
                onChange={handleChange}
                className={errors.addressLine1 ? "border-red-500" : ""}
              />
              {errors.addressLine1 && <p className="text-xs text-red-600">Required</p>}
            </div>

            {/* Institute */}
            <div>
              <Label>Institute Name <span className="text-red-500">*</span></Label>
              <Input
                name="instituteName"
                value={form.instituteName}
                onChange={handleChange}
                className={errors.instituteName ? "border-red-500" : ""}
              />
              {errors.instituteName && <p className="text-xs text-red-600">Required</p>}
            </div>

            {/* Profile Picture (Full Width) */}
            <div className="md:col-span-2">
              <Label>Profile Picture <span className="text-red-500">*</span></Label>
              <Input
                id="profilePicture"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setImageFile(file);
                    setImagePreview(URL.createObjectURL(file));
                    setImageError(false);
                  }
                }}
              />
              {imageError && <p className="text-xs text-red-600 mt-1">Required</p>}
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="mt-2 h-20 rounded" />
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-green-600 text-white" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </div>
          
        </form>
      </DialogContent>
    </Dialog>
      {/* AlertDialog for Success/Error */}
  <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Notice</AlertDialogTitle>
        <AlertDialogDescription>
          {alertMessage}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogAction onClick={() => setAlertOpen(false)}>OK</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
    </div>
  );
};

export default DashboardHeader;
