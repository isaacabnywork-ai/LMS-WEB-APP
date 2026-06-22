"use client";

import { useState } from "react";
import { updateUserRole } from "@/app/actions/admin";

export function UserRoleSelector({ userId, initialRole }: { userId: string; initialRole: string }) {
  const [role, setRole] = useState(initialRole);
  const [loading, setLoading] = useState(false);

  async function handleRoleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value;
    setRole(newRole);
    setLoading(true);
    try {
      await updateUserRole(userId, newRole);
    } catch (err) {
      console.error(err);
      setRole(initialRole); // Revert on failure
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      value={role}
      onChange={handleRoleChange}
      disabled={loading}
      className={`text-sm rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 ${
        role === "admin"
          ? "text-rose-600 font-bold"
          : role === "teacher"
          ? "text-indigo-600 font-bold"
          : "text-slate-600 dark:text-slate-300"
      }`}
    >
      <option value="student">Student</option>
      <option value="teacher">Teacher</option>
      <option value="admin">Admin</option>
    </select>
  );
}
