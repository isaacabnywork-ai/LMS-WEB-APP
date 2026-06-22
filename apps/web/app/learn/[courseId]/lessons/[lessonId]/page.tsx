import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LessonViewerClient } from "./LessonViewerClient";

export default async function LessonPage({
  params
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const resolvedParams = await params;
  const { courseId, lessonId } = resolvedParams;

  // 1. Fetch the course with all modules and lessons to determine prev/next logic
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { position: "asc" }
          }
        }
      }
    }
  });

  if (!course) redirect("/student/courses");

  // Flatten lessons to easily find current, prev, next
  const allLessons = course.modules.flatMap(m => m.lessons);
  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  
  if (currentIndex === -1) {
    redirect(`/learn/${courseId}`);
  }

  const lesson = allLessons[currentIndex];
  const prevLessonId = currentIndex > 0 ? allLessons[currentIndex - 1].id : null;
  const nextLessonId = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1].id : null;

  // Fetch current lesson's module name
  const currentModule = course.modules.find(m => m.id === lesson.moduleId);

  // 2. Check completion status
  const progress = await prisma.lessonProgress.findUnique({
    where: {
      userId_lessonId: {
        userId: session.user.id,
        lessonId: lesson.id
      }
    }
  });

  const isCompleted = progress?.isCompleted ?? false;

  return (
    <LessonViewerClient 
      lesson={{
        id: lesson.id,
        title: lesson.title,
        type: lesson.type,
        contentUrl: lesson.contentUrl,
        module: { title: currentModule?.title || "Module" }
      }}
      courseId={courseId}
      isCompleted={isCompleted}
      nextLessonId={nextLessonId}
      prevLessonId={prevLessonId}
    />
  );
}
