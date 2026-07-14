"use client";

import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<"student" | "teacher" | "admin">("student");
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  // Prefill email based on selected role for easy testing of seeded users
  useEffect(() => {
    if (activeTab === "login") {
      setEmail(`${role}@edunova.com`);
    } else {
      setEmail("");
      setName("");
      setPassword("");
    }
  }, [role, activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (activeTab === "signup") {
        // Handle Registration
        const res = await registerUser({ name, username: email, email, password, role });
        if (res && res.error) {
          setError(`Registration Failed: ${res.error}`);
          setIsLoading(false);
          return;
        }
      }

      // Automatically login after registration or standard login
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        role,
      });

      if (result?.error) {
        setError(`Login Failed: ${result.error}`);
      } else {
        // Hard redirect to clear any app router caches and fetch session
        window.location.href = "/";
      }
    } catch (err: any) {
      setError(`Error: ${err?.message || String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="min-h-screen bg-slate-50 dark:bg-[#060d1b] flex items-center justify-center relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-teal-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-indigo-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />
      
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Auth Form Box */}
      <div className="relative z-10 w-full max-w-md p-6 sm:p-10 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-slate-200/20 dark:shadow-black/40 border border-slate-100 dark:border-slate-800 m-4">
        <div className="w-full">
          {/* Logo */}
          <div className="flex items-center justify-center mb-10">
            <img src="/logo.png" alt="Avia Tech Logo" className="h-14 w-auto block dark:hidden" />
            <img src="/logo-dark.png" alt="Avia Tech Logo" className="h-14 w-auto hidden dark:block" />
          </div>

          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">
            {activeTab === "login" ? "Welcome back" : "Create account"}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            {activeTab === "login" ? "Sign in to your Avia Tech account" : "Join thousands of learners today"}
          </p>

          {/* Tab switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-1 mb-8 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                activeTab === "login"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("signup")}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                activeTab === "signup"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              Register
            </button>
          </div>


          {/* Form fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-semibold text-center">
                {error}
              </div>
            )}
            
            <>
              {activeTab === "signup" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Baker"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Username or Email Address
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alexbaker or alex@university.edu"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                  {activeTab === "login" && (
                    <a href="#" className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline">
                      Forgot password?
                    </a>
                  )}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            </>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-0.5 disabled:opacity-70 disabled:pointer-events-none"
            >
              {isLoading ? "Please wait..." : activeTab === "login" ? "Sign In" : "Create Account"}
              {!isLoading && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-slate-50 dark:bg-[#060d1b] px-3 text-xs text-slate-400">or continue with</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-1 gap-3">
            <button 
              type="button" 
              onClick={() => setError("Google login is not configured yet. Please sign in with your Moodle credentials.")}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
          </div>

          <p className="mt-8 text-center text-xs text-slate-400">
            By continuing, you agree to our{" "}
            <a href="#" className="text-teal-600 dark:text-teal-400 hover:underline">Terms</a> and{" "}
            <a href="#" className="text-teal-600 dark:text-teal-400 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
