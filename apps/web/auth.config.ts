import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const hasMoodleToken = !!(auth?.user as any)?.moodleToken;
      const isLoggedIn = !!auth?.user && hasMoodleToken;
      const role = (auth?.user as any)?.role;
      const path = nextUrl.pathname;

      console.log("Middleware Auth Check:", { path, isLoggedIn, role, auth });

      // Protect /student routes
      if (path.startsWith("/student")) {
        if (!isLoggedIn) return false;
        if (role !== "student" && role !== "admin") {
          return Response.redirect(new URL("/unauthorized", nextUrl));
        }
      }

      // Protect /teacher routes (except the teacher login page at /teacher)
      if (path.startsWith("/teacher") && path !== "/teacher") {
        if (!isLoggedIn) return false;
        if (role !== "teacher" && role !== "admin") {
          return Response.redirect(new URL("/unauthorized", nextUrl));
        }
      }

      // Protect /admin routes (except the admin login page at /admin)
      if (path.startsWith("/admin") && path !== "/admin") {
        if (!isLoggedIn) return false;
        if (role !== "admin") {
          return Response.redirect(new URL("/unauthorized", nextUrl));
        }
      }

      // Redirect logged-in users away from auth pages to their dashboards
      if (isLoggedIn && (path === "/" || path === "/login" || path === "/register" || path === "/admin" || path === "/teacher")) {
        if (role === "admin") return Response.redirect(new URL("/admin/dashboard", nextUrl));
        if (role === "teacher") return Response.redirect(new URL("/teacher/dashboard", nextUrl));
        if (role === "student") return Response.redirect(new URL("/student/dashboard", nextUrl));
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.moodleToken = user.moodleToken;
        token.privateToken = (user as any).privateToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.user.moodleToken = token.moodleToken as string;
        (session.user as any).privateToken = token.privateToken as string;
      }
      return session;
    }
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
