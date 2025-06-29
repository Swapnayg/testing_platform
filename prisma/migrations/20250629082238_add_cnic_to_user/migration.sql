/*
  Warnings:

  - A unique constraint covering the columns `[cnicNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `cnicNumber` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_cnicNumber_key` ON `User`(`cnicNumber`);

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_cnicNumber_fkey` FOREIGN KEY (`cnicNumber`) REFERENCES `User`(`cnicNumber`) ON DELETE RESTRICT ON UPDATE CASCADE;
