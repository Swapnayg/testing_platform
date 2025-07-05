-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `fromAdminId` VARCHAR(191) NULL,
    `toAdminId` VARCHAR(191) NULL,
    `fromStudentId` VARCHAR(191) NULL,
    `toStudentId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isRead` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_fromAdminId_fkey` FOREIGN KEY (`fromAdminId`) REFERENCES `Admin`(`username`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_toAdminId_fkey` FOREIGN KEY (`toAdminId`) REFERENCES `Admin`(`username`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_fromStudentId_fkey` FOREIGN KEY (`fromStudentId`) REFERENCES `Student`(`cnicNumber`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_toStudentId_fkey` FOREIGN KEY (`toStudentId`) REFERENCES `Student`(`cnicNumber`) ON DELETE SET NULL ON UPDATE CASCADE;
