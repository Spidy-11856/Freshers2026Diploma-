"use client";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";

export default function Hero({ eventDate, venue }: { eventDate: string; venue: string }) {
  const dateDisplay = eventDate === "TBA" ? "To Be Announced Soon" : eventDate;
  const isTBA = eventDate === "TBA";

  return (
    <section className="relative overflow-hidden bg-[#050505]">
      {/* subtle gold glow bg */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-[#C9A227]/[0.06] blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-[#C9A227]/[0.03] blur-[100px]" />
        {/* grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative mx-auto grid max-w-[1280px] grid-cols-1 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:px-8 lg:py-16">
        {/* Left - Typography */}
        <div className="flex flex-col justify-center gap-6 lg:pr-6">
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#C9A227]/20 bg-[#C9A227]/[0.08] px-3 py-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#C9A227]" />
            <span className="text-[11px] font-bold tracking-[0.16em] text-[#E5C76B]">USHA MARTIN UNIVERSITY • DIPLOMA ENGINEERING</span>
          </div>

          <div className="space-y-1 leading-[0.9] tracking-[-0.04em]">
            <h1 className="text-[42px] font-[700] text-white sm:text-[56px] lg:text-[68px]">DIPLOMA</h1>
            <h1 className="text-[42px] font-[700] text-white sm:text-[56px] lg:text-[68px]">ENGINEERING</h1>
            <h1 className="text-[42px] font-[700] text-[#C9A227] sm:text-[56px] lg:text-[68px]">FRESHERS</h1>
            <div className="flex items-baseline gap-3">
              <span className="text-[42px] font-[300] italic tracking-[-0.03em] text-[#BFC0C2] sm:text-[56px] lg:text-[68px]">PASS &</span>
            </div>
            <h1 className="bg-gradient-to-r from-white via-[#E8E8E8] to-[#BFC0C2] bg-clip-text text-[38px] font-[700] leading-none text-transparent sm:text-[52px] lg:text-[62px]">
              CULTURAL
            </h1>
            <h1 className="bg-gradient-to-r from-white via-[#E8E8E8] to-[#BFC0C2] bg-clip-text text-[38px] font-[700] leading-none text-transparent sm:text-[52px] lg:text-[62px]">EVENTS</h1>
          </div>

          <p className="max-w-[520px] text-[15px] leading-relaxed text-[#BFC0C2]">
            The premium Freshers celebration for Diploma Engineering. Get your <span className="font-semibold text-white">black & gold pass</span>, celebrate, and own the stage in Dance, Drama & Singing.
          </p>

          {/* Date */}
          <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#151515] px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1C1C1C] text-[#C9A227]">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold tracking-[0.14em] text-[#BFC0C2]">EVENT DATE</div>
              <div className={`text-[15px] font-bold tracking-wide ${isTBA ? "text-[#E5C76B]" : "text-white"}`}>
                {isTBA ? "DATE TO BE ANNOUNCED SOON" : dateDisplay.toUpperCase()}
              </div>
            </div>
            {!isTBA && <div className="ml-auto hidden text-xs text-[#BFC0C2] sm:block">{venue}</div>}
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/get-pass" className="btn-gold flex items-center justify-center gap-2 rounded-full px-8 py-4 text-[14px] font-bold tracking-wide sm:w-auto">
              <span>GET MY PASS</span> <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/retrieve" className="btn-dark flex items-center justify-center gap-2 rounded-full px-8 py-4 text-[13px] font-semibold tracking-wide">
              <span>ALREADY PURCHASED? <span className="text-[#C9A227]">RETRIEVE PASS</span></span> <ArrowRight className="h-4 w-4 opacity-60" />
            </Link>
          </div>

          <div className="flex items-center gap-4 pt-2 text-xs text-[#BFC0C2]">
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Instant QR Pass</span>
            <span className="h-3 w-px bg-white/10" />
            <span>Secure Razorpay</span>
            <span className="h-3 w-px bg-white/10" />
            <span>Black & Gold Premium</span>
          </div>
        </div>

        {/* Right - Image */}
        <div className="relative lg:h-[620px]">
          {/* Glow behind image */}
          <div className="absolute inset-0 -z-10 rounded-[32px] bg-gradient-to-br from-[#C9A227]/10 via-transparent to-transparent blur-2xl" />

          <div className="relative h-[420px] overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0D0D0D] sm:h-[520px] lg:h-full">
            {/* Placeholder image using gradient + confetti pattern - replaceable via admin */}
            <div className="absolute inset-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80&auto=format&fit=crop"
                alt="Freshers celebration - stage, confetti, students celebrating"
                className="h-full w-full object-cover"
                loading="eager"
              />
              {/* Black gradient blend - image melts into dark bg like reference */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#050505]/70" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/40 to-transparent lg:from-[#050505]/60" />
              {/* Gold tint overlay very subtle */}
              <div className="absolute inset-0 bg-[#C9A227]/[0.04] mix-blend-overlay" />
            </div>

            {/* Floating info cards */}
            <div className="absolute bottom-4 left-4 right-4 flex gap-3 sm:bottom-6 sm:left-6 sm:right-6">
              <div className="flex-1 rounded-2xl border border-white/10 bg-black/60 px-4 py-3 backdrop-blur-xl">
                <div className="text-[10px] tracking-[0.14em] text-[#BFC0C2]">VENUE</div>
                <div className="text-sm font-bold leading-tight text-white">UMU CAMPUS</div>
                <div className="text-xs text-[#BFC0C2]">Ranchi, Jharkhand</div>
              </div>
              <div className="rounded-2xl border border-[#C9A227]/30 bg-[#C9A227] px-4 py-3 text-black">
                <div className="text-[10px] font-bold tracking-[0.14em] opacity-70">PASS INCLUDES</div>
                <div className="text-sm font-black leading-tight">EVENT +</div>
                <div className="text-sm font-black leading-tight">CULTURAL</div>
              </div>
            </div>

            {/* Top badge */}
            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 backdrop-blur-md sm:left-6 sm:top-6">
              <span className="h-2 w-2 rounded-full bg-[#C9A227] shadow-[0_0_8px_rgba(201,162,39,0.6)]" />
              <span className="text-xs font-bold tracking-wide text-white">FRESHERS 2026 • DIPLOMA</span>
            </div>
          </div>

          {/* Decorative metallic border glow */}
          <div className="pointer-events-none absolute -inset-px -z-10 rounded-[28px] bg-gradient-to-br from-[#C9A227]/20 via-white/[0.06] to-transparent opacity-60" />
        </div>
      </div>
    </section>
  );
}
