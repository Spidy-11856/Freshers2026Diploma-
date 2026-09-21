"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function PassCard({
  pass,
  eventDate,
  venue,
}: {
  pass: {
    passCode: string;
    qrToken: string;
    name: string;
    branch: string;
    registrationNumber: string;
    type: string;
    email: string;
  };
  eventDate: string;
  venue: string;
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    const qrPayload = JSON.stringify({ t: pass.qrToken, c: pass.passCode });
    // Alternative: backend URL verification — use token only
    // For display we encode token; scanner will verify via backend
    QRCode.toDataURL(qrPayload, {
      width: 300,
      margin: 1,
      color: { dark: "#050505", light: "#FFFFFF" },
      errorCorrectionLevel: "H",
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [pass.qrToken, pass.passCode]);

  const dateDisplay = eventDate === "TBA" ? "TO BE ANNOUNCED" : eventDate;

  return (
    <div className="mx-auto w-full max-w-[420px]">
      {/* Pass container - premium black with gold */}
      <div className="relative overflow-hidden rounded-[28px] border border-[#C9A227]/30 bg-[#0D0D0D] shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_40px_rgba(201,162,39,0.12)]">
        {/* Top gold bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#C9A227] via-[#E5C76B] to-[#C9A227]" />

        {/* Metallic decorative top */}
        <div className="absolute right-0 top-0 h-40 w-40 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-[#C9A227]/30 to-transparent blur-2xl" />
        </div>

        {/* Header */}
        <div className="relative p-6 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-bold tracking-[0.18em] text-[#C9A227]">USHA MARTIN UNIVERSITY</div>
              <div className="text-[10px] tracking-[0.14em] text-[#BFC0C2]">DIPLOMA ENGINEERING</div>
            </div>
            <div className="rounded-full border border-[#C9A227]/30 bg-[#C9A227]/15 px-3 py-1 text-xs font-black tracking-wide text-[#E5C76B]">FRESHERS 2026</div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#C9A227] to-[#E5C76B] text-sm font-black text-black">UM</div>
            <div>
              <div className="text-sm font-black tracking-wide text-white">DIPLOMA FRESHERS PASS</div>
              <div className="text-xs font-semibold tracking-[0.1em] text-[#C9A227]">VALID ENTRY PASS • PREMIUM</div>
            </div>
          </div>
        </div>

        {/* Divider with diamond */}
        <div className="relative flex items-center gap-3 px-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-white/10" />
          <div className="h-2 w-2 rotate-45 border border-[#C9A227]/50 bg-[#C9A227]/20" />
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/10 to-white/10" />
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 p-6">
          <div className="col-span-2 rounded-2xl border border-white/[0.06] bg-[#151515] p-4">
            <div className="text-[10px] font-bold tracking-[0.12em] text-[#BFC0C2]">NAME</div>
            <div className="mt-1 text-base font-black tracking-wide text-white">{pass.name}</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] font-bold tracking-[0.12em] text-[#BFC0C2]">BRANCH</div>
                <div className="text-sm font-bold text-white">{pass.branch}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-[0.12em] text-[#BFC0C2]">TYPE</div>
                <div className="inline-flex rounded-full bg-[#C9A227] px-2 py-0.5 text-xs font-black text-black">{pass.type}</div>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-[10px] font-bold tracking-[0.12em] text-[#BFC0C2]">REGISTRATION NUMBER</div>
              <div className="font-mono text-sm font-bold tracking-wide text-[#E5C76B]">{pass.registrationNumber}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-[#151515] p-4">
            <div className="text-[10px] font-bold tracking-[0.12em] text-[#BFC0C2]">EVENT DATE</div>
            <div className="mt-1 text-sm font-black leading-tight text-white">{dateDisplay}</div>
            <div className="mt-1 text-xs text-[#BFC0C2]">{venue}</div>
          </div>
          <div className="rounded-2xl border border-[#C9A227]/20 bg-[#C9A227]/10 p-4">
            <div className="text-[10px] font-bold tracking-[0.12em] text-[#C9A227]">PASS CODE</div>
            <div className="font-mono text-sm font-black tracking-widest text-white">{pass.passCode}</div>
            <div className="mt-1 text-xs font-medium text-[#E5C76B]">Show at entrance</div>
          </div>
        </div>

        {/* QR */}
        <div className="px-6 pb-6">
          <div className="rounded-[20px] border border-white/[0.08] bg-white p-4">
            <div className="flex gap-4">
              <div className="shrink-0 rounded-xl bg-white p-2">
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrDataUrl} alt="QR Code" className="h-[120px] w-[120px]" />
                ) : (
                  <div className="flex h-[120px] w-[120px] items-center justify-center bg-gray-100 text-xs text-gray-500">Generating QR...</div>
                )}
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-xs font-black tracking-[0.12em] text-black">SCAN AT ENTRY</div>
                <div className="mt-1 text-xs leading-relaxed text-gray-600">Organiser will scan this QR to validate your pass. Each QR is unique and single-use.</div>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-black px-3 py-1.5 text-xs font-bold text-white">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> VALID ENTRY PASS
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-black/10 pt-3">
              <span className="font-mono text-xs font-bold tracking-widest text-black/70">{pass.qrToken.slice(0, 16).toUpperCase()}...</span>
              <span className="text-xs font-bold tracking-wide text-black/50">UMU • 2026</span>
            </div>
          </div>
        </div>

        {/* Footer gold shimmer */}
        <div className="flex items-center justify-between border-t border-white/[0.06] bg-[#050505] px-6 py-3">
          <span className="text-[10px] font-bold tracking-[0.14em] text-[#BFC0C2]">WWW.UMU.AC.IN • DIPLOMA ENGINEERING</span>
          <span className="text-[10px] font-bold tracking-[0.14em] text-[#C9A227]">PREMIUM • BLACK & GOLD</span>
        </div>
      </div>

      {/* Actions hint */}
      <p className="mt-4 text-center text-xs leading-relaxed text-[#BFC0C2]">Save this pass as image or PDF. You can always retrieve it with your Registration Number & Pass Code at <span className="font-bold text-white">/retrieve</span>.</p>
    </div>
  );
}
