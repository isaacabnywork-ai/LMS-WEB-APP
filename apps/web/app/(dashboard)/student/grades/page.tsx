import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import StudentGradesClient, { GradeItem } from "./StudentGradesClient";

function calculateLetterGrade(score: number, maxScore: number) {
  if (maxScore === 0) return "N/A";
  const pct = score / maxScore;
  if (pct >= 0.95) return "A+";
  if (pct >= 0.90) return "A";
  if (pct >= 0.85) return "B+";
  if (pct >= 0.80) return "B";
  if (pct >= 0.75) return "C+";
  if (pct >= 0.70) return "C";
  if (pct >= 0.60) return "D";
  return "F";
}

function calculateGPA(pcts: number[]) {
  if (pcts.length === 0) return "0.0";
  let total = 0;
  for (const p of pcts) {
    if (p >= 0.9) total += 4.0;
    else if (p >= 0.8) total += 3.0;
    else if (p >= 0.7) total += 2.0;
    else if (p >= 0.6) total += 1.0;
  }
  return (total / pcts.length).toFixed(1);
}

export default async function StudentGradesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const userId = session.user.id;
  const moodleToken = (session.user as any).moodleToken;

  const grades: GradeItem[] = [];
  const pcts: number[] = [];

  try {
    if (moodleToken) {
      // 1. Fetch enrolled courses for the student
      const { moodle } = await import("@/lib/moodle/client");
      const courses = await moodle.call<any[]>('core_enrol_get_users_courses', {
        userid: userId
      }, { cache: 'no-store' }, moodleToken);

      // 2. Fetch grades for each course
      for (const course of courses) {
        const gradeReport = await moodle.call<any>('gradereport_user_get_grade_items', {
          courseid: course.id,
          userid: userId
        }, { cache: 'no-store' }, moodleToken);
        
        if (gradeReport.usergrades && gradeReport.usergrades.length > 0) {
          const userGrade = gradeReport.usergrades[0];
          
          if (userGrade.gradeitems) {
            for (const item of userGrade.gradeitems) {
              // We can filter out course totals or empty grades if desired
              // For now, let's include anything that has a grade or is a course total
              const isGraded = item.gradeformatted && item.gradeformatted !== '-';
              
              let score = 0;
              let max = 100;
              
              if (isGraded) {
                // Some Moodle setups return strings like "95.00"
                score = parseFloat(item.gradeformatted) || 0;
                max = parseFloat(item.grademax) || 100;
                pcts.push(score / max);
              }

              const status = isGraded ? calculateLetterGrade(score, max) : 'N/A';
              const assignmentName = item.itemname || (item.itemtype === 'course' ? 'Course Total' : 'Assignment');
              const dateTimestamp = item.gradedatedatesubmitted || item.gradedategraded || (Date.now() / 1000);
              
              grades.push({
                id: String(item.id),
                course: course.fullname,
                assignment: assignmentName,
                score: isGraded ? score : 0,
                total: max,
                date: new Date(dateTimestamp * 1000).toLocaleDateString(),
                status: status
              });
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch Moodle grades:", error);
  }

  const gpa = calculateGPA(pcts);
  const totalCredits = grades.length * 3; // Mock 3 credits per graded item

  return <StudentGradesClient grades={grades} totalCredits={totalCredits} gpa={gpa} />;
}
