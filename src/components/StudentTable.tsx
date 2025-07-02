/* eslint-disable @next/next/no-img-element */

"use client"
import React from 'react';
import  { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Check, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type EnrichedRegistration = {
  id: number;
  name: string;
  studentId: string;
  rollNumber: string;
  type: string;
  email: string;
  phone: string;
  regNumber: string;
  quiz: string;
  date: string;
  fee: string;
  paymentStatus: string;
  revenue: string;
  quizzes: string;
  avatar: string;
  subject:string;
  transactionReceipt:string;
};

const StudentTable = () => {
  const [students, setstudents] = useState<EnrichedRegistration[]>([]);
  const [filteredData, setFilteredData] = useState<EnrichedRegistration[]>([]);
  const [search, setSearch] = useState('');
  const [quizFilter, setQuizFilter] = useState('all-quizzes');
  const [studentTypeFilter, setStudentTypeFilter] = useState('all-students');
  const [filteredStudents, setFilteredStudents] = useState<EnrichedRegistration[]>([]);
  const router = useRouter();
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<"APPROVED" | "REJECTED" | null>(null);


  const handleViewReceipt = (url: string, studentId: string) => {
    setReceiptUrl(url);
    setSelectedStudentId(studentId);
  };

  const closeModal = () => {
    setReceiptUrl(null);
    setSelectedStudentId(null);
  };

  const handleStatusUpdate = async (status: "APPROVED" | "REJECTED") => {
    if (!selectedStudentId) return;

    setLoadingStatus(status); // Start loading

    try {
      const res =  await fetch(`/api/registrations/status?studentId=${selectedStudentId}&status=${status}`);

      if (res.ok) {
        closeModal();
        window.location.reload(); // Refresh the page or fetch again
      } else {
        console.error("Failed to update student status");
      }
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setLoadingStatus(null); // Stop loading
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Pending': { variant: 'secondary' as const, className: 'bg-orange-100 text-orange-800' },
      'Approved': { variant: 'secondary' as const, className: 'bg-green-100 text-green-800' },
      'Rejected': { variant: 'secondary' as const, className: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };


const handleDelete = async (studentId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this student?');

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        console.log("page refresh")
        window.location.reload(); // Refresh the page or fetch again
      } else {
        console.error('Failed to delete student');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      'Returning': { className: 'bg-blue-100 text-blue-800' },
      'First Time': { className: 'bg-green-100 text-green-800' }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig];
    return (
      <Badge variant="secondary" className={config.className}>
        {type}
      </Badge>
    );
  };

useEffect(() => {
  const fetchData = async () => {
    const res = await fetch('/api/registration-list');
    const data = await res.json();
    setstudents(Array.isArray(data) ? data : []); // ensure data is an array
  };
  fetchData();
}, []);


  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    const filtered = students.filter(item =>
      item.name.toLowerCase().includes(lowerSearch) ||
      item.email.toLowerCase().includes(lowerSearch) ||
      item.regNumber.toLowerCase().includes(lowerSearch) ||
      item.rollNumber.toLowerCase().includes(lowerSearch)
    );
    setFilteredStudents(filtered);
  }, [search, students]);

useEffect(() => {
  let temp = [...students];

  if (quizFilter !== 'all-quizzes') {
    if (quizFilter === 'noquizz') {
      temp = temp.filter(student => !student.subject || student.subject.trim() === 'No subject');
    } else {
      temp = temp.filter(student =>
        student.subject?.toLowerCase().includes(quizFilter.toLowerCase())
      );
    }
  }

  if (studentTypeFilter !== 'all-students') {
    temp = temp.filter(student =>
      student.type?.toString().trim() === studentTypeFilter
    );
  }

  console.log('FilteredStudents:', temp); // Debug log

  setFilteredStudents(temp);
}, [quizFilter, studentTypeFilter, students]);


const displayStudents = filteredStudents !== null && filteredStudents !== undefined ? filteredStudents : students;


//console.log(displayStudents);
  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input placeholder="Search by name, email, CNIC, or roll number..." value={search} 
            onChange={e => setSearch(e.target.value)} className="w-full"/>
        </div>
        <div className="flex gap-2">
          <Select value={quizFilter} onValueChange={setQuizFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Quizzes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-quizzes">All Quizzes</SelectItem>
              <SelectItem value="noquizz">No Quiz</SelectItem>
              <SelectItem value="mathematics">Mathematics Quiz</SelectItem>
              <SelectItem value="science">Science Quiz</SelectItem>
              <SelectItem value="english">English Quiz</SelectItem>
              <SelectItem value="history">History Quiz</SelectItem>
              <SelectItem value="geography">Geography Quiz</SelectItem>
              <SelectItem value="physics">Physics Quiz</SelectItem>
              <SelectItem value="chemistry">Chemistry Quiz</SelectItem>
              <SelectItem value="biology">Biology Quiz</SelectItem>
              <SelectItem value="computer science">Computer Science Quiz</SelectItem>
              <SelectItem value="art">Art Quiz</SelectItem>
            </SelectContent>
          </Select>
          <Select value={studentTypeFilter} onValueChange={setStudentTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Students" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-students">All Students</SelectItem>
              <SelectItem value="First Time">First Time</SelectItem>
              <SelectItem value="Returning">Returning</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Card className="bg-white">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Students ({Array.isArray(students) ? students.length : 0})</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Student</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Latest Quiz</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Payment Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Revenue</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayStudents && Array.isArray(displayStudents) && displayStudents.map((student) => (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          {student.avatar ? (
                            <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <span className="text-gray-600 font-medium">
                              {student.name.split(' ').map((n: string) => n[0]).join('')}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-600">{student.studentId}</p>
                          <p className="text-sm text-gray-500">{student.rollNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {getTypeBadge(student.type)}
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm text-gray-900">{student.email}</p>
                        <p className="text-sm text-gray-600">{student.phone}</p>
                        <p className="text-sm text-gray-500">{student.regNumber}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{student.quiz}</p>
                        <p className="text-sm font-medium text-gray-900">{student.subject}</p>
                        <p className="text-sm text-gray-600">{student.date}</p>
                        <p className="text-sm text-gray-500">{student.fee}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {student.paymentStatus === 'Pending' && student.transactionReceipt ? (
                        <div className="flex flex-col items-start">
                          <span className="text-yellow-600 font-medium">Pending</span>
                          <button
                            className="text-blue-600 underline text-sm"
                            onClick={() => handleViewReceipt(student.transactionReceipt, student.regNumber)}
                          >
                            View Image
                          </button>
                        </div>
                      ) : (
                        getStatusBadge(student.paymentStatus)
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{student.revenue}</p>
                        <p className="text-sm text-gray-600">{student.quizzes}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/list/students/${student.regNumber}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(student.studentId)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
      {receiptUrl && selectedStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
              onClick={closeModal}
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-3">Transaction Receipt</h2>
            <img
              src={receiptUrl}
              alt="Transaction Receipt"
              className="w-full max-h-80 object-contain rounded border"
            />

            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => handleStatusUpdate("REJECTED")}
                disabled={loadingStatus === "REJECTED"}
                className={`px-4 py-2 rounded ${
                  loadingStatus === "REJECTED"
                    ? "bg-red-300 text-red-800 cursor-not-allowed"
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                }`}
              >
                {loadingStatus === "REJECTED" ? "Rejecting..." : "Reject"}
              </button>

              <button
                onClick={() => handleStatusUpdate("APPROVED")}
                disabled={loadingStatus === "APPROVED"}
                className={`px-4 py-2 rounded ${
                  loadingStatus === "APPROVED"
                    ? "bg-green-300 text-green-800 cursor-not-allowed"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                {loadingStatus === "APPROVED" ? "Accepting..." : "Accept"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

    
  );
};

export default StudentTable;
