'use client';

import { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Label,
  LabelList ,
} from 'recharts';

interface PerfEntry {
  name: string;
  value: number;       // raw score
  total: number;       // max score
  rankOutOfTen: number;
  fill: string;
}

export default function StudentPerformanceChart({ studentId }: { studentId: string }) {
  const [data, setData] = useState<PerfEntry[]>([]);
  const [rating, setRating] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const getContrastColor = (hexColor: string) => {
    if (!hexColor) return "black";
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
    return luminance > 186 ? "black" : "white";
  };


  useEffect(() => {
    if (!studentId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/student-performance?studentId=${studentId}`);
        const json = await res.json();
        const chartData: PerfEntry[] = json.chartData.map((e: any, i: number) => ({
          name: e.name,
          value: e.value,
          total: e.total,
          rankOutOfTen: +((e.value / e.total) * 10).toFixed(1),
          fill: e.fill,
        }));
        setData(chartData);
        const avg = chartData.reduce((sum, cur) => sum + cur.rankOutOfTen, 0) / chartData.length;
        setRating(+avg.toFixed(1));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [studentId]);

  if (loading) return <p className="text-center py-4">Loading…</p>;
  const isEmpty = data.length === 0;

  const chartData = isEmpty
    ? [
        {
          name: "No Data",
          value: 1,
          total: 1,
          rankOutOfTen: 1, // must be > 0 to render
          fill: "#e5e7eb", // gray slice
        },
      ]
    : data;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mx-auto" style={{ width: '100%' }}>
      <h2 className="text-xl font-semibold mb-4">🎯 Performance</h2>
      <div style={{ width: '100%', height: 300, margin: '0 auto' }}>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="rankOutOfTen"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              startAngle={90}
              endAngle={-270}
              label={
                !isEmpty
                  ? ({ name, x, y, payload }) => {
                      const percent = ((payload.value / payload.total) * 100).toFixed(0);
                      const dx = 20;
                      const dy = 20;
                      const contrastColor = getContrastColor(payload.fill);

                      return (
                        <text x={x + dx} y={y + dy} textAnchor="middle" dominantBaseline="central">
                          <tspan x={x + dx} dy="-1.2em" fontSize="14" fontWeight="bold" fill={contrastColor}>
                            {name}
                          </tspan>
                          <tspan x={x + dx} dy="1.6em" fontSize="12" fill="black">
                            {percent}%
                          </tspan>
                        </text>
                      );
                    }
                  : undefined
              }
              labelLine={false}
            >
              {chartData.map((entry, idx) => (
                <Cell key={idx} fill={entry.fill} />
              ))}

              <Label
                position="center"
                value={isEmpty ? "No Data" : `${rating} / 10`}
                className="text-xl font-bold"
                style={{
                  fill: isEmpty ? "#9ca3af" : "#4f46e5",
                  pointerEvents: "none",
                }}
              />
            </Pie>

            {/* ✅ Move Tooltip here */}
          {!isEmpty && (
            <Tooltip
              formatter={(value, name, props) => {
                const entry = props.payload;
                return [`${entry.value} / ${entry.payload.total} Marks`];
              }}
            />
          )}

          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
