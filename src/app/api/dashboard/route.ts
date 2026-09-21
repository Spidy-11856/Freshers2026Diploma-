import { NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const user = await requireAuth(["SUPER_ADMIN", "ORGANISER", "SCANNER"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const stats = await getDashboardStats();
  // SCANNER gets limited stats only
  if (user.role === "SCANNER") {
    return NextResponse.json({
      totalPasses: stats.totalPasses,
      used: stats.used,
      unused: stats.unused,
      recentPasses: stats.recentPasses.slice(0, 3),
      role: "SCANNER",
      limited: true,
    });
  }
  return NextResponse.json(stats);
}
