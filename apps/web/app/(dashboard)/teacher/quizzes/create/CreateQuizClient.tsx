"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createQuiz } from "@/app/actions/teacher";

export default function CreateQuizClient({ courses }: { courses: { id: string; title: string }[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [timeLimit, setTimeLimit] = useState("60");
  const [attemptsAllowed, setAttemptsAllowed] = useState("1");
  const [questions, setQuestions] = useState([{ id: 1, text: "", options: ["", "", "", ""], correctIndex: 0, points: 10 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const addQuestion = () => setQuestions([...questions, { id: Date.now(), text: "", options: ["", "", "", ""], correctIndex: 0, points: 10 }]);

  const updateQuestion = (idx: number, updates: any) => {
    const newQs = [...questions];
    newQs[idx] = { ...newQs[idx], ...updates };
    setQuestions(newQs);
  };

  const removeQuestion = (idx: number) => {
    if (questions.length === 1) return;
    const newQs = [...questions];
    newQs.splice(idx, 1);
    setQuestions(newQs);
  };

  const updateOption = (qIdx: number, oIdx: number, val: string) => {
    const newQs = [...questions];
    const q = newQs[qIdx];
    if (q && q.options) {
      q.options[oIdx] = val;
    }
    setQuestions(newQs);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !courseId) {
      setError("Title and Course are required.");
      return;
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q) continue;
      if (!q.text.trim() || q.options.some(o => !o.trim())) {
        setError(`Question ${i + 1} is missing text or has empty options.`);
        return;
      }
    }

    setIsSubmitting(true);
    setError("");

    try {
      const formattedQuestions = questions.map(q => ({
        text: q.text,
        type: "mcq",
        options: JSON.stringify(q.options),
        correctAnswer: q.options[q.correctIndex] || "",
        points: q.points
      }));

      await createQuiz({
        title,
        courseId,
        timeLimitMins: timeLimit ? parseInt(timeLimit, 10) : null,
        attemptsAllowed: attemptsAllowed ? parseInt(attemptsAllowed, 10) : 1,
        questions: formattedQuestions
      });

      router.push("/teacher/quizzes");
    } catch (err: any) {
      setError(err.message || "Failed to create quiz.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-slide-up mt-10 pb-20">
      <div className="mb-10 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-4xl font-extrabold font-heading text-foreground tracking-tight mb-2">Quiz Builder</h1>
          <p className="text-foreground opacity-60">Construct an interactive assessment.</p>
        </div>
        <button 
          onClick={addQuestion}
          className="bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-800/50 px-6 py-3 rounded-full font-bold transition-all flex items-center space-x-2 w-full sm:w-auto justify-center"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          <span>Add Question</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 font-bold p-4 rounded-xl mb-8">
          {error}
        </div>
      )}

      <div className="space-y-8">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-2">
              <label className="block text-sm font-bold uppercase tracking-wider opacity-80 mb-3">Quiz Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Midterm Examination" 
                className="w-full bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-bold uppercase tracking-wider opacity-80 mb-3">Select Course</label>
              <select 
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium appearance-none"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-bold uppercase tracking-wider opacity-80 mb-3">Time Limit (Minutes)</label>
              <input 
                type="number" 
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                placeholder="60" 
                className="w-full bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-bold uppercase tracking-wider opacity-80 mb-3">Attempts Allowed</label>
              <input 
                type="number" 
                value={attemptsAllowed}
                onChange={(e) => setAttemptsAllowed(e.target.value)}
                placeholder="1" 
                min="1"
                className="w-full bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
              />
            </div>
          </div>
        </div>

        {questions.map((q, idx) => (
          <div key={q.id} className="glass-panel p-6 sm:p-8 rounded-3xl border-l-4 border-l-teal-500 relative group animate-fade-in">
            {questions.length > 1 && (
              <button onClick={() => removeQuestion(idx)} className="absolute top-6 right-6 text-foreground/40 hover:text-red-500 transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            )}
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg font-heading flex items-center space-x-3">
                <span className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 flex items-center justify-center text-sm shrink-0">{idx + 1}</span>
                <span>Question Configuration</span>
              </h3>
              <div className="flex items-center space-x-2 mr-8">
                <label className="text-sm font-bold opacity-60">Points:</label>
                <input 
                  type="number" 
                  value={q.points}
                  onChange={(e) => updateQuestion(idx, { points: parseInt(e.target.value) || 0 })}
                  className="w-16 bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-lg px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            
            <div className="space-y-6">
              <textarea 
                rows={2}
                value={q.text}
                onChange={(e) => updateQuestion(idx, { text: e.target.value })}
                placeholder="Enter the question text here..." 
                className="w-full bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium resize-none text-lg"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-0 sm:pl-4 sm:border-l-2 border-foreground/10">
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} className={`flex items-center space-x-3 p-2 rounded-xl transition-colors ${q.correctIndex === oIdx ? 'bg-teal-500/10' : ''}`}>
                    <input 
                      type="radio" 
                      name={`correct-${q.id}`} 
                      className="w-5 h-5 text-teal-600 focus:ring-teal-500 cursor-pointer" 
                      checked={q.correctIndex === oIdx} 
                      onChange={() => updateQuestion(idx, { correctIndex: oIdx })}
                    />
                    <input 
                      type="text" 
                      value={opt}
                      onChange={(e) => updateOption(idx, oIdx, e.target.value)}
                      placeholder={`Option ${oIdx + 1}`} 
                      className={`w-full bg-black/5 dark:bg-white/5 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${q.correctIndex === oIdx ? 'border-teal-500/50' : 'border-foreground/10'}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-end pt-6">
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-teal-600 hover:bg-teal-500 text-white px-12 py-4 rounded-xl font-bold shadow-lg hover:shadow-teal-500/30 transition-all flex items-center justify-center space-x-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isSubmitting ? "Publishing..." : "Publish Assessment"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
