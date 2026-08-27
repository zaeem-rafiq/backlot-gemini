import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Backlot — AI-Native Pre-Production Studio",
  description: "Transform screenplays into auditable studio coverage, 1st AD breakdowns, stripboard schedules, and line-item budgets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#08090D] text-[#F8FAFC] min-h-screen">
        {children}
      </body>
    </html>
  );
}
