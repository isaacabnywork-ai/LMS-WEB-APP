import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { TeacherAssignmentsClient, Assignment } from "./TeacherAssignmentsClient";

const COURSE_COLORS = ["#14b8a6", "#8b5cf6", "#f59e0b", "#ec4899", "#3b82f6"];

export default async function TeacherAssignmentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  // Fetch all assignments (mocked since Prisma models were dropped)
  const assignments: Assignment[] = [
    {
      id: "mock-assign-1",
      title: "React Fundamentals Project",
      course: "Advanced Web Development",
      courseColor: COURSE_COLORS[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      totalStudents: 24,
      submitted: 18,
      graded: 10,
      status: "active",
      students: [
        {
          id: "3",
          name: "student",
          avatar: "ST",
          submittedAt: new Date().toLocaleDateString(),
          score: null,
          submissionId: "sub-1"
        }
      ]
    }
  ];

  return <TeacherAssignmentsClient assignments={assignments} />;
}
