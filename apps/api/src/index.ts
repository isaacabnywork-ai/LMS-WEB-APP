import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { prisma } from '@repo/database';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';
import assignmentRoutes from './routes/assignment.routes';
import quizRoutes from './routes/quiz.routes';
import gradeRoutes from './routes/grade.routes';
import certificateRoutes from './routes/certificate.routes';
import notificationRoutes from './routes/notification.routes';

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.listen(port, () => {
  console.log(`EduNova API Server running on port ${port}`);
});
