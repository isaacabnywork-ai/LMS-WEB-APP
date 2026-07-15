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
    const coursesResponse = await moodle.call<any>('core_course_get_courses_by_field', {
      field: 'id',
      value: courseId
    }, {}, session.user.moodleToken);
    
    if (coursesResponse && coursesResponse.courses && coursesResponse.courses.length > 0) {
      course = coursesResponse.courses[0];
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

    let baseAutologinUrl = "";
    const privateToken = (session.user as any).privateToken;
    if (privateToken) {
      try {
        const autologinResponse = await moodle.call<any>('tool_mobile_get_autologin_key', {
          privatetoken: privateToken
        }, { cache: 'no-store' }, session.user.moodleToken);
        if (autologinResponse && autologinResponse.autologinurl) {
          baseAutologinUrl = autologinResponse.autologinurl;
        }
      } catch (err: any) {
        console.warn("Failed to fetch autologin key:", err.message);
      }
    }

    const baseUrl = process.env.MOODLE_URL || "http://localhost:8080";
    courseContents = courseContents.map(section => ({
      ...section,
      modules: (section.modules || []).map((mod: any) => {
        let contentUrl = mod.url || `${baseUrl}/mod/${mod.modname}/view.php?id=${mod.id}`;
        
        if (mod.modname === 'resource' && mod.contents && mod.contents.length > 0 && mod.contents[0].fileurl) {
          contentUrl = mod.contents[0].fileurl + `&token=${session.user.moodleToken}`;
        } else if (baseAutologinUrl && contentUrl !== "#") {
          // Hide Moodle's native header, footer, and navigation blocks
          const targetUrlObj = new URL(contentUrl);
          targetUrlObj.searchParams.set('embedded', '1');
          targetUrlObj.searchParams.set('isapp', '1');
          const finalTargetUrl = targetUrlObj.toString();

          const urlObj = new URL(baseAutologinUrl);
          urlObj.searchParams.set('siteurl', finalTargetUrl);
          contentUrl = urlObj.toString();
        }

        return {
          ...mod,
          url: contentUrl
        };
      })
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
