import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireAuth(["SUPER_ADMIN", "ORGANISER", "SCANNER"]);
  if (!user) redirect("/organiser/login");
  // If SCANNER, redirect to scanner but allow viewing dashboard limited
  return <DashboardClient user={user} />;
}
