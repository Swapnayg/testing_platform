/*
  Warnings:

  - You are about to drop the `_ExamAnnouncements` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `announcementType` to the `Announcement` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_ExamAnnouncements` DROP FOREIGN KEY `_ExamAnnouncements_A_fkey`;

-- DropForeignKey
ALTER TABLE `_ExamAnnouncements` DROP FOREIGN KEY `_ExamAnnouncements_B_fkey`;

-- AlterTable
ALTER TABLE `Announcement` ADD COLUMN `announcementType` ENUM('GENERAL', 'EXAM_RESULT') NOT NULL;

-- DropTable
DROP TABLE `_ExamAnnouncements`;

-- CreateTable
CREATE TABLE `_AnnouncementGrades` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_AnnouncementGrades_AB_unique`(`A`, `B`),
    INDEX `_AnnouncementGrades_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_AnnouncementExams` (
    `A` INTEGER NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_AnnouncementExams_AB_unique`(`A`, `B`),
    INDEX `_AnnouncementExams_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_AnnouncementGrades` ADD CONSTRAINT `_AnnouncementGrades_A_fkey` FOREIGN KEY (`A`) REFERENCES `Announcement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AnnouncementGrades` ADD CONSTRAINT `_AnnouncementGrades_B_fkey` FOREIGN KEY (`B`) REFERENCES `Grade`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AnnouncementExams` ADD CONSTRAINT `_AnnouncementExams_A_fkey` FOREIGN KEY (`A`) REFERENCES `Announcement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AnnouncementExams` ADD CONSTRAINT `_AnnouncementExams_B_fkey` FOREIGN KEY (`B`) REFERENCES `Exam`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
