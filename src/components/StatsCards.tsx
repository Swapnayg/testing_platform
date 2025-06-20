"use client"
import React from 'react';
import  { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Users, UserPlus, TrendingUp, Clock, CheckCircle, IndianRupee } from 'lucide-react';

type Summary = {
  totalUniqueStudents: number;
  firstTimeStudents: number;
  repeatedStudents: number;
  approvedPayments: number;
  pendingPayments: number;
  totalRevenue: number;
};



const StatsCards = () => {
  
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  const stats = [
    {
      title: 'Total Students',
      value: summary?.totalUniqueStudents,
      icon: Users,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'First Time Students',
      value: summary?.firstTimeStudents,
      icon: UserPlus,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Returning Students',
      value: summary?.repeatedStudents,
      icon: TrendingUp,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Pending Payments',
      value: summary?.pendingPayments,
      icon: Clock,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600'
    },
    {
      title: 'Approved Payments',
      value: summary?.approvedPayments,
      icon: CheckCircle,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Total Revenue',
      value: 'Rs. ' + (summary?.totalRevenue ?? 0),
      icon: IndianRupee,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    }
  ];

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch('/api/student-summary');
        const data = await res.json();
        setSummary(data);

        setSummary(data);
      } catch (error) {
        console.error('Error fetching summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);
  if (loading) return <p>Loading summary...</p>;
  if (!summary) return <p>Failed to load summary.</p>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      {stats.map((stat, index) => {
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
  );
};

export default StatsCards;
