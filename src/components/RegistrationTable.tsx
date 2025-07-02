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
  status?:string;
}

export default function RegistrationTable({ registrations }: { registrations: Registration[] }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-100 rounded-xl shadow-md">

      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-indigo-100 text-indigo-800 font-medium">
            <tr>
              <th className="p-3 border">Category</th>
              <th className="p-3 border">Grade</th>
              <th className="p-3 border">Payment Option</th>
              <th className="p-3 border">Other Name</th>
              <th className="p-3 border">Trans-ID</th>
              <th className="p-3 border">Amount</th>
              <th className="p-3 border">Paid On</th>
              <th className="p-3 border">Receipt</th>
              <th className="p-3 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((reg, index) => (
              <tr
                key={reg.id}
                className={`text-center ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-purple-50 transition`}
              >
                <td className="p-2 border">{reg.olympiadCategory}</td>
                <td className="p-2 border">{reg.catGrade}</td>
                <td className="p-2 border">{reg.paymentOption}</td>
                <td className="p-2 border capitalize">{reg.otherName}</td>
                <td className="p-2 border">{reg.transactionId}</td>
                <td className="p-2 border font-semibold text-green-600">₹{reg.totalAmount}</td>
                <td className="p-2 border">
                  {new Date(reg.dateOfPayment).toLocaleDateString("en-GB")}
                </td>
                <td className="p-2 border">
                  {reg.transactionReceipt ? (
                    <button
                      onClick={() => setSelectedImage(reg.transactionReceipt!)}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      View
                    </button>
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </td>
                <td
                  className={`p-2 border font-medium ${
                    reg.status === "APPROVED"
                      ? "text-green-600"
                      : reg.status === "REJECTED"
                      ? "text-red-500"
                      : "text-yellow-600"
                  }`}
                >
                  {reg.status?.toUpperCase()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg relative max-w-lg w-full shadow-lg">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
            >
              ✕
            </button>
            <img
              src={selectedImage}
              alt="Receipt"
              className="w-full max-h-[70vh] object-contain rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
}
