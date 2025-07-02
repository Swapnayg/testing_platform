'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
  CartesianGrid,
} from 'recharts';
import prisma from "@/lib/prisma";

interface ExamAttendanceData {
  examTitle: string;
  present: number;
  absent: number;
}

export default function ExamAttendanceChart() {
  const [data, setData] = useState<ExamAttendanceData[]>([]);
  const [loading, setLoading] = useState(true);

  const [gradeId, setGradeId] = useState('all');
  const [subjectId, setSubjectId] = useState('all');

  const [grades, setGrades] = useState<{level: string; id: string; }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);


  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (gradeId !== 'all') params.append('gradeId', gradeId);
      if (subjectId !== 'all') params.append('subjectId', subjectId);

      
      const res = await fetch(`/api/exam-attendance?${params.toString()}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch attendance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
    fetch("/api/grades").then(res => res.json()).then(setGrades);
    fetch("/api/subjects").then(res => res.json()).then(setSubjects);
  }, [ gradeId, subjectId]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
      <div className="flex justify-between flex-wrap gap-3">
        <h2 className="text-xl font-semibold text-gray-800">📊 Exam Details</h2>
        <div className="w-full flex justify-end mb-4">
          <div className="flex gap-2 flex-wrap justify-end">
            <select
              value={gradeId}
              onChange={(e) => setGradeId(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="all">All Grades</option>
              {grades.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.level}
                </option>
              ))}
            </select>

            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="border p-2 rounded text-sm"
            >
              <option value="all">All Subjects</option>
              {subjects.map((subj) => (
                <option key={subj.id} value={subj.id}>
                  {subj.name}
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : data.length === 0 ? (
        <p className="text-gray-500">No attendance data available.</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={data}
            barCategoryGap="20%"
            margin={{ top: 30, right: 30, left: 10, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="examTitle"
              interval={0}
              angle={-20}
              textAnchor="end"
              tick={{ fontSize: 12 }}
              height={60}
            />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="present" stackId="a" fill="#FACC15" name="Present">
              <LabelList dataKey="present" position="top" fontSize={12} fill="#FACC15" />
            </Bar>
            <Bar dataKey="absent" stackId="a" fill="#38BDF8" name="Absent">
              <LabelList dataKey="absent" position="top" fontSize={12} fill="#38BDF8" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
