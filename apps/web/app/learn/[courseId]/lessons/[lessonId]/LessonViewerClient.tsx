"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { markLessonComplete } from "@/app/actions/student";

export function LessonViewerClient({
  lesson,
  courseId,
  isCompleted,
  nextLessonId,
  prevLessonId
}: {
  lesson: { id: string; title: string; type: string; contentUrl: string | null; module: { title: string } };
  courseId: string;
  isCompleted: boolean;
  nextLessonId: string | null;
  prevLessonId: string | null;
  allLessons?: { id: string; title: string; sectionName: string }[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    try {
      await markLessonComplete(lesson.id, courseId, !isCompleted);
      // Automatically go to next lesson if marking as complete and there is a next lesson
      if (!isCompleted && nextLessonId) {
        router.push(`/learn/${courseId}/lessons/${nextLessonId}`);
      }
    } catch (err: any) {
      alert("Could not mark as complete. This usually means the activity in Moodle is set to 'Automatic Completion' (e.g., it completes automatically when you view it, submit a quiz, or receive a grade), so it cannot be manually marked complete.");
    }
    setLoading(false);
  };

  const renderContent = () => {
    if (!lesson.contentUrl) {
      return (
        <div className="w-full h-64 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center justify-center border border-dashed border-foreground/20">
          <p className="text-foreground/50 italic">No content URL provided for this lesson.</p>
        </div>
      );
    }

    const type = lesson.type.toLowerCase();
    
    if (type === "video") {
      const isMp4 = lesson.contentUrl.endsWith(".mp4");
      if (isMp4) {
        return (
          <video controls className="w-full aspect-video rounded-2xl bg-black shadow-xl" src={lesson.contentUrl} />
        );
      }
      
      let embedUrl = lesson.contentUrl;
      if (embedUrl.includes("youtube.com/watch?v=")) {
        embedUrl = embedUrl.replace("watch?v=", "embed/");
        embedUrl = embedUrl.split("&")[0] || "";
      } else if (embedUrl.includes("youtu.be/")) {
        embedUrl = embedUrl.replace("youtu.be/", "youtube.com/embed/");
        embedUrl = embedUrl.split("?")[0] || "";
      }

      return (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-xl border border-white/10">
          <iframe 
            src={embedUrl} 
            className="absolute top-0 left-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          />
        </div>
      );
    }

    if (type === "pdf") {
      return (
        <div className="w-full h-[70vh] rounded-2xl overflow-hidden border border-foreground/10 shadow-xl bg-black/5">
          <iframe src={lesson.contentUrl} className="w-full h-full" />
        </div>
      );
    }

    if (type === "audio") {
      return (
        <div className="w-full p-8 rounded-2xl bg-[#0f4c9c]/10 border border-[#0f4c9c]/20 flex flex-col items-center justify-center gap-6">
          <div className="w-24 h-24 rounded-full bg-[#0f4c9c] text-white flex items-center justify-center shadow-xl shadow-[#0f4c9c]/20">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
          </div>
          <audio controls className="w-full max-w-md" src={lesson.contentUrl} />
        </div>
      );
    }

    if (type === "url") {
      return (
        <div className="w-full p-10 bg-black/5 dark:bg-white/5 rounded-2xl border border-foreground/10 text-center flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-16 h-16 bg-[#0f4c9c] text-white rounded-2xl shadow-sm mx-auto flex items-center justify-center mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </div>
          <h3 className="text-xl font-bold mb-3">External Resource</h3>
          <p className="text-foreground/60 mb-8 max-w-md">This lesson contains a link to an external website or document that cannot be displayed inside the application.</p>
          <a 
            href={lesson.contentUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-6 py-3 bg-[#0f4c9c] hover:bg-[#0c3e7f] text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            Open Resource in New Tab
          </a>
        </div>
      );
    }

    if (type === "page" || type === "exam" || type === "assignment" || type === "quiz" || type === "folder" || type === "reading" || type === "resource") {
      return (
        <div className="w-full min-h-[70vh] relative group">
          <div className="absolute -top-12 right-0">
            <a 
              href={lesson.contentUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs font-semibold text-[#0f4c9c] dark:text-[#4a90e2] hover:underline flex items-center gap-1"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              Seeing a Moodle Enroll/Login screen? Click here to open lesson
            </a>
          </div>
          <iframe 
            src={lesson.contentUrl} 
            className="w-full h-full min-h-[70vh] absolute top-0 left-0 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 shadow-sm"
            title={lesson.title}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads allow-modals"
            allowFullScreen
          />
        </div>
      );
    }

    return (
      <div className="w-full p-10 bg-black/5 dark:bg-white/5 rounded-2xl border border-foreground/10 text-center">
        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm mx-auto flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
        </div>
        <h3 className="text-xl font-bold mb-2">Resource Module</h3>
        <p className="text-foreground/60 mb-6">This lesson module is meant to be marked as complete when you are finished.</p>
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 pb-32 animate-slide-up">
      <div className="mb-6">
        <p className="text-xs font-bold text-[#0f4c9c] uppercase tracking-widest mb-2">{lesson.module.title}</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{lesson.title}</h1>
      </div>

      <div className="mb-6">
        {renderContent()}
      </div>

      {/* Manual Completion Button (Aligned Right, just under content) */}
      <div className="flex justify-end mb-8">
        <button 
          onClick={handleComplete}
          disabled={loading}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            isCompleted 
              ? "bg-[#198754] hover:bg-[#157347] text-white" 
              : "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          {loading ? "Saving..." : isCompleted ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Marked as Complete
            </>
          ) : (
            "Mark as Complete"
          )}
        </button>
      </div>

      {/* Moodle-style Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-slate-200 dark:border-slate-800">
        
        {/* Left: Previous Section */}
        <div className="flex-1 w-full sm:w-auto">
          {prevLessonId ? (
            <button 
              onClick={() => router.push(`/learn/${courseId}/lessons/${prevLessonId}`)}
              className="w-full sm:w-auto px-4 py-2 bg-[#0f4c9c] hover:bg-[#0c3e7f] text-white text-sm font-semibold rounded shadow-sm transition-colors flex items-center justify-center sm:justify-start gap-1"
            >
              <span className="text-xs opacity-70">◄</span> Prev Section
            </button>
          ) : (
            <div className="invisible px-4 py-2 text-sm font-semibold">◄ Prev Section</div>
          )}
        </div>

        {/* Center: Jump To Dropdown */}
        <div className="flex-1 w-full sm:w-auto flex justify-center">
          {allLessons && allLessons.length > 0 && (
            <select 
              value={lesson.id}
              onChange={(e) => {
                if (e.target.value && e.target.value !== lesson.id) {
                  router.push(`/learn/${courseId}/lessons/${e.target.value}`);
                }
              }}
              className="w-full sm:w-64 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0f4c9c]"
            >
              <option disabled>Jump to...</option>
              {Array.from(new Set(allLessons.map(l => l.sectionName))).map(sectionName => (
                <optgroup key={sectionName} label={sectionName}>
                  {allLessons.filter(l => l.sectionName === sectionName).map(l => (
                    <option key={l.id} value={l.id}>{l.title}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          )}
        </div>

        {/* Right: Next Activity */}
        <div className="flex-1 w-full sm:w-auto flex justify-end">
          {nextLessonId ? (
            <button 
              onClick={() => router.push(`/learn/${courseId}/lessons/${nextLessonId}`)}
              className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-[#0f4c9c] dark:text-[#4a90e2] text-sm font-semibold rounded border border-[#0f4c9c] dark:border-[#4a90e2] shadow-sm transition-colors flex items-center justify-center sm:justify-end gap-1"
            >
              Next Activity <span className="text-xs opacity-70">►</span>
            </button>
          ) : (
            <div className="invisible px-4 py-2 text-sm font-semibold border border-transparent">Next Activity ►</div>
          )}
        </div>

      </div>
    </div>
  );
}
