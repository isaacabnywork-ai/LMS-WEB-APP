import React from 'react';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

import { AnnouncementsList } from '@/components/AnnouncementsList';

export default async function StudentDashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  // Fetch student's enrolments
  const enrolments = await prisma.enrolment.findMany({
    where: { userId: session.user.id },
    include: { course: { include: { instructor: true } } }
  });

  const enrolledCount = enrolments.length;
  const completedCount = enrolments.filter(e => e.progress === 100).length;
  const myCourses = enrolments.map(e => ({
    ...e.course,
    progress: e.progress
  }));

  const courseIds = enrolments.map(e => e.courseId);
  const now = new Date();

  // Fetch upcoming assignments
  const upcomingAssignments = await prisma.assignment.findMany({
    where: { 
      courseId: { in: courseIds }, 
      dueAt: { gt: now },
      submissions: { none: { userId: session.user.id } }
    },
    include: { course: { select: { title: true } } },
    orderBy: { dueAt: 'asc' },
    take: 4
  });

  // Calculate completed & due activities
  const completedActivities = await prisma.submission.count({
    where: { userId: session.user.id }
  });
  const activitiesDue = upcomingAssignments.length;

  return (
    <div className="animate-slide-up space-y-6 w-full">
      <AnnouncementsList />
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground mb-1">
          Student Dashboard
        </h1>
        <p className="text-foreground opacity-60 text-sm sm:text-base">Your academic overview</p>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="glass-panel p-6 flex flex-col justify-between h-36 glass-panel-hover">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4">
            <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          </div>
          <div>
            <p className="text-foreground opacity-50 text-xs font-semibold mb-1">Courses Enrolled</p>
            <p className="text-2xl font-bold text-foreground">{enrolledCount}</p>
          </div>
        </div>
        
        <div className="glass-panel p-6 flex flex-col justify-between h-36 glass-panel-hover">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4">
            <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <p className="text-foreground opacity-50 text-xs font-semibold mb-1">Courses Completed</p>
            <p className="text-2xl font-bold text-foreground">{completedCount}</p>
          </div>
        </div>
        
        <div className="glass-panel p-6 flex flex-col justify-between h-36 glass-panel-hover">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <div>
            <p className="text-foreground opacity-50 text-xs font-semibold mb-1">Activities Completed</p>
            <p className="text-2xl font-bold text-foreground">{completedActivities}</p>
          </div>
        </div>
        
        <div className="glass-panel p-6 flex flex-col justify-between h-36 glass-panel-hover">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center mb-4">
            <svg className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
          </div>
          <div>
            <p className="text-foreground opacity-50 text-xs font-semibold mb-1">Activities Due</p>
            <p className="text-2xl font-bold text-foreground">{activitiesDue}</p>
          </div>
        </div>
      </div>

      {/* My Courses Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold font-heading text-foreground mb-4 flex items-center space-x-2">
          <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          <span>Continue Learning</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {myCourses.length > 0 ? (
            myCourses.slice(0, 3).map(course => (
              <a key={course.id} href={`/learn/${course.id}`} className="glass-panel rounded-2xl p-5 glass-panel-hover group block relative overflow-hidden">
                <div className="flex gap-4 items-center mb-4">
                  <div className="w-16 h-16 rounded-xl bg-black/10 dark:bg-white/10 overflow-hidden shrink-0">
                    <img src={course.thumbnailUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80"} alt={course.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground line-clamp-1 group-hover:text-teal-500 transition-colors">{course.title}</h3>
                    <p className="text-xs text-foreground/50">{course.instructor.name}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-foreground/60">
                    <span>Progress</span>
                    <span className="text-teal-500">{course.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 transition-all duration-1000" style={{ width: `${course.progress}%` }} />
                  </div>
                </div>
              </a>
            ))
          ) : (
            <div className="col-span-full py-10 text-center border-2 border-dashed border-foreground/10 rounded-2xl">
              <p className="text-foreground/50 mb-4">You aren't enrolled in any courses yet.</p>
              <a href="/student/catalog" className="inline-block px-6 py-2.5 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-colors">Browse Catalog</a>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Timeline Section */}
        <div className="lg:col-span-2 glass-panel p-4 sm:p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-base sm:text-xl font-bold font-heading text-foreground flex items-center space-x-2">
              <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>Timeline</span>
            </h2>
            <select className="bg-slate-100 dark:bg-white/5 border border-foreground/10 text-xs sm:text-sm font-medium rounded-lg px-2 sm:px-3 py-1.5 focus:outline-none appearance-none">
              <option>Next 7 days</option>
              <option>Next 30 days</option>
            </select>
          </div>

          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-teal-500 before:via-teal-500/50 before:to-transparent">
            {upcomingAssignments.length > 0 ? upcomingAssignments.map((assignment, i) => (
              <div key={assignment.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-[var(--card-bg)] ${i % 2 === 0 ? "bg-teal-500" : "bg-rose-500"} text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border ${i % 2 === 0 ? "border-teal-500/20 bg-teal-500/5" : "border-foreground/10 bg-black/5 dark:bg-white/5"} shadow-sm`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold ${i % 2 === 0 ? "text-teal-600 dark:text-teal-400" : "text-foreground opacity-60"} text-sm`}>
                      {assignment.dueAt ? new Date(assignment.dueAt).toLocaleString() : "No deadline"}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground text-lg mb-1">{assignment.title}</h3>
                  <p className="text-sm opacity-70">{assignment.course.title}</p>
                  <a href={`/student/assignments`} className={`mt-3 inline-block text-xs font-bold px-3 py-1.5 ${i % 2 === 0 ? "bg-teal-500 hover:bg-teal-600 text-white" : "bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20"} rounded-md transition-colors`}>
                    View Assignment
                  </a>
                </div>
              </div>
            )) : (
              <div className="py-10 text-center italic opacity-60">You have no upcoming deadlines!</div>
            )}
          </div>
        </div>

        {/* Calendar Widget Section */}
        <div className="glass-panel p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base sm:text-xl font-bold font-heading text-foreground flex items-center space-x-2">
              <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              <span>Calendar</span>
            </h2>
            <button className="p-1.5 bg-teal-500/10 text-teal-600 rounded-lg hover:bg-teal-500 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            </button>
          </div>

          <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-4 border border-foreground/5">
            <div className="flex justify-between items-center mb-4 px-2">
              <button className="opacity-50 hover:opacity-100">&larr;</button>
              <h3 className="font-bold text-sm">June 2026</h3>
              <button className="opacity-50 hover:opacity-100">&rarr;</button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center mb-2 text-xs font-bold opacity-50">
              <div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div><div>Su</div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {[...Array(30)].map((_, i) => (
                <div 
                  key={i} 
                  className={`p-2 rounded-lg cursor-pointer transition-colors ${
                    i === 4 
                      ? 'bg-teal-500 text-white font-bold shadow-md shadow-teal-500/40' 
                      : i === 11 || i === 18 
                        ? 'border border-teal-500/30 text-teal-600 font-bold'
                        : 'hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-6 space-y-3">
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-3 h-3 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]"></div>
              <span className="opacity-80">Today (2 Events)</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-3 h-3 rounded-full border-2 border-teal-500"></div>
              <span className="opacity-80">Upcoming Deadlines</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
