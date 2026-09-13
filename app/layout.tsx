import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Learning Site — desktop editor for learning projects",
  description: "Create, manage, update, and publish static learning sites from one desktop application.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
