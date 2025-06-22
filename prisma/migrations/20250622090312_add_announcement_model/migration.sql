-- AlterTable
ALTER TABLE `Announcement` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `isForAll` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateTable
CREATE TABLE `_AnnouncementGrades` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_AnnouncementGrades_AB_unique`(`A`, `B`),
    INDEX `_AnnouncementGrades_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_AnnouncementGrades` ADD CONSTRAINT `_AnnouncementGrades_A_fkey` FOREIGN KEY (`A`) REFERENCES `Announcement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AnnouncementGrades` ADD CONSTRAINT `_AnnouncementGrades_B_fkey` FOREIGN KEY (`B`) REFERENCES `Grade`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
