import { NextRequest, NextResponse } from "next/server";
import { getPasses, getPassByRegAndCode, getEventSettings } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const reg = searchParams.get("reg");

  // Retrieve pass (public) via reg+code
  if (code && reg) {
    const pass = await getPassByRegAndCode(reg, code);
    if (!pass) return NextResponse.json({ error: "Pass not found. Check Registration Number and Pass Code." }, { status: 404 });
    const settings = await getEventSettings();
    return NextResponse.json({ pass, eventDate: settings.eventDate, venue: settings.venue });
  }

  if (code && !reg) {
    const { getPassByCode } = await import("@/lib/db");
    const pass = await getPassByCode(code);
    if (!pass) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const settings = await getEventSettings();
    return NextResponse.json({ pass, eventDate: settings.eventDate, venue: settings.venue });
  }

  // List passes — requires auth (SCANNER cannot list all passes, only scan)
  const user = await requireAuth(["SUPER_ADMIN", "ORGANISER"]);
  if (!user) return NextResponse.json({ error: "Unauthorized: scanner role can only use QR scanner" }, { status: 403 });

  const passes = await getPasses();
  const search = searchParams.get("search")?.toLowerCase() || "";
  const filterType = searchParams.get("type");
  const filterStatus = searchParams.get("status");
  const filterUsed = searchParams.get("used");

  let filtered = passes;
  if (search) {
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(search) || p.registrationNumber.toLowerCase().includes(search) || p.passCode.toLowerCase().includes(search) || p.phone.includes(search));
  }
  if (filterType) filtered = filtered.filter((p) => p.type === filterType);
  if (filterStatus) filtered = filtered.filter((p) => p.status === filterStatus);
  if (filterUsed === "true") filtered = filtered.filter((p) => p.used);
  if (filterUsed === "false") filtered = filtered.filter((p) => !p.used);

  return NextResponse.json(filtered.reverse());
}
