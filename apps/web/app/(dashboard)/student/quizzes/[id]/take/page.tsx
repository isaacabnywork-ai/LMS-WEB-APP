import React from "react";
import QuizTakeClient, { QuizInfo, QuizQuestion } from "@/components/QuizTakeClient";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function StudentQuizTakePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const quizRecord = await prisma.quiz.findUnique({
    where: { id: resolvedParams.id },
    include: { questions: true }
  });

  if (!quizRecord) {
    return <div className="p-10 text-center mt-10 opacity-60">Quiz not found</div>;
  }

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
