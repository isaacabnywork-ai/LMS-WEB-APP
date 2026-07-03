"use client";

import React, { useState } from "react";
import Link from "next/link";

export type StudentAssignment = {
  id: string;
  title: string;
  course: string;
  courseColor: string;
  dueDate: string;
  status: "pending" | "future" | "submitted" | "graded" | "overdue";
  score?: number;
  maxScore: number;
  description: string;
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Due Soon", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
  future: { label: "Upcoming", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
  submitted: { label: "Submitted", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  graded: { label: "Graded", color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-900/20" },
  overdue: { label: "Overdue", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20" },
};

export function StudentAssignmentsClient({ assignments }: { assignments: StudentAssignment[] }) {
  const [filter, setFilter] = useState("all");

  const tabs = [
    { id: "all", label: "All" },
    { id: "pending", label: "Due Soon" },
    { id: "submitted", label: "Submitted" },
    { id: "graded", label: "Graded" },
    { id: "overdue", label: "Overdue" },
  ];

  const filtered = filter === "all" ? assignments : assignments.filter((a) => a.status === filter);

  return (
    <div className="animate-slide-up space-y-5 sm:space-y-8 w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground mb-1">Assignments</h1>
          <p className="text-foreground opacity-60">Track your tasks and submissions</p>
        </div>
        <div className="flex items-center space-x-2 text-sm font-semibold text-foreground/60">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> {assignments.filter(a => a.status === "pending").length} due soon
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

      {/* Assignment Cards */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="p-8 text-center glass-panel rounded-2xl text-foreground/50">
            No assignments found for this category.
          </div>
        )}
        {filtered.map((assignment, idx) => {
          const st = (statusConfig[assignment.status] || statusConfig.future) as { label: string; color: string; bg: string };
          return (
            <div
              key={assignment.id}
              className="glass-panel rounded-2xl p-4 sm:p-6 flex items-start gap-5 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 group"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              {/* Course Color Dot */}
              <div className={`w-1.5 self-stretch rounded-full ${assignment.courseColor} shrink-0`} />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h3 className="font-bold text-lg text-foreground group-hover:text-teal-500 transition-colors leading-tight">
                      {assignment.title}
                    </h3>
                    <p className="text-sm text-foreground/60 mt-0.5">{assignment.course}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full shrink-0 ${st.color} ${st.bg}`}>
                    {st.label}
                  </span>
                </div>

                <p className="text-sm text-foreground/50 mb-4 leading-relaxed">{assignment.description}</p>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1.5 text-foreground/60">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{assignment.dueDate}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-foreground/60">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>
                        {assignment.score !== undefined && assignment.score !== null
                          ? `${assignment.score} / ${assignment.maxScore}`
                          : `Max: ${assignment.maxScore} pts`}
                      </span>
                    </div>
                  </div>

                  {assignment.status !== "submitted" && assignment.status !== "graded" && (
                    <Link
                      href={`/student/assignments/${assignment.id}/submit`}
                      className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-teal-500/20"
                    >
                      {assignment.status === "overdue" ? "Submit Late" : "Submit"}
                    </Link>
                  )}
                  {(assignment.status === "submitted" || assignment.status === "graded") && (
                    <Link
                      href={`/student/assignments/${assignment.id}/submit`}
                      className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-sm hover:underline"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{assignment.status === "graded" ? "View Grade" : "View Submission"}</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
