/*
  Warnings:

  - You are about to drop the column `grade` on the `quizzes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `quizzes` DROP COLUMN `grade`;

-- CreateTable
CREATE TABLE `_GradeToQuiz` (
    `A` INTEGER NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_GradeToQuiz_AB_unique`(`A`, `B`),
    INDEX `_GradeToQuiz_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_GradeToQuiz` ADD CONSTRAINT `_GradeToQuiz_A_fkey` FOREIGN KEY (`A`) REFERENCES `Grade`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GradeToQuiz` ADD CONSTRAINT `_GradeToQuiz_B_fkey` FOREIGN KEY (`B`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
