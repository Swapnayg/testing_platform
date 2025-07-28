'use client';

import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useMemo, useRef, useState, useEffect } from 'react';
import { parseISO } from 'date-fns';

const localizer = momentLocalizer(moment);

const CustomToolbar = ({ label, onNavigate }: any) => (
  <div className="flex justify-between items-center px-4 py-2 bg-indigo-50 rounded-md mb-4">
    <div className="flex items-center gap-2">
      <button onClick={() => onNavigate('TODAY')} className="text-sm px-3 py-1 bg-white rounded shadow">Today</button>
      <button onClick={() => onNavigate('PREV')} className="text-indigo-600 text-lg font-bold">←</button>
      <button onClick={() => onNavigate('NEXT')} className="text-indigo-600 text-lg font-bold">→</button>
    </div>
    <span className="text-sm font-medium text-gray-800">{label}</span>
  </div>
);

export default function ExamCalendarStudent({ exams }: { exams: any[] }) {
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);
  const calendarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (selectedExam) {
      const timeout = setTimeout(() => {
        setSelectedExam(null);
        setTooltipPosition(null);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [selectedExam]);

  const events = useMemo(
    () =>
      exams.map((exam) => ({
        id: exam.id,
        title: exam.title,
        start: typeof exam.startTime === 'string' ? parseISO(exam.startTime) : exam.startTime,
        end: typeof exam.endTime === 'string' ? parseISO(exam.endTime) : exam.endTime,
        subject: exam.subject,
        grade: exam.grade,
        category: exam.category,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
      })),
    [exams]
  );

  const handleSelectEvent = (event: any, e: any) => {
    const rect = e.target.getBoundingClientRect();
    if (calendarRef.current) {
      const containerRect = calendarRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.bottom - containerRect.top + 10,
        left: rect.left - containerRect.left + rect.width / 2,
      });
    }
    setSelectedExam(event);
  };

  return (
    <div ref={calendarRef} className="relative p-6 bg-white rounded-xl shadow space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">📆 Upcoming Exams</h2>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        views={['month']}
        defaultView="month"
        toolbar={true}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={(event) => {
          const categoryStyles: Record<string, { bg: string; text: string }> = {
            'Category-I': { bg: '#EDE9FE', text: '#6B21A8' },
            'Category-II': { bg: '#FEF3C7', text: '#92400E' },
            'Category-III': { bg: '#D1FAE5', text: '#065F46' },
            'Category-IV': { bg: '#DBEAFE', text: '#1D4ED8' },
          };

          const { bg, text } = categoryStyles[event.category] || { bg: '#E0E7FF', text: '#1E3A8A' };

          return {
            style: {
              backgroundColor: bg,
              color: text,
              borderRadius: '8px',
              padding: '6px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            },
          };
        }}
        components={{
          toolbar: CustomToolbar,
          event: ({ event }) => (
            <div title={event.title}>
              <div className="text-sm font-semibold truncate">{event.title}</div>
              <div className="flex flex-wrap gap-1 mt-1">
                <span className="text-xs bg-white text-purple-700 px-1.5 py-0.5 rounded-full">📘 {event.subject}</span>
                <span className="text-xs bg-white text-emerald-700 px-1.5 py-0.5 rounded-full">🏷 {event.category}</span>
              </div>
            </div>
          ),
        }}
      />

      {selectedExam && tooltipPosition && (
        <div
          className="absolute z-50 w-72 p-4 bg-white text-gray-700 rounded-xl shadow-lg border border-gray-200 transition-opacity duration-300"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            transform: 'translate(-50%, 0)',
          }}
        >
          <div className="text-base font-bold text-indigo-800 mb-2 flex items-center gap-2">
            📌 {selectedExam.title}
          </div>

          <div className="text-sm space-y-1">
            <p><strong>📘 Subject:</strong> {selectedExam.subject}</p>
            <p><strong>🏷 Category:</strong> {selectedExam.category}</p>
            <p><strong>🎓 Grade:</strong> {selectedExam.grade}</p>
            <p><strong>⏰ Start:</strong> {moment(selectedExam.start).format('LLL')}</p>
            <p><strong>🛑 End:</strong> {moment(selectedExam.end).format('LLL')}</p>
            <p><strong>🕒 Duration:</strong> {selectedExam.duration ?? 'N/A'}</p>
            <p><strong>📝 Total Marks:</strong> {selectedExam.totalMarks ?? 'N/A'}</p>
          </div>

          {/* Speech bubble tail */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
        </div>
      )}
    </div>
  );
}
