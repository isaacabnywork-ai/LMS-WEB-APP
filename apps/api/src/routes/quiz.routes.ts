import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import {
  createQuiz,
  getQuizById,
  submitQuiz,
} from '../controllers/quiz.controller';

const router = Router();

router.use(authenticateToken);

// Teacher/Admin routes
router.post('/course/:courseId', requireRole(['TEACHER', 'ADMIN']), createQuiz);

// Shared
router.get('/:id', getQuizById);

// Student routes
router.post('/:id/submit', requireRole(['STUDENT']), submitQuiz);

export default router;
