
import React from 'react';
import { useFormContext } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from 'lucide-react';
import "react-datepicker/dist/react-datepicker.css";
import { Textarea } from '@/components/ui/textarea';
import { v4 as uuidv4 } from 'uuid';

const PersonalInfoStep = () => {
  const { register, formState: { errors }, setValue, watch } = useFormContext();
  const dateOfBirth = watch('dateOfBirth');
  const gender = watch('gender');
  const religion = watch('religion');
  const email = watch('email');
  const confirmEmail = watch('confirmEmail');
  const status =  watch('status') || 'PENDING';

  const generateApplicationId = () => {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 15; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return result;
  };

  function uuidTo6DigitNumber() {
    const uuid = uuidv4(); // Generate UUID
    const hash = parseInt(uuid.replace(/-/g, '').slice(0, 12), 16); // Convert part of UUID to number
    const sixDigit = hash % 900000 + 100000; // Ensure 6 digits
    return sixDigit;
  }

  const applicationId = generateApplicationId();
  var rollNo = "UIN" + uuidTo6DigitNumber();

  const formatCNIC = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,5})(\d{0,7})(\d{0,1})$/);
    if (match) {
      return [match[1], match[2], match[3]].filter(Boolean).join('-');
    }
    return value;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Enter your full name"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message as string}</p>
          )}
        </div>

        {/* Father/Guardian Name */}
        <div className="space-y-2">
          <Label htmlFor="fatherName">Father/Guardian Name *</Label>
          <Input
            id="fatherName"
            {...register('fatherName')}
            placeholder="Enter father/guardian name"
            className={errors.fatherName ? 'border-red-500' : ''}
          />
          
           <Input
            id="applicationId"
            {...register('applicationId')}
            value={applicationId}
            readOnly
            className="hidden"
          />
           <Input
            id="rollNo"
            {...register('rollNo')}
            value={rollNo}
            readOnly
            className="hidden"
          />
          <Input
            id="status"
            {...register('status')}
            value={status}
            readOnly
            className="hidden"
          />
          {errors.fatherName && (
            <p className="text-sm text-red-500">{errors.fatherName.message as string}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <Label>Date of Birth *</Label>
          <div className="relative">
            <DatePicker
              selected={dateOfBirth}
              onChange={(date: Date | null) => setValue('dateOfBirth', date)}
              dateFormat="dd/MM/yyyy"
              maxDate={new Date()}
              showYearDropdown
              yearDropdownItemNumber={100}
              scrollableYearDropdown
              placeholderText="Select date of birth"
              className={`w-full px-3 py-2 border rounded-md ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'}`}
            />
            <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          {errors.dateOfBirth && (
            <p className="text-sm text-red-500">{errors.dateOfBirth.message as string}</p>
          )}
        </div>

        {/* CNIC Number */}
        <div className="space-y-2">
          <Label htmlFor="cnicNumber">CNIC/B-Form Number *</Label>
          <Input
            id="cnicNumber"
            {...register('cnicNumber')}
            placeholder="12345-1234567-1"
            onChange={(e) => {
              const formatted = formatCNIC(e.target.value);
              setValue('cnicNumber', formatted);
            }}
            className={errors.cnicNumber ? 'border-red-500' : ''}
          />
          <span className="text-xs text-gray-500">
       This number is used for verification and must be unique.
      </span>

          {errors.cnicNumber && (
            <p className="text-sm text-red-500">{errors.cnicNumber.message as string}</p>
          )}
        </div>
      </div>

      {/* Gender */}
      <div className="space-y-2">
        <Label>Gender *</Label>
        <RadioGroup
          value={gender}
          onValueChange={(value) => setValue('gender', value)}
          className="flex flex-row space-x-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="male" id="male" />
            <Label htmlFor="male">Male</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="female" id="female" />
            <Label htmlFor="female">Female</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="other" id="other" />
            <Label htmlFor="other">Other</Label>
          </div>
        </RadioGroup>
        {errors.gender && (
          <p className="text-sm text-red-500">{errors.gender.message as string}</p>
        )}
      </div>

      {/* Religion */}
      <div className="space-y-2">
        <Label>Religion *</Label>
        <Select value={religion} onValueChange={(value) => setValue('religion', value)}>
          <SelectTrigger className={errors.religion ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select religion" />
          </SelectTrigger>
          <SelectContent className='bg-white'>
            <SelectItem value="islam">Islam</SelectItem>
            <SelectItem value="christianity">Christianity</SelectItem>
            <SelectItem value="hinduism">Hinduism</SelectItem>
            <SelectItem value="sikhism">Sikhism</SelectItem>
            <SelectItem value="buddhism">Buddhism</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        {errors.religion && (
          <p className="text-sm text-red-500">{errors.religion.message as string}</p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input id="email" type="email"
          {...register('email')}
            placeholder="Enter your email address"
            className={errors.email ? 'border-red-500' : ''} />
            {errors.email && (<p className="text-sm text-red-500">{errors.email.message as string}</p>)}
      </div>

      {/* Confirm Email */}
      <div className="space-y-2">
        <Label htmlFor="confirmEmail">Confirm Email Address *</Label>
        <Input id="confirmEmail" type="email" {...register('confirmEmail')} placeholder="Confirm your email address"
          className={errors.confirmEmail ? 'border-red-500' : ''}/>
          {errors.confirmEmail && ( <p className="text-sm text-red-500">{errors.confirmEmail.message as string}</p> )}
          {email && confirmEmail && email !== confirmEmail && ( <p className="text-sm text-orange-500">Emails do not match</p>
        )}
      </div>

      {/* Mobile Number */}
      <div className="space-y-2">
        <Label htmlFor="mobileNumber">Mobile Number *</Label>
          <Input id="mobileNumber" type="tel" {...register('mobileNumber')}
            placeholder="+92 300 1234567" className={errors.mobileNumber ? 'border-red-500' : ''} />
            {errors.mobileNumber && ( <p className="text-sm text-red-500">{errors.mobileNumber.message as string}</p>)}
      </div>

      {/* City */}
      <div className="space-y-2">
        <Label htmlFor="city">City *</Label>
          <Input id="city" {...register('city')} placeholder="Enter your city" className={errors.city ? 'border-red-500' : ''}/>
          {errors.city && ( <p className="text-sm text-red-500">{errors.city.message as string}</p> )}
      </div>
      </div>
      {/* Address Line 1 */}
      <div className="space-y-2">
        <Label htmlFor="addressLine1">Address Line 1 *</Label>
        <Textarea
          id="addressLine1"
          {...register('addressLine1')}
          placeholder="Enter your complete address"
          className={errors.addressLine1 ? 'border-red-500' : ''}
          rows={3}
        />
        {errors.addressLine1 && (
          <p className="text-sm text-red-500">{errors.addressLine1.message as string}</p>
        )}
      </div>

      {/* State/Province */}
      <div className="space-y-2">
        <Label htmlFor="stateProvince">State / Province / Region *</Label>
        <Input
          id="stateProvince"
          {...register('stateProvince')}
          placeholder="Enter your state/province"
          className={errors.stateProvince ? 'border-red-500' : ''}
        />
        {errors.stateProvince && (
          <p className="text-sm text-red-500">{errors.stateProvince.message as string}</p>
        )}
      </div>
    </div>
  );
};

export default PersonalInfoStep;
