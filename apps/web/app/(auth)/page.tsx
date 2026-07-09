import React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LandingPage() {
  const features = [
    {
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      ),
      color: "from-teal-400 to-teal-600",
      bg: "bg-teal-500/10",
      text: "text-teal-500",
      title: "Smart Learning Paths",
      desc: "AI-powered course recommendations that adapt to each student's pace and learning style.",
    },
    {
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      ),
      color: "from-indigo-400 to-indigo-600",
      bg: "bg-indigo-500/10",
      text: "text-indigo-500",
      title: "Live Analytics",
      desc: "Track every student's progress with real-time dashboards and automated grade reports.",
    },
    {
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      ),
      color: "from-rose-400 to-rose-600",
      bg: "bg-rose-500/10",
      text: "text-rose-500",
      title: "Adaptive Quizzes",
      desc: "Auto-generated quizzes and assignments with AI-powered grading and instant feedback.",
    },
    {
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      ),
      color: "from-amber-400 to-amber-600",
      bg: "bg-amber-500/10",
      text: "text-amber-500",
      title: "Collaborative Spaces",
      desc: "Discussion forums, group projects, and peer review tools built right into every course.",
    },
  ];

  const stats = [
    { value: "50K+", label: "Active Students" },
    { value: "1,200+", label: "Courses" },
    { value: "98%", label: "Satisfaction Rate" },
    { value: "200+", label: "Expert Instructors" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col overflow-y-auto relative transition-colors duration-300">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-white dark:from-slate-800 dark:via-slate-900 dark:to-black z-0 transition-colors duration-300"></div>
      
      {/* Decorative blobs */}
      <div className="absolute top-0 left-1/4 w-[30rem] h-[30rem] bg-teal-500/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none z-0" />
      <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-[100px] translate-y-1/2 pointer-events-none z-0" />
      
      {/* Navbar */}
      <header className="relative z-20 flex items-center justify-between px-6 lg:px-12 py-6 w-full max-w-7xl mx-auto">
        <div className="flex items-center">
          <img src="/logo.png" alt="Avia Tech Logo" className="h-12 w-auto block dark:hidden" />
          <img src="/logo-dark.png" alt="Avia Tech Logo" className="h-12 w-auto hidden dark:block" />
        </div>
        <div className="flex items-center space-x-4 sm:space-x-6">
          <ThemeToggle />
          <Link href="/login" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-semibold text-sm transition-colors hidden sm:block">
            Sign In
          </Link>
          <Link href="/login" className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 lg:px-12 py-16">
        <div className="max-w-4xl mx-auto text-center w-full">
          <div className="inline-flex items-center gap-2 bg-teal-500/15 border border-teal-500/20 rounded-full px-4 py-1.5 mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-teal-400 text-sm font-semibold">Next-Gen Learning Platform</span>
          </div>

          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white leading-[1.05] mb-8 tracking-tight transition-colors">
            Learn Smarter.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-400 dark:from-teal-400 dark:to-teal-200">
              Teach Better.
            </span>
          </h1>

          <p className="text-slate-600 dark:text-slate-400 text-lg lg:text-xl leading-relaxed mb-16 max-w-2xl mx-auto font-medium transition-colors">
            Avia Tech International Training Academy, INC. is a fully custom LMS built for institutions that demand more than Moodle can offer. Premium design, powerful tools.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24 max-w-4xl mx-auto w-full">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-2 transition-colors">{stat.value}</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wide transition-colors">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto w-full mt-auto">
          {features.map((f) => (
            <div key={f.title} className="bg-white/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-3xl p-6 md:p-8 backdrop-blur-md hover:bg-white/80 dark:hover:bg-slate-800/60 transition-colors shadow-xl">
              <div className={`w-14 h-14 rounded-2xl ${f.bg} flex items-center justify-center mb-6 shadow-inner`}>
                <svg className={`w-7 h-7 ${f.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {f.icon}
                </svg>
              </div>
              <h3 className="text-slate-900 dark:text-white font-bold text-xl mb-3 transition-colors">{f.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed transition-colors">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md mt-16 py-8 transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 dark:text-slate-400 text-sm transition-colors">© {new Date().getFullYear()} Avia Tech International Training Academy, INC. All rights reserved.</span>
          </div>
          <div className="flex space-x-6 text-sm text-slate-500 dark:text-slate-400 transition-colors">
            <Link href="#" className="hover:text-teal-500 dark:hover:text-teal-400 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-teal-500 dark:hover:text-teal-400 transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-teal-500 dark:hover:text-teal-400 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
