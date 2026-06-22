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
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    await markLessonComplete(lesson.id, courseId, !isCompleted);
    setLoading(false);
    
    // Automatically go to next lesson if marking as complete and there is a next lesson
    if (!isCompleted && nextLessonId) {
      router.push(`/learn/${courseId}/lessons/${nextLessonId}`);
    }
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
      // Basic iframe embed for YouTube/Vimeo
      // Note: If the user provides a raw MP4, they should use type: 'link' for now, or we can use a native <video> tag if it ends in .mp4
      const isMp4 = lesson.contentUrl.endsWith(".mp4");
      if (isMp4) {
        return (
          <video controls className="w-full aspect-video rounded-2xl bg-black shadow-xl" src={lesson.contentUrl} />
        );
      }
      
      let embedUrl = lesson.contentUrl;
      // Convert standard YouTube watch links to embed links
      if (embedUrl.includes("youtube.com/watch?v=")) {
        embedUrl = embedUrl.replace("watch?v=", "embed/");
        // Remove any additional query parameters like &t=
        embedUrl = embedUrl.split("&")[0];
      } else if (embedUrl.includes("youtu.be/")) {
        embedUrl = embedUrl.replace("youtu.be/", "youtube.com/embed/");
        embedUrl = embedUrl.split("?")[0];
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
        <div className="w-full p-8 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex flex-col items-center justify-center gap-6">
          <div className="w-24 h-24 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-xl shadow-teal-500/20">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
          </div>
          <audio controls className="w-full max-w-md" src={lesson.contentUrl} />
        </div>
      );
    }

    // Default for Links or Text
    return (
      <div className="w-full p-10 bg-black/5 dark:bg-white/5 rounded-2xl border border-foreground/10 text-center">
        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm mx-auto flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
        </div>
        <h3 className="text-xl font-bold mb-2">External Resource</h3>
        <p className="text-foreground/60 mb-6">This lesson contains an external link or resource.</p>
        <a href={lesson.contentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity">
          Open Resource
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        </a>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-10 pb-32 animate-slide-up">
      {/* Lesson Header */}
      <div className="mb-8">
        <p className="text-sm font-bold text-teal-600 uppercase tracking-widest mb-2">{lesson.module.title}</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground">{lesson.title}</h1>
      </div>

      {/* Main Content Area */}
      <div className="mb-10">
        {renderContent()}
      </div>

      {/* Navigation & Completion Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 glass-panel rounded-3xl">
        <div className="flex w-full sm:w-auto gap-3">
          <button 
            disabled={!prevLessonId}
            onClick={() => prevLessonId && router.push(`/learn/${courseId}/lessons/${prevLessonId}`)}
            className="flex-1 sm:flex-none px-5 py-3 rounded-xl font-semibold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 transition-all text-center"
          >
            Previous
          </button>
          <button 
            disabled={!nextLessonId}
            onClick={() => nextLessonId && router.push(`/learn/${courseId}/lessons/${nextLessonId}`)}
            className="flex-1 sm:flex-none px-5 py-3 rounded-xl font-semibold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 transition-all text-center"
          >
            Next
          </button>
        </div>

        <button 
          onClick={handleComplete}
          disabled={loading}
          className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
            isCompleted 
              ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20" 
              : "bg-teal-600 hover:bg-teal-500 text-white shadow-teal-500/20"
          }`}
        >
          {loading ? "Saving..." : isCompleted ? (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Completed
            </>
          ) : (
            "Mark as Complete"
          )}
        </button>
      </div>
    </div>
  );
}
