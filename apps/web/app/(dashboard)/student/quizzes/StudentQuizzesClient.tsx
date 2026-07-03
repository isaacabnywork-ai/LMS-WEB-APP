"use client";

import React, { useState } from "react";
import Link from "next/link";

export type StudentQuiz = {
  id: string;
  title: string;
  course: string;
  courseColor: string;
  dueDate: string;
  duration: string;
  questions: number;
  status: "available" | "upcoming" | "completed";
  attempts: number;
  maxAttempts: number;
  score?: number;
  maxScore?: number;
};

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  available: { label: "Available", color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-900/20", icon: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  upcoming: { label: "Upcoming", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  completed: { label: "Completed", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
};

export default function StudentQuizzesClient({ quizzes }: { quizzes: StudentQuiz[] }) {
  const [filter, setFilter] = useState("all");

  const tabs = [
    { id: "all", label: "All Quizzes" },
    { id: "available", label: "Available" },
    { id: "upcoming", label: "Upcoming" },
    { id: "completed", label: "Completed" },
  ];

  const filtered = filter === "all" ? quizzes : quizzes.filter((q) => q.status === filter);

  return (
    <div className="animate-slide-up space-y-5 sm:space-y-8 w-full pb-20">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground mb-1">Quizzes</h1>
          <p className="text-foreground opacity-60">Test your knowledge and track your progress</p>
        </div>
        <div className="flex items-center space-x-2 text-sm font-semibold text-foreground/60">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block"></span>
          {quizzes.filter((q) => q.status === "available").length} available now
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 overflow-x-auto hide-scrollbar pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`whitespace-nowrap px-5 py-2 rounded-full font-semibold text-sm transition-all ${
              filter === tab.id
                ? "bg-teal-500 text-white shadow-md shadow-teal-500/20"
                : "bg-black/5 dark:bg-white/5 text-foreground/70 hover:text-foreground hover:bg-black/10 dark:hover:bg-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quiz Cards */}
      {filtered.length === 0 && (
        <div className="p-10 text-center glass-panel rounded-3xl opacity-60 font-semibold">
          No quizzes found.
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {filtered.map((quiz, idx) => {
          const st = (statusConfig[quiz.status] || statusConfig.available) as { label: string; color: string; bg: string; icon: string };
          const scorePercent = quiz.score !== undefined ? Math.round((quiz.score / quiz.maxScore!) * 100) : null;

          return (
            <div
              key={quiz.id}
              className="glass-panel rounded-2xl p-6 flex flex-col gap-4 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 group"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${quiz.courseColor} shrink-0`} />
                  <div>
                    <h3 className="font-bold text-base text-foreground group-hover:text-teal-500 transition-colors leading-snug">
                      {quiz.title}
                    </h3>
                    <p className="text-xs text-foreground/60 mt-0.5">{quiz.course}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${st.color} ${st.bg}`}>
                  {st.label}
                </span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-5 text-sm text-foreground/60">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{quiz.duration}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{quiz.questions} questions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{quiz.attempts}/{quiz.maxAttempts} attempts</span>
                </div>
              </div>

              {/* Score bar (completed) */}
              {scorePercent !== null && (
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-foreground/60">Your Score</span>
                    <span className={scorePercent >= 80 ? "text-emerald-500" : scorePercent >= 60 ? "text-amber-500" : "text-rose-500"}>
                      {quiz.score}/{quiz.maxScore} ({scorePercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-700 ${
                        scorePercent >= 80 ? "bg-emerald-500" : scorePercent >= 60 ? "bg-amber-500" : "bg-rose-500"
                      }`}
                      style={{ width: `${scorePercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-1 border-t border-foreground/5 mt-auto">
                <div className="flex items-center gap-1.5 text-xs text-foreground/50">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {quiz.dueDate}
                </div>

                {quiz.status === "available" && (
                  <Link
                    href={`/student/quizzes/${quiz.id}/take`}
                    className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold rounded-xl transition-colors shadow-md shadow-teal-500/20 flex items-center gap-1.5"
                  >
                    Start Quiz
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                )}
                {quiz.status === "completed" && (
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Done
                  </span>
                )}
                {quiz.status === "upcoming" && (
                  <span className="text-xs text-foreground/40 font-semibold">Not yet open</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
