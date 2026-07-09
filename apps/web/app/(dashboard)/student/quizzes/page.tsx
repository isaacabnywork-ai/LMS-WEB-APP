import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import StudentQuizzesClient, { StudentQuiz } from "./StudentQuizzesClient";
import { moodle } from "@/lib/moodle/client";

const COURSE_COLORS = ["bg-teal-500", "bg-purple-500", "bg-rose-500", "bg-amber-500", "bg-blue-500"];

export default async function StudentQuizzesPage() {
  const session = await auth();
  if (!session?.user?.id || !session.user.moodleToken) redirect("/");

  // 1. Fetch user's courses
  const enrolments = await moodle.call<any[]>('core_enrol_get_users_courses', {
    userid: session.user.id
  }, { cache: 'no-store' }, session.user.moodleToken).catch(() => []);

  const courseIds = enrolments.map(e => e.id);

  // 2. Fetch quizzes for those courses
  let allQuizzes: any[] = [];
  if (courseIds.length > 0) {
    const quizResponse = await moodle.call<any>('mod_quiz_get_quizzes_by_courses', {
      courseids: courseIds
    }, { cache: 'no-store' }, session.user.moodleToken).catch(() => ({ quizzes: [] }));
    allQuizzes = quizResponse.quizzes || [];
  }

  // 3. Map Moodle quizzes to the expected UI type
  const quizzes: StudentQuiz[] = allQuizzes.map((q, i) => {
    // Moodle handles attempts via mod_quiz_get_user_attempts, but for list view
    // we can use basic derived fields or default them.
    const attempts = 0; // Would require N+1 query or custom Moodle WebService
    const maxAttempts = q.attempts || 1;
    const maxScore = q.grade || 100;
    
    let status: "available" | "upcoming" | "completed" = "available";
    const now = new Date().getTime() / 1000;
    
    if (q.timeclose && q.timeclose > 0 && now > q.timeclose) {
      status = "completed";
    }

    // Find the course name from enrolments
    const courseName = enrolments.find(c => c.id === q.course)?.fullname || "Course";

    return {
      id: String(q.id),
      title: q.name,
      course: courseName,
      courseColor: COURSE_COLORS[i % COURSE_COLORS.length] || "bg-teal-500",
      dueDate: q.timeclose ? new Date(q.timeclose * 1000).toLocaleDateString() : "No deadline",
      duration: q.timelimit ? `${Math.floor(q.timelimit / 60)} min` : "No limit",
      questions: 10, // Mocked unless we fetch mod_quiz_get_quiz_info
      status,
      attempts,
      maxAttempts,
      score: undefined,
      maxScore
    };
  });

  return <StudentQuizzesClient quizzes={quizzes} />;
}
