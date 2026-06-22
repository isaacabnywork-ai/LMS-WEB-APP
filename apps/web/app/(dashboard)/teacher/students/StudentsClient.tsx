"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";

// ── Types ────────────────────────────────────────────────────────────────────

type Status = "Active" | "At Risk" | "Completed";
type FilterTab = "All" | Status;

export interface Student {
  id: string;
  name: string;
  email: string;
  coursesEnrolled: number;
  progress: number; // 0-100
  lastActive: string; // ISO date string
  status: Status;
  avatarColor: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getProgressColor(progress: number): string {
  if (progress >= 80) return "from-emerald-500 to-teal-400";
  if (progress >= 50) return "from-amber-400 to-orange-400";
  return "from-rose-500 to-red-400";
}

function getProgressTextColor(progress: number): string {
  if (progress >= 80) return "text-emerald-400";
  if (progress >= 50) return "text-amber-400";
  return "text-rose-400";
}

function getStatusStyles(status: Status): string {
  switch (status) {
    case "Active":
      return "bg-teal-500/15 text-teal-400 ring-1 ring-teal-500/30";
    case "At Risk":
      return "bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30";
    case "Completed":
      return "bg-violet-500/15 text-violet-400 ring-1 ring-violet-500/30";
  }
}

// ── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ name, colorClass }: { name: string; colorClass: string }) {
  return (
    <div
      className={`w-10 h-10 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg`}
    >
      {getInitials(name)}
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyles(status)}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-1.5 bg-foreground/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(progress)} transition-all duration-700`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className={`text-xs font-bold tabular-nums ${getProgressTextColor(progress)}`}>
        {progress}%
      </span>
    </div>
  );
}

// ── Desktop Table Row ────────────────────────────────────────────────────────

function TableRow({ student, index }: { student: Student; index: number }) {
  return (
    <tr
      className="group border-b border-foreground/10 hover:bg-foreground/5 transition-colors"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <td className="py-4 pl-6 pr-4">
        <div className="flex items-center gap-3">
          <Avatar name={student.name} colorClass={student.avatarColor} />
          <div>
            <p className="font-semibold text-foreground text-sm leading-tight">{student.name}</p>
            <p className="text-xs text-foreground/50 mt-0.5">{student.email}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-teal-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="font-semibold text-foreground/80 text-sm">{student.coursesEnrolled}</span>
        </div>
      </td>
      <td className="py-4 px-4 w-48">
        <ProgressBar progress={student.progress} />
      </td>
      <td className="py-4 px-4">
        <span className="text-sm text-foreground/60">{formatDate(student.lastActive)}</span>
      </td>
      <td className="py-4 px-4">
        <StatusBadge status={student.status} />
      </td>
      <td className="py-4 pl-4 pr-6 text-right">
        <Link
          href={`/teacher/students/${student.id}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-500/10 text-teal-400 text-xs font-semibold hover:bg-teal-500/25 hover:text-teal-300 border border-teal-500/20 hover:border-teal-400/40 transition-all duration-200"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          View Profile
        </Link>
      </td>
    </tr>
  );
}

// ── Mobile Card ───────────────────────────────────────────────────────────────

function StudentCard({ student, index }: { student: Student; index: number }) {
  return (
    <div
      className="glass-panel rounded-2xl p-4 space-y-4 animate-slide-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={student.name} colorClass={student.avatarColor} />
          <div>
            <p className="font-semibold text-foreground text-sm leading-tight">{student.name}</p>
            <p className="text-xs text-foreground/50 mt-0.5">{student.email}</p>
          </div>
        </div>
        <StatusBadge status={student.status} />
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-foreground/5 rounded-xl p-3">
          <p className="text-xs text-foreground/50 mb-1">Courses</p>
          <p className="font-bold text-foreground">{student.coursesEnrolled} enrolled</p>
        </div>
        <div className="bg-foreground/5 rounded-xl p-3">
          <p className="text-xs text-foreground/50 mb-1">Last Active</p>
          <p className="font-bold text-foreground">{formatDate(student.lastActive)}</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-slate-500 font-medium">Overall Progress</span>
        </div>
        <ProgressBar progress={student.progress} />
      </div>

      <Link
        href={`/teacher/students/${student.id}`}
        className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-teal-500/10 text-teal-400 text-sm font-semibold hover:bg-teal-500/20 hover:text-teal-300 border border-teal-500/20 transition-all duration-200"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        View Profile
      </Link>
    </div>
  );
}

// ── Filter Tabs ───────────────────────────────────────────────────────────────

const TABS: FilterTab[] = ["All", "Active", "At Risk", "Completed"];

function FilterTabs({
  active,
  onChange,
  counts,
}: {
  active: FilterTab;
  onChange: (t: FilterTab) => void;
  counts: Record<FilterTab, number>;
}) {
  return (
    <div className="flex items-center gap-1.5 bg-foreground/5 p-1 rounded-xl border border-foreground/10 w-fit flex-wrap">
      {TABS.map((tab) => {
        const isActive = tab === active;
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              isActive
                ? "bg-teal-500 text-white shadow-md shadow-teal-500/25"
                : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
            }`}
          >
            {tab}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                isActive ? "bg-white/20 text-white" : "bg-foreground/10 text-foreground/50"
              }`}
            >
              {counts[tab]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <p className="text-slate-300 font-semibold text-base">No students found</p>
      <p className="text-slate-500 text-sm mt-1">
        {query ? `No results for "${query}"` : "There are no students in this category"}
      </p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function StudentsClient({ mockStudents }: { mockStudents: Student[] }) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("All");

  const counts = useMemo<Record<FilterTab, number>>(() => {
    const all = mockStudents.length;
    const active = mockStudents.filter((s) => s.status === "Active").length;
    const atRisk = mockStudents.filter((s) => s.status === "At Risk").length;
    const completed = mockStudents.filter((s) => s.status === "Completed").length;
    return { All: all, Active: active, "At Risk": atRisk, Completed: completed };
  }, [mockStudents]);

  const filtered = useMemo(() => {
    return mockStudents.filter((s) => {
      const matchesTab = activeTab === "All" || s.status === activeTab;
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [search, activeTab, mockStudents]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Background ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-slide-up pb-20">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-400/20 to-teal-600/20 border border-teal-500/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Students</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-400 text-sm font-bold ring-1 ring-teal-500/30">
                  {mockStudents.length} total
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-0.5">Monitor progress and manage your roster</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
            <input
              id="student-search"
              type="search"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 placeholder:text-slate-600 text-sm focus:outline-none focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/15 transition-all"
            />
          </div>
        </div>

        {/* ── Filter Tabs ── */}
        <FilterTabs active={activeTab} onChange={setActiveTab} counts={counts} />

        {/* ── Stats Summary ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Students", value: counts.All, color: "text-teal-400", bg: "from-teal-500/10 to-teal-600/5", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
            { label: "Active", value: counts.Active, color: "text-emerald-400", bg: "from-emerald-500/10 to-emerald-600/5", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
            { label: "At Risk", value: counts["At Risk"], color: "text-rose-400", bg: "from-rose-500/10 to-rose-600/5", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
            { label: "Completed", value: counts.Completed, color: "text-violet-400", bg: "from-violet-500/10 to-violet-600/5", icon: "M5 13l4 4L19 7" },
          ].map((stat) => (
            <div key={stat.label} className={`glass-panel rounded-2xl p-4 bg-gradient-to-br ${stat.bg} border border-foreground/10`}>
              <div className="flex items-center gap-3">
                <svg className={`w-5 h-5 ${stat.color} shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
                </svg>
                <div>
                  <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-foreground/50 font-medium">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Content Area ── */}
        {filtered.length === 0 ? (
          <div className="glass-panel rounded-2xl border border-slate-700/40">
            <EmptyState query={search} />
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block glass-panel rounded-2xl border border-foreground/10 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-foreground/10 bg-foreground/5">
                    <th className="py-3.5 pl-6 pr-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Student
                    </th>
                    <th className="py-3.5 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Courses
                    </th>
                    <th className="py-3.5 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest w-48">
                      Progress
                    </th>
                    <th className="py-3.5 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Last Active
                    </th>
                    <th className="py-3.5 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="py-3.5 pl-4 pr-6 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30">
                  {filtered.map((student, i) => (
                    <TableRow key={student.id} student={student} index={i} />
                  ))}
                </tbody>
              </table>
              {/* Table footer */}
              <div className="px-6 py-3 border-t border-foreground/10 bg-foreground/5 flex items-center justify-between">
                <p className="text-xs text-foreground/50">
                  Showing <span className="font-semibold text-foreground/80">{filtered.length}</span> of{" "}
                  <span className="font-semibold text-foreground/80">{mockStudents.length}</span> students
                </p>
                <div className="flex items-center gap-1 text-xs text-foreground/30">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Click a row to view details</span>
                </div>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="grid md:hidden gap-4">
              {filtered.map((student, i) => (
                <StudentCard key={student.id} student={student} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
