/*
  Warnings:

  - A unique constraint covering the columns `[chatId]` on the table `GroupChat` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `chatId` to the `GroupChat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `GroupChat` ADD COLUMN `chatId` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `GroupChat_chatId_key` ON `GroupChat`(`chatId`);

-- AddForeignKey
ALTER TABLE `GroupChat` ADD CONSTRAINT `GroupChat_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `Chat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
