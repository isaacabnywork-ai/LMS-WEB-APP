"use client";

import React, { useState } from "react";
import { CheckCircle, Circle, PlayCircle, FileText, ChevronDown, ChevronUp } from "lucide-react";

interface PlayerSidebarProps {
  sections: any[];
  activeModule: any;
  onSelectModule: (module: any) => void;
}

export default function PlayerSidebar({ sections, activeModule, onSelectModule }: PlayerSidebarProps) {
  // Track which sections are expanded. By default, let's expand the first one.
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({
    [sections[0]?.id]: true
  });

  const toggleSection = (id: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getModuleIcon = (modname: string, isCompleted: boolean) => {
    if (isCompleted) return <CheckCircle className="w-5 h-5 text-green-500" />;
    
    switch (modname) {
      case 'url':
        return <PlayCircle className="w-5 h-5 text-gray-400" />;
      case 'resource':
      case 'page':
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="w-full h-full pb-20">
      {sections.map((section, idx) => {
        if (!section.modules || section.modules.length === 0) return null;
        const isExpanded = expandedSections[section.id];
        
        // Calculate progress for this section
        const total = section.modules.length;
        const completed = section.modules.filter((m: any) => m.completiondata?.state === 1).length;

        return (
          <div key={section.id} className="border-b border-gray-100 last:border-0">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition text-left"
            >
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">
                  {section.name || `Section ${idx}`}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {completed} / {total} | {(completed / total * 100).toFixed(0)}%
                </p>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {isExpanded && (
              <div className="bg-white">
                {section.modules.map((mod: any) => {
                  const isActive = activeModule?.id === mod.id;
                  const isCompleted = mod.completiondata?.state === 1;

                  return (
                    <button
                      key={mod.id}
                      onClick={() => onSelectModule(mod)}
                      className={`
                        w-full flex items-start gap-3 p-3 text-left transition
                        ${isActive ? "bg-blue-50 border-l-4 border-blue-600 pl-2" : "border-l-4 border-transparent pl-3 hover:bg-gray-50"}
                      `}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {getModuleIcon(mod.modname, isCompleted)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm line-clamp-2 ${isActive ? "font-semibold text-blue-900" : "text-gray-700"}`}>
                          {mod.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 capitalize">
                          {mod.modname === 'url' ? 'Video' : mod.modname === 'page' ? 'Reading' : 'Resource'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
