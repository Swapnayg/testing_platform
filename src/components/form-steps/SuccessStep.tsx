
import React, { useRef } from "react";
import { motion } from 'framer-motion';
import { useFormContext } from 'react-hook-form';
import { CheckCircle, Download, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const SuccessStep = () => {

  const divRef = useRef<HTMLDivElement>(null);
  const { watch } = useFormContext();
  const formData = watch();


  const handleDownloadReceipt = async () => {
    // In a real application, this would generate and download a PDF receipt
    const element = divRef.current;

    if (!element) {
      return;
    }

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save("download.pdf");

  };


  return (
    <div className="text-center space-y-6" >
      <div ref={divRef} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
      >
        <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Registration Successful!
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Thank you for registering for the Great Future Talent Olympiad
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="max-w-md mx-auto mb-6 shadow-md border border-gray-200">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Application Confirmation
            </h3>

            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-600">Application ID:</span>
                <span className="font-medium">{formData.applicationId || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-medium">Submitted</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">
                  {new Date().toLocaleDateString('en-GB')}
                </span>
              </div>
            </div>

            <div className="border-t pt-4 mt-4 space-y-2 text-sm text-gray-700">
              <h4 className="font-semibold text-gray-800">Login Credentials</h4>
              <div className="flex justify-between">
                <span className="text-gray-600">Username:</span>
                <span className="font-medium">{formData.rollNo || 'Not generated'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Password:</span>
                <span className="font-medium">{formData.cnicNumber || 'Not generated'}</span>
              </div>
            </div>

            <div className="pt-4 border-t mt-4 text-sm text-gray-700">
              <p>
                Please log in to the <span className="font-medium text-gray-900">Student Portal</span> to view your profile, exam details, and more.
              </p>
              <a
                href="https://app.secondsweb.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-blue-600 font-medium hover:underline"
              >
                Go to Student Portal &rarr;
              </a>
            </div>
          </CardContent>
        </Card>

      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="space-y-4"
      >
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Whats Next?</h4>
          <ul className="text-sm text-blue-800 space-y-1 text-left">
            <li>• You will receive a confirmation email within 24 hours</li>
            <li>• Our team will verify your payment and documents</li>
            <li>• Olympiad schedule will be sent via email</li>
            <li>• Keep your application ID for future reference</li>
          </ul>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-sm text-gray-500"
      >
        <p>
          If you have any questions, please contact us at{' '}
          <a href="mailto:info@greatfuturetalent.com" className="text-blue-600 hover:underline">
            info@greatfuturetalent.com
          </a>
        </p>
      </motion.div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button type="button" onClick={handleDownloadReceipt} variant="outline" className="flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Download Receipt
          </Button>
      </div>
    </div>
  );
};

export default SuccessStep;
