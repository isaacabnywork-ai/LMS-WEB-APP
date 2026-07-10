import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { authenticateWithMoodle } from "./lib/moodle/auth";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email or Username", type: "text", placeholder: "username" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const rawMoodleUser = await authenticateWithMoodle(
            credentials.email as string, 
            credentials.password as string
          );
          
          if (!rawMoodleUser) return null;
          
          const moodleUser = rawMoodleUser as any;

          const assignedRole = (credentials.role as string) || "student";

          const userId = String(moodleUser.id);
          const userName = moodleUser.name || "User";

          await prisma.user.upsert({
            where: { id: userId },
            update: {
              email: moodleUser.email,
              role: assignedRole,
            },
            create: {
              id: userId,
              email: moodleUser.email,
              role: assignedRole,
            }
          });

          return {
            id: userId,
            email: moodleUser.email,
            name: userName,
            role: assignedRole,
            moodleToken: moodleUser.moodleToken,
            privateToken: moodleUser.privateToken,
          } as any;
        } catch (error: any) {
          console.error("Moodle Auth Error:", error.message);
          // Return null instead of throwing an Error to prevent NextAuth from showing "Configuration" error.
          // Returning null displays a standard "CredentialsSignin" error to the user.
          return null;
        }
      }
    })
  ],
});
