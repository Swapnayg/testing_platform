'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Pencil } from 'lucide-react';
import { columns } from '@/components/columns'; // Adjust path if needed
import { DataTable } from '@/components/ui/data-table';


interface Grade {
  id: number;
  name: string;
}

interface Announcement {
  id: number;
  title: string;
  description: string;
  date: string;
  grades: Grade[];
}

export default function AdminAnnouncementPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [editing, setEditing] = useState<Announcement | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    gradeIds: [] as number[],
  });

  const fetchGrades = async () => {
    const res = await fetch('/api/grades');
    const data = await res.json();
    setGrades(data);
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

  const handleSubmit = async () => {
    const method = editing ? 'PUT' : 'POST';
    const endpoint = editing ? `/api/announcements/${editing.id}` : '/api/announcements';
    await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    setEditing(null);
    setFormData({ title: '', description: '', gradeIds: [] });
    fetchAnnouncements();
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
    fetchAnnouncements();
  };

  const filtered = announcements.filter((a) =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
            <Input
                placeholder="Search announcements..."
                className="w-full max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

        <Dialog>
          <DialogTrigger asChild>
            <Button className="ml-4">+ Add Announcement</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit' : 'Add'} Announcement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Grades</Label>
                <div className="grid grid-cols-2 gap-2">
                  {grades.map((grade) => (
                    <label key={grade.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.gradeIds.includes(grade.id)}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...formData.gradeIds, grade.id]
                            : formData.gradeIds.filter((id) => id !== grade.id);
                          setFormData({ ...formData, gradeIds: updated });
                        }}
                      />
                      {grade.name}
                    </label>
                  ))}
                </div>
              </div>
              <Button onClick={handleSubmit}>{editing ? 'Update' : 'Save'} Announcement</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md overflow-auto">
        {/* ✅ Replace table with DataTable */}
        <DataTable columns={columns} data={filtered} />
      </div>
    </div>
  );
}
