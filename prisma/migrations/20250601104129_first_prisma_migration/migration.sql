-- DropForeignKey
ALTER TABLE `Attendance` DROP FOREIGN KEY `Attendance_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `Result` DROP FOREIGN KEY `Result_studentId_fkey`;

-- DropIndex
DROP INDEX `Student_id_key` ON `Student`;

-- AddForeignKey
ALTER TABLE `Result` ADD CONSTRAINT `Result_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`cnicNumber`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`cnicNumber`) ON DELETE RESTRICT ON UPDATE CASCADE;
