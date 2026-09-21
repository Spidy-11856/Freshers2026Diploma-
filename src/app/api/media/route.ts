import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

// In production, upload to Cloudflare R2 / S3
// For demo, accept URL input and echo back
export async function POST(req: NextRequest) {
  const user = await requireAuth(["SUPER_ADMIN", "ORGANISER"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Try to parse multipart or json
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const { url, type } = await req.json();
    if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });
    return NextResponse.json({ success: true, url, type: type || "gallery" });
  }

  // For multipart, just return mock
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const type = (form.get("type") as string) || "gallery";
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
    // In prod: upload to R2
    // const buffer = await file.arrayBuffer();
    // await R2.put(key, buffer)
    return NextResponse.json({
      success: true,
      message: "In production this uploads to R2/S3. File received.",
      filename: file.name,
      type,
      url: `https://via.placeholder.com/600x400?text=${encodeURIComponent(file.name)}`,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "Use POST to upload. In prod, images stored in R2." });
}
