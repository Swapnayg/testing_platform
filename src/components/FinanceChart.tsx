'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format } from 'date-fns';

export default function MonthlyGradeRegistrationChart() {
  const today = new Date();
  const [month, setMonth] = useState<number>(today.getMonth() + 1);
  const [year, setYear] = useState<number>(today.getFullYear());
  const [gradeId, setGradeId] = useState<string>('all');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [grades, setGrades] = useState<{ id: number; level: string }[]>([]);
  const now = new Date(); // 1-based


  const fetchData = async () => {
    setLoading(true);
    try {
      const params: { month: string; year: string; gradeId?: string } = {
        month: month.toString(),
        year: year.toString(),
      };
      if (gradeId !== 'all') {
        params.gradeId = gradeId;
      }
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`/api/registration-chart?${query}`);

      if (!res.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await res.json();
      setData(data);
    } catch (err) {
      console.error('Failed to fetch registration summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/grades").then(res => res.json()).then(setGrades);
    fetchData();
  }, [month, year, gradeId]);

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-lg font-bold text-gray-800">📈 Registrations</h2>
        <div className="flex gap-3">
          <select
            className="border rounded px-2 py-1 text-sm"
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
          >
            {Array.from({ length: 12 }).map((_, idx) => (
              <option key={idx + 1} value={idx + 1}>
                {format(new Date(2000, idx), 'MMMM')}
              </option>
            ))}
          </select>

          <select
            className="border rounded px-2 py-1 text-sm"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <option key={i} value={today.getFullYear() - i}>
                {today.getFullYear() - i}
              </option>
            ))}
          </select>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={gradeId}
            onChange={(e) => setGradeId(e.target.value)}
          >
            <option value="all">All Grades</option>
            {grades.map((grade) => (
              <option key={grade.id} value={grade.id.toString()}>
                {grade.level}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading chart...</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 20, right: 30, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="APPROVED" stroke="#38BDF8" strokeWidth={2} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="REJECTED" stroke="#FACC15" strokeWidth={2} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
