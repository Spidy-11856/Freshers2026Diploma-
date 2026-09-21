import { NextRequest, NextResponse } from "next/server";
import { getCulturalApplications, createCulturalApplication } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const user = await requireAuth(["SUPER_ADMIN", "ORGANISER"]);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized: scanner cannot list cultural applications" }, { status: 403 });
  }
  const apps = await getCulturalApplications();
  return NextResponse.json(apps);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, registrationNumber, branch, phone, email, eventType, performanceName, participants, description } = body;
  if (!name || !registrationNumber || !branch || !phone || !email || !eventType || !performanceName || !participants) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!["DANCE", "DRAMA", "SINGING"].includes(eventType)) {
    return NextResponse.json({ error: "Invalid eventType. Only DANCE, DRAMA, SINGING allowed." }, { status: 400 });
  }
  // basic rate limit: check if same registration already applied for same event type recently
  const existing = await getCulturalApplications();
  const duplicate = existing.find((a) => a.registrationNumber.toLowerCase() === String(registrationNumber).toLowerCase() && a.eventType === eventType && a.performanceName.toLowerCase() === String(performanceName).toLowerCase());
  if (duplicate) {
    return NextResponse.json({ error: "You have already submitted this performance." }, { status: 409 });
  }
  const app = await createCulturalApplication({
    name: String(name).trim(),
    registrationNumber: String(registrationNumber).trim(),
    branch: String(branch).trim(),
    phone: String(phone).trim(),
    email: String(email).trim(),
    eventType,
    performanceName: String(performanceName).trim(),
    participants: Number(participants),
    description: String(description || "").trim(),
  });
  return NextResponse.json(app, { status: 201 });
}
