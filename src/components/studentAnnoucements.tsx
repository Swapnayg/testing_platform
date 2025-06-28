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
import StudentAnnouncementsTable from './StudentAnnouncementsTable';
import type { Announcement } from './columns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";


interface Exam {
  id: string;
  title: string;
}

export default function StudentAnnouncementPage({ username }: { username: string }) {

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAnnouncements = async (username: string) => {
    const res = await fetch(`/api/studentannouncements?username=${encodeURIComponent(username)}`);
    const data = await res.json();
    setAnnouncements(data);
  };


  useEffect(() => {
      fetchAnnouncements(username);
  }, []);

  const filtered = Array.isArray(announcements)
    ? announcements.filter((a) =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase())
    ): [];
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
            <Input
                placeholder="Search announcements..."
                className="w-full max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

      </div>

      <div className="border rounded-md overflow-auto">
        {/* ✅ Replace table with DataTable */}
           <StudentAnnouncementsTable
        data={filtered}
      />

      </div>
    </div>
  );
}