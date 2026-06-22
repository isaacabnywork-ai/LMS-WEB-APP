import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SubmitAssignmentClient from "@/components/SubmitAssignmentClient";

export default async function StudentAssignmentSubmitPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const resolvedParams = await params;
  
  const assignment = await prisma.assignment.findUnique({
    where: { id: resolvedParams.id },
    include: {
      submissions: {
        where: { userId: session.user.id }
      }
    }
  });

  if (!assignment) {
    return <div className="p-10 text-center">Assignment not found</div>;
  }

  // We serialize dates
  const serialized = {
    ...assignment,
    dueAt: assignment.dueAt ? assignment.dueAt.toISOString() : null,
    createdAt: assignment.createdAt.toISOString(),
    updatedAt: assignment.updatedAt.toISOString(),
    submission: assignment.submissions[0] ? {
      ...assignment.submissions[0],
      submittedAt: assignment.submissions[0].submittedAt.toISOString(),
      gradedAt: assignment.submissions[0].gradedAt?.toISOString() || null
    } : null
  };

  return <SubmitAssignmentClient assignment={serialized} />;
}
