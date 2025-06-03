"use client";
import Image from "next/image";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";


const data = [
  { name: "Mon", present: 5, absent: 2 },
  { name: "Tue", present: 4, absent: 3 },
  { name: "Wed", present: 6, absent: 1 },
  { name: "Thu", present: 3, absent: 4 },
  { name: "Fri", present: 5, absent: 0 },
];


const AttendanceChart = () => {
  return (
<div className="w-full h-[400px] bg-white p-4 rounded-xl shadow">
      <h2 className="text-lg font-bold mb-4">Weekly Attendance</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fill: "#6B7280" }} />
          <YAxis tick={{ fill: "#6B7280" }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="present" fill="#34D399" radius={[6, 6, 0, 0]} />
          <Bar dataKey="absent" fill="#F87171" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>

  );
};

export default AttendanceChart;
