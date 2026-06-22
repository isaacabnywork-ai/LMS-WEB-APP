import { Request, Response } from 'express';
import { prisma } from '@repo/database';
import { AuthRequest } from '../middleware/auth.middleware';

export const createCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, categoryId, thumbnailUrl } = req.body;
    const instructorId = req.user?.userId;

    if (!instructorId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        categoryId,
        thumbnailUrl,
        instructorId,
      },
    });

    res.status(201).json(course);
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        instructor: { select: { id: true, name: true } },
        modules: { include: { lessons: true } },
      },
    });
    res.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCourseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: { select: { id: true, name: true, avatarUrl: true } },
        modules: {
          include: { lessons: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    res.json(course);
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Modules
export const createModule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { title, order } = req.body;

    const module = await prisma.module.create({
      data: {
        courseId,
        title,
        order,
      },
    });

    res.status(201).json(module);
  } catch (error) {
    console.error('Create module error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Lessons
export const createLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { moduleId } = req.params;
    const { title, type, contentUrl, textContent, order } = req.body;

    const lesson = await prisma.lesson.create({
      data: {
        moduleId,
        title,
        type,
        contentUrl,
        textContent,
        order,
      },
    });

    res.status(201).json(lesson);
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
