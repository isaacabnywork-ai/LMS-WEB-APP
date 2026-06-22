import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { generateCertificate, getStudentCertificates } from '../controllers/certificate.controller';

const router = Router();

router.use(authenticateToken);

router.get('/', requireRole(['STUDENT']), getStudentCertificates);
router.post('/generate/:courseId', requireRole(['STUDENT', 'ADMIN']), generateCertificate);

export default router;
