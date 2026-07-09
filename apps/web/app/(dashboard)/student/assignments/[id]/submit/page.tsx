import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SubmitAssignmentClient from "@/components/SubmitAssignmentClient";

export default async function StudentAssignmentSubmitPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const resolvedParams = await params;
  
  // Mock assignment record since Prisma Assignment model was dropped
  const serialized = {
    id: resolvedParams.id,
    title: "Sample Assignment (Mocked)",
    description: "Please submit your project files.",
    courseId: "mock-course",
    moduleId: null,
    maxScore: 100,
    dueAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    submission: null // No submission yet in mock
  };

  return <SubmitAssignmentClient assignment={serialized} />;
}
