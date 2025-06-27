// components/AssignStudentsButton.tsx
'use client';

import { useTransition } from 'react';
import { assignStudentsToExams } from "@/lib/actions";// adjust path accordingly

export default function AssignStudentsButton() {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(() => {
      assignStudentsToExams();
    });
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      disabled={isPending}
      className={`text-sm px-4 py-2 rounded-md text-white transition ${
        isPending ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
      }`}
    >
      {isPending ? 'Assigning...' : 'Assign Students'}
    </button>
  );
}
