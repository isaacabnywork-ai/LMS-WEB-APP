import { Request, Response } from 'express';
import { prisma } from '@repo/database';
import { AuthRequest } from '../middleware/auth.middleware';

export const sendNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const senderId = req.user?.userId;
    const { targetUserId, courseId, title, message } = req.body;

    if (!senderId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const notification = await prisma.notification.create({
      data: {
        userId: targetUserId,
        title,
        message,
        type: 'SYSTEM',
        relatedId: courseId,
      },
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const broadcastAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const senderId = req.user?.userId;
    const { courseId, title, message } = req.body;

    if (!senderId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Find all students enrolled in the course
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      select: { studentId: true },
    });

    // Create a notification for each student
    const notificationsData = enrollments.map((e: any) => ({
      userId: e.studentId,
      title,
      message,
      type: 'COURSE_UPDATE',
      relatedId: courseId,
    }));

    if (notificationsData.length > 0) {
      await prisma.notification.createMany({
        data: notificationsData,
      });
    }

    res.status(201).json({ success: true, count: notificationsData.length });
  } catch (error) {
    console.error('Broadcast announcement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const notification = await prisma.notification.updateMany({
      where: {
        id,
        userId, // ensure users can only mark their own notifications
      },
      data: {
        isRead: true,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
