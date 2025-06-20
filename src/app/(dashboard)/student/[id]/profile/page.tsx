import StudentEditForm from '@/components/Profile';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Student ID: ${id}`,
    description: `Details for Student ${id}`,
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  console.log(id);

  return (
    <StudentEditForm studentId={id}></StudentEditForm>
  );
}
