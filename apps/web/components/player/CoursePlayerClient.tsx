"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Menu, X } from "lucide-react";
import PlayerSidebar from "./PlayerSidebar";
import ModuleRenderer from "./ModuleRenderer";

interface CoursePlayerClientProps {
  courseId: string;
  courseTitle: string;
  sections: any[];
}

export default function CoursePlayerClient({ courseId, courseTitle, sections }: CoursePlayerClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Find the first module to set as default active
  const firstModule = sections.find(s => s.modules && s.modules.length > 0)?.modules[0];
  const [activeModule, setActiveModule] = useState<any | null>(firstModule || null);

  return (
    <div className="flex h-full w-full bg-white text-slate-900 overflow-hidden">
      
      {/* Sidebar Overlay for Mobile */}
      {!sidebarOpen && (
    <button 
      onClick={() => setSidebarOpen(true)}
      className="lg:hidden fixed top-2 left-4 z-50 bg-blue-600 text-white p-2 rounded-xl shadow-md hover:bg-blue-700 transition"
    >
      <Menu className="w-6 h-6" />
    </button>
      )}

      {/* Sidebar */}
      <div className={`
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        fixed inset-y-0 left-0 z-40 w-80 bg-gray-50 border-r border-gray-200 transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 flex flex-col h-full
      `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Link href={`/student/catalog/${courseId}`} className="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 bg-white border-b border-gray-200">
          <h2 className="font-bold text-lg leading-tight line-clamp-2">{courseTitle}</h2>
          {/* Progress bar could go here */}
        </div>

        <div className="flex-1 overflow-y-auto">
          <PlayerSidebar 
            sections={sections} 
            activeModule={activeModule}
            onSelectModule={(mod) => {
              setActiveModule(mod);
              if (window.innerWidth < 1024) setSidebarOpen(false); // Close sidebar on mobile after selection
            }} 
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-white relative w-full lg:w-[calc(100%-20rem)]">
        {activeModule ? (
          <ModuleRenderer 
            module={activeModule} 
            courseId={courseId} 
            onNext={() => {
              // Simple logic to find the next module
              let foundCurrent = false;
              for (const section of sections) {
                for (const mod of section.modules || []) {
                  if (foundCurrent) {
                    setActiveModule(mod);
                    return;
                  }
                  if (mod.id === activeModule.id) foundCurrent = true;
                }
              }
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full flex-col text-gray-400">
            <p>No content available for this course.</p>
          </div>
        )}
      </div>

    </div>
  );
}
