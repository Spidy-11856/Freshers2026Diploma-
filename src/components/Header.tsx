"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X, HelpCircle } from "lucide-react";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = [
    { label: "Home", href: "/" },
    { label: "Events", href: "/#culture" },
    { label: "Passes", href: "/get-pass" },
    { label: "Participate", href: "/#culture" },
    { label: "Info", href: "/#info" },
    { label: "Contact", href: "/#contact" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#050505]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#C9A227] to-[#E5C76B] text-sm font-black leading-none text-black">
            UM
          </div>
          <div className="leading-none">
            <div className="text-[11px] font-bold tracking-[0.18em] text-[#E8E8E8]">USHA MARTIN</div>
            <div className="text-[10px] font-medium tracking-[0.14em] text-[#BFC0C2]">University</div>
            <div className="mt-0.5 text-[9px] tracking-[0.12em] text-[#C9A227]">DIPLOMA ENGINEERING</div>
          </div>
        </Link>

        {/* Center nav - desktop */}
        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              className="rounded-full px-4 py-2 text-[13px] font-medium tracking-wide text-[#BFC0C2] transition hover:bg-white/[0.06] hover:text-white"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/#contact" className="flex items-center gap-1.5 text-sm font-medium text-[#BFC0C2] hover:text-white">
            <HelpCircle className="h-4 w-4" />
            Help
          </Link>
          <Link
            href="/get-pass"
            className="btn-gold rounded-full px-6 py-2.5 text-sm"
          >
            <span>GET MY PASS</span>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-full border border-white/10 p-2.5 text-[#E8E8E8] lg:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/[0.06] bg-[#0D0D0D] px-4 py-6 lg:hidden">
          <nav className="flex flex-col gap-1">
            {nav.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3 text-[15px] font-medium text-[#E8E8E8] hover:bg-white/[0.06]"
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-3">
              <Link href="/retrieve" className="btn-dark rounded-full px-6 py-3 text-center text-sm font-semibold">
                ALREADY PURCHASED? RETRIEVE PASS
              </Link>
              <Link href="/get-pass" className="btn-gold rounded-full px-6 py-3 text-center text-sm">
                <span>GET MY PASS →</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
