import { Request, Response } from 'express';
import { prisma } from '@repo/database';
import { AuthRequest } from '../middleware/auth.middleware';

export const getStudentGrades = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.userId;
    const { courseId } = req.params;

    if (!studentId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Fetch assignment submissions
    const submissions = await prisma.submission.findMany({
      where: {
        studentId,
        assignment: { courseId }
      },
      include: { assignment: true }
    });

    // Fetch quiz results
    const quizResults = await prisma.quizResult.findMany({
      where: {
        studentId,
        quiz: { courseId }
      },
      include: { quiz: true }
    });

    // Calculate totals
    let totalEarned = 0;
    let totalMax = 0;

    submissions.forEach(sub => {
      if (sub.score !== null) {
        totalEarned += sub.score;
        totalMax += sub.assignment.maxScore;
      }
    });

    quizResults.forEach(qr => {
      totalEarned += qr.score;
      totalMax += qr.totalMarks;
    });

    const percentage = totalMax > 0 ? (totalEarned / totalMax) * 100 : 0;
    
    // Basic GPA scale (out of 4.0)
    let gpa = 0.0;
    if (percentage >= 90) gpa = 4.0;
    else if (percentage >= 80) gpa = 3.0;
    else if (percentage >= 70) gpa = 2.0;
    else if (percentage >= 60) gpa = 1.0;

    res.json({
      courseId,
      submissions,
      quizResults,
      summary: {
        totalEarned,
        totalMax,
        percentage: percentage.toFixed(2),
        gpa: gpa.toFixed(1)
      }
    });
  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
