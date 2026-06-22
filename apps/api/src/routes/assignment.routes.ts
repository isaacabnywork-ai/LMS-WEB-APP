import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { upload } from '../utils/s3';
import {
  createAssignment,
  submitAssignment,
  gradeSubmission,
  getAssignmentsByCourse,
} from '../controllers/assignment.controller';

const router = Router();

router.use(authenticateToken);

// Get assignments for a course
router.get('/course/:courseId', getAssignmentsByCourse);

// Teacher/Admin
router.post('/course/:courseId', requireRole(['TEACHER', 'ADMIN']), createAssignment);
router.post('/submissions/:submissionId/grade', requireRole(['TEACHER', 'ADMIN']), gradeSubmission);

// Student
router.post('/:assignmentId/submit', requireRole(['STUDENT']), upload.single('file'), submitAssignment);

export default router;
