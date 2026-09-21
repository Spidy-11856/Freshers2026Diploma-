import { NextRequest, NextResponse } from "next/server";
import { getAnnouncements, createAnnouncement } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const publishedOnly = searchParams.get("published") === "true";
  const anns = await getAnnouncements(publishedOnly);
  return NextResponse.json(anns);
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(["SUPER_ADMIN", "ORGANISER"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { title, content, published } = body;
  if (!title || !content) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const ann = await createAnnouncement({ title, content, published: published !== false });
  return NextResponse.json(ann, { status: 201 });
}
