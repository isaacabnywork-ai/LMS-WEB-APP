import React from "react";
import QuizTakeClient, { QuizInfo, QuizQuestion } from "@/components/QuizTakeClient";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function StudentQuizTakePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  // Mock quiz record since Prisma Quiz model was dropped
  const quizRecord = {
    id: resolvedParams.id,
    title: "Sample Quiz (Mocked)",
    timeLimitMins: 30,
    questions: [
      { id: "q1", text: "What is 2 + 2?", options: '["3", "4", "5"]' },
      { id: "q2", text: "What is the capital of France?", options: '["London", "Berlin", "Paris"]' }
    ]
  };

  const quiz: QuizInfo = {
    id: quizRecord.id,
    title: quizRecord.title,
    timeLimitMins: quizRecord.timeLimitMins
  };

  const questions: QuizQuestion[] = quizRecord.questions.map(q => {
    let options: string[] = [];
    try {
      if (q.options) {
        options = JSON.parse(q.options);
      }
    } catch (e) {
      options = [];
    }
    return {
      id: q.id,
      text: q.text,
      options
    };
  });

  return <QuizTakeClient quiz={quiz} questions={questions} />;
}
