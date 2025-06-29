-- CreateTable
CREATE TABLE `Admin` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Admin_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Student` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `fatherName` VARCHAR(191) NULL,
    `dateOfBirth` DATETIME(3) NOT NULL,
    `religion` VARCHAR(191) NULL,
    `gender` VARCHAR(191) NULL,
    `cnicNumber` VARCHAR(191) NOT NULL,
    `profilePicture` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `mobileNumber` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `stateProvince` VARCHAR(191) NULL,
    `addressLine1` VARCHAR(191) NULL,
    `instituteName` VARCHAR(191) NULL,
    `others` VARCHAR(191) NULL,
    `rollNo` VARCHAR(191) NULL,
    `gradeId` INTEGER NULL,

    UNIQUE INDEX `Student_cnicNumber_key`(`cnicNumber`),
    INDEX `Student_gradeId_fkey`(`gradeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `catName` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Category_catName_key`(`catName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quiz_attempts` (
    `id` VARCHAR(191) NOT NULL,
    `quizId` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `studentName` VARCHAR(191) NOT NULL,
    `startTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endTime` DATETIME(3) NULL,
    `isCompleted` BOOLEAN NOT NULL DEFAULT false,
    `isSubmitted` BOOLEAN NOT NULL DEFAULT false,
    `totalScore` INTEGER NULL,
    `timeSpent` INTEGER NULL,
    `submittedAt` DATETIME(3) NULL,

    INDEX `quiz_attempts_quizId_fkey`(`quizId`),
    INDEX `quiz_attempts_studentId_fkey`(`studentId`),
    UNIQUE INDEX `quiz_attempts_quizId_studentId_key`(`quizId`, `studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `answers` (
    `id` VARCHAR(191) NOT NULL,
    `attemptId` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `answerText` TEXT NOT NULL,
    `isCorrect` BOOLEAN NULL,
    `pointsEarned` INTEGER NOT NULL DEFAULT 0,
    `answeredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `questionOptionId` VARCHAR(191) NULL,

    INDEX `answers_questionId_fkey`(`questionId`),
    INDEX `answers_questionOptionId_fkey`(`questionOptionId`),
    UNIQUE INDEX `answers_attemptId_questionId_key`(`attemptId`, `questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Grade` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `level` VARCHAR(191) NOT NULL,
    `categoryId` INTEGER NOT NULL,

    UNIQUE INDEX `Grade_level_key`(`level`),
    INDEX `Grade_categoryId_fkey`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Registration` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `olympiadCategory` VARCHAR(191) NULL,
    `catGrade` VARCHAR(191) NULL,
    `bankName` VARCHAR(191) NULL,
    `accountTitle` VARCHAR(191) NULL,
    `accountNumber` VARCHAR(191) NULL,
    `totalAmount` VARCHAR(191) NULL,
    `transactionId` VARCHAR(191) NULL,
    `dateOfPayment` DATETIME(3) NOT NULL,
    `paymentOption` VARCHAR(191) NULL,
    `otherName` VARCHAR(191) NULL,
    `transactionReceipt` VARCHAR(191) NULL,
    `applicationId` VARCHAR(191) NULL,
    `status` ENUM('APPROVED', 'PENDING', 'REJECTED') NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `registerdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Registration_studentId_fkey`(`studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExamOnRegistration` (
    `examId` VARCHAR(191) NOT NULL,
    `registrationId` INTEGER NOT NULL,

    INDEX `ExamOnRegistration_registrationId_fkey`(`registrationId`),
    PRIMARY KEY (`examId`, `registrationId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subject` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Subject_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Exam` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `status` ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'NOT_STARTED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resultDate` DATETIME(3) NULL,
    `timeLimit` INTEGER NOT NULL DEFAULT 30,
    `categoryId` INTEGER NOT NULL,
    `subjectId` INTEGER NOT NULL,
    `totalMCQ` INTEGER NOT NULL,
    `totalMarks` INTEGER NOT NULL,

    INDEX `Exam_categoryId_fkey`(`categoryId`),
    INDEX `Exam_subjectId_fkey`(`subjectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quizzes` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `total_questions` INTEGER NOT NULL,
    `total_marks` INTEGER NOT NULL,
    `start_date_time` DATETIME(3) NOT NULL,
    `end_date_time` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `examId` VARCHAR(191) NOT NULL,
    `timeLimit` INTEGER NOT NULL DEFAULT 30,
    `grades` VARCHAR(191) NULL,

    UNIQUE INDEX `quizzes_examId_key`(`examId`),
    INDEX `quizzes_examId_fkey`(`examId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `questions` (
    `id` VARCHAR(191) NOT NULL,
    `quiz_id` VARCHAR(191) NOT NULL,
    `type` ENUM('multiple_choice', 'true_false', 'short_text', 'long_text', 'numerical') NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `marks` DOUBLE NOT NULL,
    `correct_answer` TEXT NULL,
    `order_index` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `questions_quiz_id_fkey`(`quiz_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question_options` (
    `id` VARCHAR(191) NOT NULL,
    `question_id` VARCHAR(191) NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `is_correct` BOOLEAN NOT NULL,
    `order_index` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `question_options_question_id_fkey`(`question_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Result` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `totalScore` INTEGER NOT NULL,
    `score` INTEGER NOT NULL,
    `grade` VARCHAR(191) NOT NULL,
    `status` ENUM('NOT_GRADED', 'PASSED', 'FAILED', 'ABSENT') NOT NULL DEFAULT 'NOT_GRADED',
    `gradedAt` DATETIME(3) NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `examId` VARCHAR(191) NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `answeredQuestions` INTEGER NOT NULL DEFAULT 0,
    `correctAnswers` INTEGER NOT NULL DEFAULT 0,
    `quizAttemptId` VARCHAR(191) NULL,
    `resultDeclared` BOOLEAN NOT NULL DEFAULT false,
    `declaredOn` DATETIME(3) NULL,

    INDEX `Result_examId_fkey`(`examId`),
    INDEX `Result_quizAttemptId_fkey`(`quizAttemptId`),
    INDEX `Result_studentId_fkey`(`studentId`),
    UNIQUE INDEX `Result_examId_studentId_key`(`examId`, `studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Attendance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `present` BOOLEAN NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `examId` VARCHAR(191) NULL,

    INDEX `Attendance_examId_fkey`(`examId`),
    INDEX `Attendance_studentId_fkey`(`studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Event` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Announcement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resultDate` DATETIME(3) NULL,
    `announcementType` ENUM('GENERAL', 'EXAM_RESULT') NOT NULL,
    `isForAll` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `type` ENUM('GENERAL', 'EXAM_CREATED', 'RESULT_ANNOUNCED', 'PAYMENT_APPROVED', 'PAYMENT_REJECTED', 'QUIZ_APPLIED', 'STUDENT_REGISTERED') NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `senderId` INTEGER NOT NULL,
    `senderRole` ENUM('admin', 'student') NOT NULL,
    `receiverId` INTEGER NOT NULL,
    `receiverRole` ENUM('admin', 'student') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `role` ENUM('admin', 'student') NOT NULL,

    UNIQUE INDEX `User_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ExamToGrade` (
    `A` VARCHAR(191) NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ExamToGrade_AB_unique`(`A`, `B`),
    INDEX `_ExamToGrade_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
ALTER TABLE `Student` ADD CONSTRAINT `Student_gradeId_fkey` FOREIGN KEY (`gradeId`) REFERENCES `Grade`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz_attempts` ADD CONSTRAINT `quiz_attempts_quizId_fkey` FOREIGN KEY (`quizId`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz_attempts` ADD CONSTRAINT `quiz_attempts_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`cnicNumber`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `answers` ADD CONSTRAINT `answers_attemptId_fkey` FOREIGN KEY (`attemptId`) REFERENCES `quiz_attempts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `answers` ADD CONSTRAINT `answers_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `answers` ADD CONSTRAINT `answers_questionOptionId_fkey` FOREIGN KEY (`questionOptionId`) REFERENCES `question_options`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Grade` ADD CONSTRAINT `Grade_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Registration` ADD CONSTRAINT `Registration_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`cnicNumber`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExamOnRegistration` ADD CONSTRAINT `ExamOnRegistration_examId_fkey` FOREIGN KEY (`examId`) REFERENCES `Exam`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExamOnRegistration` ADD CONSTRAINT `ExamOnRegistration_registrationId_fkey` FOREIGN KEY (`registrationId`) REFERENCES `Registration`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Exam` ADD CONSTRAINT `Exam_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Exam` ADD CONSTRAINT `Exam_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quizzes` ADD CONSTRAINT `quizzes_examId_fkey` FOREIGN KEY (`examId`) REFERENCES `Exam`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `questions_quiz_id_fkey` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_options` ADD CONSTRAINT `question_options_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result` ADD CONSTRAINT `Result_examId_fkey` FOREIGN KEY (`examId`) REFERENCES `Exam`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result` ADD CONSTRAINT `Result_quizAttemptId_fkey` FOREIGN KEY (`quizAttemptId`) REFERENCES `quiz_attempts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result` ADD CONSTRAINT `Result_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`cnicNumber`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_examId_fkey` FOREIGN KEY (`examId`) REFERENCES `Exam`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`cnicNumber`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ExamToGrade` ADD CONSTRAINT `_ExamToGrade_A_fkey` FOREIGN KEY (`A`) REFERENCES `Exam`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ExamToGrade` ADD CONSTRAINT `_ExamToGrade_B_fkey` FOREIGN KEY (`B`) REFERENCES `Grade`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AnnouncementGrades` ADD CONSTRAINT `_AnnouncementGrades_A_fkey` FOREIGN KEY (`A`) REFERENCES `Announcement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AnnouncementGrades` ADD CONSTRAINT `_AnnouncementGrades_B_fkey` FOREIGN KEY (`B`) REFERENCES `Grade`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AnnouncementExams` ADD CONSTRAINT `_AnnouncementExams_A_fkey` FOREIGN KEY (`A`) REFERENCES `Announcement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AnnouncementExams` ADD CONSTRAINT `_AnnouncementExams_B_fkey` FOREIGN KEY (`B`) REFERENCES `Exam`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
