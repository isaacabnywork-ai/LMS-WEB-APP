"use client";

import React, { useState } from "react";
import { submitAssignment } from "@/app/actions/student";

export default function SubmitAssignmentClient({ assignment }: { assignment: any }) {
  const [contentUrl, setContentUrl] = useState(assignment.submission?.contentUrl || "");
  const [textContent, setTextContent] = useState(assignment.submission?.textContent || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isGraded = assignment.submission?.score !== null && assignment.submission?.score !== undefined;
  const isSubmitted = !!assignment.submission;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contentUrl.trim() && !textContent.trim()) {
      setError("Please provide either a link or text submission.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const result = await submitAssignment(assignment.id, {
        contentUrl: contentUrl.trim() || undefined,
        textContent: textContent.trim() || undefined,
      });
      if (result.success) {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || "Submission failed");
    } finally {
      setIsLoading(false);
    }
  }

  const dueDateStr = assignment.dueAt ? new Date(assignment.dueAt).toLocaleString() : "No due date";
  const now = new Date();
  const isOverdue = assignment.dueAt && new Date(assignment.dueAt) < now;

  return (
    <div className="w-full max-w-4xl mx-auto animate-slide-up mt-10 pb-20">
      <div className="mb-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-heading text-foreground tracking-tight mb-4">{assignment.title}</h1>
        <div className="flex flex-wrap gap-2">
          <span className={`glass-panel px-4 py-1.5 rounded-full text-sm font-bold border ${isOverdue && !isSubmitted ? 'text-red-600 border-red-500/20' : 'text-pink-600 dark:text-pink-400 border-pink-500/20'}`}>
            Due: {dueDateStr}
          </span>
          <span className="glass-panel px-4 py-1.5 rounded-full text-sm font-bold text-foreground opacity-70 border-foreground/10">
            Points: {assignment.maxScore}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="glass-panel rounded-3xl p-8">
            <h2 className="text-xl font-bold font-heading mb-4">Instructions</h2>
            <div className="prose dark:prose-invert max-w-none opacity-80 whitespace-pre-wrap">
              {assignment.description || "No instructions provided."}
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-8">
            <h2 className="text-xl font-bold font-heading mb-6">Your Submission</h2>

            {isGraded ? (
              <div className="bg-teal-500/10 border border-teal-500/20 p-6 rounded-2xl">
                <h3 className="font-bold text-teal-600 dark:text-teal-400 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Assignment Graded
                </h3>
                <p className="opacity-80 mb-4">You cannot edit your submission because it has already been graded.</p>
                <div className="bg-white/50 dark:bg-black/20 p-4 rounded-xl border border-foreground/5 space-y-4">
                  {assignment.submission.contentUrl && (
                    <div>
                      <span className="text-xs font-bold uppercase opacity-50 block mb-1">Link Submitted</span>
                      <a href={assignment.submission.contentUrl} target="_blank" rel="noreferrer" className="text-teal-500 hover:underline break-all">{assignment.submission.contentUrl}</a>
                    </div>
                  )}
                  {assignment.submission.textContent && (
                    <div>
                      <span className="text-xs font-bold uppercase opacity-50 block mb-1">Text Submitted</span>
                      <div className="whitespace-pre-wrap opacity-80 bg-background/50 p-3 rounded-lg border border-foreground/5">{assignment.submission.textContent}</div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && <div className="text-red-500 font-semibold mb-4 bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</div>}
                {success && <div className="text-teal-600 dark:text-teal-400 font-semibold mb-4 bg-teal-500/10 p-3 rounded-xl border border-teal-500/20">Submission saved successfully!</div>}
                
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2 opacity-80">Link / URL</label>
                  <input
                    type="url"
                    value={contentUrl}
                    onChange={(e) => setContentUrl(e.target.value)}
                    placeholder="https://github.com/username/repo or Google Doc link"
                    className="w-full bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex-1 h-px bg-foreground/10"></div>
                  <span className="text-sm font-semibold opacity-50 uppercase tracking-widest">AND / OR</span>
                  <div className="flex-1 h-px bg-foreground/10"></div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2 opacity-80">Text Response</label>
                  <textarea
                    rows={6}
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="Type or paste your response here..."
                    className="w-full bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-teal-500/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      <span>{isSubmitted ? "Update Submission" : "Submit Assignment"}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-6">
            <h3 className="font-bold font-heading mb-4 text-lg">Submission Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-foreground/10">
                <span className="opacity-70">Status</span>
                <span className={`font-semibold ${isGraded ? 'text-teal-500' : isSubmitted ? 'text-emerald-500' : isOverdue ? 'text-red-500' : 'text-amber-500'}`}>
                  {isGraded ? "Graded" : isSubmitted ? "Submitted" : isOverdue ? "Overdue" : "Not Submitted"}
                </span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-foreground/10">
                <span className="opacity-70">Submitted On</span>
                <span className="font-semibold text-right">
                  {assignment.submission?.submittedAt ? new Date(assignment.submission.submittedAt).toLocaleString() : "-"}
                </span>
              </div>
              {isGraded && (
                <div className="flex justify-between items-center pt-2">
                  <span className="opacity-70">Grade</span>
                  <span className="font-extrabold text-2xl text-teal-500">{assignment.submission.score} <span className="text-sm font-medium opacity-50">/ {assignment.maxScore}</span></span>
                </div>
              )}
            </div>
          </div>
          
          {isGraded && assignment.submission.feedback && (
            <div className="glass-panel rounded-3xl p-6 bg-amber-50 dark:bg-amber-900/10 border-amber-500/20">
              <h3 className="font-bold font-heading mb-3 text-lg text-amber-700 dark:text-amber-400">Teacher Feedback</h3>
              <p className="opacity-80 whitespace-pre-wrap text-sm">{assignment.submission.feedback}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
