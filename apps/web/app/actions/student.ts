"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function enrollInCourse(courseId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const existing = await prisma.enrolment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId,
      }
    }
  });

  if (existing) {
    return { success: true, message: "Already enrolled" };
  }

  await prisma.enrolment.create({
    data: {
      userId: session.user.id,
      courseId,
    }
  });

  revalidatePath(`/student/courses/${courseId}`);
  revalidatePath(`/student/courses`);
  return { success: true };
}

export async function markLessonComplete(lessonId: string, courseId: string, isCompleted: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  // Upsert the lesson progress
  await prisma.lessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId,
        lessonId,
      }
    },
    update: {
      isCompleted,
      completedAt: isCompleted ? new Date() : null,
    },
    create: {
      userId,
      lessonId,
      isCompleted,
      completedAt: isCompleted ? new Date() : null,
    }
  });

  const isComplete = await checkCourseCompletion(courseId);

  revalidatePath(`/student/courses/${courseId}/learn`);
  revalidatePath(`/student/courses/${courseId}/learn/lessons/${lessonId}`);
  return { success: true, isComplete };
}

export async function submitAssignment(assignmentId: string, data: { contentUrl?: string; textContent?: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  // Verify assignment exists and student is enrolled in the course
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      course: {
        include: {
          enrolments: {
            where: { userId }
          }
        }
      }
    }
  });

  if (!assignment || assignment.course.enrolments.length === 0) {
    throw new Error("Assignment not found or you are not enrolled in this course");
  }

  // Create or update the submission
  const submission = await prisma.submission.upsert({
    where: {
      assignmentId_userId: {
        assignmentId,
        userId
      }
    },
    update: {
      contentUrl: data.contentUrl,
      textContent: data.textContent,
      submittedAt: new Date(),
    },
    create: {
      assignmentId,
      userId,
      contentUrl: data.contentUrl,
      textContent: data.textContent,
    }
  });

  await checkCourseCompletion(assignment.courseId);

  revalidatePath(`/student/assignments/${assignmentId}/submit`);
  revalidatePath("/student/assignments");
  return { success: true, submissionId: submission.id };
}

export async function submitQuizAttempt(quizId: string, answers: Record<string, string>) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "student") throw new Error("Unauthorized");

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true }
  });

  if (!quiz) throw new Error("Quiz not found");

  let score = 0;
  for (const q of quiz.questions) {
    if (answers[q.id] === q.correctAnswer) {
      score += q.points;
    }
  }

  await prisma.quizAttempt.create({
    data: {
      quizId,
      userId: session.user.id,
      score,
      answers: JSON.stringify(answers),
      submittedAt: new Date()
    }
  });

  await checkCourseCompletion(quiz.courseId);

  revalidatePath("/student/quizzes");
  revalidatePath(`/student/courses/${quiz.courseId}`);
  return { success: true, score };
}

export async function submitReview(courseId: string, rating: number, comment?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  // Check if enrolled
  const enrolment = await prisma.enrolment.findUnique({
    where: { userId_courseId: { userId, courseId } }
  });

  if (!enrolment) {
    throw new Error("You must be enrolled to leave a review.");
  }

  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5.");
  }

  await prisma.review.upsert({
    where: {
      courseId_userId: { courseId, userId }
    },
    update: {
      rating,
      comment
    },
    create: {
      courseId,
      userId,
      rating,
      comment
    }
  });

  revalidatePath(`/student/catalog/${courseId}`);
  return { success: true };
}

export async function deleteReview(reviewId: string, courseId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review || review.userId !== session.user.id) {
    throw new Error("Review not found or unauthorized");
  }

  await prisma.review.delete({ where: { id: reviewId } });

  revalidatePath(`/student/catalog/${courseId}`);
  return { success: true };
}

export async function checkCourseCompletion(courseId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const existingCert = await prisma.certificate.findUnique({
    where: { userId_courseId: { userId, courseId } }
  });
  if (existingCert) return true;

  const lessonsCount = await prisma.lesson.count({ where: { module: { courseId } } });
  const assignmentsCount = await prisma.assignment.count({ where: { courseId } });
  const quizzesCount = await prisma.quiz.count({ where: { courseId } });
  const totalItems = lessonsCount + assignmentsCount + quizzesCount;

  if (totalItems === 0) return false;

  const completedLessons = await prisma.lessonProgress.count({
    where: { userId, lesson: { module: { courseId } }, isCompleted: true }
  });
  const completedAssignments = await prisma.submission.count({
    where: { userId, assignment: { courseId } }
  });
  const completedQuizzes = await prisma.quizAttempt.count({
    where: { userId, quiz: { courseId }, submittedAt: { not: null } }
  });

  const totalCompleted = completedLessons + completedAssignments + completedQuizzes;

  if (totalCompleted >= totalItems) {
    await prisma.certificate.create({
      data: { userId, courseId }
    });
    await prisma.enrolment.update({
      where: { userId_courseId: { userId, courseId } },
      data: { progress: 100, completedAt: new Date() }
    });
    return true;
  }
  
  const progressPercent = Math.round((totalCompleted / totalItems) * 100);
  await prisma.enrolment.update({
    where: { userId_courseId: { userId, courseId } },
    data: { progress: progressPercent }
  });

  return false;
}
