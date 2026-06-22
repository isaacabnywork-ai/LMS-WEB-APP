import React from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function CertificatesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const certificates = await prisma.certificate.findMany({
    where: { userId: session.user.id },
    include: {
      course: {
        include: { instructor: true }
      }
    },
    orderBy: { issuedAt: "desc" }
  });

  return (
    <div className="animate-slide-up space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">My Certificates</h1>
          <p className="text-foreground/60 mt-1">View and download your earned certificates of completion.</p>
        </div>
      </div>

      {certificates.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl border border-foreground/10">
          <div className="w-20 h-20 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-teal-500">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
          </div>
          <h3 className="text-xl font-bold mb-2">No certificates yet</h3>
          <p className="text-foreground/60 mb-6 max-w-md mx-auto">Complete a course 100% to automatically earn a certificate of completion!</p>
          <Link href="/student/catalog" className="inline-block px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 transition-all">
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {certificates.map(cert => (
            <div key={cert.id} className="glass-panel p-8 rounded-3xl border border-teal-500/20 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg className="w-32 h-32 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
              </div>
              
              <div className="relative z-10 space-y-6">
                <div>
                  <h4 className="text-teal-600 dark:text-teal-400 font-bold text-xs uppercase tracking-widest mb-2">Certificate of Completion</h4>
                  <h3 className="text-2xl font-black text-foreground leading-tight">{cert.course.title}</h3>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs text-foreground/50 uppercase tracking-wider font-semibold">Instructor</p>
                  <p className="font-medium">{cert.course.instructor.name || "Unknown Instructor"}</p>
                </div>
                
                <div className="flex items-end justify-between pt-4 border-t border-foreground/10">
                  <div>
                    <p className="text-xs text-foreground/50 uppercase tracking-wider font-semibold mb-1">Issued</p>
                    <p className="font-bold">{cert.issuedAt.toLocaleDateString()}</p>
                  </div>
                  <Link href={`/student/certificates/${cert.id}`} className="flex items-center gap-2 text-sm font-bold text-teal-600 hover:text-teal-700 bg-teal-500/10 hover:bg-teal-500/20 px-4 py-2 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    View Certificate
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
