import Link from "next/link";
import { Ticket, CreditCard, QrCode, Download } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    { icon: Ticket, title: "Get My Pass", desc: "Choose Fresher / Senior and enter your details." },
    { icon: CreditCard, title: "Secure Payment", desc: "Pay via Razorpay. Coupon discounts auto-applied server-side." },
    { icon: QrCode, title: "Instant QR Pass", desc: "Unique Pass Code + QR generated. Black & gold premium ticket." },
    { icon: Download, title: "Show at Entry", desc: "Save, download and show QR at gate. One scan = one entry." },
  ];
  return (
    <section id="timeline" className="bg-[#050505] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1280px]">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex rounded-full border border-[#C9A227]/20 bg-[#C9A227]/10 px-3 py-1 text-xs font-bold tracking-[0.12em] text-[#E5C76B]">HOW IT WORKS</div>
          <h2 className="mt-4 text-[30px] font-black tracking-[-0.03em] text-white sm:text-[40px]">HOW TO GET YOUR PASS</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#BFC0C2]">Four simple steps from registration to entry — premium, fast and secure.</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.title} className="relative rounded-[24px] border border-white/[0.08] bg-[#0D0D0D] p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C9A227] to-[#E5C76B] text-black">
                <s.icon className="h-6 w-6" />
              </div>
              <div className="absolute right-6 top-6 text-4xl font-black leading-none text-white/[0.06]">0{i + 1}</div>
              <h3 className="mt-5 text-lg font-black text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#BFC0C2]">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link href="/get-pass" className="btn-gold rounded-full px-8 py-4 text-sm font-black">
            <span>GET MY PASS NOW →</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
