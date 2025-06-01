/*
  Warnings:

  - Added the required column `studentId` to the `Registration` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Registration` ADD COLUMN `studentId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Registration` ADD CONSTRAINT `Registration_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`cnicNumber`) ON DELETE RESTRICT ON UPDATE CASCADE;
