"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { submitQuizAttempt } from "@/app/actions/student";

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
}

export interface QuizInfo {
  id: string;
  title: string;
  timeLimitMins: number | null;
}

export default function QuizTakeClient({ quiz, questions }: { quiz: QuizInfo; questions: QuizQuestion[] }) {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // We are using a map of questionId -> selectedOption (string value)
  const currentQ = questions[currentQuestion];
  const selectedAnswer = answers[currentQ?.id] || null;

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handleSelect = (option: string) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: option }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await submitQuizAttempt(quiz.id, answers);
      router.push("/student/quizzes");
    } catch (e) {
      console.error(e);
      alert("Failed to submit quiz.");
      setIsSubmitting(false);
    }
  };

  if (!questions || questions.length === 0) {
    return <div className="p-10 text-center glass-panel mt-10 rounded-3xl">No questions found for this quiz.</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in mt-10 pb-20">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-foreground">{quiz.title}</h1>
          <p className="text-foreground opacity-60">Complete all questions to the best of your ability.</p>
        </div>
        {quiz.timeLimitMins && (
          <div className="glass-panel px-6 py-3 rounded-full flex items-center space-x-3 border-teal-500/30 w-max">
            <svg className="w-6 h-6 text-teal-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span className="font-bold text-xl font-heading text-teal-600 dark:text-teal-400">{quiz.timeLimitMins}:00</span>
          </div>
        )}
      </div>

      <div className="glass-panel rounded-3xl p-6 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-black/5 dark:bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all duration-500"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        <div className="mb-8 mt-4">
          <span className="text-teal-600 dark:text-teal-400 font-bold tracking-widest text-sm uppercase">Question {currentQuestion + 1} of {questions.length}</span>
          <h2 className="text-2xl font-semibold mt-4 text-foreground leading-snug">
            {currentQ.text}
          </h2>
        </div>

        <div className="space-y-4">
          {currentQ.options.map((option, index) => (
            <div
              key={index}
              onClick={() => handleSelect(option)}
              className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center space-x-4
                ${selectedAnswer === option
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 shadow-lg shadow-teal-500/10'
                  : 'border-white/10 dark:border-white/5 hover:border-teal-300 dark:hover:border-teal-700 bg-black/5 dark:bg-white/5'
                }`}
            >
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors shrink-0
                ${selectedAnswer === option ? 'border-teal-500 bg-teal-500 text-white' : 'border-foreground/20 text-transparent'}
              `}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
              </div>
              <span className="text-lg font-medium text-foreground opacity-90">{option}</span>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-end">
          {currentQuestion < questions.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={selectedAnswer === null}
              className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-teal-500/30 flex items-center space-x-2"
            >
              <span>Next Question</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={selectedAnswer === null || isSubmitting}
              className="bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-emerald-500/30 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <span>{isSubmitting ? "Submitting..." : "Submit Quiz"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
