"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Ticket, Calendar, MapPin, ShieldCheck, Tag, Loader2 } from "lucide-react";
import PassCard from "@/components/PassCard";

type PassType = "FRESHER" | "SENIOR";

export default function GetPassClient({ passPrice, eventDate, venue }: { passPrice: number; eventDate: string; venue: string }) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [type, setType] = useState<PassType>("FRESHER");
  const [loading, setLoading] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number; finalPrice: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [form, setForm] = useState({ name: "", registrationNumber: "", branch: "", yearSemester: "", phone: "", email: "" });
  const [pass, setPass] = useState<any>(null);
  const [error, setError] = useState("");

  const originalPrice = passPrice; // paise
  const discount = couponApplied?.discount || 0;
  const finalPrice = couponApplied ? couponApplied.finalPrice : originalPrice;

  async function applyCoupon() {
    setCouponError("");
    if (!couponInput.trim()) return setCouponError("Enter coupon code");
    setCouponLoading(true);
    try {
      const res = await fetch(`/api/coupons?code=${encodeURIComponent(couponInput.trim())}&validate=true`);
      const data = await res.json();
      if (!res.ok || !data.valid) throw new Error(data.reason || data.error || "Invalid coupon");
      setCouponApplied({ code: data.coupon.code, discount: data.discount, finalPrice: data.finalPrice });
    } catch (e: any) {
      setCouponError(e.message);
      setCouponApplied(null);
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setCouponApplied(null);
    setCouponInput("");
    setCouponError("");
  }

  // Load Razorpay script
  function loadRazorpay(): Promise<boolean> {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });
  }

  async function handleProceed() {
    setError("");
    // basic validation
    if (!form.name || !form.registrationNumber || !form.branch || !form.yearSemester || !form.phone || !form.email) {
      setError("Please fill all fields.");
      return;
    }
    setLoading(true);
    try {
      // Step 1: create order (server calculates final price)
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, type, couponCode: couponApplied?.code }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Failed to create order");

      // If demo mode — bypass Razorpay checkout and directly verify with demo signature
      if (orderData.demo || orderData.keyId === "rzp_test_demo_key") {
        // Simulate payment
        const verifyRes = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: orderData.orderId,
            razorpay_payment_id: `pay_demo_${Date.now()}`,
            razorpay_signature: "demo_signature",
            ...form,
            type,
            couponCode: couponApplied?.code,
          }),
        });
        const verifyData = await verifyRes.json();
        if (!verifyRes.ok) throw new Error(verifyData.error || "Payment verification failed");
        setPass(verifyData.pass);
        setStep("success");
        // also store event data for PassCard
        (window as any).__freshersEventDate = verifyData.eventDate;
        (window as any).__freshersVenue = verifyData.venue;
        setLoading(false);
        return;
      }

      // Real Razorpay flow
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Failed to load Razorpay");

      const options: any = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: "INR",
        name: "Usha Martin University",
        description: `Freshers Pass — ${type}`,
        order_id: orderData.orderId,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        notes: { registrationNumber: form.registrationNumber, branch: form.branch },
        theme: { color: "#C9A227" },
        handler: async (resp: any) => {
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: resp.razorpay_order_id,
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_signature: resp.razorpay_signature,
                ...form,
                type,
                couponCode: couponApplied?.code,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || "Verification failed");
            setPass(verifyData.pass);
            setStep("success");
          } catch (e: any) {
            setError(e.message);
            setLoading(false);
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (resp: any) => {
        setError(resp.error?.description || "Payment failed");
        setLoading(false);
      });
      rzp.open();
    } catch (e: any) {
      setError(e.message || "Something went wrong");
      setLoading(false);
    }
  }

  if (step === "success" && pass) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-10 sm:px-6">
        <div className="mb-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white">✓</div>
          <h2 className="mt-4 text-2xl font-black text-white">Payment Successful!</h2>
          <p className="mt-2 text-sm text-emerald-100">Your premium pass has been generated. Save it and show QR at entry.</p>
          <div className="mt-3 inline-flex rounded-full bg-black/20 px-3 py-1 text-xs font-bold text-white">Pass Code: {pass.passCode}</div>
        </div>

        <PassCard pass={pass} eventDate={eventDate} venue={venue} />

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => window.print()}
            className="btn-dark rounded-full px-6 py-3 text-sm font-bold"
          >
            DOWNLOAD PASS (Print)
          </button>
          <Link href="/retrieve" className="btn-gold rounded-full px-6 py-3 text-center text-sm font-bold">
            <span>RETRIEVE ANYTIME →</span>
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-[#0D0D0D] p-4 text-center">
          <p className="text-xs text-[#BFC0C2]">Lost your pass? Go to <Link href="/retrieve" className="font-bold text-[#C9A227]">/retrieve</Link> and enter Registration Number + Pass Code.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link href="/" className="text-sm text-[#BFC0C2] hover:text-white">← Back to Home</Link>
        <h1 className="mt-3 text-[28px] font-black tracking-[-0.03em] text-white sm:text-[36px]">GET YOUR <span className="text-[#C9A227]">FRESHERS PASS</span></h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#BFC0C2]">Secure your premium black & gold pass. Instant QR, Razorpay secured, server-verified pricing.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Form */}
        <div className="rounded-[24px] border border-white/[0.08] bg-[#0D0D0D] p-6 sm:p-8">
          <div className="mb-6">
            <div className="text-xs font-bold tracking-[0.14em] text-[#C9A227]">WHO ARE YOU?</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {(["FRESHER", "SENIOR"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`rounded-2xl border p-4 text-left transition ${type === t ? "border-[#C9A227] bg-[#C9A227]/12" : "border-white/10 bg-[#151515] hover:border-white/20"}`}
                >
                  <div className={`text-sm font-black tracking-wide ${type === t ? "text-[#E5C76B]" : "text-white"}`}>{t}</div>
                  <div className="text-xs text-[#BFC0C2]">{t === "FRESHER" ? "New Diploma student 2026" : "Senior — welcome back"}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold tracking-wide text-[#BFC0C2]">FULL NAME *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" className="input-premium mt-1 w-full rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white placeholder:text-white/40" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold tracking-wide text-[#BFC0C2]">REGISTRATION NUMBER *</label>
                <input value={form.registrationNumber} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })} placeholder="DIPL2026XXX" className="input-premium mt-1 w-full rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white" />
              </div>
              <div>
                <label className="text-xs font-bold tracking-wide text-[#BFC0C2]">BRANCH *</label>
                <select value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} className="input-premium mt-1 w-full rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white">
                  <option value="">Select branch</option>
                  <option>Civil</option>
                  <option>Mechanical</option>
                  <option>Electrical</option>
                  <option>Computer Science</option>
                  <option>Mining</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold tracking-wide text-[#BFC0C2]">YEAR / SEMESTER *</label>
                <input value={form.yearSemester} onChange={(e) => setForm({ ...form, yearSemester: e.target.value })} placeholder="e.g. 1st Year / 1st Sem" className="input-premium mt-1 w-full rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white" />
              </div>
              <div>
                <label className="text-xs font-bold tracking-wide text-[#BFC0C2]">PHONE NUMBER *</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 90000 00000" className="input-premium mt-1 w-full rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold tracking-wide text-[#BFC0C2]">EMAIL ADDRESS *</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@umu.ac.in" type="email" className="input-premium mt-1 w-full rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white" />
            </div>

            {/* Coupon */}
            <div className="rounded-2xl border border-white/[0.06] bg-[#151515] p-4">
              <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-[#BFC0C2]"><Tag className="h-4 w-4 text-[#C9A227]" /> COUPON CODE</div>
              <div className="mt-3 flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="e.g. FRESHERS50"
                  disabled={!!couponApplied}
                  className="input-premium flex-1 rounded-xl border border-white/10 bg-[#0D0D0D] px-4 py-3 text-sm font-mono font-bold tracking-wide text-white placeholder:text-white/30 disabled:opacity-60"
                />
                {!couponApplied ? (
                  <button onClick={applyCoupon} disabled={couponLoading} className="rounded-xl bg-[#C9A227] px-5 py-3 text-sm font-black text-black hover:bg-[#D4AF37] disabled:opacity-50">
                    {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "APPLY"}
                  </button>
                ) : (
                  <button onClick={removeCoupon} className="rounded-xl border border-white/10 bg-[#0D0D0D] px-5 py-3 text-sm font-bold text-white hover:bg-white/5">
                    REMOVE
                  </button>
                )}
              </div>
              {couponError && <div className="mt-2 text-xs font-medium text-red-400">{couponError}</div>}
              {couponApplied && <div className="mt-2 text-xs font-bold text-emerald-400">✓ Coupon {couponApplied.code} applied — you save ₹{Math.round(couponApplied.discount / 100)}!</div>}
              {!couponApplied && !couponError && <div className="mt-2 text-xs text-[#BFC0C2]">Try <span className="font-mono font-bold text-[#E5C76B]">FRESHERS50</span> for 50% OFF • <span className="font-mono font-bold text-[#E5C76B]">EARLYBIRD20</span> for 20% OFF</div>}
            </div>

            {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

            <button onClick={handleProceed} disabled={loading} className="btn-gold flex w-full items-center justify-center gap-2 rounded-full py-4 text-sm font-black disabled:opacity-60">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              <span>{loading ? "PROCESSING..." : "PROCEED TO PAYMENT →"}</span>
            </button>
            <p className="text-center text-xs text-[#BFC0C2] flex items-center justify-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Secure Razorpay • Amount verified server-side</p>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <div className="rounded-[24px] border border-white/[0.08] bg-[#0D0D0D] p-6">
            <h3 className="text-sm font-black tracking-wide text-white flex items-center gap-2"><Ticket className="h-4 w-4 text-[#C9A227]" /> PASS SUMMARY</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-[#BFC0C2]">Pass Type</span><span className="font-bold text-white">{type}</span></div>
              <div className="flex justify-between"><span className="text-[#BFC0C2]">Original Price</span><span className="font-mono font-bold text-white">₹{Math.round(originalPrice / 100)}</span></div>
              {discount > 0 && <div className="flex justify-between text-emerald-400"><span>Discount {couponApplied?.code}</span><span className="font-mono font-bold">- ₹{Math.round(discount / 100)}</span></div>}
              <div className="h-px bg-white/10" />
              <div className="flex justify-between text-base"><span className="font-bold text-white">Final Price</span><span className="font-mono text-xl font-black text-[#C9A227]">₹{Math.round(finalPrice / 100)}</span></div>
              <div className="rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/20 px-3 py-2 text-xs text-[#E5C76B]">Server calculates final amount. Frontend price is never trusted.</div>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/[0.08] bg-[#0D0D0D] p-6">
            <h4 className="text-sm font-black text-white">WHAT YOU GET</h4>
            <ul className="mt-3 space-y-2 text-sm text-[#BFC0C2]">
              <li className="flex gap-2"><span className="text-[#C9A227]">•</span> Premium black & gold digital pass</li>
              <li className="flex gap-2"><span className="text-[#C9A227]">•</span> Unique Pass Code + QR (single use)</li>
              <li className="flex gap-2"><span className="text-[#C9A227]">•</span> Event access + cultural participation</li>
              <li className="flex gap-2"><span className="text-[#C9A227]">•</span> Instant delivery — no email wait</li>
            </ul>
            <div className="mt-4 flex items-center gap-2 text-xs text-[#BFC0C2]">
              <Calendar className="h-4 w-4" /> {eventDate === "TBA" ? "Date TBA" : eventDate} • <MapPin className="h-4 w-4" /> {venue}
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-[#151515] p-4">
            <div className="text-xs font-bold tracking-wide text-white">ALREADY PURCHASED?</div>
            <p className="mt-1 text-xs leading-relaxed text-[#BFC0C2]">Retrieve your pass with Registration Number + Pass Code.</p>
            <Link href="/retrieve" className="btn-dark mt-3 flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-bold">
              RETRIEVE PASS <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
