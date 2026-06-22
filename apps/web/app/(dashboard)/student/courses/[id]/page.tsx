import React from "react";
import CourseDetailClient from "@/components/CourseDetailClient";
import { redirect } from "next/navigation";

export function generateStaticParams() {
  return [{ id: '1' }];
}

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  redirect(`/student/catalog/${resolvedParams.id}`);
}
