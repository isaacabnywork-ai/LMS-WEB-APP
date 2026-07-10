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

  // Fetch FULL course contents using Admin Token (to see all modules, even hidden ones)
  const fullContents = await moodle.call<any[]>('core_course_get_contents', {
    courseid: courseId
  }, { cache: 'no-store' }, process.env.MOODLE_WS_TOKEN).catch(() => []);

  // Fetch STUDENT course contents (to see what is actually unlocked and completed for them)
  const studentContents = await moodle.call<any[]>('core_course_get_contents', {
    courseid: courseId
  }, { cache: 'no-store' }, session.user.moodleToken).catch(() => []);

  const completedLessonIds: string[] = [];

  console.log("DEBUG LAYOUT.TSX: fullContents length:", fullContents.length);
  console.log("DEBUG LAYOUT.TSX: fullContents sections:", fullContents.map(s => s.name).join(", "));
  console.log("DEBUG LAYOUT.TSX: studentContents length:", studentContents.length);
  console.log("DEBUG LAYOUT.TSX: studentContents sections:", studentContents.map(s => s.name).join(", "));

  // Create a lookup map for student's view of the modules
  const studentModuleMap = new Map();
  studentContents.forEach((section: any) => {
    (section.modules || []).forEach((mod: any) => {
      studentModuleMap.set(mod.id, mod);
    });
  });

  const modulesWithItems = fullContents
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
        if (mod.modname === "hvp" || mod.modname === "scorm") type = "PAGE"; 

        // Get student's version of this module
        const studentMod = studentModuleMap.get(mod.id);

        // Track completed items based on student's data
        if (studentMod?.completiondata?.state === 1 || studentMod?.completiondata?.state === 2) {
          completedLessonIds.push(String(mod.id));
        }

        // It is user-visible if the student can see it AND it's marked uservisible: true by Moodle for the student.
        // If it's completely missing from studentMod, it's hidden from them.
        const isUserVisible = studentMod ? (studentMod.uservisible !== false) : false;

        return {
          id: String(mod.id),
          title: mod.name,
          type: type,
          position: modIndex,
          uservisible: isUserVisible
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
