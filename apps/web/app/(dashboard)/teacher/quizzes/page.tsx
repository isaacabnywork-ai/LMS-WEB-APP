import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { TeacherQuizzesClient, Quiz } from "./TeacherQuizzesClient";

export default async function TeacherQuizzesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const dbQuizzes = await prisma.quiz.findMany({
    where: { course: { instructorId: session.user.id } },
    include: {
      course: { include: { enrolments: true } },
      questions: true,
      attempts: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const quizzes: Quiz[] = dbQuizzes.map(q => {
    const totalStudents = q.course.enrolments.length;
    const attempts = q.attempts.length;
    const participationRate = totalStudents > 0 ? Math.round((attempts / totalStudents) * 100) : 0;
    
    // Calculate average score
    const validAttempts = q.attempts.filter(a => a.score !== null);
    const avgScore = validAttempts.length > 0 
      ? Math.round(validAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / validAttempts.length)
      : 0;

    let status: "Active" | "Upcoming" | "Closed" = "Active";
    if (q.status === "draft") status = "Upcoming";
    if (q.status === "closed") status = "Closed";

    const distribution = { high: 0, mid: 0, low: 0 };
    if (validAttempts.length > 0) {
      let high = 0, mid = 0, low = 0;
      validAttempts.forEach(a => {
        if ((a.score || 0) >= 80) high++;
        else if ((a.score || 0) >= 50) mid++;
        else low++;
      });
      distribution.high = Math.round((high / validAttempts.length) * 100);
      distribution.mid = Math.round((mid / validAttempts.length) * 100);
      distribution.low = 100 - distribution.high - distribution.mid;
    }

    return {
      id: q.id,
      title: q.title,
      course: q.course.title,
      status: status,
      questions: q.questions.length,
      timeLimitMins: q.timeLimitMins || 0,
      attemptsAllowed: q.attemptsAllowed,
      avgScore,
      participationRate,
      totalStudents,
      dueDate: q.endAt ? new Date(q.endAt).toLocaleDateString() : "No Due Date",
      distribution
    };
  });

  return <TeacherQuizzesClient initialQuizzes={quizzes} />;
}
