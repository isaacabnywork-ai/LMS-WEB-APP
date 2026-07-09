import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { moodle } from "@/lib/moodle/client";

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user?.id || !(session.user as any).moodleToken) redirect("/");

  const moodleToken = (session.user as any).moodleToken;

  // Extract and sort events
  const events: Array<{
    id: string;
    title: string;
    courseName: string;
    type: "Assignment" | "Quiz";
    date: Date;
    url: string;
  }> = [];

  try {
    // Fetch upcoming events from Moodle
    const calendarResponse = await moodle.call<any>('core_calendar_get_action_events_by_timesort', {
      timesortfrom: Math.floor(Date.now() / 1000)
    }, { cache: 'no-store' }, moodleToken);

    if (calendarResponse.events) {
      calendarResponse.events.forEach((ev: any) => {
        if (ev.modulename === 'assign' || ev.modulename === 'quiz') {
          events.push({
            id: String(ev.id),
            title: ev.name,
            courseName: ev.course?.fullname || "Course",
            type: ev.modulename === 'assign' ? "Assignment" : "Quiz",
            date: new Date(ev.timestart * 1000),
            url: ev.modulename === 'assign' 
              ? `/student/assignments`
              : `/student/quizzes`
          });
        }
      });
    }
  } catch (error) {
    console.error("Failed to fetch Moodle calendar events:", error);
  }

  events.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Group by Month/Year
  const groupedEvents: Record<string, typeof events> = {};
  events.forEach(event => {
    const monthYear = event.date.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!groupedEvents[monthYear]) groupedEvents[monthYear] = [];
    groupedEvents[monthYear].push(event);
  });

  return (
    <div className="max-w-4xl mx-auto animate-slide-up space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Calendar & Deadlines</h1>
        <p className="text-foreground/60 mt-1">Keep track of your upcoming assignments and quizzes.</p>
      </div>

      {events.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl border border-foreground/10">
          <div className="w-20 h-20 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-teal-500">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <h3 className="text-xl font-bold mb-2">No upcoming deadlines</h3>
          <p className="text-foreground/60 mb-6 max-w-md mx-auto">You're all caught up! Enjoy your free time.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(groupedEvents).map(([month, monthEvents]) => (
            <div key={month} className="space-y-4">
              <h2 className="text-xl font-bold text-teal-600 dark:text-teal-400 pl-2 border-l-4 border-teal-500">{month}</h2>
              <div className="space-y-3">
                {monthEvents.map(event => (
                  <Link href={event.url} key={event.id} className="block glass-panel p-5 rounded-2xl border border-foreground/10 hover:border-teal-500/50 transition-all group">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-black/5 dark:bg-white/5 group-hover:bg-teal-500/10 transition-colors">
                          <span className="text-lg font-bold text-teal-600 dark:text-teal-400">{event.date.getDate()}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${event.type === 'Assignment' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                              {event.type}
                            </span>
                            <span className="text-xs text-foreground/50 font-medium">{event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <h3 className="text-lg font-bold text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{event.title}</h3>
                          <p className="text-sm text-foreground/60">{event.courseName}</p>
                        </div>
                      </div>
                      
                      <div className="sm:text-right shrink-0">
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 transform duration-300">
                          Go to {event.type}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
