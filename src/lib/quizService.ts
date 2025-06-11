
import prisma from "./prisma";

interface CreateQuizAttemptData {
  quizId: string;
  studentId: string;
  studentName: string;
}

interface SubmitQuizData {
  attemptId: string;
  answers: Array<{
    questionId: string;
    answerText: string;
  }>;
  timeSpent: number;
  endTime: string;
}

export class QuizService {
  // This would use Prisma Client when connected to database
  static async createQuizAttempt(data: CreateQuizAttemptData) {
    console.log('Creating quiz attempt:', data);
    
    // Example Prisma code (uncomment when database is setup):
    /*
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId: data.quizId,
        studentId: data.studentId,
        studentName: data.studentName,
        startTime: new Date(),
      }
    });
    return attempt;
    */
    
    // Mock implementation that simulates database save
    const attempt = {
      id: `attempt_${Date.now()}`,
      quizId: data.quizId,
      studentId: data.studentId,
      studentName: data.studentName,
      startTime: new Date(),
      isCompleted: false,
      isSubmitted: false,
    };
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('Quiz attempt created in database:', attempt);
    return attempt;
  }

  static async submitQuiz(data: SubmitQuizData) {
    console.log('Submitting quiz to database:', data);
    
    // Example Prisma code (uncomment when database is setup):
    /*
    const [updatedAttempt, createdAnswers] = await prisma.$transaction([
      prisma.quizAttempt.update({
        where: { id: data.attemptId },
        data: {
          endTime: new Date(data.endTime),
          isCompleted: true,
          isSubmitted: true,
          timeSpent: data.timeSpent,
        }
      }),
      prisma.answer.createMany({
        data: data.answers.map(answer => ({
          attemptId: data.attemptId,
          questionId: answer.questionId,
          answerText: answer.answerText,
          answeredAt: new Date(),
        }))
      })
    ]);
    
    return { attempt: updatedAttempt, answers: createdAnswers };
    */
    
    // Mock implementation that simulates database operations
    const submissionResult = {
      success: true,
      attemptId: data.attemptId,
      submittedAt: new Date(),
      timeSpent: data.timeSpent,
      totalAnswers: data.answers.length,
      answers: data.answers.map((answer, index) => ({
        id: `answer_${Date.now()}_${index}`,
        attemptId: data.attemptId,
        questionId: answer.questionId,
        answerText: answer.answerText,
        answeredAt: new Date(),
      }))
    };
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  
    return submissionResult;
  }

  static async getQuizById(quizId: string) {
    console.log('Fetching quiz from database:', quizId);
    
    // Example Prisma code (uncomment when database is setup):
    /*
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { questionNumber: 'asc' }
        }
      }
    });
    return quiz;
    */
    
    // Mock implementation
    return null;
  }

  static async getAllQuiz(rollNo: string) {
    try {
      console.log("1")
      const student = await prisma.student.findFirst({
        where: { rollNo: "UIN703411" }
      });
      console.log("2")
      console.log(student);
    } catch (error) {
      console.log("3")
      console.error("Prisma error:", error);
    }
    return "student";
  }

  static async getQuizAttempt(attemptId: string) {
    console.log('Fetching quiz attempt from database:', attemptId);
    
    // Example Prisma code (uncomment when database is setup):
    /*
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            questions: true
          }
        },
        answers: true
      }
    });
    return attempt;
    */
    
    // Mock implementation
    return null;
  }
}
