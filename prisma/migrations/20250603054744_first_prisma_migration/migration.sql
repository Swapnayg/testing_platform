/*
  Warnings:

  - You are about to drop the column `examId` on the `Registration` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Registration` DROP FOREIGN KEY `Registration_examId_fkey`;

-- AlterTable
ALTER TABLE `Registration` DROP COLUMN `examId`;

-- CreateTable
CREATE TABLE `ExamOnRegistration` (
    `examId` VARCHAR(191) NOT NULL,
    `registrationId` INTEGER NOT NULL,

    PRIMARY KEY (`examId`, `registrationId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ExamOnRegistration` ADD CONSTRAINT `ExamOnRegistration_examId_fkey` FOREIGN KEY (`examId`) REFERENCES `Exam`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExamOnRegistration` ADD CONSTRAINT `ExamOnRegistration_registrationId_fkey` FOREIGN KEY (`registrationId`) REFERENCES `Registration`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
