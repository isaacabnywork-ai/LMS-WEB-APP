import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { getStudentGrades } from '../controllers/grade.controller';

const router = Router();

router.use(authenticateToken);

// Student fetching their own grades for a course
router.get('/course/:courseId', requireRole(['STUDENT']), getStudentGrades);

export default router;
