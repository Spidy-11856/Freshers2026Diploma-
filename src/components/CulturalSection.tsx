"use client";
import { useState } from "react";
import { ArrowRight, Music, Drama, Zap } from "lucide-react";
import CulturalModal from "./CulturalModal";

const events = [
  {
    key: "DANCE",
    title: "DANCE",
    icon: Zap,
    desc: "Bring your energy to the stage.",
    longDesc: "Solo, duo or group — show your moves and own the spotlight.",
    image: "https://images.unsplash.com/photo-1518834107812-67b0b288f498?w=600&q=80&auto=format&fit=crop",
  },
  {
    key: "DRAMA",
    title: "DRAMA / ACTING",
    icon: Drama,
    desc: "Tell a story. Own the stage.",
    longDesc: "Mono act, skit or theatre — emotions, dialogue and drama.",
    image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&q=80&auto=format&fit=crop",
  },
  {
    key: "SINGING",
    title: "SINGING",
    icon: Music,
    desc: "Let your voice be heard.",
    longDesc: "Solo or group singing — classical, modern, rap, any genre.",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&q=80&auto=format&fit=crop",
  },
];

export default function CulturalSection() {
  const [active, setActive] = useState<string | null>(null);
  const activeEvent = events.find((e) => e.key === active);

  return (
    <section id="culture" className="bg-[#050505] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#C9A227]/20 bg-[#C9A227]/10 px-3 py-1">
              <span className="text-xs font-bold tracking-[0.14em] text-[#E5C76B]">CULTURAL EVENTS • ONLY 3 CATEGORIES</span>
            </div>
            <h2 className="text-[32px] font-black leading-none tracking-[-0.03em] text-white sm:text-[44px]">
              BE PART OF <span className="text-[#C9A227]">THE CULTURE</span>
            </h2>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[#BFC0C2]">
              Show your talent and become part of the Freshers celebration. Choose one category and submit your performance.
            </p>
          </div>
          <div className="hidden text-right text-xs leading-relaxed text-[#BFC0C2] sm:block">
            <div>Organised by</div>
            <div className="font-bold text-white">Cultural Committee • UMU</div>
            <div className="mt-1 text-[#C9A227]">Diploma Engineering</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {events.map((ev) => (
            <div
              key={ev.key}
              className="premium-card group relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0D0D0D]"
            >
              <div className="relative h-[240px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ev.image} alt={ev.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/40 to-transparent" />
                <div className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl bg-black/60 backdrop-blur border border-white/10 text-[#E5C76B]">
                  <ev.icon className="h-5 w-5" />
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="inline-flex rounded-full bg-[#C9A227] px-3 py-1 text-xs font-black tracking-wide text-black">
                    {ev.key === "DRAMA" ? "DRAMA" : ev.key}
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-[20px] font-black tracking-[-0.02em] text-white">{ev.title}</h3>
                <p className="mt-1 text-sm font-medium text-[#E5C76B]">{ev.desc}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#BFC0C2]">{ev.longDesc}</p>
                <button
                  onClick={() => setActive(ev.key)}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-[#C9A227]/30 bg-[#1A1A1A] py-3 text-sm font-bold tracking-wide text-white transition hover:bg-[#C9A227] hover:text-black hover:border-[#C9A227]"
                >
                  PARTICIPATE <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs tracking-wide text-[#BFC0C2]">
          Only <span className="font-bold text-white">DANCE</span> • <span className="font-bold text-white">DRAMA / ACTING</span> • <span className="font-bold text-white">SINGING</span> are allowed. No other categories.
        </p>
      </div>

      {activeEvent && <CulturalModal eventType={activeEvent.key as any} title={activeEvent.title} onClose={() => setActive(null)} />}
    </section>
  );
}
