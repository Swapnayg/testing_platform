-- AlterTable
ALTER TABLE `Result` ADD COLUMN `answeredQuestions` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `correctAnswers` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `quizAttemptId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Result` ADD CONSTRAINT `Result_quizAttemptId_fkey` FOREIGN KEY (`quizAttemptId`) REFERENCES `quiz_attempts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
