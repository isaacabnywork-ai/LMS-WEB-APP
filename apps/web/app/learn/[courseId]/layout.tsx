import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CourseSidebarClient } from "./CourseSidebarClient";

export default async function LearnLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const resolvedParams = await params;
  const courseId = resolvedParams.courseId;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { position: "asc" },
            select: { id: true, title: true, type: true, position: true }
          },
          assignments: {
            orderBy: { position: "asc" },
            select: { id: true, title: true, position: true }
          },
          quizzes: {
            orderBy: { position: "asc" },
            select: { id: true, title: true, position: true }
          }
        }
      }
    }
  });

  if (!course) {
    redirect("/student/courses");
  }

  // Fetch completed lessons for this student
  const completedProgress = await prisma.lessonProgress.findMany({
    where: {
      userId: session.user.id,
      lesson: {
        module: {
          courseId: course.id
        }
      },
      isCompleted: true
    },
    select: { lessonId: true }
  });

  const completedLessonIds = completedProgress.map(p => p.lessonId);

  const modulesWithItems = course.modules.map(m => ({
    id: m.id,
    title: m.title,
    position: m.position,
    items: [
      ...m.lessons.map(l => ({ id: l.id, title: l.title, type: l.type.toUpperCase(), position: l.position })),
      ...m.assignments.map(a => ({ id: a.id, title: a.title, type: "ASSIGNMENT", position: a.position })),
      ...m.quizzes.map(q => ({ id: q.id, title: q.title, type: "EXAM", position: q.position }))
    ].sort((a, b) => a.position - b.position)
  }));

  const courseForSidebar = { ...course, modules: modulesWithItems };

  return (
    <div className="flex flex-col lg:flex-row min-h-[100dvh] bg-background">
      <CourseSidebarClient course={courseForSidebar} completedLessonIds={completedLessonIds} />
      
      <main className="flex-1 overflow-y-auto relative h-[100dvh]">
        {children}
      </main>
    </div>
  );
}
