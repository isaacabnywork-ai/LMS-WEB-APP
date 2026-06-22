import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import StudentGradesClient, { GradeItem } from "./StudentGradesClient";

function calculateLetterGrade(score: number, maxScore: number) {
  if (maxScore === 0) return "N/A";
  const pct = score / maxScore;
  if (pct >= 0.95) return "A+";
  if (pct >= 0.90) return "A";
  if (pct >= 0.85) return "B+";
  if (pct >= 0.80) return "B";
  if (pct >= 0.75) return "C+";
  if (pct >= 0.70) return "C";
  if (pct >= 0.60) return "D";
  return "F";
}

function calculateGPA(pcts: number[]) {
  if (pcts.length === 0) return "0.0";
  let total = 0;
  for (const p of pcts) {
    if (p >= 0.9) total += 4.0;
    else if (p >= 0.8) total += 3.0;
    else if (p >= 0.7) total += 2.0;
    else if (p >= 0.6) total += 1.0;
  }
  return (total / pcts.length).toFixed(1);
}

export default async function StudentGradesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const userId = session.user.id;

  // Fetch graded assignments
  const submissions = await prisma.submission.findMany({
    where: { userId, score: { not: null } },
    include: { assignment: { include: { course: true } } },
    orderBy: { gradedAt: "desc" }
  });

  // Fetch graded quizzes
  const quizAttempts = await prisma.quizAttempt.findMany({
    where: { userId, score: { not: null } },
    include: { quiz: { include: { course: true, questions: true } } },
    orderBy: { submittedAt: "desc" }
  });

  const grades: GradeItem[] = [];
  const pcts: number[] = [];

  submissions.forEach(s => {
    const score = s.score!;
    const maxScore = s.assignment.maxScore;
    pcts.push(score / maxScore);
    grades.push({
      id: `sub-${s.id}`,
      course: s.assignment.course.title,
      assignment: s.assignment.title,
      score,
      total: maxScore,
      date: s.gradedAt ? new Date(s.gradedAt).toLocaleDateString() : new Date().toLocaleDateString(),
      status: calculateLetterGrade(score, maxScore)
    });
  });

  quizAttempts.forEach(qa => {
    const score = qa.score!;
    const maxScore = qa.quiz.questions.reduce((sum, q) => sum + q.points, 0) || 1;
    pcts.push(score / maxScore);
    grades.push({
      id: `qa-${qa.id}`,
      course: qa.quiz.course.title,
      assignment: qa.quiz.title,
      score,
      total: maxScore,
      date: qa.submittedAt ? new Date(qa.submittedAt).toLocaleDateString() : new Date().toLocaleDateString(),
      status: calculateLetterGrade(score, maxScore)
    });
  });

  // Sort by date descending
  grades.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const gpa = calculateGPA(pcts);
  const totalCredits = grades.length * 3; // Mock 3 credits per graded item

  return <StudentGradesClient grades={grades} totalCredits={totalCredits} gpa={gpa} />;
}
