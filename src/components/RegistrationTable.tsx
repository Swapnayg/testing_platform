/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import {updateReject, updateAccept} from "@/lib/actions";

interface Registration {
  id: number;
  olympiadCategory?: string;
  catGrade?: string;
  paymentOption?: string;
  otherName?: string;
  transactionId?: string;
  totalAmount?: string;
  dateOfPayment: string;
  transactionReceipt?: string;
}

export default function RegistrationTable({ registrations }: { registrations: Registration[] }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleAccept = async (id: number) => {
    const res = await updateAccept(id)
    console.log(res)
    if(res && res.success)
    {
        window.location.reload(); 
    }
  };

  const handleReject = async (id: number) => {
    const res = await updateReject(id)
    if(res && res.success)
    {
        window.location.reload(); 
    }
  };

  return (
    <div className="p-4">
      <table className="w-full border border-gray-200 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Category</th>
            <th className="p-2 border">Grade</th>
            <th className="p-2 border">Payment Option</th>
            <th className="p-2 border">Other Name</th>
            <th className="p-2 border">Trans-ID</th>
            <th className="p-2 border">Amount</th>
            <th className="p-2 border">Paid On</th>
            <th className="p-2 border">Receipt</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((reg) => (
            <tr key={reg.id} className="even:bg-gray-50 text-center">
              <td className="p-2 border">{reg.olympiadCategory}</td>
              <td className="p-2 border">{reg.catGrade}</td>
              <td className="p-2 border">{reg.paymentOption}</td>
              <td className="p-2 border capitalize">{reg.otherName}</td>
              <td className="p-2 border">{reg.transactionId}</td>
              <td className="p-2 border">{reg.totalAmount}</td>
              <td className="p-2 border">{new Date(reg.dateOfPayment).toLocaleDateString()}</td>
              <td className="p-2 border">
                {reg.transactionReceipt ? (
                  <button
                    onClick={() => setSelectedImage(reg.transactionReceipt!)}
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    View Receipt
                  </button>
                ) : (
                  'N/A'
                )}
              </td>
              <td className="p-2 border flex gap-2 justify-center">
                <button
                  onClick={() => handleAccept(reg.id)}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleReject(reg.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg relative max-w-lg w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              ✕
            </button>
            <img src={selectedImage} alt="Receipt" className="w-full max-h-[70vh] object-contain rounded" />
          </div>
        </div>
      )}
    </div>
  );
}
