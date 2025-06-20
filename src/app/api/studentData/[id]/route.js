// app/api/student/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req, { params }) {
  const student = await prisma.student.findFirst({
    where: { rollNo: params.id.toString().toUpperCase() },
  });
  return NextResponse.json(student);
}


export async function POST(req, { params }) {
  try {
    const formData = await req.formData();
    const fields = Object.fromEntries(formData.entries());

    await prisma.student.update({
      where: { cnicNumber: fields.cnicNumber },
      data: {
        name: fields.name,
        fatherName: fields.fatherName,
        dateOfBirth: new Date(fields.dateOfBirth),
        religion: fields.religion,
        gender: fields.gender,
        email: fields.email,
        mobileNumber: fields.mobileNumber,
        city: fields.city,
        stateProvince: fields.stateProvince,
        addressLine1: fields.addressLine1,
        instituteName: fields.instituteName,
        profilePicture: fields.profilePicture,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update student:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

