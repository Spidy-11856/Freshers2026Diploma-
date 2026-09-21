import { Calendar, MapPin, Users, Ticket } from "lucide-react";

export default function InfoStrip({ date, venue }: { date: string; venue: string }) {
  const dateDisplay = date === "TBA" ? "To Be Announced Soon" : date;
  const items = [
    { icon: Calendar, label: "Event Date", value: dateDisplay, sub: "" },
    { icon: MapPin, label: "Venue", value: venue, sub: "" },
    { icon: Users, label: "Who Can Join", value: "All Diploma Engineering Students", sub: "" },
    { icon: Ticket, label: "Pass Includes", value: "Event Access + Participation", sub: "" },
  ];
  return (
    <section id="info" className="border-y border-white/[0.06] bg-[#0A0A0A] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1280px] grid grid-cols-1 gap-0 divide-y divide-white/[0.06] sm:grid-cols-4 sm:divide-y-0 sm:divide-x">
        {items.map((it) => (
          <div key={it.label} className="flex gap-4 px-0 py-5 sm:px-6 sm:py-2 first:pl-0 last:pr-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#C9A227]/15 text-[#C9A227] sm:h-9 sm:w-9">
              <it.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-medium tracking-wide text-[#BFC0C2]">{it.label}</div>
              <div className="mt-0.5 text-sm font-bold leading-tight text-white">{it.value}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
