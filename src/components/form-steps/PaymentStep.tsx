
import React from 'react';
import { useFormContext } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Calendar } from 'lucide-react';
import { CldUploadWidget } from "next-cloudinary";
import "react-datepicker/dist/react-datepicker.css";

const PaymentStep = () => {
  const { register, formState: { errors }, setValue, watch } = useFormContext();
  const dateOfPayment = watch('dateOfPayment');
  const transactionReceipt = watch('transactionReceipt');
  const paymentOption = watch('paymentOption') || '';

  const payOptions = [
    'Easypaisa',
    'JazzCash',
    'ATM Transfer',
    'Online Bank Transfer',
    'RAAST ID',
    'Other'
  ];

  const handlePaymentChange = (payment: string, checked: boolean) => {
    setValue('paymentOption', checked ? payment : '');
  };



  return (
    <div className="space-y-6">
      {/* Payment Option Manual */}
      <div className="space-y-2">
          <Label>Select Great Future Talent Olympiad Category *</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border rounded-lg">
          {payOptions.map((payment) => (
            <div key={payment} className="flex items-center space-x-2">
              <Checkbox
                id={payment}
                checked={paymentOption === payment}
                onCheckedChange={(checked) => handlePaymentChange(payment, checked as boolean)}
              />
              <Label htmlFor={payment} className="text-sm font-normal cursor-pointer">
                {payment}
              </Label>
            </div>
                    ))}
            </div>
          {errors.paymentOption && (
          <p className="text-sm text-red-500">{errors.paymentOption.message as string}</p>
        )}

      </div>
      {paymentOption !== '' && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Other Name */}
        {paymentOption === 'Other' && (
        <div className="space-y-2">
          <Label htmlFor="otherName">Others *</Label>
          <Input
            id="otherName"
            {...register('otherName')}
            placeholder="Enter Other name"
            className={errors.otherName ? 'border-red-500' : ''}
          />
          {errors.otherName && (
            <p className="text-sm text-red-500">{errors.otherName.message as string}</p>
          )}
        </div>
        )}
        {/* Bank Name */}
        <div className="space-y-2">
          <Label htmlFor="bankName">Bank Name *</Label>
          <Input
            id="bankName"
            value="Bank of Punjab"
            {...register('bankName')}
            placeholder="Enter bank name"
            className={errors.bankName ? 'border-red-500' : ''} readOnly
          />
          {errors.bankName && (
            <p className="text-sm text-red-500">{errors.bankName.message as string}</p>
          )}
        </div>

        {/* Bank Account Title */}
        <div className="space-y-2">
          <Label htmlFor="accountTitle">Bank Account Title *</Label>
          <Input
            id="accountTitle"
            value="Great Future (SMC) Private Limited"
            {...register('accountTitle')}
            readOnly
            placeholder="Enter account holder name"
            className={errors.accountTitle ? 'border-red-500' : ''}
          />
          {errors.accountTitle && (
            <p className="text-sm text-red-500">{errors.accountTitle.message as string}</p>
          )}
        </div>

        {/* Bank Account Number */}
        <div className="space-y-2">
          <Label htmlFor="accountNumber">Bank Account Number *</Label>
          <Input
            id="accountNumber"
            value="6020293165600018"
            {...register('accountNumber')}
            placeholder="Enter account number"
            readOnly
            className={errors.accountNumber ? 'border-red-500' : ''}
          />
          {errors.accountNumber && (
            <p className="text-sm text-red-500">{errors.accountNumber.message as string}</p>
          )}
        </div>

        {/* Total Amount */}
        <div className="space-y-2">
          <Label htmlFor="totalAmount">Total Amount *</Label>
          <Input
            id="totalAmount"
            value="Rs 330/-"
            {...register('totalAmount')}
            placeholder="Enter total amount"
            readOnly
            className={errors.totalAmount ? 'border-red-500' : ''}
          />
          {errors.totalAmount && (
            <p className="text-sm text-red-500">{errors.totalAmount.message as string}</p>
          )}
        </div>

        {/* Transaction ID */}
        <div className="space-y-2">
          <Label htmlFor="transactionId">Transaction ID/Reference Number *</Label>
          <Input
            id="transactionId"
            {...register('transactionId')}
            placeholder="Enter transaction ID"
            className={errors.transactionId ? 'border-red-500' : ''}
          />
          {errors.transactionId && (
            <p className="text-sm text-red-500">{errors.transactionId.message as string}</p>
          )}
        </div>

        {/* Date of Payment */}
        <div className="space-y-2">
          <Label>Date of Payment *</Label>
          <div className="relative">
            <DatePicker
              selected={dateOfPayment}
              onChange={(date: Date | null) => setValue('dateOfPayment', date)}
              dateFormat="dd/MM/yyyy"
              maxDate={new Date()}
              placeholderText="Select payment date"
              className={`w-full px-3 py-2 border rounded-md ${errors.dateOfPayment ? 'border-red-500' : 'border-gray-300'}`}
            />
            <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          {errors.dateOfPayment && (
            <p className="text-sm text-red-500">{errors.dateOfPayment.message as string}</p>
          )}
        </div>
      </div>
      )}
      {/* Transaction Receipt Upload */}
      <div className="space-y-2">
        <Label>Upload Transaction Receipt/Screenshot *</Label>
        <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="space-y-2">
               <CldUploadWidget
                  uploadPreset="school"
                  onSuccess={(result: { info: { url?: string } } | any, { widget }) => {
                  const url = typeof result.info === 'object' && 'url' in result.info ? result.info.url : '';
                    setValue('transactionReceipt', url);
                    widget.close();
                  }}
                >
                  {({ open }) => {
                    return (
                      <div className="text-xs text-gray-500 items-center justify-center gap-2 cursor-pointer"
                        onClick={() => open()}>
                          <Label htmlFor="transactionReceipt" className="cursor-pointer">
                            <span className="text-blue-600 hover:text-blue-500">
                              Click to upload
                            </span>
                            <span className="text-gray-600"> or drag and drop</span>
                            </Label>
                            <p className="text-xs text-gray-500 mt-2">
                              PNG, JPG, GIF up to 10MB
                            </p>
                          </div>
                          );
                        }}
                      </CldUploadWidget>
              </div>
              {transactionReceipt && (
                <p className="text-sm text-green-600 mt-2">
                  File selected: {transactionReceipt}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        {errors.transactionReceipt && (
          <p className="text-sm text-red-500">{errors.transactionReceipt.message as string}</p>
        )}
      </div>
    </div>
  );
};

export default PaymentStep;
