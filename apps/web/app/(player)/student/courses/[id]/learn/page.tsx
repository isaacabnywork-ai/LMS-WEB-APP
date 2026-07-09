import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { moodle } from "@/lib/moodle/client";
import CoursePlayerClient from "@/components/player/CoursePlayerClient";

export default async function CoursePlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const courseId = resolvedParams.id;
  
  const session = await auth();
  if (!session?.user?.id || !session.user.moodleToken) {
    redirect("/login");
  }

  // 1. Fetch course details
  let course;
  try {
    const courses = await moodle.call<any[]>('core_course_get_courses_by_field', {
      field: 'id',
      value: courseId
    }, {}, session.user.moodleToken);
    
    if (courses && courses.courses && courses.courses.length > 0) {
      course = courses.courses[0];
    } else {
      throw new Error("Course not found");
    }
  } catch (err) {
    console.error("Failed to fetch course details:", err);
    redirect("/student/catalog");
  }

  // 2. Fetch course contents (Sections and Modules)
  let courseContents: any[] = [];
  try {
    courseContents = await moodle.call<any[]>('core_course_get_contents', {
      courseid: courseId
    }, {}, session.user.moodleToken);

    // Backfill missing URLs for modules (e.g. forums often don't return a url field)
    const baseUrl = process.env.MOODLE_URL || "http://localhost:8080";
    courseContents = courseContents.map(section => ({
      ...section,
      modules: (section.modules || []).map((mod: any) => ({
        ...mod,
        url: mod.url || `${baseUrl}/mod/${mod.modname}/view.php?id=${mod.id}`
      }))
    }));
  } catch (err) {
    console.error("Failed to fetch course contents:", err);
  }

  // Inject Dummy Data if Moodle returns empty or just 1 forum module
  // This helps us test the UI without having to build a massive course in Moodle manually
  const hasOnlyForum = courseContents.length === 1 && courseContents[0].modules?.length === 1 && courseContents[0].modules[0].modname === 'forum';
  if (courseContents.length === 0 || hasOnlyForum) {
    courseContents = [
      {
        id: 1,
        name: "Module 1: Introduction",
        modules: [
          {
            id: 101,
            name: "Welcome to the Course",
            modname: "page",
            url: "#",
            completiondata: { state: 1 }, // completed
            contentsinfo: { repositorytype: "" },
            contents: [{ fileurl: "dummy", filename: "dummy" }],
          },
          {
            id: 102,
            name: "Course Overview & Syllabus",
            modname: "resource",
            url: "#",
            completiondata: { state: 0 },
            contents: [{ fileurl: "dummy.pdf", filename: "syllabus.pdf" }],
          }
        ]
      },
      {
        id: 2,
        name: "Module 2: Core Concepts",
        modules: [
          {
            id: 201,
            name: "Fundamentals of Aviation Security",
            modname: "url",
            url: "#",
            contents: [{ fileurl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", filename: "video" }],
            completiondata: { state: 0 },
          },
          {
            id: 202,
            name: "Threat Assessment Basics",
            modname: "page",
            url: "#",
            completiondata: { state: 0 },
          }
        ]
      }
    ];
  }

  return (
    <CoursePlayerClient 
      courseId={courseId} 
      courseTitle={course.displayname || course.fullname}
      sections={courseContents}
    />
  );
}
