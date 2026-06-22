"use client";

import { useState } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type QuizStatus = "Active" | "Upcoming" | "Closed";

export interface ScoreDistribution {
  high: number; // % scoring ≥ 80
  mid: number;  // % scoring 50–79
  low: number;  // % scoring < 50
}

export interface Quiz {
  id: string | number;
  title: string;
  course: string;
  status: QuizStatus;
  questions: number;
  timeLimitMins: number;
  attemptsAllowed: number;
  avgScore: number; // %
  participationRate: number; // %
  totalStudents: number;
  dueDate: string;
  distribution: ScoreDistribution;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<QuizStatus, string> = {
  Active:   "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  Upcoming: "bg-amber-500/15  text-amber-400  border border-amber-500/30",
  Closed:   "bg-slate-500/15  text-slate-400  border border-slate-500/30",
};

const STATUS_DOT: Record<QuizStatus, string> = {
  Active:   "bg-emerald-400",
  Upcoming: "bg-amber-400",
  Closed:   "bg-slate-500",
};

type TabKey = "All" | QuizStatus;
const TABS: TabKey[] = ["All", "Active", "Upcoming", "Closed"];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="glass-panel rounded-2xl p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-teal-500/15 flex items-center justify-center text-teal-400 shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function ParticipationBar({ rate }: { rate: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
        <span>Participation</span>
        <span className="font-medium text-foreground">{rate}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-700"
          style={{ width: `${rate}%` }}
        />
      </div>
    </div>
  );
}

function ScoreDistributionPanel({ quiz }: { quiz: Quiz }) {
  const bars = [
    { label: "High (≥80%)", value: quiz.distribution.high, color: "bg-emerald-500" },
    { label: "Mid (50–79%)", value: quiz.distribution.mid, color: "bg-amber-500" },
    { label: "Low (<50%)",  value: quiz.distribution.low, color: "bg-rose-500" },
  ];

  if (quiz.status === "Upcoming") {
    return (
      <div className="mt-4 p-4 rounded-xl bg-white/[0.03] border border-white/8 text-center">
        <p className="text-sm text-muted-foreground">Results available once quiz closes.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 rounded-xl bg-white/[0.03] border border-white/8 animate-slide-up">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
        Score Distribution
      </p>
      <div className="flex items-end gap-2 h-20 mb-3">
        {bars.map((b) => (
          <div key={b.label} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs font-semibold text-foreground">{b.value}%</span>
            <div className="w-full rounded-t-md overflow-hidden bg-white/5" style={{ height: "48px" }}>
              <div
                className={`w-full rounded-t-md ${b.color} transition-all duration-700`}
                style={{ height: `${(b.value / 100) * 48}px`, marginTop: `${48 - (b.value / 100) * 48}px` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-4 flex-wrap">
        {bars.map((b) => (
          <div key={b.label} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${b.color}`} />
            <span className="text-[11px] text-muted-foreground">{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuizCard({ quiz }: { quiz: Quiz }) {
  const [showResults, setShowResults] = useState(false);

  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4 animate-slide-up hover:border-teal-500/30 transition-all duration-300 group">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate group-hover:text-teal-400 transition-colors duration-200">
            {quiz.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{quiz.course}</p>
        </div>
        <span className={`shrink-0 flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[quiz.status]}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[quiz.status]} ${quiz.status === "Active" ? "animate-pulse" : ""}`} />
          {quiz.status}
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: <QuestionIcon />, label: "Questions", value: quiz.questions },
          { icon: <ClockIcon />,    label: "Time Limit", value: `${quiz.timeLimitMins}m` },
          { icon: <RetryIcon />,    label: "Attempts",   value: quiz.attemptsAllowed },
          { icon: <ScoreIcon />,    label: "Avg Score",  value: quiz.status === "Upcoming" ? "—" : `${quiz.avgScore}%` },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2 bg-white/[0.03] rounded-xl px-3 py-2">
            <span className="text-teal-400/70">{s.icon}</span>
            <div>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
              <p className="text-sm font-semibold text-foreground leading-tight">{String(s.value)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Participation */}
      <ParticipationBar rate={quiz.participationRate} />

      {/* Due date */}
      <p className="text-[11px] text-muted-foreground">
        <span className="text-teal-400/80">⌛</span>{" "}
        {quiz.status === "Closed" ? "Closed" : "Due"}: {quiz.dueDate} · {quiz.totalStudents} students
      </p>

      {/* Results panel */}
      {showResults && <ScoreDistributionPanel quiz={quiz} />}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Link
          href={`/teacher/quizzes/${quiz.id}/edit`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-white/10 text-sm text-muted-foreground hover:text-foreground hover:border-teal-500/40 hover:bg-teal-500/5 transition-all duration-200"
        >
          <EditIcon />
          Edit
        </Link>
        <button
          onClick={() => setShowResults((v) => !v)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            showResults
              ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
              : "bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:bg-teal-500/20 hover:border-teal-500/40"
          }`}
        >
          <ChartIcon />
          {showResults ? "Hide Results" : "View Results"}
        </button>
      </div>
    </div>
  );
}

// ─── Inline SVG Icons ─────────────────────────────────────────────────────────

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function QuestionIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}
function RetryIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 4v6h6M23 20v-6h-6" />
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
    </svg>
  );
}
function ScoreIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6"  y1="20" x2="6"  y2="14" />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function TeacherQuizzesClient({ initialQuizzes }: { initialQuizzes: Quiz[] }) {
  const [activeTab, setActiveTab] = useState<TabKey>("All");

  const filtered = activeTab === "All" ? initialQuizzes : initialQuizzes.filter((q) => q.status === activeTab);

  const totalQuizzes = initialQuizzes.length;
  const avgScore = totalQuizzes > 0 ? Math.round(
    initialQuizzes.filter((q) => q.avgScore > 0).reduce((sum, q) => sum + q.avgScore, 0) /
      Math.max(1, initialQuizzes.filter((q) => q.avgScore > 0).length)
  ) : 0;
  const liveNow = initialQuizzes.filter((q) => q.status === "Active").length;

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Quizzes</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage, monitor and analyse your assessments</p>
        </div>
        <Link
          href="/teacher/quizzes/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-teal-500/20 hover:shadow-teal-400/30 hover:scale-[1.02] active:scale-[0.98] shrink-0 w-full sm:w-auto justify-center"
        >
          <PlusIcon />
          Create New Quiz
        </Link>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up" style={{ animationDelay: "60ms" }}>
        <StatCard
          label="Total Quizzes"
          value={String(totalQuizzes)}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          }
        />
        <StatCard
          label="Average Score"
          value={`${avgScore}%`}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          }
        />
        <StatCard
          label="Live Now"
          value={String(liveNow)}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="2" />
              <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
            </svg>
          }
        />
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/8 overflow-x-auto hide-scrollbar animate-slide-up" style={{ animationDelay: "120ms" }}>
        {TABS.map((tab) => {
          const count = tab === "All" ? initialQuizzes.length : initialQuizzes.filter((q) => q.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === tab
                  ? "bg-teal-500 text-white shadow-md shadow-teal-500/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              {tab}
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full transition-colors duration-200 ${
                  activeTab === tab ? "bg-white/20 text-white" : "bg-white/8 text-muted-foreground"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Quiz Grid ── */}
      {filtered.length > 0 ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-slide-up"
          style={{ animationDelay: "180ms" }}
        >
          {filtered.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-slide-up">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <p className="text-foreground font-semibold">No quizzes found</p>
          <p className="text-muted-foreground text-sm mt-1">No {activeTab.toLowerCase()} quizzes yet.</p>
        </div>
      )}
    </div>
  );
}
