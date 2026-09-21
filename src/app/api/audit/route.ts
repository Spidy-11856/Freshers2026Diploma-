import { NextResponse } from "next/server";
import { getAuditLogs } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const user = await requireAuth(["SUPER_ADMIN", "ORGANISER"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const logs = await getAuditLogs();
  return NextResponse.json(logs.slice(-100).reverse());
}
