'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { createColumns } from "./columns";
import { DataTable } from '@/components/ui/data-table';
import { ArrowUp, ArrowDown,Megaphone  } from "lucide-react";
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
  // return (
  //   <div className="p-6 max-w-7xl mx-auto ">
  //     <div className="flex justify-between items-center m-4 mt-8">
  //           <Input
  //               placeholder="Search announcements..."
  //               className="w-full max-w-sm"
  //               value={searchTerm}
  //               onChange={(e) => setSearchTerm(e.target.value)}
  //           />

  //     </div>

  //     <div className="border rounded-md overflow-auto">
  //       {/* ✅ Replace table with DataTable */}
  //          <StudentAnnouncementsTable
  //       data={filtered}
  //     />

  //     </div>
  //   </div>
  // );
return (
<div className="min-h-screen bg-white">
  {/* Header Section */}
  <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-600 text-white shadow-md">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Megaphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Announcements</h1>
            <p className="text-emerald-100 text-sm sm:text-base">
              Stay updated with latest news and notifications
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Content Section */}
  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
    {/* Search Bar */}
    <div className="mb-8">
      <Input
        placeholder="Search announcements..."
        className="w-full max-w-md"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>

    {/* Table */}
    <div className="w-full overflow-x-auto rounded-lg border border-slate-200 shadow-md bg-white">
      <StudentAnnouncementsTable data={filtered} />
    </div>
  </div>
</div>

)


}