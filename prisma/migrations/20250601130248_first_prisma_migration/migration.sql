/*
  Warnings:

  - Added the required column `endTime` to the `Result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Result` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Exam` ADD COLUMN `status` ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'NOT_STARTED';

-- AlterTable
ALTER TABLE `Result` ADD COLUMN `endTime` DATETIME(3) NOT NULL,
    ADD COLUMN `gradedAt` DATETIME(3) NULL,
    ADD COLUMN `startTime` DATETIME(3) NOT NULL,
    ADD COLUMN `status` ENUM('NOT_GRADED', 'PASSED', 'FAILED', 'ABSENT') NOT NULL DEFAULT 'NOT_GRADED';
