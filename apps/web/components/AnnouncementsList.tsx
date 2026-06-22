import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function AnnouncementsList() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const announcements = await prisma.announcement.findMany({
    where: {
      course: {
        enrolments: {
          some: { userId: session.user.id }
        }
      }
    },
    include: {
      course: { select: { title: true } },
      author: { select: { name: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 3
  });

  if (announcements.length === 0) return null;

  return (
    <div className="space-y-4 mb-8">
      {announcements.map((announcement) => (
        <div
          key={announcement.id}
          className="bg-teal-50 dark:bg-teal-500/10 border-l-4 border-teal-500 p-4 rounded-r-xl"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-teal-900 dark:text-teal-200">
                📢 {announcement.title} <span className="opacity-60 font-normal text-sm">— {announcement.course.title}</span>
              </h3>
              <p className="text-sm text-teal-700 dark:text-teal-300 mt-1">
                {announcement.content}
              </p>
            </div>
            <div className="text-xs text-teal-500 font-medium">
              {new Date(announcement.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
