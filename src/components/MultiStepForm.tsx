"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, User, FileText, CreditCard, Eye } from 'lucide-react';
import PersonalInfoStep from './form-steps/PersonalInfoStep';
import ContactInfoStep from './form-steps/ContactInfoStep';
import EducationStep from './form-steps/EducationStep';
import PaymentStep from './form-steps/PaymentStep';
import ReviewStep from './form-steps/ReviewStep';
import SuccessStep from './form-steps/SuccessStep';
import { useFormState } from "react-dom";
import {createRegistration} from "@/lib/actions";
import Swal from 'sweetalert2';


// Validation schemas for each step
const personalInfoSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  fatherName: z.string().min(2, 'Father/Guardian name is required'),
  dateOfBirth: z.date({ required_error: 'Date of birth is required' }),
  gender: z.enum(['male', 'female', 'other'], { required_error: 'Please select gender' }),
  religion: z.string().min(1, 'Please select religion'),
  cnicNumber: z.string().regex(/^\d{5}-\d{7}-\d{1}$/, 'CNIC must be in format 12345-1234567-1'),
  status:z.enum(['PENDING', 'APPROVED', 'REJECTED']).default('PENDING'),
  applicationId: z.string().min(2, 'ApplicationId is required'),
  rollNo: z.string().min(2, 'Roll number is required'),
});

const baseContactInfoSchema = z.object({
  email: z.string().email('Invalid email format'),
  confirmEmail: z.string().email('Invalid email format'),
  mobileNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid mobile number'),
  addressLine1: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  stateProvince: z.string().min(2, 'State/Province is required'),
});

const contactInfoSchema = baseContactInfoSchema.refine((data) => data.email === data.confirmEmail, {
  message: "Emails don't match",
  path: ["confirmEmail"],
});

const educationSchema = z.object({
  profilePicture:z.string().min(2, 'Profile Picture is required'),
  instituteName: z.string().min(2, 'Institute name is required'),
  olympiadCategory: z.string().min(2, 'Olympiad category is required'),
  catGrade: z.string().min(2, 'Class is required'),
});

const paymentSchema = z.object({
  otherName: z.string().min(2, 'Other payment option is required'),
  bankName: z.string().min(2, 'Bank name is required'),
  accountTitle: z.string().min(2, 'Account title is required'),
  accountNumber: z.string().min(10, 'Account number must be at least 10 digits'),
  totalAmount: z.string().min(2, 'Amount is required'),
  transactionId: z.string().min(5, 'Transaction ID is required'),
  dateOfPayment: z.date({ required_error: 'Payment date is required' }), 
  paymentOption:  z.string().min(5, 'Payment Option is required'),
  transactionReceipt:z.string().min(2, 'Transaction Receipt is required'),
});



// Create the final schema by merging the base schemas and then applying refinement
export const formSchema = personalInfoSchema
  .merge(baseContactInfoSchema)
  .merge(educationSchema)
  .merge(paymentSchema)
  .refine((data) => data.email === data.confirmEmail, {
    message: "Emails don't match",
    path: ["confirmEmail"],
  });

type FormData = z.infer<typeof formSchema>;

const steps = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Education', icon: FileText },
  { id: 3, title: 'Payment', icon: CreditCard },
  { id: 4, title: 'Review', icon: Eye },
  { id: 5, title: 'Success', icon: CheckCircle },
];

const MultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, settype] = useState("create");

  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      olympiadCategory: '',
      paymentOption: '',
    },
  });

  const { handleSubmit, trigger } = methods;

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;
  const nextStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ['name', 'fatherName', 'dateOfBirth', 'gender', 'religion', 'cnicNumber','email', 'confirmEmail', 'mobileNumber', 'addressLine1', 'city', 'stateProvince'];
        break;
      case 2:
        fieldsToValidate = ['instituteName', 'olympiadCategory', 'catGrade', 'profilePicture'];
        break;
      case 3:
        if( methods.getValues('paymentOption').toString().trim() === "Other") {
          fieldsToValidate = ['bankName', 'accountTitle', 'accountNumber', 'totalAmount', 'transactionId', 'dateOfPayment', 'otherName', 'transactionReceipt','paymentOption'];
        }
        else
        {
          fieldsToValidate = ['bankName', 'accountTitle', 'accountNumber', 'totalAmount', 'transactionId', 'dateOfPayment', 'transactionReceipt','paymentOption'];
        }
        
        break;
    }
    
    const isStepValid = await trigger(fieldsToValidate);
    
    if (isStepValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };


  const handleSubmit1 = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    const formData  = methods.getValues();
    console.log(formData);
    setIsSubmitting(true);
    const res = await createRegistration({
      ...formData,
      registerdAt: new Date()
    })
    if (res.success) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSubmitting(false);
      setCurrentStep(5); 
    }
    else
    {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "You have already registered with us please login!",
      });
      setIsSubmitting(false);
    }
   // Go to success step
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep />;
      case 2:
        return <EducationStep />;
      case 3:
        return <PaymentStep />;
      case 4:
        return <ReviewStep />;
      case 5:
        return <SuccessStep />;
      default:
        return <PersonalInfoStep />;
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-white from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Great Future Talent Olympiad Registration
            </h1>
            <p className="text-gray-600">
              Complete your registration in {steps.length - 1} simple steps
            </p>
          </div>

          {/* Progress Bar */}
          {currentStep < 5 && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                {steps.slice(0, -1).map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  
                  return (
                    <div key={step.id} className="flex flex-col items-center">
                      <div
                        className={`
                          w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300
                          ${isCompleted ? 'bg-green-500 text-white' : 
                            isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}
                        `}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <span className={`text-xs font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                        {step.title}
                      </span>
                    </div>
                  );
                })}
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Form Content */}
          <form  onSubmit={handleSubmit1}>
            <Card className="shadow-lg p-6">
              <CardContent>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -50, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderStep()}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            {currentStep < 5 && (
              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="px-8 bg-gray-300 text-gray-700 hover:bg-gray-400 disabled:opacity-50"
                >
                  Back
                </Button>
             
                {currentStep <= 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="px-8 bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </FormProvider>
  );
};

export default MultiStepForm;
