/*
  Warnings:

  - You are about to drop the `_AnnouncementGrades` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_AnnouncementGrades` DROP FOREIGN KEY `_AnnouncementGrades_A_fkey`;

-- DropForeignKey
ALTER TABLE `_AnnouncementGrades` DROP FOREIGN KEY `_AnnouncementGrades_B_fkey`;

-- DropTable
DROP TABLE `_AnnouncementGrades`;

-- CreateTable
CREATE TABLE `_ExamAnnouncements` (
    `A` INTEGER NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ExamAnnouncements_AB_unique`(`A`, `B`),
    INDEX `_ExamAnnouncements_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_ExamAnnouncements` ADD CONSTRAINT `_ExamAnnouncements_A_fkey` FOREIGN KEY (`A`) REFERENCES `Announcement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ExamAnnouncements` ADD CONSTRAINT `_ExamAnnouncements_B_fkey` FOREIGN KEY (`B`) REFERENCES `Exam`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
