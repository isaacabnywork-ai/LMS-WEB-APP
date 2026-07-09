import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LessonViewerClient } from "./LessonViewerClient";
import { moodle } from "@/lib/moodle/client";

export default async function LessonPage({
  params
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const resolvedParams = await params;
  const { courseId, lessonId } = resolvedParams;

  // 1. Fetch course contents from Moodle
  const contents = await moodle.call<any[]>('core_course_get_contents', {
    courseid: courseId
  }, { cache: 'no-store' }, session.user.moodleToken).catch(() => []);

  if (!contents || contents.length === 0) redirect("/student/courses");

  // Flatten modules (lessons) to easily find current, prev, next
  const allModules: any[] = [];
  contents.forEach((section: any) => {
    if (section.modules && section.modules.length > 0) {
      section.modules.forEach((mod: any) => {
        allModules.push({
          ...mod,
          sectionName: section.name
        });
      });
    }
  });

  const currentIndex = allModules.findIndex(m => String(m.id) === lessonId);
  
  if (currentIndex === -1) {
    redirect(`/learn/${courseId}`);
  }

  const lesson = allModules[currentIndex];
  if (!lesson) redirect(`/learn/${courseId}`);

  const prevLesson = currentIndex > 0 ? allModules[currentIndex - 1] : null;
  const prevLessonId = prevLesson ? String(prevLesson.id) : null;

  const nextLesson = currentIndex < allModules.length - 1 ? allModules[currentIndex + 1] : null;
  const nextLessonId = nextLesson ? String(nextLesson.id) : null;

  // 2. Check completion status
  const isCompleted = lesson.completiondata?.state === 1 || lesson.completiondata?.state === 2;

  // 3. Map Moodle module properties to our UI
  let type = "PAGE";
  if (lesson.modname === "assign") type = "ASSIGNMENT";
  if (lesson.modname === "quiz") type = "EXAM";
  if (lesson.modname === "resource") type = "PDF";
  if (lesson.modname === "folder") type = "FOLDER";
  if (lesson.modname === "url") type = "VIDEO"; // usually youtube links
  if (lesson.modname === "hvp" || lesson.modname === "scorm") type = "PAGE"; // Interactive Moodle modules rendered in iframe

  let contentUrl = lesson.url || "";
  // If it's a file resource (like a PDF), extract the direct file URL
  if (lesson.modname === "resource" && lesson.contents && lesson.contents.length > 0 && lesson.contents[0].fileurl) {
    contentUrl = lesson.contents[0].fileurl + `&token=${session.user.moodleToken}`;
  }

  return (
    <LessonViewerClient 
      lesson={{
        id: String(lesson.id),
        title: lesson.name,
        type: type,
        contentUrl: contentUrl,
        module: { title: lesson.sectionName || "Module" }
      }}
      courseId={courseId}
      isCompleted={isCompleted}
      nextLessonId={nextLessonId}
      prevLessonId={prevLessonId}
    />
  );
}
