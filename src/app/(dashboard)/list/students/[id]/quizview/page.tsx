import QuizResultsViewer from '@/components/QuizResultView';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ studentName?: string; userRole?: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Quiz ID: ${id}`,
    description: `Details for Quiz ${id}`,
  };
}

export default async function QuizListPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ studentName?: string; userRole?: string }>;
}) {
  const { id } = await params;
  const { studentName = '', userRole = 'student' } = await searchParams;

  return (
    <QuizResultsViewer
      quizId={id}
      username={studentName}
      userRole={userRole}
    />
  );
}
