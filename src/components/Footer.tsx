import Link from "next/link";
import { Globe, Mail, Phone, MapPin } from "lucide-react";

export default function Footer({ coordinatorName, coordinatorPhone, coordinatorEmail }: { coordinatorName: string; coordinatorPhone: string; coordinatorEmail: string }) {
  return (
    <footer id="contact" className="border-t border-white/[0.06] bg-[#080808] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1280px] grid grid-cols-1 gap-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#C9A227] to-[#E5C76B] text-sm font-black text-black">UM</div>
            <div>
              <div className="text-sm font-black tracking-wide text-white">USHA MARTIN UNIVERSITY</div>
              <div className="text-xs tracking-[0.12em] text-[#C9A227]">DIPLOMA ENGINEERING • FRESHERS 2026</div>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#BFC0C2]">
            Premium black & gold Freshers Pass & Cultural Events platform — built for Diploma Engineering. Luxury digital invitation meets modern ticketing.
          </p>
          <div className="mt-4 flex gap-3">
            <a href="#" className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#151515] text-[#BFC0C2] hover:text-white"><Globe className="h-4 w-4" /></a>
            <a href={`mailto:${coordinatorEmail}`} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#151515] text-[#BFC0C2] hover:text-white"><Mail className="h-4 w-4" /></a>
            <a href={`tel:${coordinatorPhone}`} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#151515] text-[#BFC0C2] hover:text-white"><Phone className="h-4 w-4" /></a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-black tracking-wide text-white">CULTURAL COORDINATOR</h4>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center gap-3 text-[#BFC0C2]"><span className="h-2 w-2 rounded-full bg-[#C9A227]" /> {coordinatorName}</div>
            <a href={`tel:${coordinatorPhone}`} className="flex items-center gap-2 text-[#BFC0C2] hover:text-white"><Phone className="h-4 w-4 text-[#C9A227]" /> {coordinatorPhone}</a>
            <a href={`mailto:${coordinatorEmail}`} className="flex items-center gap-2 text-[#BFC0C2] hover:text-white"><Mail className="h-4 w-4 text-[#C9A227]" /> {coordinatorEmail}</a>
            <div className="flex items-center gap-2 text-[#BFC0C2]"><MapPin className="h-4 w-4 text-[#C9A227]" /> Usha Martin University Campus, Ranchi</div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-black tracking-wide text-white">QUICK LINKS</h4>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <Link href="/" className="text-[#BFC0C2] hover:text-white">Home</Link>
            <Link href="/get-pass" className="text-[#BFC0C2] hover:text-white">Get My Pass</Link>
            <Link href="/retrieve" className="text-[#BFC0C2] hover:text-white">Retrieve Pass</Link>
            <Link href="/#culture" className="text-[#BFC0C2] hover:text-white">Cultural Events</Link>
            <Link href="/organiser/login" className="text-[#C9A227] hover:text-[#E5C76B]">Organiser Login</Link>
            <Link href="/organiser/login" className="text-[#BFC0C2] hover:text-white">QR Scanner</Link>
          </div>
          <div className="mt-6 rounded-xl border border-[#C9A227]/20 bg-[#C9A227]/10 px-4 py-3">
            <div className="text-xs font-bold tracking-wide text-[#E5C76B]">NEED HELP?</div>
            <div className="text-sm font-medium text-white">Contact Cultural Committee</div>
            <div className="text-xs text-[#BFC0C2]">{coordinatorPhone} • {coordinatorEmail}</div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-[1280px] flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-6 text-xs text-[#BFC0C2] sm:flex-row">
        <span>© 2026 Usha Martin University — Diploma Engineering Freshers. All rights reserved.</span>
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#C9A227]" /> Premium Black & Gold Experience
        </span>
      </div>
    </footer>
  );
}
