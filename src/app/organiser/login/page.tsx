"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Shield, Ticket, IdCard } from "lucide-react";
import Link from "next/link";

export default function OrganiserLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.push("/organiser/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] flex flex-col">
      <header className="border-b border-white/[0.06] bg-[#050505] px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#C9A227] to-[#E5C76B] text-sm font-black text-black">UM</div>
            <div><div className="text-sm font-black tracking-wide text-white">USHA MARTIN UNIVERSITY</div><div className="text-xs tracking-wide text-[#C9A227]">ORGANISER PORTAL</div></div>
          </Link>
          <Link href="/" className="text-sm text-[#BFC0C2] hover:text-white">← Back to Website</Link>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-[1000px] grid-cols-1 gap-8 lg:grid-cols-[1fr_1.1fr]">
          <div className="hidden flex-col justify-center rounded-[28px] border border-white/[0.06] bg-[#0D0D0D] p-8 lg:flex">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C9A227] text-black"><Shield className="h-6 w-6" /></div>
            <h1 className="mt-6 text-3xl font-black tracking-[-0.02em] text-white leading-tight">ORGANISER<br /><span className="text-[#C9A227]">LOGIN</span></h1>
            <p className="mt-3 text-sm leading-relaxed text-[#BFC0C2]">Secure access for Freshers 2026 management. Manage passes, cultural applications, coupons, scanner and announcements.</p>

            <div className="mt-8 space-y-3">
              <div className="rounded-2xl border border-white/[0.06] bg-[#151515] p-4">
                <div className="text-xs font-bold tracking-wide text-[#E5C76B] flex items-center gap-2"><IdCard className="h-4 w-4" /> ID PASS INCLUDED</div>
                <div className="mt-1 text-sm text-[#BFC0C2]">Each organiser gets a premium ID pass with unique code after login — for gate verification.</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl bg-[#151515] p-3 border border-white/[0.06]"><div className="font-black text-white">SUPER_ADMIN</div><div className="text-[#BFC0C2]">Full control</div></div>
                <div className="rounded-xl bg-[#151515] p-3 border border-white/[0.06]"><div className="font-black text-white">ORGANISER</div><div className="text-[#BFC0C2]">Manage all</div></div>
                <div className="rounded-xl bg-[#151515] p-3 border border-white/[0.06]"><div className="font-black text-white">SCANNER</div><div className="text-[#BFC0C2]">QR only</div></div>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/20 p-4">
              <div className="text-xs font-bold text-[#E5C76B]">DEMO CREDENTIALS</div>
              <div className="mt-2 space-y-1 font-mono text-xs text-white">
                <div>organiser / admin123 <span className="text-[#BFC0C2]">— ORGANISER</span></div>
                <div>superadmin / superadmin123 <span className="text-[#BFC0C2]">— SUPER_ADMIN</span></div>
                <div>scanner / scanner123 <span className="text-[#BFC0C2]">— SCANNER</span></div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/[0.08] bg-[#0D0D0D] p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-black text-white">Sign in to Organiser Dashboard</h2>
              <p className="mt-1 text-sm text-[#BFC0C2]">Use your organiser credentials. ID Pass will be generated automatically.</p>
            </div>

            <form onSubmit={handle} className="space-y-4">
              <div>
                <label className="text-xs font-bold tracking-wide text-[#BFC0C2]">USERNAME / EMAIL</label>
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="organiser / superadmin / scanner" className="input-premium mt-1 w-full rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white" required />
              </div>
              <div>
                <label className="text-xs font-bold tracking-wide text-[#BFC0C2]">PASSWORD</label>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" className="input-premium mt-1 w-full rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white" required />
              </div>
              {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
              <button type="submit" disabled={loading} className="btn-gold flex w-full items-center justify-center gap-2 rounded-full py-4 text-sm font-black disabled:opacity-60">
                {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                <span>{loading ? "SIGNING IN..." : "SIGN IN →"}</span>
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-white/[0.06] bg-[#151515] p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-white"><Ticket className="h-4 w-4 text-[#C9A227]" /> Secure & Audited</div>
              <p className="mt-1 text-xs leading-relaxed text-[#BFC0C2]">All organiser actions are audit-logged. Razorpay secrets never exposed to frontend. Pass codes are server-generated and unique.</p>
            </div>

            <div className="mt-4 text-center text-xs text-[#BFC0C2] lg:hidden">
              <div>Demo: organiser / admin123 • superadmin / superadmin123 • scanner / scanner123</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
