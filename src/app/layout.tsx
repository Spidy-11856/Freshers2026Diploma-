import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Usha Martin University — Diploma Engineering Freshers 2026 | Pass & Cultural Events",
  description:
    "Official Freshers Pass & Cultural Events portal for Diploma Engineering — Usha Martin University. Get your premium black & gold pass, participate in Dance, Drama & Singing.",
  keywords: ["Usha Martin University", "Freshers 2026", "Diploma Engineering", "Cultural Events", "Freshers Pass"],
  openGraph: {
    title: "UMU Diploma Freshers 2026 — Pass & Cultural Events",
    description: "Premium Freshers Experience. Get your pass, own the stage.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#050505] text-[#E8E8E8] overflow-x-hidden" style={{ fontFamily: "Space Grotesk, Inter, system-ui, -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
