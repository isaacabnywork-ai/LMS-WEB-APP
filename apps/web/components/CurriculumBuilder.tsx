"use client";

import React, { useState } from "react";
import { createModule, createLesson, deleteModule, deleteLesson, createAssignment, createQuiz } from "@/app/actions/teacher";
import { FileUpload } from "@/components/FileUpload";
import { uploadFile } from "@/app/actions/upload";

export type CurriculumItem = { id: string; title: string; type: string; contentUrl?: string | null; position: number };
export type Module = { id: string; title: string; position: number; items: CurriculumItem[] };

export function CurriculumBuilder({ courseId, initialModules }: { courseId: string; initialModules: Module[] }) {
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Module form state
  const [moduleTitle, setModuleTitle] = useState("");

  // Lesson/Assignment/Exam form state
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonType, setLessonType] = useState<"VIDEO"|"PDF"|"AUDIO"|"LINK"|"ASSIGNMENT"|"EXAM">("VIDEO");
  const [lessonContentUrl, setLessonContentUrl] = useState("");
  const [assignmentDescription, setAssignmentDescription] = useState("");
  const [assignmentScore, setAssignmentScore] = useState(100);

  // Exam specifics
  const [examTimeLimit, setExamTimeLimit] = useState<number>(30);
  const [examAttempts, setExamAttempts] = useState<number>(1);

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleTitle.trim()) return;
    setLoading(true);
    await createModule(courseId, moduleTitle);
    setModuleTitle("");
    setIsAddingModule(false);
    setLoading(false);
  };

  const handleAddItem = async (e: React.FormEvent, moduleId: string) => {
    e.preventDefault();
    if (!lessonTitle.trim()) return;
    setLoading(true);

    try {
      if (lessonType === "ASSIGNMENT") {
        await createAssignment({
          courseId,
          moduleId,
          title: lessonTitle,
          description: assignmentDescription,
          maxScore: assignmentScore
        });
      } else if (lessonType === "EXAM") {
        await createQuiz({
          courseId,
          moduleId,
          title: lessonTitle,
          timeLimitMins: examTimeLimit,
          attemptsAllowed: examAttempts,
          questions: [
            { text: "Sample Question?", type: "mcq", options: JSON.stringify(["A", "B"]), correctAnswer: "A", points: 10 }
          ] // In a real app, you'd add a full question builder here
        });
      } else {
        await createLesson({
          moduleId,
          courseId,
          title: lessonTitle,
          type: lessonType,
          contentUrl: lessonContentUrl
        });
      }

      setLessonTitle("");
      setLessonContentUrl("");
      setAssignmentDescription("");
      setAddingLessonTo(null);
    } catch (err) {
      alert("Failed to add item to module");
    } finally {
      setLoading(false);
    }
  };

  const getLessonIcon = (type: string) => {
    switch(type?.toUpperCase()) {
      case "VIDEO": return "🎥";
      case "AUDIO": return "🎧";
      case "PDF": return "📄";
      case "LINK": return "🔗";
      case "ASSIGNMENT": return "📝";
      case "EXAM": return "🏆";
      case "QUIZ": return "🏆";
      default: return "📄";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Course Curriculum</h2>
        {!isAddingModule && (
          <button 
            onClick={() => setIsAddingModule(true)}
            className="text-sm font-semibold text-teal-600 bg-teal-500/10 px-4 py-2 rounded-lg hover:bg-teal-500/20 transition"
          >
            + Add Module
          </button>
        )}
      </div>

      {isAddingModule && (
        <form onSubmit={handleAddModule} className="glass-panel p-4 rounded-2xl flex gap-3">
          <input 
            type="text" 
            placeholder="Module Title (e.g., Chapter 1: Introduction)" 
            value={moduleTitle}
            onChange={(e) => setModuleTitle(e.target.value)}
            className="flex-1 bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
            autoFocus
          />
          <button type="submit" disabled={loading} className="bg-teal-600 text-white font-bold px-5 py-2 rounded-xl disabled:opacity-50">Save</button>
          <button type="button" onClick={() => setIsAddingModule(false)} className="px-4 text-foreground/60 hover:text-foreground">Cancel</button>
        </form>
      )}

      <div className="space-y-4">
        {initialModules.length === 0 && !isAddingModule ? (
          <div className="text-center p-8 bg-black/5 dark:bg-white/5 rounded-2xl border border-dashed border-foreground/20 text-foreground/50">
            No modules added yet. Click "+ Add Module" to start building your curriculum.
          </div>
        ) : (
          initialModules.map(mod => (
            <div key={mod.id} className="border border-foreground/10 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-foreground/5 flex justify-between items-center group">
                <h3 className="font-bold text-lg">{mod.title}</h3>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => { setAddingLessonTo(mod.id); setLessonType("VIDEO"); }}
                    className="text-xs bg-teal-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-teal-600"
                  >
                    + Add Item
                  </button>
                  <button 
                    onClick={() => deleteModule(mod.id, courseId)}
                    className="text-xs bg-red-500/10 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-500/20"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="p-2 space-y-2">
                {mod.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl group transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getLessonIcon(item.type)}</span>
                      <div>
                        <p className="font-semibold text-sm">{item.title}</p>
                        <p className="text-xs text-foreground/50 uppercase">{item.type}</p>
                      </div>
                    </div>
                    {item.type !== "ASSIGNMENT" && item.type !== "EXAM" && item.type !== "QUIZ" && (
                      <button 
                        onClick={() => deleteLesson(item.id, courseId)}
                        className="opacity-0 group-hover:opacity-100 text-red-500 text-xs p-2 hover:bg-red-500/10 rounded-lg"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}

                {addingLessonTo === mod.id && (
                  <form onSubmit={(e) => handleAddItem(e, mod.id)} className="p-4 bg-teal-500/5 rounded-xl border border-teal-500/20 mt-2 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs font-bold uppercase mb-1">Item Title</label>
                        <input 
                          type="text" 
                          required
                          value={lessonTitle}
                          onChange={(e) => setLessonTitle(e.target.value)}
                          className="w-full bg-white dark:bg-black/20 border border-foreground/10 rounded-lg px-3 py-2 text-sm"
                          placeholder="e.g. Intro to Variables, Midterm Exam"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase mb-1">Type</label>
                        <select 
                          value={lessonType}
                          onChange={(e) => setLessonType(e.target.value as any)}
                          className="w-full bg-white dark:bg-black/20 border border-foreground/10 rounded-lg px-3 py-2 text-sm"
                        >
                          <option value="VIDEO">Video</option>
                          <option value="PDF">PDF</option>
                          <option value="AUDIO">Audio</option>
                          <option value="LINK">Link</option>
                          <option value="ASSIGNMENT">Assignment</option>
                          <option value="EXAM">Exam / Quiz</option>
                        </select>
                      </div>
                    </div>

                    {lessonType === "ASSIGNMENT" && (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                          <label className="block text-xs font-bold uppercase mb-1">Description</label>
                          <input type="text" value={assignmentDescription} onChange={e => setAssignmentDescription(e.target.value)} className="w-full bg-white dark:bg-black/20 border border-foreground/10 rounded-lg px-3 py-2 text-sm" placeholder="Assignment details..." />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase mb-1">Max Score</label>
                          <input type="number" value={assignmentScore} onChange={e => setAssignmentScore(parseInt(e.target.value))} className="w-full bg-white dark:bg-black/20 border border-foreground/10 rounded-lg px-3 py-2 text-sm" />
                        </div>
                      </div>
                    )}

                    {lessonType === "EXAM" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase mb-1">Time Limit (mins)</label>
                          <input type="number" value={examTimeLimit} onChange={e => setExamTimeLimit(parseInt(e.target.value))} className="w-full bg-white dark:bg-black/20 border border-foreground/10 rounded-lg px-3 py-2 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase mb-1">Allowed Attempts</label>
                          <input type="number" value={examAttempts} onChange={e => setExamAttempts(parseInt(e.target.value))} className="w-full bg-white dark:bg-black/20 border border-foreground/10 rounded-lg px-3 py-2 text-sm" />
                        </div>
                      </div>
                    )}

                    {lessonType !== "ASSIGNMENT" && lessonType !== "EXAM" && (
                      <div>
                        <label className="block text-xs font-bold uppercase mb-1">Content Upload / URL</label>
                        <div className="flex flex-col gap-4">
                          <input 
                            type="url" 
                            value={lessonContentUrl}
                            onChange={(e) => setLessonContentUrl(e.target.value)}
                            className="w-full bg-white dark:bg-black/20 border border-foreground/10 rounded-lg px-3 py-2 text-sm"
                            placeholder={lessonType === 'VIDEO' ? "Paste YouTube / Vimeo URL" : "Paste Public Link"}
                          />
                          <div className="flex items-center gap-4">
                            <hr className="flex-1 border-foreground/10" />
                            <span className="text-xs font-bold text-foreground/40 uppercase">OR UPLOAD</span>
                            <hr className="flex-1 border-foreground/10" />
                          </div>
                          <FileUpload 
                            accept={lessonType === 'VIDEO' ? "video/*" : "application/pdf,image/*"}
                            label={`Upload ${lessonType.toLowerCase()} file`}
                            onUpload={(url) => setLessonContentUrl(url)}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setAddingLessonTo(null)} className="text-xs px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg">Cancel</button>
                      <button type="submit" disabled={loading} className="text-xs bg-teal-600 text-white px-4 py-2 rounded-lg font-bold">Save Item</button>
                    </div>
                  </form>
                )}
                
                {mod.items.length === 0 && addingLessonTo !== mod.id && (
                  <div className="p-4 text-sm text-foreground/40 text-center italic">
                    Empty module.
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
