"use client";
import { useState } from "react";
import { X } from "lucide-react";

export default function CulturalModal({ eventType, title, onClose }: { eventType: "DANCE" | "DRAMA" | "SINGING"; title: string; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || "").trim(),
      registrationNumber: String(fd.get("registrationNumber") || "").trim(),
      branch: String(fd.get("branch") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      eventType,
      performanceName: String(fd.get("performanceName") || "").trim(),
      participants: Number(fd.get("participants") || 1),
      description: String(fd.get("description") || "").trim(),
    };
    if (!payload.name || !payload.registrationNumber || !payload.branch || !payload.phone || !payload.email || !payload.performanceName) {
      setError("Please fill all required fields.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/cultural", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative max-h-[90vh] w-full max-w-[640px] overflow-auto rounded-[24px] border border-white/10 bg-[#0D0D0D] shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full border border-white/10 bg-[#1C1C1C] p-2 text-white hover:bg-white/10">
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 sm:p-8">
          {!success ? (
            <>
              <div className="mb-6">
                <div className="inline-flex rounded-full bg-[#C9A227] px-3 py-1 text-xs font-black text-black">PARTICIPATE • {title}</div>
                <h3 className="mt-3 text-2xl font-black tracking-[-0.02em] text-white">Submit Your Performance</h3>
                <p className="mt-1 text-sm text-[#BFC0C2]">Only DANCE / DRAMA / SINGING are accepted. Your application will be reviewed by the Cultural Committee.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold tracking-wide text-[#BFC0C2]">FULL NAME *</label>
                    <input name="name" placeholder="Your full name" className="input-premium mt-1 w-full rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white placeholder:text-white/40" required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold tracking-wide text-[#BFC0C2]">REGISTRATION NUMBER *</label>
                    <input name="registrationNumber" placeholder="e.g. DIPL2026XXX" className="input-premium mt-1 w-full rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white placeholder:text-white/40" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold tracking-wide text-[#BFC0C2]">BRANCH *</label>
                    <select name="branch" className="input-premium mt-1 w-full rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white" required defaultValue="">
                      <option value="" disabled>Select branch</option>
                      <option>Civil</option>
                      <option>Mechanical</option>
                      <option>Electrical</option>
                      <option>Computer Science</option>
                      <option>Mining</option>
                      <option>Other Diploma</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold tracking-wide text-[#BFC0C2]">PHONE NUMBER *</label>
                    <input name="phone" placeholder="+91 90000 00000" className="input-premium mt-1 w-full rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white placeholder:text-white/40" required />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold tracking-wide text-[#BFC0C2]">EMAIL *</label>
                  <input name="email" type="email" placeholder="you@umu.ac.in" className="input-premium mt-1 w-full rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white placeholder:text-white/40" required />
                </div>

                <div>
                  <label className="text-xs font-semibold tracking-wide text-[#BFC0C2]">EVENT TYPE *</label>
                  <div className="mt-1 flex gap-2">
                    {["DANCE", "DRAMA", "SINGING"].map((t) => (
                      <div key={t} className={`flex-1 rounded-xl border px-3 py-3 text-center text-sm font-bold ${t === eventType ? "border-[#C9A227] bg-[#C9A227]/15 text-[#E5C76B]" : "border-white/10 bg-[#151515] text-[#BFC0C2]"}`}>
                        {t === "DRAMA" ? "DRAMA / ACTING" : t}
                      </div>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-[#BFC0C2]">Selected: {title}</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold tracking-wide text-[#BFC0C2]">PERFORMANCE NAME *</label>
                    <input name="performanceName" placeholder="e.g. Fusion Beat" className="input-premium mt-1 w-full rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white placeholder:text-white/40" required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold tracking-wide text-[#BFC0C2]">NUMBER OF PARTICIPANTS *</label>
                    <input name="participants" type="number" min={1} max={50} defaultValue={1} className="input-premium mt-1 w-full rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white" required />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold tracking-wide text-[#BFC0C2]">SHORT DESCRIPTION *</label>
                  <textarea name="description" rows={3} placeholder="Tell us about your performance..." className="input-premium mt-1 w-full rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white placeholder:text-white/40" required />
                </div>

                {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

                <button type="submit" disabled={loading} className="btn-gold w-full rounded-full py-4 text-sm font-black tracking-wide disabled:opacity-60">
                  <span>{loading ? "Submitting..." : "SUBMIT PERFORMANCE →"}</span>
                </button>
                <p className="text-center text-xs text-[#BFC0C2]">You will be contacted by Coordinator after review.</p>
              </form>
            </>
          ) : (
            <div className="py-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">✓</div>
              <h3 className="mt-4 text-2xl font-black text-white">Submitted Successfully!</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#BFC0C2]">Your performance request has been submitted successfully. The Cultural Committee will review and update your status to Pending / Shortlisted / Approved.</p>
              <button onClick={onClose} className="btn-gold mt-6 rounded-full px-8 py-3 text-sm font-bold">
                <span>Done</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
