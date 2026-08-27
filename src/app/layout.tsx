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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#08090D] text-[#F8FAFC] min-h-screen">
        {children}
      </body>
    </html>
  );
}
