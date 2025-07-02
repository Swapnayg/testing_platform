'use client';

import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useMemo, useState } from 'react';
import { parseISO, format, isValid } from 'date-fns';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

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

export default function ExamCalendar({ exams }: { exams: any[] }) {
  const [selectedExam, setSelectedExam] = useState<any>(null);

  const events = useMemo(
    () =>
      exams.map((exam) => ({
        id: exam.id,
        title: exam.title,
        start: typeof exam.startTime === 'string' ? parseISO(exam.startTime) : exam.startTime,
        end: typeof exam.endTime === 'string' ? parseISO(exam.endTime) : exam.endTime,
        subject: exam.subject.name,
        grade: exam.grades.map((g: { level: any }) => g.level).join(', '),
        category: exam.category.catName,
        fullData: exam,
      })),
    [exams]
  );

  return (
    <div className="p-6 bg-white rounded-xl shadow space-y-4">
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
        onSelectEvent={(event) => setSelectedExam(event.fullData)}
        eventPropGetter={(event) => {
          const subjectColors: Record<string, string> = {
            Math: '#22c55e',
            Science: '#0ea5e9',
            English: '#f59e0b',
            General: '#6366f1',
          };
        let bgColor = '#4f46e5'; // default indigo
        let textColor = 'white';

        // Apply announcement-style color logic
        switch (event.category) {
            case 'Category-I':
            bgColor = '#EDE9FE'; // Violet
            textColor = '#6B21A8';
            break;
            case 'Category-II':
            bgColor = '#FEF3C7'; // Amber
            textColor = '#92400E';
            break;
            case 'Category-III':
            bgColor = '#D1FAE5'; // Mint
            textColor = '#34D399';
            break;
            case 'Category-IV':
            bgColor = '#DBEAFE'; // Blue
            textColor = '#1D4ED8';
            break;
        }
          return {
            style: {
              backgroundColor: bgColor,
              color: textColor,
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

      {/* Modal for Exam Details */}
      <Transition appear show={!!selectedExam} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setSelectedExam(null)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="bg-white max-w-md w-full rounded-xl p-6 shadow-xl space-y-4">
                  <Dialog.Title className="text-lg font-bold text-gray-800">
                    {selectedExam?.title}
                  </Dialog.Title>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Subject:</strong> {selectedExam?.subject?.name}</p>
                    <p><strong>Category:</strong> {selectedExam?.category?.catName}</p>
                    <p><strong>Grades:</strong> {selectedExam?.grades.map((g: { level: any }) => g.level).join(', ')}</p>
                    <p>
                      <strong>Start:</strong> {isValid(new Date(selectedExam?.startTime)) ? format(new Date(selectedExam.startTime), 'PPpp') : 'N/A'}
                    </p>
                    <p>
                      <strong>End:</strong> {isValid(new Date(selectedExam?.endTime)) ? format(new Date(selectedExam.endTime), 'PPpp') : 'N/A'}
                    </p>
                    <p><strong>Time Limit:</strong> {selectedExam?.timeLimit} mins</p>
                    <p><strong>Total Marks:</strong> {selectedExam?.totalMarks}</p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setSelectedExam(null)}
                      className="text-sm px-4 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
