"use client";

import React from "react";

export default function StudentNotificationsPage() {
  const notifications = [
    { id: 1, title: "New Assignment: React Context API", course: "Advanced React Native", time: "2 hours ago", type: "assignment", unread: true },
    { id: 2, title: "Your grade for Midterm is published", course: "Next.js Fullstack Masterclass", time: "Yesterday", type: "grade", unread: true },
    { id: 3, title: "Course Announcement: No class on Friday", course: "UI/UX Design for Developers", time: "3 days ago", type: "announcement", unread: false },
    { id: 4, title: "Reminder: Project proposal due tomorrow", course: "Advanced React Native", time: "Last week", type: "reminder", unread: false },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "assignment": return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>;
      case "grade": return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>;
      case "announcement": return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>;
      default: return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "assignment": return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
      case "grade": return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "announcement": return "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400";
      default: return "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-slide-up mt-6 sm:mt-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-5 sm:mb-10 border-b border-foreground/10 pb-4 sm:pb-6 gap-3">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-foreground tracking-tight mb-2">Notifications</h1>
          <p className="text-foreground opacity-60">Stay updated on your coursework and announcements.</p>
        </div>
        <button className="text-teal-600 dark:text-teal-400 font-semibold hover:underline">
          Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        {notifications.map((note, idx) => (
          <div 
            key={note.id} 
            className={`glass-panel p-4 sm:p-6 rounded-2xl flex gap-4 sm:gap-6 items-start transition-all cursor-pointer hover:-translate-y-1 hover:shadow-xl
              ${note.unread ? 'border-teal-500/50 bg-teal-50/30 dark:bg-teal-900/10' : ''}
            `}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 ${getColor(note.type)}`}>
              <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {getIcon(note.type)}
              </svg>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap justify-between items-start mb-1 gap-1">
                <h3 className={`text-base sm:text-lg font-bold font-heading ${note.unread ? 'text-foreground' : 'text-foreground/80'}`}>
                  {note.title}
                </h3>
                <span className="text-sm opacity-50 whitespace-nowrap ml-4">{note.time}</span>
              </div>
              <p className="text-foreground opacity-60 mb-2">{note.course}</p>
              
              {note.unread && (
                <span className="inline-block w-2 h-2 rounded-full bg-teal-500 mt-1"></span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
