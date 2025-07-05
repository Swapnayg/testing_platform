/*
  Warnings:

  - You are about to drop the `_QuizGrades` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_QuizGrades` DROP FOREIGN KEY `_QuizGrades_A_fkey`;

-- DropForeignKey
ALTER TABLE `_QuizGrades` DROP FOREIGN KEY `_QuizGrades_B_fkey`;

-- AlterTable
ALTER TABLE `quizzes` ADD COLUMN `grades` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `_QuizGrades`;
