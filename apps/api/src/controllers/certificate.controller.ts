import { Request, Response } from 'express';
import { prisma } from '@repo/database';
import { AuthRequest } from '../middleware/auth.middleware';
import PDFDocument from 'pdfkit';
import { uploadFileToS3 } from '../utils/s3';

export const generateCertificate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.userId;
    const { courseId } = req.params;

    if (!studentId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    const student = await prisma.user.findUnique({ where: { id: studentId } });

    if (!course || !student) {
      res.status(404).json({ error: 'Course or Student not found' });
      return;
    }

    // Generate PDF in memory
    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
    });

    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));

    doc.on('end', async () => {
      const pdfData = Buffer.concat(buffers);

      // Upload the PDF to S3 using the utility wrapper
      const fileMock = {
        originalname: `certificate_${courseId}.pdf`,
        buffer: pdfData,
        mimetype: 'application/pdf',
      } as Express.Multer.File;

      const pdfUrl = await uploadFileToS3(fileMock, 'certificates');

      // Save to database
      const certificate = await prisma.certificate.create({
        data: {
          studentId,
          courseId,
          pdfUrl,
        },
      });

      res.status(201).json(certificate);
    });

    // Draw Certificate Content
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#ffffff');
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#1e40af'); // Border
    
    doc.fontSize(40).fillColor('#1e40af').text('Certificate of Completion', { align: 'center' });
    doc.moveDown();
    doc.fontSize(20).fillColor('#000000').text('This is to certify that', { align: 'center' });
    doc.moveDown();
    doc.fontSize(30).fillColor('#111827').text(student.name, { align: 'center' });
    doc.moveDown();
    doc.fontSize(20).fillColor('#000000').text('has successfully completed the course', { align: 'center' });
    doc.moveDown();
    doc.fontSize(30).fillColor('#1e40af').text(course.title, { align: 'center' });
    doc.moveDown(2);
    doc.fontSize(16).fillColor('#6b7280').text(`Issued on: ${new Date().toLocaleDateString()}`, { align: 'center' });
    
    doc.end();

  } catch (error) {
    console.error('Generate certificate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStudentCertificates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.userId;
    if (!studentId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const certificates = await prisma.certificate.findMany({
      where: { studentId },
      include: { course: { select: { title: true } } },
    });

    res.json(certificates);
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
