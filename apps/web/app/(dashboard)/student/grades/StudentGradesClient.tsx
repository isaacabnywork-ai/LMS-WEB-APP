"use client";

import React from "react";

export type GradeItem = {
  id: string;
  course: string;
  assignment: string;
  score: number;
  total: number;
  date: string;
  status: string;
};

export default function StudentGradesClient({ grades, totalCredits, gpa }: { grades: GradeItem[]; totalCredits: number; gpa: string }) {
  return (
    <div className="w-full max-w-6xl mx-auto animate-slide-up mt-6 sm:mt-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-5 sm:mb-10 gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-foreground tracking-tight mb-2">Grades & Transcripts</h1>
          <p className="text-foreground opacity-60">Track your academic performance and download certificates.</p>
        </div>
        
        <div className="glass-panel px-4 sm:px-8 py-4 rounded-3xl flex items-center space-x-4 sm:space-x-6 w-full sm:w-auto">
          <div>
            <p className="text-sm font-semibold opacity-60 uppercase tracking-wider mb-1">Overall GPA</p>
            <p className="text-4xl font-bold font-heading text-teal-600 dark:text-teal-400">{gpa}</p>
          </div>
          <div className="h-12 w-px bg-foreground/10"></div>
          <div>
            <p className="text-sm font-semibold opacity-60 uppercase tracking-wider mb-1">Credits Earned</p>
            <p className="text-4xl font-bold font-heading text-foreground">{totalCredits}</p>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden shadow-sm border border-foreground/5 mb-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/5 dark:bg-white/5 border-b border-foreground/10 text-sm font-semibold uppercase tracking-wider opacity-80">
                <th className="p-6">Course</th>
                <th className="p-6">Assignment/Quiz</th>
                <th className="p-6">Date</th>
                <th className="p-6 text-right">Score</th>
                <th className="p-6 text-center">Grade</th>
              </tr>
            </thead>
            <tbody>
              {grades.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center opacity-50">No graded items yet.</td>
                </tr>
              ) : grades.map((grade) => (
                <tr key={grade.id} className="border-b border-foreground/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                  <td className="p-6 font-semibold">{grade.course}</td>
                  <td className="p-6 opacity-80">{grade.assignment}</td>
                  <td className="p-6 opacity-60 text-sm">{grade.date}</td>
                  <td className="p-6 text-right font-medium">
                    {grade.score} <span className="opacity-50">/ {grade.total}</span>
                  </td>
                  <td className="p-6 text-center">
                    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold
                      ${grade.status.includes('A') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                      : grade.status.includes('B') ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
                      : grade.status.includes('C') ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}
                    `}>
                      {grade.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-panel p-4 sm:p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-amber-500/20 transition-all"></div>
        
        <div className="flex items-center space-x-6 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
          </div>
          <div>
            <h3 className="text-xl font-bold font-heading mb-1">Official Transcripts & Certificates</h3>
            <p className="opacity-70">Download a verified PDF copy of your academic records.</p>
          </div>
        </div>
        
        <button className="relative z-10 w-full sm:w-auto bg-foreground text-background hover:bg-teal-600 hover:text-white px-8 py-3 rounded-full font-bold transition-colors shadow-lg flex items-center justify-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          <span>Download PDF</span>
        </button>
      </div>
    </div>
  );
}
