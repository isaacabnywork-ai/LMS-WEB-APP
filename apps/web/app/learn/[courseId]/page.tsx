import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function LearnRootPage({
  params
}: {
  params: Promise<{ courseId: string }>;
}) {
  const resolvedParams = await params;
  const courseId = resolvedParams.courseId;

  // Find the first lesson of the first module
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { position: "asc" },
            take: 1
          }
        },
        take: 1
      }
    }
  });

  if (!course || course.modules.length === 0 || course.modules[0].lessons.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full p-8 text-center animate-slide-up">
        <div>
          <div className="w-24 h-24 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📚</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">No Curriculum Yet</h1>
          <p className="text-foreground/60 max-w-md mx-auto">This course doesn't have any lessons available right now. Please check back later!</p>
        </div>
      </div>
    );
  }

  const firstLessonId = course.modules[0].lessons[0].id;
  redirect(`/learn/${courseId}/lessons/${firstLessonId}`);
}
