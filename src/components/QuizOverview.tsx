

"use client"
import React from 'react';
import { Card } from '@/components/ui/card';
import { FileText, CheckCircle, Clock, XCircle, IndianRupee } from 'lucide-react';
import  { useEffect, useState } from 'react';


type RegistrationSummary = {
  totalRegistrations: number;
  approved: number;
  pending: number;
  rejected: number;
  totalRevenue: number;
};

const QuizOverview = () => {
  const [regSummary, setRegSummary] = useState<RegistrationSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const overviewStats = [
    {
      title: 'Total Registrations',
      value: regSummary?.totalRegistrations,
      icon: FileText,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Approved',
      value: regSummary?.approved,
      icon: CheckCircle,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Pending',
      value: regSummary?.pending,
      icon: Clock,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600'
    },
    {
      title: 'Rejected',
      value: regSummary?.rejected,
      icon: XCircle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600'
    },
    {
      title: 'Revenue',
      value: 'Rs. ' + (regSummary?.totalRevenue ?? 0),
      icon: IndianRupee,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    }
  ];

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch('/api/registration-summary');
        const data: RegistrationSummary = await res.json();
        setRegSummary(data);
      } catch (error) {
        console.error('Error fetching registration summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) return <p className="p-4">Loading summary...</p>;
  if (!regSummary) return <p className="p-4 text-red-500">Failed to load summary.</p>;


  return (
    <div className="mb-8">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-1">All Quizzes Overview</h2>
        <p className="text-gray-600">Registration and payment statistics</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {overviewStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="p-4 bg-white border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                  <IconComponent className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default QuizOverview;
