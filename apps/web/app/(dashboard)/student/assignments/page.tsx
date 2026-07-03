import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { StudentAssignmentsClient, StudentAssignment } from "./StudentAssignmentsClient";

const COURSE_COLORS = ["bg-teal-500", "bg-purple-500", "bg-rose-500", "bg-amber-500", "bg-blue-500"];

export default async function StudentAssignmentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  // Fetch all assignments for courses the student is enrolled in
  const dbAssignments = await prisma.assignment.findMany({
    where: {
      course: {
        enrolments: {
          some: { userId: session.user.id }
        }
      }
    },
    include: {
      course: true,
      submissions: {
        where: { userId: session.user.id }
      }
    },
    orderBy: { dueAt: 'asc' }
  });

  const assignments: StudentAssignment[] = dbAssignments.map((a, i) => {
    const submission = a.submissions[0];
    
    let status: StudentAssignment["status"] = "future";
    const now = new Date();
    
    if (submission) {
      if (submission.score !== null && submission.score !== undefined) {
        status = "graded";
      } else {
        status = "submitted";
      }
    } else {
      if (a.dueAt && new Date(a.dueAt) < now) {
        status = "overdue";
      } else if (a.dueAt && new Date(a.dueAt).getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) {
        // Due within 7 days
        status = "pending";
      } else {
        status = "future";
      }
    }

    return {
      id: a.id,
      title: a.title,
      course: a.course.title,
      courseColor: COURSE_COLORS[i % COURSE_COLORS.length] || "bg-teal-500",
      dueDate: a.dueAt ? new Date(a.dueAt).toLocaleString() : "No due date",
      status,
      maxScore: a.maxScore,
      score: submission?.score ?? undefined,
      description: a.description || "No description provided.",
    };
  });

  return <StudentAssignmentsClient assignments={assignments} />;
}
