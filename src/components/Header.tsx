"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X, HelpCircle, ChevronDown } from "lucide-react";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = [
    { label: "Home", href: "/", hasDropdown: true },
    { label: "Events", href: "/#culture", hasDropdown: true },
    { label: "Passes", href: "/get-pass", hasDropdown: true },
    { label: "Participate", href: "/#culture", hasDropdown: true },
    { label: "Info", href: "/#info", hasDropdown: true },
    { label: "Contact", href: "/#contact", hasDropdown: false },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#050505]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Logo - minimalist as reference */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center bg-white text-black">
            {/* geometric logo like reference */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="8" height="8" fill="currentColor" />
              <rect x="12" y="2" width="10" height="4" fill="currentColor" opacity="0.7" />
              <rect x="12" y="8" width="4" height="10" fill="currentColor" opacity="0.7" />
            </svg>
          </div>
          <div className="leading-none">
            <div className="text-[12px] font-bold tracking-[-0.01em] text-white">Usha Martin</div>
            <div className="text-[12px] font-bold tracking-[-0.01em] text-white">University</div>
          </div>
        </Link>

        {/* Center nav - desktop - exact reference style */}
        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              className="flex items-center gap-1 rounded-full px-3.5 py-2 text-[13px] font-medium tracking-[-0.01em] text-[#E8E8E8] transition hover:text-white"
            >
              {n.label}
              {n.hasDropdown && <ChevronDown className="h-3 w-3 opacity-60" />}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="hidden items-center gap-4 lg:flex">
          <Link href="/#contact" className="text-sm font-medium text-[#E8E8E8] hover:text-white">
            Help
          </Link>
          <Link
            href="/get-pass"
            className="btn-gold rounded-full px-6 py-2.5 text-sm"
          >
            <span>Get My Pass</span>
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
