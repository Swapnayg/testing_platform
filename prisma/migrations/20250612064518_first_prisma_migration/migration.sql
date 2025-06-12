/*
  Warnings:

  - A unique constraint covering the columns `[examId]` on the table `quizzes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `quizzes_examId_key` ON `quizzes`(`examId`);
