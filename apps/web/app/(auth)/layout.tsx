import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Avia Tech — Next-Gen Learning Platform",
  description: "Sign in or create your Avia Tech account",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
