// app/api/student/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req, { params }) {
    console.log(params);
  const student = await prisma.student.findFirst({
    where: { rollNo: params.id.toString().toUpperCase() },
  });
  return NextResponse.json(student);
}

export async function PUT(req, { params }) {
  const formData = await req.formData();

  const fields = Object.fromEntries(formData.entries());
  await prisma.student.update({
    where: { id: params.id },
    data: {
      name: fields.name,
      fatherName: fields.fatherName,
      dateOfBirth: new Date(fields.dateOfBirth),
      religion: fields.religion,
      gender: fields.gender,
      cnicNumber: fields.cnicNumber,
      email: fields.email,
      mobileNumber: fields.mobileNumber,
      city: fields.city,
      stateProvince: fields.stateProvince,
      addressLine1: fields.addressLine1,
      instituteName: fields.instituteName,
      others: fields.others,
      rollNo: fields.rollNo,
      profilePicture: fields.profilePicture,
    },
  });

  return NextResponse.json({ success: true });
}
