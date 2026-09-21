import { NextRequest, NextResponse } from "next/server";
import { getEventSettings, updateEventSettings } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const settings = await getEventSettings();
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const user = await requireAuth(["SUPER_ADMIN", "ORGANISER"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  // Only allow certain fields
  const allowed = [
    "eventName",
    "eventYear",
    "university",
    "heroHeading",
    "heroAccent",
    "heroSubtitle",
    "eventDate",
    "eventTime",
    "venue",
    "passPrice",
    "eventDescription",
    "announcement",
    "coordinatorName",
    "coordinatorPhone",
    "coordinatorEmail",
    "socialLinks",
    "faq",
    "heroImage",
    "culturalImages",
    "gallery",
  ];
  const patch: any = {};
  for (const k of allowed) if (k in body) patch[k] = body[k];
  // Validate passPrice
  if (patch.passPrice !== undefined) {
    const v = Number(patch.passPrice);
    if (isNaN(v) || v < 0) return NextResponse.json({ error: "Invalid passPrice" }, { status: 400 });
    patch.passPrice = v;
  }
  const updated = await updateEventSettings(patch);
  return NextResponse.json(updated);
}
