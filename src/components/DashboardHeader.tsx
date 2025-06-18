
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const DashboardHeader = () => {
  return (
    <div className="flex justify-between items-start mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Management</h1>
        <p className="text-gray-600">Manage quiz registrations and payment approvals</p>
      </div>
      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
        <Plus className="w-4 h-4 mr-2" />
        Add Student
      </Button>
    </div>
  );
};

export default DashboardHeader;
