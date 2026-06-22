"use client";

import React from "react";
import { deleteCourse } from "@/app/actions/teacher";

export function DeleteCourseButton({ courseId }: { courseId: string }) {
  return (
    <button 
      onClick={async () => {
        if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
          await deleteCourse(courseId);
        }
      }}
      className="font-semibold py-2 px-5 rounded-xl transition-all shadow-lg bg-red-500 hover:bg-red-600 text-white shadow-red-500/20"
    >
      Delete
    </button>
  );
}
