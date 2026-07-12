import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home - Aipply",
  description: "Welcome to Aipply. Find your dream job today.",
};

export default function DashboardHomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
