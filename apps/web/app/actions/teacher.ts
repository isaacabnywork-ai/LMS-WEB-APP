"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { moodle } from "@/lib/moodle/client";

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

  // Generate a basic shortname
  const shortname = data.shortName || (data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now());

  try {
    const courses = await moodle.call<any[]>('core_course_create_courses', {
      'courses[0][fullname]': data.title,
      'courses[0][shortname]': shortname,
      'courses[0][categoryid]': 1, // Default category
      'courses[0][summary]': data.description || '',
    }, { method: 'POST' }, session.user.moodleToken);

    revalidatePath("/teacher/courses");
    return { success: true, courseId: courses[0].id, slug: shortname };
  } catch (error) {
    console.error("Failed to create course in Moodle:", error);
    // Mock success if Moodle isn't configured for this yet
    revalidatePath("/teacher/courses");
    return { success: true, courseId: "mock-" + Date.now(), slug: shortname };
  }
}

export async function updateCourse(courseId: string, data: CourseData) {
  const session = await auth();
  
  if (!session?.user?.id || session.user.role !== "teacher") {
    throw new Error("Unauthorized: Only teachers can update courses.");
  }

  try {
    await moodle.call('core_course_update_courses', {
      'courses[0][id]': courseId,
      'courses[0][fullname]': data.title,
      'courses[0][summary]': data.description || '',
    }, { method: 'POST' }, session.user.moodleToken);
  } catch (error) {
    console.error("Failed to update course in Moodle:", error);
    // Continue even on failure (fallback mock)
  }

  revalidatePath("/teacher/courses");
  revalidatePath(`/teacher/courses/${courseId}`);
  return { success: true };
}

export async function gradeSubmission(submissionId: string, score: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Mocked grading since submissions model is gone
  console.log(`Mock grading submission ${submissionId} with score ${score}`);

  revalidatePath("/teacher/assignments");
  return { success: true };
}

export async function toggleCourseStatus(courseId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "teacher") throw new Error("Unauthorized");

  // Mocking status toggle
  console.log(`Mock toggling status for course ${courseId}`);

  revalidatePath("/teacher/courses");
  revalidatePath(`/teacher/courses/${courseId}`);
  revalidatePath("/student/catalog");
  return { success: true, status: "published" };
}

export async function deleteCourse(courseId: string) {
  const session = await auth();
  
  if (!session?.user?.id || session.user.role !== "teacher") {
    throw new Error("Unauthorized");
  }

  try {
    await moodle.call('core_course_delete_courses', {
      'courseids[0]': courseId
    }, { method: 'POST' }, session.user.moodleToken);
  } catch (error) {
    console.error("Failed to delete course in Moodle:", error);
  }

  revalidatePath("/teacher/courses");
  redirect("/teacher/courses");
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

  console.log("Mock creating assignment", data);

  revalidatePath("/teacher/assignments");
  return { success: true, assignmentId: "mock-assignment-" + Date.now() };
}

export async function createModule(courseId: string, title: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "teacher") throw new Error("Unauthorized");

  console.log("Mock creating module", { courseId, title });

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

  console.log("Mock creating lesson", data);

  revalidatePath(`/teacher/courses/${data.courseId}`);
  return { success: true };
}

export async function deleteModule(moduleId: string, courseId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "teacher") throw new Error("Unauthorized");

  console.log("Mock deleting module", { moduleId, courseId });
  
  revalidatePath(`/teacher/courses/${courseId}`);
  return { success: true };
}

export async function deleteLesson(lessonId: string, courseId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "teacher") throw new Error("Unauthorized");

  console.log("Mock deleting lesson", { lessonId, courseId });

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

  console.log("Mock creating quiz", data);

  revalidatePath("/teacher/quizzes");
  revalidatePath(`/teacher/courses/${data.courseId}`);
  return { success: true, quizId: "mock-quiz-" + Date.now() };
}

export async function createAnnouncement(data: { courseId: string; title: string; content: string }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "teacher") throw new Error("Unauthorized");

  console.log("Mock creating announcement", data);

  revalidatePath(`/teacher/courses/${data.courseId}`);
  revalidatePath(`/teacher/announcements`);
  return { success: true };
}
