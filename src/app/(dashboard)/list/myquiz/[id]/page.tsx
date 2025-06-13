import QuizInterface from '@/components/QuizInterface';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ username?: string; totalMarks?: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  // You can also await searchParams here if you want to use them in meta
  return {
    title: `Quiz ID: ${id}`,
    description: `Details for Quiz ${id}`,
  };
}

export default async function QuizPage(
  {
    params,
    searchParams,
  }: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ username?: string; totalMarks?: string }>;
  }
) {
  // await both before using
  const { id } = await params;
  const { username = '', totalMarks = '0' } = await searchParams;

  return (
    <QuizInterface
      quizId={id}
      username={username}
      totalMarks={Number(totalMarks)}
    />
  );
}
