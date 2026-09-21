import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SecondaryNav from "@/components/SecondaryNav";
import CulturalSection from "@/components/CulturalSection";
import InfoStrip from "@/components/InfoStrip";
import HowItWorks from "@/components/HowItWorks";
import Announcements from "@/components/Announcements";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import { getEventSettings, getAnnouncements } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getEventSettings();
  const announcements = await getAnnouncements(true);

  return (
    <main className="min-h-screen bg-[#050505]">
      <Header />
      <Hero eventDate={settings.eventDate} venue={settings.venue} />
      <SecondaryNav />
      <CulturalSection />
      <InfoStrip date={settings.eventDate} venue={settings.venue} />
      <HowItWorks />
      <Announcements items={announcements} />
      <section className="bg-[#050505] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          <div className="rounded-[24px] border border-[#C9A227]/20 bg-gradient-to-br from-[#151515] to-[#0D0D0D] p-8 sm:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-2xl font-black tracking-[-0.02em] text-white">EVENT DETAILS</h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#BFC0C2]">{settings.eventDescription}</p>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs font-bold tracking-wide text-[#BFC0C2]">EVENT</div>
                    <div className="font-bold text-white">{settings.eventName} {settings.eventYear}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold tracking-wide text-[#BFC0C2]">UNIVERSITY</div>
                    <div className="font-bold text-white">{settings.university}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold tracking-wide text-[#BFC0C2]">TIME</div>
                    <div className="font-bold text-white">{settings.eventTime}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold tracking-wide text-[#BFC0C2]">VENUE</div>
                    <div className="font-bold text-white">{settings.venue}</div>
                  </div>
                </div>
              </div>
              <div className="shrink-0 rounded-2xl border border-white/10 bg-[#050505] p-6">
                <div className="text-center">
                  <div className="text-xs font-bold tracking-[0.12em] text-[#BFC0C2]">PASS PRICE</div>
                  <div className="mt-1 text-4xl font-black text-[#C9A227]">₹{Math.round(settings.passPrice / 100)}</div>
                  <div className="text-xs text-[#BFC0C2]">per person • includes all events</div>
                  <a href="/get-pass" className="btn-gold mt-4 inline-flex rounded-full px-6 py-3 text-sm font-black">
                    <span>GET MY PASS →</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <FAQ items={settings.faq} />
      <Footer coordinatorName={settings.coordinatorName} coordinatorPhone={settings.coordinatorPhone} coordinatorEmail={settings.coordinatorEmail} />
    </main>
  );
}
