import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CourseDetailClient, { CourseDetailProps } from "@/components/CourseDetailClient";
import { enrollInCourse, submitReview, deleteReview, createStripeCheckout } from "@/app/actions/student";
import { createDiscussion, replyDiscussion } from "@/app/actions/course";
import { moodle } from "@/lib/moodle/client";

export default async function CatalogCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || !session.user.moodleToken) redirect("/");

  const resolvedParams = await params;
  const courseId = resolvedParams.id;

  // 1. Fetch Course Details from Moodle
  const coursesResponse = await moodle.call<any>('core_course_get_courses_by_field', {
    field: 'id',
    value: courseId
  }, { cache: 'no-store' }, session.user.moodleToken).catch(() => ({ courses: [] }));
  
  const course = coursesResponse.courses?.[0];
  if (!course) redirect("/student/catalog");

  // 2. Fetch Course Contents (Sections and Modules)
  const contents = await moodle.call<any[]>('core_course_get_contents', {
    courseid: courseId
  }, { cache: 'no-store' }, session.user.moodleToken).catch(() => []);

  // 3. Check Enrollment Status & Progress
  const enrolments = await moodle.call<any[]>('core_enrol_get_users_courses', {
    userid: session.user.id
  }, { cache: 'no-store' }, session.user.moodleToken).catch(() => []);
  
  const enrolment = enrolments.find((e: any) => String(e.id) === String(courseId));
  const isEnrolled = !!enrolment;
  const progress = enrolment?.progress || 0;

  // 4. Map Moodle Sections to UI Modules
  const mappedModules = contents
    .filter((section: any) => section.name && section.modules.length > 0) // Skip empty sections
    .map((section: any) => ({
      id: String(section.id),
      title: section.name,
      duration: `${section.modules.length * 15}m`, // Mock duration based on module count
      lessons: section.modules.map((mod: any) => {
        // Map Moodle module names to our UI types (Video, PDF, Quiz, Assignment)
        let type = "Page";
        if (mod.modname === "assign") type = "Assignment";
        if (mod.modname === "quiz") type = "Quiz";
        if (mod.modname === "resource") type = "PDF";
        if (mod.modname === "url" || mod.modname === "hvp" || mod.modname === "scorm") type = "Video";

        return {
          id: String(mod.id),
          title: mod.name,
          type: type,
          duration: "15m",
          completed: mod.completiondata?.state === 1 || mod.completiondata?.state === 2 // 1: complete, 2: complete pass
        };
      })
    }));

  const totalLessons = mappedModules.reduce((acc, m) => acc + m.lessons.length, 0);
  const duration = `${Math.floor(totalLessons * 15 / 60)}h ${totalLessons * 15 % 60}m`;

  // Extract actual image url
  let imageUrl = course.courseimage;
  if (course.overviewfiles && course.overviewfiles.length > 0) {
    imageUrl = course.overviewfiles[0].fileurl;
  }
  
  // Format for external viewing
  if (imageUrl) {
    if (imageUrl.includes('pluginfile.php') && !imageUrl.includes('webservice/pluginfile.php')) {
      imageUrl = imageUrl.replace('pluginfile.php', 'webservice/pluginfile.php');
    }
    if (imageUrl.includes('pluginfile.php') && !imageUrl.includes('token=')) {
      imageUrl += (imageUrl.includes('?') ? '&' : '?') + 'token=' + session.user.moodleToken;
    }
  }

  const courseProps: CourseDetailProps = {
    id: String(course.id),
    title: course.fullname,
    category: "General", // Could be fetched via core_course_get_categories
    description: course.summary?.replace(/(<([^>]+)>)/gi, "") || "No description provided.",
    thumbnailUrl: imageUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
    instructor: {
      name: "Instructor", // Usually fetched via core_enrol_get_enrolled_users filtering by role
      avatar: "I",
      role: "Instructor"
    },
    rating: 0,
    reviewCount: 0,
    enrolledCount: course.enrolledusercount || 0,
    duration: duration,
    lastUpdated: new Date((course.timemodified || 0) * 1000).toLocaleDateString(),
    level: "All Levels",
    language: "English",
    certificate: true,
    progress: progress,
    isEnrolled: isEnrolled,
    skills: ["General"],
    modules: mappedModules,
    discussions: [], // To be migrated in Phase 10
    reviews: [], // App-specific metadata
    currentUserId: session.user.id
  };

  const enrollAction = async () => {
    "use server";
    await enrollInCourse(courseId);
  };

  const createDiscussionAction = async (title: string, content: string) => {
    "use server";
    await createDiscussion(courseId, title, content);
  };

  const replyDiscussionAction = async (discussionId: string, content: string) => {
    "use server";
    await replyDiscussion(discussionId, courseId, content);
  };

  const submitReviewAction = async (rating: number, comment?: string) => {
    "use server";
    await submitReview(courseId, rating, comment);
  };

  const deleteReviewAction = async (reviewId: string) => {
    "use server";
    await deleteReview(reviewId, courseId);
  };

  return (
    <CourseDetailClient 
      course={courseProps} 
      onEnroll={enrollAction} 
      onCreateDiscussion={createDiscussionAction}
      onReplyDiscussion={replyDiscussionAction}
      onSubmitReview={submitReviewAction}
      onDeleteReview={deleteReviewAction}
    />
  );
}
