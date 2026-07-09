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
          const moodleUser = await authenticateWithMoodle(
            credentials.email as string, 
            credentials.password as string
          );
          
          if (!moodleUser) return null;

          // Note: In a full Moodle integration, we would verify the user's Moodle role
          // against the requested role (credentials.role).
          // For now, we trust the UI's role selection or default to student.
          const assignedRole = (credentials.role as string) || "student";

          // Sync the user to the local database so relations and role checks work
          await prisma.user.upsert({
            where: { id: moodleUser.id },
            update: {
              email: moodleUser.email,
              role: assignedRole,
            },
            create: {
              id: moodleUser.id,
              email: moodleUser.email,
              role: assignedRole,
            }
          });

          return {
            id: moodleUser.id,
            email: moodleUser.email,
            name: moodleUser.name,
            role: assignedRole,
            moodleToken: moodleUser.moodleToken,
          };
        } catch (error: any) {
          console.error("Moodle Auth Error:", error.message);
          throw new Error("Invalid credentials or Moodle connection failed.");
        }
      }
    })
  ],
});
