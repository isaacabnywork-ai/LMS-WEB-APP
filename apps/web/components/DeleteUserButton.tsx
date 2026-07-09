"use client";

import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteUser } from "@/app/actions/admin";
import { useRouter } from "next/navigation";

interface DeleteUserButtonProps {
  userId: string;
  userName: string;
}

export function DeleteUserButton({ userId, userName }: DeleteUserButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      setIsDeleting(true);
      try {
        await deleteUser(userId);
        router.refresh();
      } catch (error: any) {
        alert("Failed to delete user: " + error.message);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
      title="Delete User"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
