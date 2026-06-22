import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

import { AnnouncementsList } from '@/components/AnnouncementsList';

export default async function TeacherDashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  // Fetch teacher's courses
  const courses = await prisma.course.findMany({
    where: { instructorId: session.user.id },
    include: { _count: { select: { enrolments: true } } }
  });

  // Fetch pending submissions for grading pipeline
  const pendingSubmissions = await prisma.submission.findMany({
    where: {
      score: null,
      assignment: { course: { instructorId: session.user.id } }
    },
    include: {
      user: { select: { name: true } },
      assignment: { select: { title: true, course: { select: { title: true } } } }
    },
    orderBy: { submittedAt: 'asc' },
    take: 10
  });

  // Fetch recent activity (recent submissions)
  const recentSubmissions = await prisma.submission.findMany({
    where: { assignment: { course: { instructorId: session.user.id } } },
    include: { user: { select: { name: true } }, assignment: { select: { title: true } } },
    orderBy: { submittedAt: 'desc' },
    take: 5
  });

  const pendingCount = await prisma.submission.count({
    where: {
      score: null,
      assignment: { course: { instructorId: session.user.id } }
    }
  });

  const activeCourses = courses.filter(c => c.status === "published").length;
  const totalStudents = courses.reduce((sum, c) => sum + c._count.enrolments, 0);

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "S";
  };
  
  const COLORS = [
    "bg-teal-500/20 text-teal-600 dark:text-teal-400",
    "bg-rose-500/20 text-rose-600 dark:text-rose-400",
    "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400",
    "bg-amber-500/20 text-amber-600 dark:text-amber-400"
  ];
  return (
    <div className="w-full animate-slide-up space-y-8">
      <AnnouncementsList />
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-5 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground mb-1">
            Instructor Dashboard
          </h1>
          <p className="text-foreground opacity-60">Overview of your courses and grading pipeline.</p>
        </div>
        <Link href="/teacher/courses/create" className="w-full sm:w-auto bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-all flex items-center justify-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          <span>Create Course</span>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: "Active Courses", value: activeCourses.toString(), color: "bg-teal-500/10", iconColor: "text-teal-500", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
          { label: "Total Students", value: totalStudents.toLocaleString(), color: "bg-indigo-500/10", iconColor: "text-indigo-500", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
          { label: "Needs Grading", value: pendingCount.toString(), color: "bg-rose-500/10", iconColor: "text-rose-500", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
          { label: "Unread Messages", value: "0", color: "bg-amber-500/10", iconColor: "text-amber-500", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
        ].map((stat) => (
          <div key={stat.label} className="glass-panel p-6 glass-panel-hover">
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-4`}>
              <svg className={`w-5 h-5 ${stat.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
              </svg>
            </div>
            <p className="text-foreground opacity-50 text-xs font-semibold mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Grading Pipeline */}
        <div className="glass-panel p-4 sm:p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold font-heading text-foreground">Grading Pipeline</h2>
            <span className="text-xs font-bold bg-rose-500/10 text-rose-500 px-2.5 py-1 rounded-full">{pendingCount} pending</span>
          </div>
          <div className="space-y-4">
            {pendingSubmissions.length > 0 ? pendingSubmissions.map((sub, i) => (
              <div key={sub.id} className="flex items-center justify-between py-3 border-b border-foreground/5 last:border-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-9 h-9 rounded-full ${COLORS[i % COLORS.length]} flex items-center justify-center font-bold text-sm shrink-0`}>
                    {getInitials(sub.user.name || "S")}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{sub.user.name}</p>
                    <p className="text-xs text-foreground/50 mt-0.5">{sub.assignment.title} • {sub.assignment.course.title}</p>
                  </div>
                </div>
                <Link href={`/teacher/assignments`} className="px-3 py-1.5 bg-teal-500/10 hover:bg-teal-500 text-teal-600 dark:text-teal-400 hover:text-white rounded-lg font-semibold text-xs transition-all">Grade</Link>
              </div>
            )) : (
              <div className="py-6 text-center text-sm text-foreground/50">
                All caught up! No submissions need grading.
              </div>
            )}
          </div>
          <Link href="/teacher/assignments" className="text-teal-600 dark:text-teal-400 text-sm font-semibold mt-4 hover:underline flex justify-end w-full pt-2">
            View all {String.fromCharCode(8594)}
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="glass-panel p-4 sm:p-6 rounded-2xl">
          <h2 className="text-lg font-bold font-heading text-foreground mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { href: "/teacher/assignments/create", label: "New Assignment", color: "teal", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
              { href: "/teacher/quizzes/create", label: "New Quiz", color: "indigo", icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
              { href: "/teacher/courses/create", label: "New Course", color: "purple", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
              { href: "/teacher/announcements", label: "Announcement", color: "amber", icon: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`p-5 rounded-2xl border border-foreground/10 hover:border-${action.color}-400/50 hover:bg-${action.color}-500/5 transition-all flex flex-col items-center justify-center text-center group`}
              >
                <div className={`w-10 h-10 rounded-xl bg-${action.color}-500/10 flex items-center justify-center mb-3 group-hover:bg-${action.color}-500/20 transition-colors`}>
                  <svg className={`w-5 h-5 text-${action.color}-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={action.icon} />
                  </svg>
                </div>
                <span className="font-semibold text-sm text-foreground">{action.label}</span>
              </Link>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="mt-6 pt-6 border-t border-foreground/5">
            <h3 className="text-sm font-bold text-foreground/60 uppercase tracking-wider mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {recentSubmissions.length > 0 ? recentSubmissions.map((sub, i) => (
                <div key={i} className="flex items-center space-x-2.5 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                  <span className="text-foreground/70">{sub.user.name} submitted: {sub.assignment.title}</span>
                </div>
              )) : (
                <div className="text-sm text-foreground/50 italic">No recent activity</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
