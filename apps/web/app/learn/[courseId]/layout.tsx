import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CourseSidebarClient } from "./CourseSidebarClient";
import { moodle } from "@/lib/moodle/client";

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

  // Fetch course details from Moodle
  const coursesResponse = await moodle.call<any>('core_course_get_courses_by_field', {
    field: 'id',
    value: courseId
  }, { cache: 'no-store' }, session.user.moodleToken).catch(() => ({ courses: [] }));
  
  const course = coursesResponse.courses?.[0];
  if (!course) {
    redirect("/student/courses");
  }

  // Fetch course contents (Sections and Modules)
  const contents = await moodle.call<any[]>('core_course_get_contents', {
    courseid: courseId
  }, { cache: 'no-store' }, session.user.moodleToken).catch(() => []);

  const completedLessonIds: string[] = [];

  const modulesWithItems = contents
    .filter((section: any) => section.name && section.modules.length > 0)
    .map((section: any, index: number) => ({
      id: String(section.id),
      title: section.name,
      position: index,
      items: section.modules.map((mod: any, modIndex: number) => {
        let type = "PAGE";
        if (mod.modname === "assign") type = "ASSIGNMENT";
        if (mod.modname === "quiz") type = "EXAM";
        if (mod.modname === "resource") type = "PDF";
        if (mod.modname === "folder") type = "FOLDER";
        if (mod.modname === "url") type = "VIDEO"; // usually youtube links
        if (mod.modname === "hvp" || mod.modname === "scorm") type = "PAGE"; // Interactive Moodle modules rendered in iframe

        // Track completed items
        if (mod.completiondata?.state === 1 || mod.completiondata?.state === 2) {
          completedLessonIds.push(String(mod.id));
        }

        return {
          id: String(mod.id),
          title: mod.name,
          type: type,
          position: modIndex,
          uservisible: mod.uservisible !== false
        };
      })
    }));

  const courseForSidebar = { 
    id: String(course.id), 
    title: course.fullname,
    modules: modulesWithItems 
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[100dvh] bg-background">
      <CourseSidebarClient course={courseForSidebar} completedLessonIds={completedLessonIds} />
      
      <main className="flex-1 overflow-y-auto relative h-[100dvh]">
        {children}
      </main>
    </div>
  );
}
