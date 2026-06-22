import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import {
  createCourse,
  getCourses,
  getCourseById,
  createModule,
  createLesson,
} from '../controllers/course.controller';

const router = Router();

router.get('/', getCourses);
router.get('/:id', getCourseById);

// Teacher/Admin only routes
router.use(authenticateToken);
router.post('/', requireRole(['TEACHER', 'ADMIN']), createCourse);
router.post('/:courseId/modules', requireRole(['TEACHER', 'ADMIN']), createModule);
router.post('/modules/:moduleId/lessons', requireRole(['TEACHER', 'ADMIN']), createLesson);

export default router;
