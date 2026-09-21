import { getEventSettings } from "@/lib/db";
import GetPassClient from "./GetPassClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export default async function GetPassPage() {
  const settings = await getEventSettings();
  return (
    <main className="min-h-screen bg-[#050505]">
      <Header />
      <GetPassClient passPrice={settings.passPrice} eventDate={settings.eventDate} venue={settings.venue} />
      <Footer coordinatorName={settings.coordinatorName} coordinatorPhone={settings.coordinatorPhone} coordinatorEmail={settings.coordinatorEmail} />
    </main>
  );
}
