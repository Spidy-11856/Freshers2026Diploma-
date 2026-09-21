"use client";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";

export default function Hero({ eventDate, venue }: { eventDate: string; venue: string }) {
  const dateDisplay = eventDate === "TBA" ? "To Be Announced Soon" : eventDate;
  return (
    <section className="relative overflow-hidden bg-[#050505]">
      {/* subtle gold glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 right-0 h-[600px] w-[600px] rounded-full bg-[#C9A227]/[0.07] blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 h-[500px] w-[500px] rounded-full bg-[#C9A227]/[0.03] blur-[100px]" />
      </div>

      <div className="relative mx-auto grid max-w-[1280px] grid-cols-1 gap-0 lg:grid-cols-[1.02fr_0.98fr] lg:min-h-[600px]">
        {/* Left - Typography */}
        <div className="relative flex flex-col justify-center gap-7 px-4 py-10 sm:px-6 lg:px-10 lg:py-12 bg-[#050505]">
          {/* Heading - exact reference structure but gold accent */}
          <div className="space-y-0 leading-[0.88] tracking-[-0.05em]">
            <h1 className="text-[42px] font-[900] tracking-[-0.06em] text-white sm:text-[56px] lg:text-[62px]">Diploma</h1>
            <h1 className="text-[42px] font-[900] tracking-[-0.06em] text-white sm:text-[56px] lg:text-[62px]">Engineering</h1>
            <h1 className="text-[42px] font-[900] tracking-[-0.06em] text-white sm:text-[56px] lg:text-[62px]">Freshers</h1>
            <h1 className="text-[42px] font-[900] tracking-[-0.06em] text-[#C9A227] sm:text-[56px] lg:text-[62px]">Passes &</h1>
            <h1 className="text-[42px] font-[900] tracking-[-0.06em] text-[#C9A227] sm:text-[56px] lg:text-[62px]">Cultural Events</h1>
          </div>

          {/* Date - calendar icon like reference */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white">
              <Calendar className="h-4 w-4" />
            </div>
            <span className="text-[14px] font-semibold tracking-[-0.01em] text-white">{dateDisplay}</span>
          </div>

          {/* Buttons - exact reference pill shapes with arrows */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/get-pass" className="inline-flex items-center justify-between gap-6 rounded-full bg-[#C9A227] px-6 py-3.5 text-sm font-bold text-black hover:bg-[#D4AF37] transition sm:min-w-[180px]">
              <span>Get My Pass</span> <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-white"><ArrowRight className="h-4 w-4" /></span>
            </Link>
            <Link href="/retrieve" className="inline-flex items-center justify-between gap-4 rounded-full bg-[#1A1A1A] border border-white/10 px-6 py-3.5 text-sm font-bold text-white hover:bg-[#242424] transition sm:min-w-[210px]">
              <span className="leading-none text-left"><span className="block text-xs font-normal text-white/60">Already Purchased?</span><span className="block">Retrieve Pass</span></span> <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black"><ArrowRight className="h-4 w-4" /></span>
            </Link>
          </div>

          {/* blend to image */}
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-24 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent lg:block translate-x-1" />
        </div>

        {/* Right - Image - crowd with stage, confetti, hands */}
        <div className="relative h-[420px] overflow-hidden bg-black lg:h-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1000&q=80&auto=format&fit=crop"
            alt="Freshers crowd celebration"
            className="h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/70 via-transparent to-transparent" />
          <div className="absolute inset-y-0 left-0 hidden w-32 bg-gradient-to-r from-[#050505] via-[#050505]/60 to-transparent lg:block" />
          <div className="absolute inset-0 bg-[#C9A227]/[0.06] mix-blend-overlay" />
          {/* light leak like reference */}
          <div className="absolute top-0 left-1/3 h-32 w-32 rounded-full bg-white/20 blur-[50px]" />
        </div>
      </div>
    </section>
  );
}
