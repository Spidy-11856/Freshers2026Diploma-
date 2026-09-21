import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getEventSettings } from "@/lib/db";
import RetrieveClient from "./RetrieveClient";

export const dynamic = "force-dynamic";

export default async function RetrievePage() {
  const settings = await getEventSettings();
  return (
    <main className="min-h-screen bg-[#050505]">
      <Header />
      <RetrieveClient eventDate={settings.eventDate} venue={settings.venue} />
      <Footer coordinatorName={settings.coordinatorName} coordinatorPhone={settings.coordinatorPhone} coordinatorEmail={settings.coordinatorEmail} />
    </main>
  );
}
