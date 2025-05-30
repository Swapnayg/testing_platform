
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const ContactInfoStep = () => {
  const { register, formState: { errors }, watch } = useFormContext();
  const email = watch('email');
  const confirmEmail = watch('confirmEmail');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="Enter your email address"
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message as string}</p>
          )}
        </div>

        {/* Confirm Email */}
        <div className="space-y-2">
          <Label htmlFor="confirmEmail">Confirm Email Address *</Label>
          <Input
            id="confirmEmail"
            type="email"
            {...register('confirmEmail')}
            placeholder="Confirm your email address"
            className={errors.confirmEmail ? 'border-red-500' : ''}
          />
          {errors.confirmEmail && (
            <p className="text-sm text-red-500">{errors.confirmEmail.message as string}</p>
          )}
          {email && confirmEmail && email !== confirmEmail && (
            <p className="text-sm text-orange-500">Emails do not match</p>
          )}
        </div>

        {/* Mobile Number */}
        <div className="space-y-2">
          <Label htmlFor="mobileNumber">Mobile Number *</Label>
          <Input
            id="mobileNumber"
            type="tel"
            {...register('mobileNumber')}
            placeholder="+92 300 1234567"
            className={errors.mobileNumber ? 'border-red-500' : ''}
          />
          {errors.mobileNumber && (
            <p className="text-sm text-red-500">{errors.mobileNumber.message as string}</p>
          )}
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            {...register('city')}
            placeholder="Enter your city"
            className={errors.city ? 'border-red-500' : ''}
          />
          {errors.city && (
            <p className="text-sm text-red-500">{errors.city.message as string}</p>
          )}
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

export default ContactInfoStep;
