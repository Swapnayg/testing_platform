/*
  Warnings:

  - A unique constraint covering the columns `[quizId,studentId]` on the table `quiz_attempts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `quiz_attempts_quizId_studentId_key` ON `quiz_attempts`(`quizId`, `studentId`);
