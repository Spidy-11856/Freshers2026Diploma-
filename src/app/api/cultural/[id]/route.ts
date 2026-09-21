import { NextRequest, NextResponse } from "next/server";
import { updateCulturalStatus } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth(["SUPER_ADMIN", "ORGANISER"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const allowed = ["status", "coordinatorName", "coordinatorPhone", "performanceDate", "performanceTime", "performanceOrder"];
  const patch: any = {};
  for (const k of allowed) if (k in body) patch[k] = body[k];
  if (patch.status && !["PENDING", "SHORTLISTED", "APPROVED", "REJECTED"].includes(patch.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const updated = await updateCulturalStatus(id, patch);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}
