import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { TeacherQuizzesClient, Quiz } from "./TeacherQuizzesClient";

export default async function TeacherQuizzesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  // Fetch quizzes (mocked since Prisma Quiz model was dropped)
  const quizzes: Quiz[] = [
    {
      id: "mock-quiz-1",
      title: "Midterm Examination",
      course: "Advanced Web Development",
      status: "Active",
      questions: 15,
      timeLimitMins: 60,
      attemptsAllowed: 1,
      avgScore: 82,
      participationRate: 95,
      totalStudents: 24,
      dueDate: "2026-08-15",
      distribution: { high: 40, mid: 50, low: 10 }
    }
  ];

  return <TeacherQuizzesClient initialQuizzes={quizzes} />;
}
