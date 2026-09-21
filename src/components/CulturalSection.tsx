"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import CulturalModal from "./CulturalModal";

const events = [
  {
    key: "DANCE",
    title: "Dance",
    desc: "Bring your energy to the stage.",
    image: "https://images.unsplash.com/photo-1518834107812-67b0b288f498?w=600&q=80&auto=format&fit=crop",
  },
  {
    key: "DRAMA",
    title: "Drama / Acting",
    desc: "Tell a story. Own the stage.",
    image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&q=80&auto=format&fit=crop",
  },
  {
    key: "SINGING",
    title: "Singing",
    desc: "Let your voice be heard.",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&q=80&auto=format&fit=crop",
  },
];

export default function CulturalSection() {
  const [active, setActive] = useState<string | null>(null);
  const activeEvent = events.find((e) => e.key === active);

  return (
    <section id="culture" className="bg-[#050505] border-y border-white/[0.06]">
      <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.34fr_0.66fr] lg:gap-6">
          {/* Left */}
          <div className="flex flex-col justify-center">
            <h2 className="text-[30px] font-black leading-[0.9] tracking-[-0.04em] text-white sm:text-[36px]">
              Be Part of
              <br />
              The Culture
            </h2>
            <p className="mt-3 max-w-[320px] text-sm leading-relaxed text-[#BFC0C2]">
              Showcase your talent, connect with peers and make memories that last beyond the campus.
            </p>
            <button
              onClick={() => setActive("DANCE")}
              className="mt-6 inline-flex w-fit items-center gap-3 rounded-full bg-[#C9A227] px-6 py-3 text-sm font-bold text-black hover:bg-[#D4AF37] transition"
            >
              Participate Now <ArrowRight className="h-4 w-4" />
            </button>
            <p className="mt-4 hidden text-xs font-medium text-[#BFC0C2]/60 sm:block">Only DANCE • DRAMA / ACTING • SINGING</p>
          </div>

          {/* Right - 3 cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {events.map((ev) => (
              <div
                key={ev.key}
                className="group relative overflow-hidden rounded-[18px] border border-black/10 bg-[#0A0A0A] flex flex-col"
              >
                <div className="relative h-[190px] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ev.image} alt={ev.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="inline-flex rounded-full bg-white/15 backdrop-blur px-2.5 py-1 text-[10px] font-bold tracking-wide text-white border border-white/20 sm:bg-[#C9A227] sm:text-black sm:border-0">{ev.key === "DRAMA" ? "DRAMA / ACTING" : ev.key}</div>
                  </div>
                </div>
                <div className="p-4 bg-[#0D0D0D] flex-1 flex flex-col">
                  <h3 className="text-[15px] font-black tracking-[-0.02em] text-white">{ev.title}</h3>
                  <p className="mt-1 text-xs font-semibold text-[#E5C76B]">{ev.desc}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-[#BFC0C2] hidden sm:block truncate pr-2">{ev.key === "DANCE" ? "Dance, Music, Theatre" : ev.key === "DRAMA" ? "Mono act, skit, theatre" : "Classical, modern, rap"}</span>
                    <button
                      onClick={() => setActive(ev.key)}
                      className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-black hover:bg-white/90 transition"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeEvent && <CulturalModal eventType={activeEvent.key as any} title={activeEvent.title.toUpperCase()} onClose={() => setActive(null)} />}
    </section>
  );
}
