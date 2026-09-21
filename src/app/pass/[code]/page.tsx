import { getPassByCode, getEventSettings } from "@/lib/db";
import PassCard from "@/components/PassCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PassPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const pass = await getPassByCode(code);
  if (!pass) notFound();
  const settings = await getEventSettings();
  return (
    <main className="min-h-screen bg-[#050505]">
      <Header />
      <div className="mx-auto max-w-[720px] px-4 py-10 sm:px-6">
        <div className="mb-6 text-center">
          <Link href="/" className="text-sm text-[#BFC0C2] hover:text-white">← Back to Home</Link>
          <h1 className="mt-3 text-2xl font-black text-white">Your <span className="text-[#C9A227]">Premium Pass</span></h1>
          <p className="text-sm text-[#BFC0C2] font-mono">{pass.passCode} • {pass.type}</p>
        </div>
        <PassCard pass={pass} eventDate={settings.eventDate} venue={settings.venue} />
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => { if (typeof window !== "undefined") window.print(); }} className="rounded-full border border-white/10 bg-[#151515] px-6 py-3 text-sm font-bold text-white">Print / Save PDF</button>
          <Link href="/retrieve" className="btn-gold rounded-full px-6 py-3 text-sm font-black"><span>Retrieve Again</span></Link>
        </div>
      </div>
      <Footer coordinatorName={settings.coordinatorName} coordinatorPhone={settings.coordinatorPhone} coordinatorEmail={settings.coordinatorEmail} />
    </main>
  );
}
