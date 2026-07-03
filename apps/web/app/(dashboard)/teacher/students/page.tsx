import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import StudentsClient, { Student } from "./StudentsClient";

export default async function TeacherStudentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  // Fetch all courses taught by this teacher
  const courses = await prisma.course.findMany({
    where: { instructorId: session.user.id },
    select: { id: true }
  });
  
  const courseIds = courses.map(c => c.id);

  // Fetch all students enrolled in these courses
  const enrolments = await prisma.enrolment.findMany({
    where: { courseId: { in: courseIds } },
    include: {
      user: {
        include: {
          enrolments: true,
          submissions: { select: { score: true } },
          quizAttempts: { select: { score: true } }
        }
      }
    }
  });

  // Group by student
  const studentMap = new Map<string, typeof enrolments[0]['user']>();
  for (const e of enrolments) {
    if (!studentMap.has(e.userId)) {
      studentMap.set(e.userId, e.user);
    }
  }

  const AVATAR_COLORS = [
    "from-violet-500 to-purple-600",
    "from-rose-500 to-pink-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-cyan-500 to-teal-500",
    "from-indigo-500 to-blue-600"
  ];

  const studentsData: Student[] = Array.from(studentMap.values()).map((user, idx) => {
    // Very simple mock logic for progress and status based on real grading counts
    const totalGrades = user.submissions.filter(s => s.score !== null).length + user.quizAttempts.filter(q => q.score !== null).length;
    const progress = Math.min(100, Math.max(0, totalGrades * 15 + 10)); // Just a mock visualization
    
    let status: "Active" | "At Risk" | "Completed" = "Active";
    if (progress >= 100) status = "Completed";
    else if (progress < 30) status = "At Risk";

    return {
      id: user.id,
      name: user.name || "Unknown Student",
      email: user.email || "",
      coursesEnrolled: user.enrolments.length,
      progress,
      lastActive: new Date().toISOString(), // Mock last active
      status,
      avatarColor: AVATAR_COLORS[idx % AVATAR_COLORS.length] || "from-violet-500 to-purple-600"
    };
  });

  return <StudentsClient mockStudents={studentsData} />;
}
