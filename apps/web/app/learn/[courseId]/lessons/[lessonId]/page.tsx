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
  if (!lesson || lesson.uservisible === false) redirect(`/learn/${courseId}`);

  const prevLesson = currentIndex > 0 ? allModules[currentIndex - 1] : null;
  const prevLessonId = prevLesson ? String(prevLesson.id) : null;

  const nextLesson = currentIndex < allModules.length - 1 ? allModules[currentIndex + 1] : null;
  const nextLessonId = nextLesson ? String(nextLesson.id) : null;

  // 2. Check completion status
  const isCompleted = lesson.completiondata?.state === 1 || lesson.completiondata?.state === 2;

  // We rely on Moodle's uservisible property and locking rules rather than forcing strict sequential completion here.

  // 3. Map Moodle module properties to our UI
  let type = "PAGE";
  if (lesson.modname === "assign") type = "ASSIGNMENT";
  if (lesson.modname === "quiz") type = "EXAM";
  if (lesson.modname === "resource") type = "PDF";
  if (lesson.modname === "folder") type = "FOLDER";
  if (lesson.modname === "url") type = "URL"; // external links
  if (lesson.modname === "hvp" || lesson.modname === "scorm") type = "PAGE"; // Interactive Moodle modules rendered in iframe

  let contentUrl = lesson.url || "";
  // If it's a file resource (like a PDF), extract the direct file URL
  if (lesson.modname === "resource" && lesson.contents && lesson.contents.length > 0 && lesson.contents[0].fileurl) {
    contentUrl = lesson.contents[0].fileurl + `&token=${session.user.moodleToken}`;
  } else if (contentUrl && (type === "PAGE" || type === "ASSIGNMENT" || type === "EXAM" || type === "FOLDER")) {
    // Hide Moodle's native header, footer, and navigation blocks
    const targetUrlObj = new URL(contentUrl);
    targetUrlObj.searchParams.set('embedded', '1');
    targetUrlObj.searchParams.set('isapp', '1');
    contentUrl = targetUrlObj.toString();

    const privateToken = (session.user as any).privateToken;
    if (!privateToken) {
      return (
        <div className="flex items-center justify-center min-h-[70vh] p-8 text-center flex-col gap-4">
          <h2 className="text-2xl font-bold">Session Update Required</h2>
          <p className="text-muted-foreground">
            We recently updated our secure login system. Your current session is missing a required security token.
          </p>
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg max-w-md">
            <strong>Action Required:</strong> Please log out of your account using the profile menu in the top right corner, and then log back in.
          </div>
        </div>
      );
    }

    try {
      const autologinResponse = await moodle.call<any>('tool_mobile_get_autologin_key', {
        privatetoken: privateToken
      }, { cache: 'no-store' }, session.user.moodleToken);

      if (autologinResponse && autologinResponse.autologinurl) {
        const urlObj = new URL(autologinResponse.autologinurl);
        urlObj.searchParams.set('siteurl', contentUrl);
        contentUrl = urlObj.toString();
      }
    } catch (err: any) {
      console.log("Failed to fetch autologin key:", err.message);
    }
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
      allLessons={allModules.map(m => ({ id: String(m.id), title: m.name, sectionName: m.sectionName }))}
    />
  );
}
