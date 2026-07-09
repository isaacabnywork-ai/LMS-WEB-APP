import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { StudentAssignmentsClient, StudentAssignment } from "./StudentAssignmentsClient";
import { moodle } from "@/lib/moodle/client";

const COURSE_COLORS = ["bg-teal-500", "bg-purple-500", "bg-rose-500", "bg-amber-500", "bg-blue-500"];

export default async function StudentAssignmentsPage() {
  const session = await auth();
  if (!session?.user?.id || !(session.user as any).moodleToken) redirect("/");

  const moodleToken = (session.user as any).moodleToken;
  const userId = session.user.id;

  // 1. Fetch enrolled courses
  const enrolments = await moodle.call<any[]>('core_enrol_get_users_courses', {
    userid: userId
  }, { cache: 'no-store' }, moodleToken).catch(() => []);

  const courseIds = enrolments.map(e => e.id);

  // 2. Fetch assignments for those courses
  let allAssignments: any[] = [];
  if (courseIds.length > 0) {
    const assignResponse = await moodle.call<any>('mod_assign_get_assignments', {
      courseids: courseIds
    }, { cache: 'no-store' }, moodleToken).catch(() => ({ courses: [] }));
    
    // Moodle returns { courses: [ { id, assignments: [...] } ] }
    if (assignResponse.courses) {
      for (const c of assignResponse.courses) {
        if (c.assignments) {
          allAssignments = [...allAssignments, ...c.assignments];
        }
      }
    }
  }

  // 3. Map to UI
  const assignments: StudentAssignment[] = allAssignments.map((a, i) => {
    const courseName = enrolments.find(c => c.id === a.course)?.fullname || "Course";
    const now = new Date().getTime() / 1000;
    
    let status: StudentAssignment["status"] = "future";
    if (a.duedate && a.duedate > 0) {
      const daysUntilDue = (a.duedate - now) / 86400;
      if (daysUntilDue < 0) {
        status = "overdue";
      } else if (daysUntilDue <= 3) {
        status = "pending";
      }
    }

    // We can also fetch submissions via mod_assign_get_submission_status
    // But for a fast listing, we will use basic status derivation for now.

    // Strip HTML from description
    const description = a.intro ? a.intro.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...' : "No description provided.";

    return {
      id: String(a.id),
      title: a.name,
      course: courseName,
      courseColor: COURSE_COLORS[i % COURSE_COLORS.length] || "bg-teal-500",
      dueDate: a.duedate ? new Date(a.duedate * 1000).toLocaleDateString() : "No due date",
      status,
      maxScore: a.grade || 100,
      description
    };
  });

  return <StudentAssignmentsClient assignments={assignments} />;
}
