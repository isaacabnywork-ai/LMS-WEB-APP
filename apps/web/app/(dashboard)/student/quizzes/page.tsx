import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import StudentQuizzesClient, { StudentQuiz } from "./StudentQuizzesClient";

const COURSE_COLORS = ["bg-teal-500", "bg-purple-500", "bg-rose-500", "bg-amber-500", "bg-blue-500"];

export default async function StudentQuizzesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const dbQuizzes = await prisma.quiz.findMany({
    where: {
      course: {
        enrolments: {
          some: { userId: session.user.id }
        }
      }
    },
    include: {
      course: true,
      questions: { select: { id: true, points: true } },
      attempts: { where: { userId: session.user.id }, orderBy: { startedAt: "desc" } }
    },
    orderBy: { createdAt: "desc" }
  });

  const quizzes: StudentQuiz[] = dbQuizzes.map((q, i) => {
    const attempts = q.attempts.length;
    const maxAttempts = q.attemptsAllowed;
    const maxScore = q.questions.reduce((sum, q) => sum + q.points, 0);
    
    // Sort attempts by score descending to find best score
    const bestAttempt = [...q.attempts].sort((a, b) => (b.score || 0) - (a.score || 0))[0];

    let status: "available" | "upcoming" | "completed" = "upcoming";
    const now = new Date();
    
    if (q.status === "active") {
      if (attempts >= maxAttempts) {
        status = "completed";
      } else {
        status = "available";
      }
    } else if (q.status === "closed") {
      status = "completed";
    }

    return {
      id: q.id,
      title: q.title,
      course: q.course.title,
      courseColor: COURSE_COLORS[i % COURSE_COLORS.length] || "bg-teal-500",
      dueDate: q.endAt ? new Date(q.endAt).toLocaleDateString() : "No deadline",
      duration: q.timeLimitMins ? `${q.timeLimitMins} min` : "No limit",
      questions: q.questions.length,
      status,
      attempts,
      maxAttempts,
      score: bestAttempt?.score ?? undefined,
      maxScore
    };
  });

  return <StudentQuizzesClient quizzes={quizzes} />;
}
