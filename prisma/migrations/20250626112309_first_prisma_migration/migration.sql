/*
  Warnings:

  - You are about to drop the column `gradeId` on the `Exam` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Exam` DROP FOREIGN KEY `Exam_gradeId_fkey`;

-- DropIndex
DROP INDEX `Exam_gradeId_fkey` ON `Exam`;

-- AlterTable
ALTER TABLE `Exam` DROP COLUMN `gradeId`;

-- CreateTable
CREATE TABLE `_ExamToGrade` (
    `A` VARCHAR(191) NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ExamToGrade_AB_unique`(`A`, `B`),
    INDEX `_ExamToGrade_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_ExamToGrade` ADD CONSTRAINT `_ExamToGrade_A_fkey` FOREIGN KEY (`A`) REFERENCES `Exam`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ExamToGrade` ADD CONSTRAINT `_ExamToGrade_B_fkey` FOREIGN KEY (`B`) REFERENCES `Grade`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
