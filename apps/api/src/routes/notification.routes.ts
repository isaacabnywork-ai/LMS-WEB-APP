import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import {
  sendNotification,
  broadcastAnnouncement,
  getMyNotifications,
  markAsRead,
} from '../controllers/notification.controller';

const router = Router();

router.use(authenticateToken);

// Send specific notification
router.post('/send', requireRole(['TEACHER', 'ADMIN']), sendNotification);

// Broadcast announcement to course
router.post('/broadcast', requireRole(['TEACHER', 'ADMIN']), broadcastAnnouncement);

// Get own notifications
router.get('/', getMyNotifications);

// Mark as read
router.patch('/:id/read', markAsRead);

export default router;
