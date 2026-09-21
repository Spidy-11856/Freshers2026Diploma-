"use client";
import Link from "next/link";
import { Home, CalendarDays, Ticket, Users, Info, Sparkles } from "lucide-react";

export default function SecondaryNav() {
  const items = [
    { label: "Home", icon: Home, href: "/" },
    { label: "Events", icon: CalendarDays, href: "/#culture" },
    { label: "Participate", icon: Users, href: "/#culture" },
    { label: "Timeline", icon: Sparkles, href: "/#timeline" },
    { label: "Info", icon: Info, href: "/#info" },
    { label: "Get My Pass", icon: Ticket, href: "/get-pass", highlight: true },
  ];

  return (
    <div className="sticky top-[57px] z-40 border-y border-white/[0.06] bg-[#0D0D0D]/90 backdrop-blur-xl">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none sm:gap-2 sm:py-3">
          {items.map((it) => (
            <Link
              key={it.label}
              href={it.href}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition whitespace-nowrap ${
                it.highlight
                  ? "bg-[#C9A227] text-black hover:bg-[#D4AF37]"
                  : "bg-[#1C1C1C] text-[#BFC0C2] hover:bg-[#242424] hover:text-white border border-white/[0.06]"
              }`}
            >
              <it.icon className="h-4 w-4" />
              {it.label}
            </Link>
          ))}
          <div className="ml-auto hidden items-center gap-2 text-xs text-[#BFC0C2] sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Registrations Open
          </div>
        </div>
      </div>
    </div>
  );
}
