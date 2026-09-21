import { NextResponse } from "next/server";
import { getCurrentOrganiser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentOrganiser();
  if (!user) return NextResponse.json({ authenticated: false }, { status: 401 });
  return NextResponse.json({ authenticated: true, user });
}
