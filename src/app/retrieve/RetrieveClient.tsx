"use client";
import { useState } from "react";
import PassCard from "@/components/PassCard";
import { Search, Loader2 } from "lucide-react";

export default function RetrieveClient({ eventDate, venue }: { eventDate: string; venue: string }) {
  const [reg, setReg] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pass, setPass] = useState<any>(null);

  async function handleRetrieve(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPass(null);
    if (!reg.trim() || !code.trim()) return setError("Both fields are required.");
    setLoading(true);
    try {
      const res = await fetch(`/api/passes?reg=${encodeURIComponent(reg.trim())}&code=${encodeURIComponent(code.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Pass not found");
      setPass(data.pass);
      // use returned eventDate/venue if present
      if (data.eventDate) (window as any).__evtDate = data.eventDate;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[720px] px-4 py-10 sm:px-6">
      <div className="text-center">
        <h1 className="text-[28px] font-black tracking-[-0.03em] text-white sm:text-[36px]">RETRIEVE YOUR <span className="text-[#C9A227]">PASS</span></h1>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[#BFC0C2]">Lost your pass? Enter your Registration Number and Pass Code to view your premium digital pass and QR.</p>
      </div>

      <form onSubmit={handleRetrieve} className="mx-auto mt-8 max-w-[520px] rounded-[24px] border border-white/[0.08] bg-[#0D0D0D] p-6 sm:p-8">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold tracking-wide text-[#BFC0C2]">REGISTRATION NUMBER *</label>
            <input value={reg} onChange={(e) => setReg(e.target.value)} placeholder="e.g. DIPL2026XXX" className="input-premium mt-1 w-full rounded-xl border border-white/10 bg-[#151515] px-4 py-3 font-mono text-sm font-bold tracking-wide text-white" />
          </div>
          <div>
            <label className="text-xs font-bold tracking-wide text-[#BFC0C2]">PASS CODE *</label>
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. F26-XXXX-XXXX" className="input-premium mt-1 w-full rounded-xl border border-white/10 bg-[#151515] px-4 py-3 font-mono text-sm font-bold tracking-widest text-white" />
          </div>
          {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
          <button type="submit" disabled={loading} className="btn-gold flex w-full items-center justify-center gap-2 rounded-full py-4 text-sm font-black disabled:opacity-60">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            <span>{loading ? "SEARCHING..." : "RETRIEVE MY PASS"}</span>
          </button>
          <p className="text-center text-xs text-[#BFC0C2]">Rate-limited for security. Contact coordinator if you forgot your Pass Code.</p>
        </div>
      </form>

      {pass && (
        <div className="mt-10">
          <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-center text-sm font-bold text-emerald-300">✓ Pass Found — Valid Entry Pass</div>
          <PassCard pass={pass} eventDate={eventDate} venue={venue} />
        </div>
      )}
    </div>
  );
}
