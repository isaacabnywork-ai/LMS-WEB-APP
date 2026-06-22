"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type CurriculumItem = { id: string; title: string; type: string; position: number };
type Module = { id: string; title: string; position: number; items: CurriculumItem[] };

export function CourseSidebarClient({ 
  course, 
  completedLessonIds 
}: { 
  course: { id: string; title: string; modules: Module[] },
  completedLessonIds: string[]
}) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const getLessonIcon = (type: string, isCompleted: boolean) => {
    if (isCompleted) {
      return (
        <div className="w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center shrink-0">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
      );
    }
    
    switch(type?.toUpperCase()) {
      case "VIDEO": return <span className="text-foreground/50 shrink-0 w-5 text-center">🎥</span>;
      case "AUDIO": return <span className="text-foreground/50 shrink-0 w-5 text-center">🎧</span>;
      case "PDF": return <span className="text-foreground/50 shrink-0 w-5 text-center">📄</span>;
      case "TEXT": return <span className="text-foreground/50 shrink-0 w-5 text-center">📝</span>;
      case "ASSIGNMENT": return <span className="text-foreground/50 shrink-0 w-5 text-center">📝</span>;
      case "EXAM": return <span className="text-foreground/50 shrink-0 w-5 text-center">🏆</span>;
      case "QUIZ": return <span className="text-foreground/50 shrink-0 w-5 text-center">🏆</span>;
      default: return <span className="text-foreground/50 shrink-0 w-5 text-center">🔗</span>;
    }
  };

  const totalItems = course.modules.reduce((acc, m) => acc + m.items.length, 0);
  const progressPercent = totalItems === 0 ? 0 : Math.round((completedLessonIds.length / totalItems) * 100);

  return (
    <>
      {/* Mobile Header Trigger */}
      <div className="lg:hidden bg-background border-b border-foreground/10 p-4 flex items-center justify-between sticky top-0 z-40">
        <h1 className="font-bold truncate pr-4">{course.title}</h1>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-2 bg-black/5 dark:bg-white/5 rounded-lg shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar Content */}
      <aside className={`fixed lg:static top-0 left-0 h-[100dvh] w-[300px] bg-background border-r border-foreground/10 z-50 flex flex-col transition-transform duration-300 ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        
        {/* Back & Title */}
        <div className="p-6 border-b border-foreground/10 shrink-0">
          <Link href="/student/courses" className="text-sm text-foreground/60 hover:text-foreground mb-4 inline-flex items-center gap-2">
            &larr; Back to Dashboard
          </Link>
          <h2 className="font-extrabold text-xl leading-tight mt-2 mb-4">{course.title}</h2>
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase text-foreground/60">
              <span>Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

        {/* Modules List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {course.modules.length === 0 ? (
            <p className="text-sm text-foreground/50 text-center p-4">No curriculum added yet.</p>
          ) : (
            course.modules.map((mod, i) => (
              <div key={mod.id} className="space-y-1">
                <h3 className="font-bold text-sm px-2 py-2 text-foreground/80 uppercase tracking-wider">
                  Section {i + 1}: {mod.title}
                </h3>
                
                <div className="space-y-1">
                  {mod.items.map(item => {
                    const isCompleted = completedLessonIds.includes(item.id);
                    let href = `/learn/${course.id}/lessons/${item.id}`;
                    if (item.type === "ASSIGNMENT") href = `/student/assignments/${item.id}`;
                    if (item.type === "EXAM") href = `/student/quizzes/${item.id}`;

                    const isActive = pathname === href;
                    
                    return (
                      <Link 
                        key={item.id} 
                        href={href}
                        onClick={() => setIsMobileOpen(false)}
                        className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                          isActive 
                            ? "bg-teal-500/10 text-teal-700 dark:text-teal-300 font-bold" 
                            : "hover:bg-black/5 dark:hover:bg-white/5 text-foreground/80 font-medium"
                        }`}
                      >
                        {getLessonIcon(item.type, isCompleted)}
                        <span className="text-sm leading-snug">{item.title}</span>
                      </Link>
                    )
                  })}
                  {mod.items.length === 0 && (
                    <div className="text-xs text-foreground/40 px-3 py-2 italic">No items in this section</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
}
