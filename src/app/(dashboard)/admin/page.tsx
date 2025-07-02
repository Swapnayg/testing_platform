import AdminAnnounView from "@/components/adminAnnounView";
import CountChartContainer from "@/components/CountChartContainer";
import FinanceChart from "@/components/FinanceChart";
import UserCard from "@/components/UserCard";
import type { Metadata } from 'next';
import AttendanceChart from "@/components/AttendanceChart";
import ExamCalendar from '@/components/ExamCalendar';
import { getUpcomingExams } from "@/lib/actions";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const page = params.page ?? '1';
  const search = params.search ?? 'none';

  return {
    title: `Admin`,
    description: `Admin results for "${search}" on page ${page}`,
  };
}


export default async function AdminPage ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const exams = await getUpcomingExams(); // Should be an array of exams

  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* LEFT */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        {/* USER CARDS */}
        <div className="flex gap-4 justify-between flex-wrap">
          <UserCard type="admin" bgClass="bg-gradient-to-r from-purple-100 to-purple-200" />
          <UserCard type="student" bgClass="bg-gradient-to-r from-yellow-100 to-yellow-200" />
        </div>
        {/* MIDDLE CHARTS */}
        <div className="flex gap-4 flex-col lg:flex-row">
          {/* COUNT CHART */}
          <div className="w-full lg:w-1/3 h-[450px]">
            <CountChartContainer />
          </div>
          {/* ATTENDANCE CHART */}
          <div className="w-full lg:w-2/3 h-[450px]">
            <AttendanceChart />
          </div>
        </div>
        {/* BOTTOM CHART */}
        <div className="w-full h-[500px]">
          <FinanceChart />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
       <ExamCalendar exams={exams}/>
        <AdminAnnounView />
      </div>
    </div>
  );
};
