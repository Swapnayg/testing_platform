'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { createColumns } from "./columns";
import { DataTable } from '@/components/ui/data-table';
import { ArrowUp, ArrowDown } from "lucide-react";
import AnnouncementsTable from './AnnouncementsTable';
import type { Announcement } from './columns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";


interface Exam {
  id: string;
  title: string;
}

export default function AdminAnnouncementPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [open, setOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<{
    title: string;
    description: string;
    type: string;
    resultDate: string;
    gradeIds: number[];
    examIds: string[];
    isForAll: boolean;
  }>({
    title: "",
    description: "",
    type: "GENERAL",
    resultDate: "",
    gradeIds: [],
    examIds: [],
    isForAll: false,
  });

  const [grades, setGrades] = useState<{ id: number; level: string }[]>([]);
  const [exams, setExams] = useState<{
    grades: any; id: number; title: string; resultDate: string 
}[]>([]);


  const fetchAnnouncements = async () => {
    const res = await fetch('/api/announcements');
    const data = await res.json();
    setAnnouncements(data);
  };

  useEffect(() => {
    fetch("/api/grades").then(res => res.json()).then(setGrades);
    const selected = form.examIds.length > 0 ? `&selected=${form.examIds.join(",")}` : "";
    fetch(`/api/annoucementExams?filter=undeclared${selected}`)
    .then(res => res.json())
    .then(setExams);
    fetchAnnouncements();
  }, []);

  const handleEdit = (announcement: Announcement) => {
    setEditing(announcement);
    setForm({
      title: announcement.title,
      description: announcement.description,
      type: announcement.announcementType,
      resultDate: announcement.resultDate || "",
      gradeIds: announcement.grades?.map(g => g.id) || [],
      examIds: announcement.exams?.map(e => String(e.id)) || [],
      isForAll: announcement.isForAll,
    });
    // ✅ Fetch exams for editing (include declared ones)
    const selected = announcement.exams?.map(e => String(e.id)) || [];
    fetch(`/api/annoucementExams?filter=undeclared${selected}`).then((res) => res.json()).then(setExams);
    setOpen(true);
  };

useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title || "",
        description: editing.description || "",
        type: editing.announcementType || "GENERAL",
        resultDate: editing.resultDate ? editing.resultDate : "",
        gradeIds: editing.grades ? editing.grades.map((g: any) => g.id) : [],
        examIds: editing.exams ? editing.exams.map((e: any) => e.id) : [],
        isForAll: typeof editing.isForAll === "boolean" ? editing.isForAll : false,
      });
    }
  }, [editing]);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      type: "GENERAL",
      resultDate: "",
      gradeIds: [],
      examIds: [],
      isForAll: false,
    });
    setEditing(null); // optional: reset edit mode
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  const method = editing ? "PUT" : "POST";
  const url = editing ? `/api/announcements/${editing.id}` : "/api/announcements";

  await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });

  setForm({ title: "", description: "", type: "GENERAL", resultDate: "", gradeIds: [], examIds: [], isForAll: false });
  setEditing(null);
  fetchAnnouncements();
  setOpen(false); // ✅ Close the modal
  setLoading(false);
};


  const handleDelete = async (id: number) => {
    await fetch(`/api/announcements/${id}`, { method: "DELETE" });
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  const filtered = Array.isArray(announcements)
    ? announcements.filter((a) =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];


  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
            <Input
                placeholder="Search announcements..."
                className="w-full max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

        <Dialog   open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen || !editing) { resetForm(); } }}>
          <DialogTrigger asChild>
            <Button className="ml-4" onClick={() => setOpen(true)}>+ Add Announcement</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {editing ? 'Edit' : 'Add'} Announcement
              </DialogTitle>
            </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Title</Label>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        </div>

        <div>
          <Label>Type</Label>
          <Select
            value={form.type}
            onValueChange={(value) =>
              setForm({ ...form, type: value as "GENERAL" | "EXAM_RESULT", gradeIds: [], examIds: [], resultDate: "" })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select announcement type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GENERAL">General</SelectItem>
              <SelectItem value="EXAM_RESULT">Exam Result</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {form.type === "GENERAL" && (
          <div>
            <Label className="block mb-1">Grades</Label>

            {/* Select All */}
            <div className="mb-2">
              <input
                type="checkbox"
                checked={form.isForAll}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setForm((prev) => ({
                    ...prev,
                    isForAll: checked,
                    gradeIds: checked ? grades.map((g: any) => g.id) : [],
                  }));
                }}
              />
              <span className="ml-2 font-medium">Select All</span>
            </div>

            {/* Grade Options */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 border p-4 rounded bg-gray-50">
              {grades.map((g: any) => (
                <label key={g.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={g.id}
                    checked={form.gradeIds.includes(g.id)}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      const updated = e.target.checked
                        ? [...form.gradeIds, id]
                        : form.gradeIds.filter((gid) => gid !== id);
                      setForm({ ...form, gradeIds: updated, isForAll: false });
                    }}
                  />
                  <span>{g.level}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {form.type === "EXAM_RESULT" && (
          <>
            <div>
              <Label>Result Declaration Date</Label>
              <Input
                type="date"
                value={form.resultDate ? form.resultDate.slice(0, 10) : ""}
                onChange={(e) =>
                  setForm({ ...form, resultDate: e.target.value })
                }
                required
              />
            </div>

            <div className="mt-4">
              <Label>Select Exams</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                {exams.map((exam: any) => (
                  <div key={exam.id} className="flex items-start gap-2 border p-3 rounded shadow-sm bg-gray-50" >
                    <input
                        id={`exam-${exam.id}`}
                        type="checkbox"
                        value={exam.id}
                        checked={form.examIds.includes(exam.id)}
                        onChange={(e) => {
                          const examId = e.target.value;
                          setForm((prev) => {
                            const newIds = e.target.checked
                              ? [...prev.examIds, examId]
                              : prev.examIds.filter((id) => id !== examId);
                            return { ...prev, examIds: newIds };
                          });
                        }}
                        className="accent-blue-600 mt-1"
                      />
                  <label htmlFor={`exam-${exam.id}`} className="cursor-pointer">
                    <div className="font-medium">{exam.title}</div>
                    <div className="text-sm text-gray-500">
                      Grades: {exam.grades?.map((g: any) => g.level).join(", ")}
                    </div>
                  </label>
                </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="flex gap-2 justify-end">
          {!editing && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Reset
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading
              ? editing
                ? "Updating..."
                : "Adding..."
              : editing
                ? "Update"
                : "Add"} Announcement
          </Button>

        </div>
      </form>

          </DialogContent>
      </Dialog>


      <Dialog open={alertOpen} onOpenChange={setAlertOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Validation Error</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-gray-700 mb-4">{alertMessage}</div>
          <div className="flex justify-end">
            <Button onClick={() => setAlertOpen(false)}>OK</Button>
          </div>
        </DialogContent>
      </Dialog>


      </div>

      <div className="border rounded-md overflow-auto">
        {/* ✅ Replace table with DataTable */}
           <AnnouncementsTable
        data={filtered}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      </div>
    </div>
  );
}