"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

type CourseData = {
  title: string;
  shortName?: string | null;
  category: string;
  description: string;
  thumbnailUrl?: string;
  status?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  idNumber?: string | null;
  format?: string;
  numberOfSections?: number;
  hiddenSections?: string;
  courseLayout?: string;
  courseHeaderImage?: string | null;
  sectionSummaryLength?: number;
  sectionBackgroundImage?: string | null;
  headerBgPosition?: string;
  headerBgSize?: string;
  headerOverlayOpacity?: number;
};

export async function createCourse(data: CourseData) {
  const session = await auth();
  
  if (!session?.user?.id || session.user.role !== "teacher") {
    throw new Error("Unauthorized: Only teachers can create courses.");
  }

  // Generate a basic slug
  const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();

  const course = await prisma.course.create({
    data: {
      title: data.title,
      shortName: data.shortName,
      description: data.description,
      category: data.category,
      slug,
      instructorId: session.user.id,
      thumbnailUrl: data.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
      status: data.status || "draft",
      startDate: data.startDate,
      endDate: data.endDate,
      idNumber: data.idNumber,
      format: data.format,
      numberOfSections: data.numberOfSections,
      hiddenSections: data.hiddenSections,
      courseLayout: data.courseLayout,
      courseHeaderImage: data.courseHeaderImage,
      sectionSummaryLength: data.sectionSummaryLength,
      sectionBackgroundImage: data.sectionBackgroundImage,
      headerBgPosition: data.headerBgPosition,
      headerBgSize: data.headerBgSize,
      headerOverlayOpacity: data.headerOverlayOpacity,
    },
  });

  revalidatePath("/teacher/courses");
  return { success: true, courseId: course.id, slug: course.slug };
}

export async function updateCourse(courseId: string, data: CourseData) {
  const session = await auth();
  
  if (!session?.user?.id || session.user.role !== "teacher") {
    throw new Error("Unauthorized: Only teachers can update courses.");
  }

  // Ensure course belongs to teacher
  const existing = await prisma.course.findUnique({ where: { id: courseId }});
  if (!existing || existing.instructorId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  const course = await prisma.course.update({
    where: { id: courseId },
    data: {
      title: data.title,
      shortName: data.shortName,
      description: data.description,
      category: data.category,
      ...(data.thumbnailUrl && { thumbnailUrl: data.thumbnailUrl }),
      status: data.status,
      startDate: data.startDate,
      endDate: data.endDate,
      idNumber: data.idNumber,
      format: data.format,
      numberOfSections: data.numberOfSections,
      hiddenSections: data.hiddenSections,
      courseLayout: data.courseLayout,
      courseHeaderImage: data.courseHeaderImage,
      sectionSummaryLength: data.sectionSummaryLength,
      sectionBackgroundImage: data.sectionBackgroundImage,
      headerBgPosition: data.headerBgPosition,
      headerBgSize: data.headerBgSize,
      headerOverlayOpacity: data.headerOverlayOpacity,
    },
  });

  revalidatePath("/teacher/courses");
  revalidatePath(`/teacher/courses/${courseId}`);
  return { success: true };
}

export async function gradeSubmission(submissionId: string, score: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Fetch submission to get assignment ID
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: { assignmentId: true }
  });

  if (!submission) throw new Error("Submission not found");

  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      score,
      gradedAt: new Date(),
    }
  });

  revalidatePath("/teacher/assignments");
  return { success: true };
}

export async function toggleCourseStatus(courseId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "teacher") throw new Error("Unauthorized");

  const existing = await prisma.course.findUnique({ where: { id: courseId } });
  if (!existing || existing.instructorId !== session.user.id) throw new Error("Unauthorized");

  const newStatus = existing.status === "published" ? "draft" : "published";
  await prisma.course.update({
    where: { id: courseId },
    data: { status: newStatus },
  });

  revalidatePath("/teacher/courses");
  revalidatePath(`/teacher/courses/${courseId}`);
  revalidatePath("/student/catalog");
  return { success: true, status: newStatus };
}

export async function deleteCourse(courseId: string) {
  const session = await auth();
  
  if (!session?.user?.id || session.user.role !== "teacher") {
    throw new Error("Unauthorized");
  }

  // Ensure the course belongs to this teacher
  await prisma.course.delete({
    where: {
      id: courseId,
      instructorId: session.user.id,
    },
  });

  revalidatePath("/teacher/courses");
  redirect("/teacher/courses");
  return { success: true };
}

import { sendEmail } from "@/lib/email";
import { triggerEvent } from "@/lib/realtime";

export async function createAssignment(data: {
  courseId: string;
  moduleId?: string;
  title: string;
  description: string;
  maxScore: number;
  dueAt?: Date;
}) {
  const session = await auth();
  
  if (!session?.user?.id || session.user.role !== "teacher") {
    throw new Error("Unauthorized");
  }

  // Verify course ownership
  const course = await prisma.course.findUnique({
    where: { id: data.courseId },
    include: {
      enrolments: {
        include: { user: true }
      }
    }
  });
  
  if (!course || course.instructorId !== session.user.id) {
    throw new Error("Unauthorized to add assignment to this course");
  }

  // Calculate position if moduleId is provided
  let position = 0;
  if (data.moduleId) {
    const assignments = await prisma.assignment.count({ where: { moduleId: data.moduleId } });
    const lessons = await prisma.lesson.count({ where: { moduleId: data.moduleId } });
    const quizzes = await prisma.quiz.count({ where: { moduleId: data.moduleId } });
    position = assignments + lessons + quizzes;
  } else {
    const assignments = await prisma.assignment.count({ where: { courseId: data.courseId, moduleId: null } });
    position = assignments;
  }

  const assignment = await prisma.assignment.create({
    data: {
      courseId: data.courseId,
      moduleId: data.moduleId,
      title: data.title,
      description: data.description,
      maxScore: data.maxScore,
      position,
      ...(data.dueAt && { dueAt: data.dueAt })
    }
  });

  // Notify all enrolled students
  for (const enrolment of course.enrolments) {
    const student = enrolment.user;
    
    // 1. Send Mock Email
    await sendEmail({
      to: student.email,
      subject: `New Assignment in ${course.title}`,
      html: `<p>A new assignment "<strong>${data.title}</strong>" has been posted in ${course.title}.</p>`
    });

    // 2. Trigger Mock Realtime Event (SSE)
    triggerEvent(`user-${student.id}`, "new_assignment", {
      assignmentId: assignment.id,
      courseName: course.title,
      title: data.title
    });
  }

  revalidatePath("/teacher/assignments");
  return { success: true, assignmentId: assignment.id };
}

export async function createModule(courseId: string, title: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "teacher") throw new Error("Unauthorized");

  const course = await prisma.course.findUnique({ where: { id: courseId }, include: { modules: true } });
  if (!course || course.instructorId !== session.user.id) throw new Error("Unauthorized");

  const position = course.modules.length;
  await prisma.module.create({
    data: { courseId, title, position }
  });

  revalidatePath(`/teacher/courses/${courseId}`);
  return { success: true };
}

export async function createLesson(data: {
  moduleId: string;
  courseId: string;
  title: string;
  type: string;
  contentUrl?: string;
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "teacher") throw new Error("Unauthorized");

  const moduleObj = await prisma.module.findUnique({ where: { id: data.moduleId }, include: { lessons: true } });
  if (!moduleObj) throw new Error("Module not found");

  const position = moduleObj.lessons.length;
  await prisma.lesson.create({
    data: {
      moduleId: data.moduleId,
      title: data.title,
      type: data.type.toLowerCase(),
      contentUrl: data.contentUrl,
      position
    }
  });

  revalidatePath(`/teacher/courses/${data.courseId}`);
  return { success: true };
}

export async function deleteModule(moduleId: string, courseId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "teacher") throw new Error("Unauthorized");

  await prisma.module.delete({ where: { id: moduleId } });
  revalidatePath(`/teacher/courses/${courseId}`);
  return { success: true };
}

export async function deleteLesson(lessonId: string, courseId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "teacher") throw new Error("Unauthorized");

  await prisma.lesson.delete({ where: { id: lessonId } });
  revalidatePath(`/teacher/courses/${courseId}`);
  return { success: true };
}

export async function createQuiz(data: {
  title: string;
  courseId: string;
  moduleId?: string;
  timeLimitMins: number | null;
  attemptsAllowed: number;
  questions: { text: string; type: string; options: string; correctAnswer: string; points: number }[];
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "teacher") throw new Error("Unauthorized");

  // Validate the course belongs to this teacher
  const course = await prisma.course.findUnique({
    where: { id: data.courseId },
    select: { instructorId: true }
  });

  if (!course || course.instructorId !== session.user.id) {
    throw new Error("Course not found or unauthorized");
  }

  // Calculate position if moduleId is provided
  let position = 0;
  if (data.moduleId) {
    const assignments = await prisma.assignment.count({ where: { moduleId: data.moduleId } });
    const lessons = await prisma.lesson.count({ where: { moduleId: data.moduleId } });
    const quizzes = await prisma.quiz.count({ where: { moduleId: data.moduleId } });
    position = assignments + lessons + quizzes;
  } else {
    const quizzes = await prisma.quiz.count({ where: { courseId: data.courseId, moduleId: null } });
    position = quizzes;
  }

  const quiz = await prisma.quiz.create({
    data: {
      title: data.title,
      courseId: data.courseId,
      moduleId: data.moduleId,
      timeLimitMins: data.timeLimitMins,
      attemptsAllowed: data.attemptsAllowed,
      status: "active", // Make active immediately for simplicity
      position,
      questions: {
        create: data.questions
      }
    }
  });

  revalidatePath("/teacher/quizzes");
  revalidatePath(`/teacher/courses/${data.courseId}`);
  return { success: true, quizId: quiz.id };
}

export async function createAnnouncement(data: { courseId: string; title: string; content: string }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "teacher") throw new Error("Unauthorized");

  const course = await prisma.course.findUnique({
    where: { id: data.courseId },
    select: { instructorId: true }
  });

  if (!course || course.instructorId !== session.user.id) {
    throw new Error("Course not found or unauthorized");
  }

  await prisma.announcement.create({
    data: {
      title: data.title,
      content: data.content,
      courseId: data.courseId,
      authorId: session.user.id,
    }
  });

  revalidatePath(`/teacher/courses/${data.courseId}`);
  revalidatePath(`/teacher/announcements`);
  return { success: true };
}
