import { getAllUsers } from "@/app/actions/admin";
import { UserRoleSelector } from "@/components/UserRoleSelector";
import { Search } from "lucide-react";

export default async function AdminUsersPage() {
  const users = await getAllUsers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100">
            User Management
          </h1>
          <p className="text-slate-500 mt-1">Manage roles and permissions</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users..."
            className="pl-10 pr-4 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 w-full sm:w-64 text-sm"
          />
        </div>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-[var(--card-border)]">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300">User</th>
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300">Email</th>
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300">Joined</th>
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {(u.name || "U").substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {u.name || "Unknown"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{u.email}</td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <UserRoleSelector userId={u.id} initialRole={u.role} />
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
