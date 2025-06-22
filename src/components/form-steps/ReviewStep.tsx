
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, GraduationCap, CreditCard } from 'lucide-react';

const ReviewStep = () => {
  const { watch } = useFormContext();
  const formData = watch();

  const formatDate = (date: Date) => {
    if (!date) return 'Not provided';
    return new Date(date).toLocaleDateString('en-GB');
  };

  const formatFileInfo = (file: File) => {
    if (!file) return 'Not uploaded';
    return `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Please review your information before submitting
        </h3>
        <p className="text-gray-600">
          Make sure all details are correct. You can go back to make changes if needed.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-700">Application Id:</span>
                <p className="text-gray-900">{formData.applicationId || 'Not provided'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Name:</span>
                <p className="text-gray-900">{formData.name.charAt(0).toLocaleUpperCase() + formData.name.slice(1) || 'Not provided'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Father/Guardian Name:</span>
                <p className="text-gray-900">{formData.fatherName.charAt(0).toLocaleUpperCase() + formData.fatherName.slice(1) || 'Not provided'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Date of Birth:</span>
                <p className="text-gray-900">{formatDate(formData.dateOfBirth)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Gender:</span>
                <p className="text-gray-900">{formData.gender.charAt(0).toLocaleUpperCase() + formData.gender.slice(1) || 'Not selected'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Religion:</span>
                <p className="text-gray-900">{formData.religion.charAt(0).toLocaleUpperCase() + formData.religion.slice(1) || 'Not selected'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">CNIC Number:</span>
                <p className="text-gray-900">{formData.cnicNumber || 'Not provided'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Roll No:</span>
                <p className="text-gray-900">{formData.rollNo || 'Not provided'}</p>
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Profile Picture:</span>
              <p className="text-gray-900">{formData.profilePicture}</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Mail className="w-5 h-5 mr-2 text-green-600" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <p className="text-gray-900">{formData.email.charAt(0).toLocaleUpperCase() + formData.email.slice(1) || 'Not provided'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Mobile Number:</span>
                <p className="text-gray-900">{formData.mobileNumber || 'Not provided'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">City:</span>
                <p className="text-gray-900">{formData.city.charAt(0).toLocaleUpperCase() + formData.city.slice(1) || 'Not provided'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">State/Province:</span>
                <p className="text-gray-900">{formData.stateProvince.charAt(0).toLocaleUpperCase() + formData.stateProvince.slice(1) || 'Not provided'}</p>
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Address:</span>
              <p className="text-gray-900">{formData.addressLine1.charAt(0).toLocaleUpperCase() + formData.addressLine1.slice(1) || 'Not provided'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Education Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <GraduationCap className="w-5 h-5 mr-2 text-purple-600" />
              Education Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium text-gray-700">Institute Name:</span>
              <p className="text-gray-900">{formData.instituteName.charAt(0).toLocaleUpperCase() + formData.instituteName.slice(1) || 'Not provided'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Olympiad Categories:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                 <p className="text-gray-900">{formData.olympiadCategory.charAt(0).toLocaleUpperCase() + formData.olympiadCategory.slice(1) || 'None selected'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <CreditCard className="w-5 h-5 mr-2 text-orange-600" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-700">Bank Name:</span>
                <p className="text-gray-900">{formData.bankName.charAt(0).toLocaleUpperCase() + formData.bankName.slice(1) || 'Not provided'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Account Title:</span>
                <p className="text-gray-900">{formData.accountTitle.charAt(0).toLocaleUpperCase() + formData.accountTitle.slice(1) || 'Not provided'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Account Number:</span>
                <p className="text-gray-900">{formData.accountNumber || 'Not provided'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Total Amount:</span>
                <p className="text-gray-900">
                  {formData.totalAmount || 'Not provided'}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Transaction ID:</span>
                <p className="text-gray-900">{formData.transactionId || 'Not provided'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Payment Date:</span>
                <p className="text-gray-900">{formatDate(formData.dateOfPayment)}</p>
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Manual Payment:  </span>
              {formData.paymentOption }
              {formData.paymentOption === 'Other' && (
                <p className="text-gray-900">{formData.otherName.charAt(0).toLocaleUpperCase() + formData.otherName.slice(1) || 'Not provided'}</p>
              )}
            </div>
            <div>
              <span className="font-medium text-gray-700">Transaction Receipt:</span>
              <p className="text-gray-900">{formData.transactionReceipt}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReviewStep;
