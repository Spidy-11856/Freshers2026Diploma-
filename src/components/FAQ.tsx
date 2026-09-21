"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FAQ({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="bg-[#050505] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[800px]">
        <div className="text-center">
          <h2 className="text-[28px] font-black tracking-[-0.03em] text-white sm:text-[36px]">FREQUENTLY ASKED QUESTIONS</h2>
          <p className="mt-2 text-sm text-[#BFC0C2]">Everything you need to know about the Freshers pass.</p>
        </div>

        <div className="mt-8 space-y-3">
          {items.map((faq, i) => (
            <div key={i} className="rounded-2xl border border-white/[0.06] bg-[#0D0D0D] overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between px-6 py-5 text-left">
                <span className="pr-6 text-sm font-bold text-white">{faq.q}</span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-[#BFC0C2] transition ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && <div className="px-6 pb-6 text-sm leading-relaxed text-[#BFC0C2]">{faq.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
