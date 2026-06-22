import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
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

      // Protect /teacher routes
      if (path.startsWith("/teacher")) {
        if (!isLoggedIn) return false;
        if (role !== "teacher" && role !== "admin") {
          return Response.redirect(new URL("/unauthorized", nextUrl));
        }
      }

      // Protect /admin routes
      if (path.startsWith("/admin")) {
        if (!isLoggedIn) return false;
        if (role !== "admin") {
          return Response.redirect(new URL("/unauthorized", nextUrl));
        }
      }

      // Redirect logged-in users away from auth pages to their dashboards
      if (isLoggedIn && (path === "/" || path === "/login" || path === "/register")) {
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
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
