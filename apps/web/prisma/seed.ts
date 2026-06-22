import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@edunova.com' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@edunova.com',
      passwordHash,
      role: 'admin',
    },
  });

  // Create Teacher
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@edunova.com' },
    update: {},
    create: {
      name: 'Sarah Teacher',
      email: 'teacher@edunova.com',
      passwordHash,
      role: 'teacher',
    },
  });

  // Create Student
  const student = await prisma.user.upsert({
    where: { email: 'student@edunova.com' },
    update: {},
    create: {
      name: 'John Student',
      email: 'student@edunova.com',
      passwordHash,
      role: 'student',
    },
  });

  console.log('Created Users:', { admin: admin.email, teacher: teacher.email, student: student.email });

  // Create Sample Course
  const course = await prisma.course.upsert({
    where: { slug: 'intro-to-react' },
    update: {},
    create: {
      title: 'Introduction to React',
      slug: 'intro-to-react',
      description: 'Learn the basics of React, components, and state.',
      category: 'Development',
      status: 'published',
      instructorId: teacher.id,
      thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
    },
  });

  console.log('Created Course:', course.title);

  // Enroll Student in Course
  const enrolment = await prisma.enrolment.upsert({
    where: {
      userId_courseId: {
        userId: student.id,
        courseId: course.id,
      },
    },
    update: {},
    create: {
      userId: student.id,
      courseId: course.id,
      progress: 0,
    },
  });

  console.log('Created Enrolment');
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
