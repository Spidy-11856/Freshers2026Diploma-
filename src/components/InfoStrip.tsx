import { Calendar, MapPin, Users, Ticket } from "lucide-react";

export default function InfoStrip({ date, venue }: { date: string; venue: string }) {
  const dateDisplay = date === "TBA" ? "To Be Announced Soon" : date;
  const items = [
    { icon: Calendar, label: "EVENT DATE", value: dateDisplay, sub: date === "TBA" ? "Stay tuned" : "Mark your calendar" },
    { icon: MapPin, label: "VENUE", value: venue, sub: "Ranchi, Jharkhand" },
    { icon: Users, label: "WHO CAN JOIN", value: "All Diploma Engineering Students", sub: "Freshers + Seniors" },
    { icon: Ticket, label: "PASS INCLUDES", value: "Event Access + Participation", sub: "Premium QR Pass" },
  ];
  return (
    <section id="info" className="border-y border-white/[0.06] bg-[#0D0D0D] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1280px] grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.label} className="flex gap-4 rounded-2xl border border-white/[0.06] bg-[#151515] p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1C1C1C] text-[#C9A227] border border-white/[0.06]">
              <it.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold tracking-[0.12em] text-[#BFC0C2]">{it.label}</div>
              <div className="mt-1 text-sm font-bold leading-tight text-white">{it.value}</div>
              <div className="text-xs text-[#BFC0C2]">{it.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
