import { Request, Response } from 'express';
import { prisma } from '@repo/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { uploadFileToS3 } from '../utils/s3';

export const createAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { title, description, dueDate, maxScore } = req.body;
    
    // In a real scenario, we would parse req.files to handle attachments
    // For this boilerplate, we'll assume attachments are uploaded and URLs are passed
    const attachments: string[] = req.body.attachments || [];

    const assignment = await prisma.assignment.create({
      data: {
        courseId,
        title,
        description,
        dueDate: new Date(dueDate),
        maxScore: parseInt(maxScore) || 100,
        attachments,
      },
    });

    res.status(201).json(assignment);
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const submitAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user?.userId;

    if (!studentId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const content = req.body.content || '';
    let fileUrl = null;

    if (req.file) {
      fileUrl = await uploadFileToS3(req.file, 'submissions');
    }

    const submission = await prisma.submission.create({
      data: {
        assignmentId,
        studentId,
        fileUrl,
        content,
      },
    });

    res.status(201).json(submission);
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const gradeSubmission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { submissionId } = req.params;
    const { score, feedback } = req.body;

    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        score: parseInt(score),
        feedback,
      },
    });

    res.json(updatedSubmission);
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAssignmentsByCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const assignments = await prisma.assignment.findMany({
      where: { courseId },
      include: { submissions: true },
    });
    res.json(assignments);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
