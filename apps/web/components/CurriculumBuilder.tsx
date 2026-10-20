"use client";

import React from "react";
import { redirectToCourseEditor } from "@/app/actions/teacher";

export type CurriculumItem = { id: string; title: string; type: string; contentUrl?: string | null; position: number };
export type Module = { id: string; title: string; position: number; items: CurriculumItem[] };

export function CurriculumBuilder({ courseId, initialModules }: { courseId: string; initialModules: Module[] }) {
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
        <form action={() => redirectToCourseEditor(courseId)}>
          <button 
            type="submit"
            className="text-sm font-semibold text-teal-600 bg-teal-500/10 px-4 py-2 rounded-lg hover:bg-teal-500/20 transition flex gap-2 items-center"
          >
            <span>📝</span> Edit in Moodle
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {initialModules.length === 0 ? (
          <div className="text-center p-8 bg-black/5 dark:bg-white/5 rounded-2xl border border-dashed border-foreground/20 text-foreground/50">
            No modules added yet. Click "Edit in Moodle" to start building your curriculum.
          </div>
        ) : (
          initialModules.map(mod => (
            <div key={mod.id} className="border border-foreground/10 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-foreground/5 flex justify-between items-center group">
                <h3 className="font-bold text-lg">{mod.title}</h3>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Edit buttons here will just redirect to the Moodle editor as well */}
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
                  </div>
                ))}
                
                {mod.items.length === 0 && (
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
