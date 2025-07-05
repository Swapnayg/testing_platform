/*
  Warnings:

  - You are about to drop the `_GradeToQuiz` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_GradeToQuiz` DROP FOREIGN KEY `_GradeToQuiz_A_fkey`;

-- DropForeignKey
ALTER TABLE `_GradeToQuiz` DROP FOREIGN KEY `_GradeToQuiz_B_fkey`;

-- DropTable
DROP TABLE `_GradeToQuiz`;

-- CreateTable
CREATE TABLE `_QuizGrades` (
    `A` INTEGER NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_QuizGrades_AB_unique`(`A`, `B`),
    INDEX `_QuizGrades_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_QuizGrades` ADD CONSTRAINT `_QuizGrades_A_fkey` FOREIGN KEY (`A`) REFERENCES `Grade`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_QuizGrades` ADD CONSTRAINT `_QuizGrades_B_fkey` FOREIGN KEY (`B`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
