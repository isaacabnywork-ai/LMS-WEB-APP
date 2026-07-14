"use client";

import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function TeacherLogin() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const role = "teacher";
  
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Prefill email based on selected role for easy testing of seeded users
  useEffect(() => {
    if (activeTab === "login") {
      setEmail(`teacher@edunova.com`);
    } else {
      setEmail("");
      setName("");
      setUsername("");
      setPassword("");
    }
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (activeTab === "signup") {
        // Handle Registration
        const res = await registerUser({ name, username, email, password, role });
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
        window.location.href = "/teacher/dashboard";
      }
    } catch (err: any) {
      setError(`Error: ${err?.message || String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

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
            {activeTab === "login" ? "Teacher Portal" : "Apply as Teacher"}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            {activeTab === "login" ? "Sign in to access your classroom" : "Register to start teaching"}
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
                      placeholder="Teacher Name"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="teacheruser"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {activeTab === "login" ? "Username or Email Address" : "Email Address"}
                </label>
                <input
                  type={activeTab === "login" ? "text" : "email"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={activeTab === "login" ? "teacheruser or teacher@university.edu" : "teacher@university.edu"}
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
              {isLoading ? "Please wait..." : activeTab === "login" ? "Sign In as Teacher" : "Create Teacher Account"}
              {!isLoading && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
