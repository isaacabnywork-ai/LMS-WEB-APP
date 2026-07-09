"use client";

import React, { useState, useTransition } from "react";
import { markLessonComplete } from "@/app/actions/student";
import { CheckCircle } from "lucide-react";

interface ModuleRendererProps {
  module: any;
  courseId: string;
  onNext: () => void;
}

export default function ModuleRenderer({ module, courseId, onNext }: ModuleRendererProps) {
  const [isPending, startTransition] = useTransition();
  const isCompleted = module.completiondata?.state === 1;
  const isVideo = module.modname === 'url' && module.contents?.[0]?.fileurl?.includes('youtube');

  const handleMarkComplete = () => {
    startTransition(async () => {
      try {
        await markLessonComplete(module.id.toString(), courseId, true);
        // Simulate local state update if needed, but Next.js revalidation should handle it
        // Then auto-advance
        onNext();
      } catch (err) {
        console.error("Failed to mark complete", err);
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-white relative w-full">
      {/* Title Bar */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">{module.name}</h1>
        <button
          onClick={handleMarkComplete}
          disabled={isPending || isCompleted}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition
            ${isCompleted 
              ? "bg-green-50 text-green-700 cursor-default" 
              : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50"}
          `}
        >
          {isCompleted ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Completed
            </>
          ) : (
            <>
              {isPending ? "Saving..." : "Mark Complete"}
            </>
          )}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
        
        {/* Video Player */}
        {isVideo && (
          <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-lg mb-4 shrink-0">
            <iframe
              src={module.contents[0].fileurl.replace("watch?v=", "embed/")}
              title={module.name}
              className="w-full h-full"
              allowFullScreen
            ></iframe>
          </div>
        )}

        {/* Interactive Moodle Modules (Iframe Embed) */}
        {module.modname !== 'resource' && !isVideo && (
          <div className="w-full h-full min-h-[85vh] bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 relative group flex-1">
            {module.url && module.url !== "#" ? (
              <iframe
                src={module.url}
                title={module.name}
                className="w-full h-full absolute inset-0"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads allow-modals"
                allowFullScreen
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full text-gray-500 absolute inset-0">
                <p>Content URL is missing or invalid.</p>
              </div>
            )}
          </div>
        )}

        {/* Downloadable Resource */}
        {module.modname === 'resource' && (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <FileIcon className="w-16 h-16 text-blue-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">{module.name}</h3>
            <p className="text-gray-500 mb-6 text-center max-w-md">
              This is a downloadable resource. Click the button below to open or save the file to your device.
            </p>
            <a 
              href={module.contents?.[0]?.fileurl || "#"} 
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-md transition"
            >
              Download File
            </a>
          </div>
        )}

      </div>
    </div>
  );
}

function FileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
