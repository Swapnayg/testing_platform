-- AlterTable
ALTER TABLE `Exam` ADD COLUMN `resultDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `Result` ADD COLUMN `resultDeclared` BOOLEAN NOT NULL DEFAULT false;
