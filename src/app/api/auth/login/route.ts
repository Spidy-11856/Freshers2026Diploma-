import { NextRequest, NextResponse } from "next/server";
import { authenticateOrganiser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { username, password } = body;
  if (!username || !password) return NextResponse.json({ error: "Missing credentials" }, { status: 400 });

  const res = await authenticateOrganiser(username, password);
  if (!res) return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });

  const response = NextResponse.json({
    success: true,
    user: {
      id: res.organiser.id,
      username: res.organiser.username,
      email: res.organiser.email,
      role: res.organiser.role,
      displayName: res.organiser.displayName,
      idPassCode: res.organiser.idPassCode,
    },
  });

  // Set httpOnly cookie
  response.cookies.set("organiser_token", res.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
