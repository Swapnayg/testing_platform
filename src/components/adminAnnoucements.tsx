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

interface Exam {
  id: number;
  title: string;
}

export default function AdminAnnouncementPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [open, setOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);


  const [formData, setFormData] = useState({
    title: '',
    description: '',
    examIds: [] as number[],
    resultDate: '', // ✅ new field
  });

  const fetchGrades = async () => {
    const res = await fetch('/api/grades');
    const data = await res.json();
    setExams(data.examsWithoutResults);
  };

  const fetchAnnouncements = async () => {
    const res = await fetch('/api/announcements');
    const data = await res.json();
    setAnnouncements(data);
  };

  useEffect(() => {
    fetchGrades();
    fetchAnnouncements();
  }, []);


  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      resultDate: '',
      examIds: [],
    });
    setEditing(null); // reset edit mode if applicable
};
  const handleEdit = (announcement: Announcement) => {
    setEditing(announcement);
    setFormData({
      title: announcement.title,
      description: announcement.description,
      resultDate: announcement.resultDate.slice(0, 10), // assumes ISO format
      examIds: announcement.grades.map((g: { id: number }) => g.id),
    });
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/announcements/${id}`, { method: "DELETE" });
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };


  const handleSubmit = async () => {
    const { title, description, resultDate, examIds } = formData;

    if (!title.trim()) {
      setAlertMessage("Title is required.");
      setAlertOpen(true);
      return;
    }

    if (!description.trim()) {
      setAlertMessage("Description is required.");
      setAlertOpen(true);
      return;
    }

    if (!resultDate) {
      setAlertMessage("Result declaration date is required.");
      setAlertOpen(true);
      return;
    }

    if (examIds.length === 0) {
      setAlertMessage("Please select at least one exam.");
      setAlertOpen(true);
      return;
    }

    const payload = {
      title,
      description,
      resultDate,
      examIds,
    };
    setIsSubmitting(true);
    try {
      const method = 'POST';
      const endpoint = editing ? `/api/announcements/${editing.id}` : '/api/announcements';
      await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setOpen(false);
      resetForm();
      setEditing(null);
      fetchAnnouncements();
    } 
    catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
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

            <div className="space-y-5">
              {/* Title Input */}
              <div>
                <Label htmlFor="title" className="font-medium">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  required
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter announcement title"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  required
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Write a brief announcement..."
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="resultDate" className="font-medium">Result Declaration Date</Label>
                <Input
                  id="resultDate"
                  type="date"
                  required
                  value={formData.resultDate}
                  onChange={(e) => setFormData({ ...formData, resultDate: e.target.value })}
                />
              </div>
              {/* Grades Section */}
              <div>
                <Label className="font-medium mb-2 block">Exams</Label>
                <div className="border rounded-lg max-h-48 overflow-y-auto p-3 grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4 bg-slate-50">
                  {exams.map((exam) => (
                    <label
                      key={exam.id}
                      className="inline-flex items-center space-x-2 text-sm text-gray-700"
                    >
                      <input
                        type="checkbox"
                        className="form-checkbox text-blue-600 rounded"
                        checked={formData.examIds.includes(exam.id)}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...formData.examIds, exam.id]
                            : formData.examIds.filter((id) => id !== exam.id);
                          setFormData({ ...formData, examIds: updated });
                        }}
                      />
                      <span>{exam.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-6 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => { setOpen(false); resetForm();}}> Cancel</Button>
             <Button onClick={handleSubmit} disabled={isSubmitting}> {isSubmitting ? "Saving..." : editing ? "Update" : "Save"} Announcement </Button>
            </div>
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
