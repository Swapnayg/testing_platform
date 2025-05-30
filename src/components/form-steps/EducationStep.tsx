
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

const EducationStep = () => {
  const { register, formState: { errors }, setValue, watch } = useFormContext();
  const olympiadCategory = watch('olympiadCategory');
  const gradeOptions = watch('gradeOptions') || ['1st','2nd','3rd','4th','5th','6th','7th','8th',];
  const profilePicture = watch('profilePicture');
  const catGrade = watch('catGrade');

  const categories = [
    'Category-I',
    'Category-II',
    'Category-III',
    'Category-IV',
  ];

  const handleCategoryChange = (category: string, checked: boolean) => {
    setValue('olympiadCategory', checked ? category : '');
    if(category == 'Category-I') {
      setValue('gradeOptions', ['1st', '2nd', '3rd', '4th', '5th','6th', '7th', '8th']);
    }
    else if(category == 'Category-II'){
      setValue('gradeOptions', ['9th', '10th', 'O-Levels', 'IGCSE']);
    }
    else if(category == 'Category-III'){
      setValue('gradeOptions', ['11th', '12th', 'A-Levels', 'IGCSE-1', 'IGCSE-2', 'DAE']);
    }
    else if(category == 'Category-IV'){
      setValue('gradeOptions', ['Undergraduate', 'ADP', 'Bachelors', 'Masters/M.Phil', 'Others']);
    }
  };

  return (
    <div className="space-y-6">
      {/* Institute Name */}
      <div className="space-y-2">
        <Label htmlFor="instituteName">Institute Name *</Label>
        <Input
          id="instituteName"
          {...register('instituteName')}
          placeholder="Enter your school/college/university name"
          className={errors.instituteName ? 'border-red-500' : ''}
        />
        {errors.instituteName && (
          <p className="text-sm text-red-500">{errors.instituteName.message as string}</p>
        )}
      </div>

      {/* Olympiad Categories */}
      <div className="space-y-2">
        <Label>Select Great Future Talent Olympiad Category *</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border rounded-lg">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={olympiadCategory === category}
                onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
              />
              <Label htmlFor={category} className="text-sm font-normal cursor-pointer">
                {category}
              </Label>
            </div>
          ))}
        </div>
        {errors.olympiadCategory && (
          <p className="text-sm text-red-500">{errors.olympiadCategory.message as string}</p>
        )}
      </div>
      {/* Category Grades */}
      {olympiadCategory !== '' && (
      <div className="space-y-2">
        <Label>Select Class/Grade *</Label>
        <Select value={catGrade} onValueChange={(value) => setValue('catGrade', value)}>
          <SelectTrigger className={errors.catGrade ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select Your Class" />
          </SelectTrigger>
          <SelectContent className='bg-white'>
            {gradeOptions.map((grade: string) => (
              <SelectItem key={grade} value={grade}>
                {grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.catGrade && (
          <p className="text-sm text-red-500">{errors.catGrade.message as string}</p>
        )}
      </div>
      )}
      {/* Profile Picture Upload */}
      <div className="space-y-2">
        <Label>Upload Your Picture</Label>
        <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors">
          <CardContent className="p-6">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <CldUploadWidget
                        uploadPreset="school"
                        onSuccess={(result: { info: { url?: string } } | any, { widget }) => {
                          const url = typeof result.info === 'object' && 'url' in result.info ? result.info.url : '';
                          setValue('profilePicture', url);
                          widget.close();
                        }}
                      >
                        {({ open }) => {
                          return (
                            <div
                              className="text-xs text-gray-500 items-center justify-center gap-2 cursor-pointer"
                              onClick={() => open()}
                            >
                              <Label htmlFor="profilePicture" className="cursor-pointer">
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

              {profilePicture && (
                <p className="text-sm text-green-600 mt-2">
                  File selected: {profilePicture}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
         {errors.profilePicture && (
            <p className="text-sm text-red-500">{errors.profilePicture.message as string}</p>
        )}
      </div>
    </div>
  );
};

export default EducationStep;
