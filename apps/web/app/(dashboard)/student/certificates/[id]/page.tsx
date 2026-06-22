import React from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function CertificateViewPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const resolvedParams = await params;
  const certificateId = resolvedParams.id;

  const certificate = await prisma.certificate.findUnique({
    where: { id: certificateId },
    include: {
      course: {
        include: { instructor: true }
      },
      user: true
    }
  });

  if (!certificate || certificate.userId !== session.user.id) {
    return (
      <div className="p-8 text-center animate-slide-up">
        <h1 className="text-3xl font-bold mb-4">Certificate Not Found</h1>
        <Link href="/student/certificates" className="text-teal-500 hover:underline">
          &larr; Back to Certificates
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-slide-up space-y-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center print:hidden">
        <Link href="/student/certificates" className="text-sm font-semibold text-foreground/60 hover:text-foreground inline-flex items-center gap-2">
          &larr; Back
        </Link>
        <button 
          onClick={() => {
            if (typeof window !== "undefined") window.print();
          }} 
          className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-6 rounded-xl shadow-lg transition-colors"
        >
          Print / Save as PDF
        </button>
      </div>

      {/* Elegant Certificate Wrapper */}
      <div className="w-full bg-white text-slate-900 border-[16px] border-double border-teal-800 p-2 sm:p-4 rounded-xl shadow-2xl relative print:shadow-none print:border-[16px] print:!p-4">
        
        {/* Inner Border */}
        <div className="border border-teal-800/20 p-8 sm:p-16 text-center space-y-8 relative overflow-hidden h-full flex flex-col justify-center min-h-[600px] print:min-h-[700px]">
          
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
               style={{ backgroundImage: "radial-gradient(#0d9488 2px, transparent 2px)", backgroundSize: "30px 30px" }}>
          </div>

          <div className="relative z-10 space-y-6">
            <h4 className="text-teal-800 font-bold tracking-[0.3em] uppercase text-sm sm:text-base">
              Certificate of Completion
            </h4>

            <div className="py-8">
              <p className="italic text-slate-500 mb-4">This is to certify that</p>
              <h1 className="text-4xl sm:text-6xl font-black text-slate-800 capitalize" style={{ fontFamily: 'Georgia, serif' }}>
                {certificate.user.name || "Student"}
              </h1>
            </div>

            <div className="max-w-2xl mx-auto">
              <p className="text-slate-600 leading-relaxed text-lg sm:text-xl">
                has successfully completed the course requirements and is hereby awarded this certificate for the course
              </p>
            </div>

            <div className="py-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-teal-900">
                {certificate.course.title}
              </h2>
            </div>

            {/* Signatures & Dates */}
            <div className="flex justify-between items-end mt-16 pt-8 border-t border-teal-800/10 px-8">
              <div className="text-center">
                <p className="font-bold text-lg text-slate-800">{certificate.issuedAt.toLocaleDateString()}</p>
                <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Date Issued</p>
              </div>

              {/* Seal */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 absolute bottom-8 sm:bottom-16 left-1/2 -translate-x-1/2 opacity-20 text-teal-800">
                 <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15 8L22 9L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9L9 8L12 2Z"/></svg>
              </div>

              <div className="text-center">
                <div className="font-medium text-xl text-teal-900 italic mb-1 border-b border-slate-300 pb-1 px-4 inline-block" style={{ fontFamily: 'cursive' }}>
                  {certificate.course.instructor.name || "Instructor"}
                </div>
                <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Lead Instructor</p>
              </div>
            </div>

            <div className="mt-8 text-[10px] text-slate-400 font-mono tracking-wider">
              Certificate ID: {certificate.id}
            </div>

          </div>
        </div>
      </div>
      
      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .glass-panel, nav, header { display: none !important; }
          .max-w-4xl > div:nth-child(2), .max-w-4xl > div:nth-child(2) * {
            visibility: visible;
          }
          .max-w-4xl > div:nth-child(2) {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            margin: 0;
            border: none;
            box-shadow: none;
          }
        }
      `}} />
    </div>
  );
}
