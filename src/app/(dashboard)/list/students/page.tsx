
import React from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import StatsCards from '@/components/StatsCards';
import QuizOverview from '@/components/QuizOverview';
import StudentTable from '@/components/StudentTable';

const StudentListPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto ">
        <DashboardHeader />
        <StatsCards />
        <QuizOverview />
        <StudentTable />
      </div>
    </div>
  );
};

export default StudentListPage;