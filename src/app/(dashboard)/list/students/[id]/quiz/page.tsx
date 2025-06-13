import QuizEditor from '@/components/QuizUpdate';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ studentName?: string;}>;
}): Promise<Metadata> {
  const { id } = await params;
  // You can also await searchParams here if you want to use them in meta
  return {
    title: `Quiz ID: ${id}`,
    description: `Details for Quiz ${id}`,
  };
}

export default async function QuizListPage(
  {
    params,
    searchParams,
  }: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ studentName?: string;}>;
  }
) {
  // await both before using
  const { id } = await params;
  const { studentName = '' } = await searchParams;

  return (
        <QuizEditor
      quizId={id}
      username={studentName}
    />
  );
}
