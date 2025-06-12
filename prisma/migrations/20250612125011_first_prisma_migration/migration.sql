/*
  Warnings:

  - A unique constraint covering the columns `[examId,studentId]` on the table `Result` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Result_examId_studentId_key` ON `Result`(`examId`, `studentId`);
