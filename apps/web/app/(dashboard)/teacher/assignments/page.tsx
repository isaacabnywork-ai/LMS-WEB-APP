import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { TeacherAssignmentsClient, Assignment } from "./TeacherAssignmentsClient";

const COURSE_COLORS = ["#14b8a6", "#8b5cf6", "#f59e0b", "#ec4899", "#3b82f6"];

export default async function TeacherAssignmentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  // Fetch all assignments for courses owned by this teacher
  const dbAssignments = await prisma.assignment.findMany({
    where: {
      course: { instructorId: session.user.id }
    },
    include: {
      course: { include: { enrolments: true } },
      submissions: { include: { user: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const assignments: Assignment[] = dbAssignments.map((a, i) => {
    const totalStudents = a.course.enrolments.length;
    const submitted = a.submissions.length;
    const graded = a.submissions.filter(s => s.score !== null).length;
    
    let status: "upcoming" | "active" | "graded" = "active";
    if (submitted === 0 && totalStudents > 0) status = "upcoming";
    else if (submitted > 0 && graded === submitted) status = "graded";

    return {
      id: a.id,
      title: a.title,
      course: a.course.title,
      courseColor: COURSE_COLORS[i % COURSE_COLORS.length] || "indigo",
      dueDate: new Date(a.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Mocking due date as 7 days from creation
      totalStudents,
      submitted,
      graded,
      status,
      students: a.submissions.map(s => ({
        id: s.user.id,
        name: s.user.name || "Unknown",
        avatar: (s.user.name || "U").substring(0, 2).toUpperCase(),
        submittedAt: new Date(s.submittedAt).toLocaleDateString(),
        score: s.score,
        submissionId: s.id
      }))
    };
  });

  return <TeacherAssignmentsClient assignments={assignments} />;
}
