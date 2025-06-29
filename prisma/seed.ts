import { User } from 'lucide-react';
import {PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { UserRole } from '@prisma/client';

async function main() {
  // ADMIN

  await prisma.admin.create({
    data: {
      id: "admin",
      username: "admin",
    },
  });

  await prisma.user.create({
    data: {
      name: "admin",
      role: UserRole.admin, // ✅ Use enum reference
    },
  });

  await prisma.category.create({
    data: {
      id: 1,
      catName: "Category-I",
    },
  });

  await prisma.category.create({
    data: {
      id: 2,
      catName: "Category-II",
    },
  });

  await prisma.category.create({
    data: {
      id: 3,
      catName: "Category-III",
    },
  });
  await prisma.category.create({
    data: {
      id: 4,
      catName: "Category-IV",
    },
  });

  await prisma.grade.create({
    data: {
      level: "1st",
      categoryId: 1,
    },
  });
  await prisma.grade.create({
    data: {
      level: "2nd",
      categoryId: 1,
    },
  });
  await prisma.grade.create({
    data: {
      level: "3rd",
      categoryId: 1,
    },
  });

  // GRADE
  for (let i = 4; i <= 8; i++) {
    await prisma.grade.create({
      data: {
        level: `${i}th`,
        categoryId: 1,
      },
    });
  }
  await prisma.grade.create({
    data: {
      level: "9th",
      categoryId: 2,
    },
  });

  await prisma.grade.create({
    data: {
      level: "10th",
      categoryId: 2,
    },
  });

  await prisma.grade.create({
    data: {
      level: "O-Levels",
      categoryId: 2,
    },
  });

  await prisma.grade.create({
    data: {
      level: "IGCSE",
      categoryId: 2,
    },
  });

  await prisma.grade.create({
    data: {
      level: "11th",
      categoryId: 3,
    },
  });

  await prisma.grade.create({
    data: {
      level: "12th",
      categoryId: 3,
    },
  });

  await prisma.grade.create({
    data: {
      level: "A-Levels",
      categoryId: 3,
    },
  });

  await prisma.grade.create({
    data: {
      level: "IGCSE-1",
      categoryId: 3,
    },
  });

  await prisma.grade.create({
    data: {
      level: "IGCSE-2",
      categoryId: 3,
    },
  });

  await prisma.grade.create({
    data: {
      level: "DAE",
      categoryId: 3,
    },
  });

  await prisma.grade.create({
    data: {
      level: "Undergraduate",
      categoryId: 4,
    },
  });

  await prisma.grade.create({
    data: {
      level: "ADP",
      categoryId: 4,
    },
  });

  await prisma.grade.create({
    data: {
      level: "Bachelors",
      categoryId: 4,
    },
  });

  await prisma.grade.create({
    data: {
      level: "Masters/M.Phil",
      categoryId: 4,
    },
  });

  await prisma.grade.create({
    data: {
      level: "Others",
      categoryId: 4,
    },
  });

  // SUBJECT
  const subjectData = [
    { name: "Mathematics" },
    { name: "Science" },
    { name: "English" },
    { name: "History" },
    { name: "Geography" },
    { name: "Physics" },
    { name: "Chemistry" },
    { name: "Biology" },
    { name: "Computer Science" },
    { name: "Art" },
  ];

  for (const subject of subjectData) {
    await prisma.subject.create({ data: subject });
  }




  console.log("Seeding completed successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
