import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { moodle } from "@/lib/moodle/client";

export default async function LearnRootPage({
  params
}: {
  params: Promise<{ courseId: string }>;
}) {
  const resolvedParams = await params;
  const courseId = resolvedParams.courseId;

  const session = await auth();
  if (!session?.user?.moodleToken) redirect("/login");

  const contents = await moodle.call<any[]>('core_course_get_contents', {
    courseid: courseId
  }, { cache: 'no-store' }, session.user.moodleToken).catch(() => []);

  const firstModule = contents.find((section: any) => section.modules.length > 0);
  const firstLesson = firstModule?.modules[0];

  if (!contents || !firstModule || !firstLesson) {
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

  const firstLessonId = firstLesson.id;
  redirect(`/learn/${courseId}/lessons/${firstLessonId}`);
}
