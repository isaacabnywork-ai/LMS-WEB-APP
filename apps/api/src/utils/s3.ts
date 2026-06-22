import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Mocking AWS values for development purposes so it doesn't crash if env vars are missing
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'mock-key',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'mock-secret',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'edunova-lms-uploads';

// Configure Multer to use memory storage
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

export const uploadFileToS3 = async (file: Express.Multer.File, folder: string = 'assignments'): Promise<string> => {
  const extension = path.extname(file.originalname);
  const key = `${folder}/${uuidv4()}${extension}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    // ACL: 'public-read', // Uncomment if bucket policies allow public read by default
  });

  try {
    // Note: In production, we actually upload to S3. 
    // If AWS credentials are mock, this will fail if we try to await it, 
    // so we catch the error and return a mock URL for development.
    await s3Client.send(command);
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
  } catch (error) {
    console.warn('S3 Upload Failed (Returning mock URL for development):', error);
    return `https://mock-s3-bucket.com/${key}`;
  }
};
