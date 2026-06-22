import { Request, Response } from 'express';
import { prisma } from '@repo/database';
import { AuthRequest } from '../middleware/auth.middleware';

export const createQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { title, durationMins, questions } = req.body;

    const quiz = await prisma.quiz.create({
      data: {
        courseId,
        title,
        durationMins: parseInt(durationMins) || 30,
        questions: {
          create: questions.map((q: any) => ({
            type: q.type,
            text: q.text,
            options: q.options,
            correctAnswer: q.correctAnswer,
            marks: q.marks || 1,
          })),
        },
      },
      include: { questions: true },
    });

    res.status(201).json(quiz);
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getQuizById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          select: {
            id: true,
            text: true,
            type: true,
            options: true,
            marks: true,
            // Exclude correctAnswer so students can't cheat by looking at the network payload
          },
        },
      },
    });

    if (!quiz) {
      res.status(404).json({ error: 'Quiz not found' });
      return;
    }

    res.json(quiz);
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const submitQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // Quiz ID
    const { answers, startedAt, completedAt } = req.body;
    const studentId = req.user?.userId;

    if (!studentId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: { questions: true },
    });

    if (!quiz) {
      res.status(404).json({ error: 'Quiz not found' });
      return;
    }

    let score = 0;
    let totalMarks = 0;

    // Autograde MCQ, True/False, Fill in Blank
    quiz.questions.forEach((q) => {
      totalMarks += q.marks;
      const studentAnswer = answers[q.id];
      if (studentAnswer && studentAnswer === q.correctAnswer) {
        score += q.marks;
      }
    });

    const result = await prisma.quizResult.create({
      data: {
        quizId: id,
        studentId,
        score,
        totalMarks,
        startedAt: new Date(startedAt),
        completedAt: new Date(completedAt),
      },
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
