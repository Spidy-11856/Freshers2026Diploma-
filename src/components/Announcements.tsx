import { Megaphone, Calendar } from "lucide-react";

export default function Announcements({ items }: { items: { id: string; title: string; content: string; createdAt: string }[] }) {
  if (!items || items.length === 0) return null;
  return (
    <section className="bg-[#0D0D0D] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1280px]">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C9A227] text-black">
            <Megaphone className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-black tracking-[-0.02em] text-white">ANNOUNCEMENTS</h2>
          <span className="ml-auto hidden text-xs text-[#BFC0C2] sm:inline">Latest updates from Organisers</span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((a) => (
            <div key={a.id} className="rounded-2xl border border-white/[0.06] bg-[#151515] p-5">
              <div className="flex items-center gap-2 text-xs text-[#BFC0C2]">
                <Calendar className="h-4 w-4" />
                {new Date(a.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                <span className="ml-auto rounded-full bg-[#C9A227]/15 px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#E5C76B]">PUBLISHED</span>
              </div>
              <h3 className="mt-3 text-base font-bold text-white">{a.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#BFC0C2]">{a.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
