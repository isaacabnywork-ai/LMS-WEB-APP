"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { gradeSubmission } from "@/app/actions/teacher";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Student {
  id: string;
  name: string;
  avatar: string;
  submittedAt: string;
  score: number | null;
  submissionId: string;
}

export interface Assignment {
  id: string;
  title: string;
  course: string;
  courseColor: string;
  dueDate: string;
  totalStudents: number;
  submitted: number;
  graded: number;
  status: "upcoming" | "active" | "graded";
  students: Student[];
}

const TABS = ["All", "Needs Grading", "Graded", "Upcoming"] as const;
type Tab = (typeof TABS)[number];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isOverdue(dateStr: string) {
  return new Date(dateStr) < new Date();
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="glass-panel rounded-2xl px-5 py-4 flex items-center gap-4 min-w-[140px]">
      <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-foreground/50 mt-0.5 whitespace-nowrap">{label}</p>
      </div>
    </div>
  );
}

function GradeInput({
  student,
  onSave,
}: {
  student: Student;
  onSave: (id: string, score: number) => Promise<void>;
}) {
  const [val, setVal] = useState<string>(student.score !== null ? String(student.score) : "");
  const [saved, setSaved] = useState(student.score !== null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    const n = parseInt(val, 10);
    if (!isNaN(n) && n >= 0 && n <= 100) {
      startTransition(async () => {
        await onSave(student.id, n);
        setSaved(true);
      });
    }
  }

  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
        {student.avatar}
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{student.name}</p>
        <p className="text-xs text-foreground/40">{student.submittedAt}</p>
      </div>
      {/* Score input */}
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          max={100}
          value={val}
          onChange={(e) => { setVal(e.target.value); setSaved(false); }}
          placeholder="—"
          className="w-14 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-center text-sm text-foreground focus:outline-none focus:border-teal-500 transition-colors"
        />
        <span className="text-foreground/30 text-xs">/100</span>
        <button
          onClick={handleSave}
          disabled={isPending}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
            saved
              ? "bg-emerald-500/20 text-emerald-400"
              : isPending ? "bg-teal-500/50 text-white cursor-not-allowed" : "bg-teal-500 hover:bg-teal-400 text-white"
          }`}
        >
          {isPending ? "..." : saved ? "✓" : "Save"}
        </button>
      </div>
    </div>
  );
}

function QuickGradingPanel({
  assignment,
  onClose,
}: {
  assignment: Assignment;
  onClose: () => void;
}) {
  const [students, setStudents] = useState<Student[]>(assignment.students);

  async function handleSave(id: string, score: number) {
    const student = students.find(s => s.id === id);
    if (!student) return;
    
    await gradeSubmission(student.submissionId, score);
    
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, score } : s))
    );
  }

  const ungradedCount = students.filter((s) => s.score === null).length;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col glass-panel border-l border-white/10 animate-slide-up"
        style={{ animationName: "slideInRight" }}>
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
          }
        `}</style>

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/10">
          <div>
            <p className="text-xs text-teal-400 font-semibold uppercase tracking-wider mb-1">
              Quick Grading
            </p>
            <h3 className="text-lg font-bold text-foreground leading-snug">
              {assignment.title}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: assignment.courseColor }}
              />
              <span className="text-sm text-foreground/50">{assignment.course}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-foreground/60 flex items-center justify-center transition-colors mt-1"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Summary bar */}
        <div className="flex items-center gap-4 px-6 py-3 border-b border-white/5">
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-foreground/50">{students.filter(s => s.score !== null).length} graded</span>
              <span className="text-foreground/50">{students.length} submitted</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${students.length ? (students.filter(s => s.score !== null).length / students.length) * 100 : 0}%` }}
              />
            </div>
          </div>
          {ungradedCount > 0 && (
            <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-medium">
              {ungradedCount} left
            </span>
          )}
        </div>

        {/* Student list */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          {students.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-foreground/20">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>
                </svg>
              </div>
              <p className="text-foreground/40 text-sm">No submissions yet</p>
            </div>
          ) : (
            students.map((student) => (
              <GradeInput key={student.id} student={student} onSave={handleSave} />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <button className="w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-semibold text-sm transition-all hover:shadow-[0_0_20px_rgba(20,184,166,0.4)]">
            Export Grades
          </button>
        </div>
      </div>
    </>
  );
}

function AssignmentCard({
  assignment,
  onGradeNow,
}: {
  assignment: Assignment;
  onGradeNow: (a: Assignment) => void;
}) {
  const gradingPercent =
    assignment.submitted > 0
      ? Math.round((assignment.graded / assignment.submitted) * 100)
      : 0;
  const allGraded = assignment.submitted > 0 && assignment.graded === assignment.submitted;
  const overdue = isOverdue(assignment.dueDate) && assignment.status !== "graded";

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4 hover:border-teal-500/30 border border-white/5 transition-all duration-300 hover:shadow-[0_0_30px_rgba(20,184,166,0.08)] group animate-slide-up">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground group-hover:text-teal-400 transition-colors line-clamp-1">
            {assignment.title}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className="inline-block w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: assignment.courseColor }}
            />
            <span className="text-sm text-foreground/50 truncate">{assignment.course}</span>
          </div>
        </div>

        {/* Status badge */}
        {assignment.status === "upcoming" ? (
          <span className="flex-shrink-0 text-xs bg-blue-500/15 text-blue-400 px-3 py-1 rounded-full font-medium border border-blue-400/20">
            Upcoming
          </span>
        ) : allGraded ? (
          <span className="flex-shrink-0 text-xs bg-emerald-500/15 text-emerald-400 px-3 py-1 rounded-full font-medium border border-emerald-400/20">
            Completed
          </span>
        ) : (
          <span className="flex-shrink-0 text-xs bg-amber-500/15 text-amber-400 px-3 py-1 rounded-full font-medium border border-amber-400/20">
            Needs Grading
          </span>
        )}
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-4 text-sm">
        {/* Due date */}
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={overdue ? "text-rose-400" : "text-foreground/40"}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span className={overdue ? "text-rose-400 font-medium" : "text-foreground/50"}>
            {overdue ? "Overdue · " : "Due "}{formatDate(assignment.dueDate)}
          </span>
        </div>

        {/* Submissions */}
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground/40">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>
          </svg>
          <span className="text-foreground/50">
            <span className="text-foreground font-medium">{assignment.submitted}</span>/{assignment.totalStudents} submitted
          </span>
        </div>
      </div>

      {/* Grading progress */}
      {assignment.submitted > 0 && (
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-foreground/50">Grading progress</span>
            <span className={gradingPercent === 100 ? "text-emerald-400 font-semibold" : "text-teal-400 font-semibold"}>
              {assignment.graded}/{assignment.submitted} graded
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/8 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${gradingPercent}%`,
                background: gradingPercent === 100
                  ? "linear-gradient(90deg, #10b981, #34d399)"
                  : "linear-gradient(90deg, #14b8a6, #2dd4bf)",
              }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        {!allGraded && assignment.submitted > 0 && (
          <button
            onClick={() => onGradeNow(assignment)}
            className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white text-sm font-semibold transition-all hover:shadow-[0_0_18px_rgba(20,184,166,0.4)] flex items-center justify-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.125L18 8.625"/>
            </svg>
            Grade Now
          </button>
        )}
        {(allGraded || assignment.submitted === 0) && (
          <button
            onClick={() => onGradeNow(assignment)}
            className="flex-1 py-2.5 rounded-xl bg-white/8 hover:bg-white/12 border border-white/10 text-foreground/70 hover:text-foreground text-sm font-semibold transition-all flex items-center justify-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            View
          </button>
        )}
        <Link
          href={`/teacher/assignments/${assignment.id}/edit`}
          className="py-2.5 px-4 rounded-xl bg-white/8 hover:bg-white/12 border border-white/10 text-foreground/50 hover:text-foreground text-sm font-semibold transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
          </svg>
        </Link>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function TeacherAssignmentsClient({ assignments }: { assignments: Assignment[] }) {
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [gradingPanel, setGradingPanel] = useState<Assignment | null>(null);

  const filteredAssignments = assignments.filter((a) => {
    if (activeTab === "All") return true;
    if (activeTab === "Needs Grading")
      return a.submitted > 0 && a.graded < a.submitted;
    if (activeTab === "Graded")
      return a.submitted > 0 && a.graded === a.submitted;
    if (activeTab === "Upcoming") return a.status === "upcoming";
    return true;
  });

  const totalAssignments = assignments.length;
  const pendingReview = assignments.reduce(
    (sum, a) => sum + (a.submitted - a.graded),
    0
  );
  const gradedThisWeek = assignments.filter((a) => a.status === "graded").reduce(
    (sum, a) => sum + a.graded,
    0
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5 sm:space-y-8">

        {/* ── Header ── */}
        <div className="animate-slide-up flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs text-teal-400 font-semibold uppercase tracking-widest mb-1">
              Teacher Portal
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Assignments</h1>
            <p className="text-foreground/50 mt-1 text-sm">
              Manage, grade and track all your course assignments
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Stats */}
            <StatCard
              label="Total Assignments"
              value={totalAssignments}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              }
            />
            <StatCard
              label="Pending Review"
              value={pendingReview}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              }
            />
            <StatCard
              label="Graded This Week"
              value={gradedThisWeek}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              }
            />
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="animate-slide-up flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          style={{ animationDelay: "60ms" }}>
          {/* Tabs */}
          <div className="flex items-center gap-1 glass-panel rounded-xl p-1.5 overflow-x-auto hide-scrollbar">
            {TABS.map((tab) => {
              const count = assignments.filter((a) => {
                if (tab === "All") return true;
                if (tab === "Needs Grading") return a.submitted > 0 && a.graded < a.submitted;
                if (tab === "Graded") return a.submitted > 0 && a.graded === a.submitted;
                if (tab === "Upcoming") return a.status === "upcoming";
                return false;
              }).length;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    activeTab === tab
                      ? "bg-teal-500 text-white shadow-[0_0_14px_rgba(20,184,166,0.35)]"
                      : "text-foreground/60 hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  {tab}
                  <span
                    className={`text-xs rounded-full px-1.5 py-0.5 font-semibold ${
                      activeTab === tab
                        ? "bg-white/20 text-white"
                        : "bg-white/10 text-foreground/50"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* New Assignment CTA */}
          <Link
            href="/teacher/assignments/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white text-sm font-semibold transition-all hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] active:scale-[0.98]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
            </svg>
            New Assignment
          </Link>
        </div>

        {/* ── Assignment Grid ── */}
        {filteredAssignments.length === 0 ? (
          <div className="glass-panel rounded-2xl p-16 flex flex-col items-center justify-center text-center animate-slide-up">
            <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-5">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-foreground/20">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground/40 mb-2">No assignments found</h3>
            <p className="text-sm text-foreground/30">Switch tabs or create a new assignment</p>
          </div>
        ) : (
          <div
            className="grid gap-4 animate-slide-up"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
              animationDelay: "120ms",
            }}
          >
            {filteredAssignments.map((assignment, i) => (
              <div key={assignment.id} style={{ animationDelay: `${i * 40}ms` }}>
                <AssignmentCard
                  assignment={assignment}
                  onGradeNow={setGradingPanel}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Quick Grading Panel ── */}
      {gradingPanel && (
        <QuickGradingPanel
          assignment={gradingPanel}
          onClose={() => setGradingPanel(null)}
        />
      )}
    </div>
  );
}
