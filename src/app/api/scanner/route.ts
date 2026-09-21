import { NextRequest, NextResponse } from "next/server";
import { getPassByQrToken, getPassByCode, markPassUsed, getEventSettings } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await requireAuth(["SUPER_ADMIN", "ORGANISER", "SCANNER"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { qrData, passCode, qrToken } = body;

  let token: string | null = null;
  let code: string | null = null;

  // qrData may be JSON stringified {t, c}
  if (qrData) {
    try {
      const parsed = typeof qrData === "string" ? JSON.parse(qrData) : qrData;
      token = parsed.t || parsed.qrToken || null;
      code = parsed.c || parsed.passCode || null;
    } catch {
      // fallback: treat as raw token or code
      if (String(qrData).startsWith("F26-")) code = String(qrData);
      else token = String(qrData);
    }
  }
  if (qrToken) token = qrToken;
  if (passCode) code = passCode;

  if (!token && !code) return NextResponse.json({ error: "No QR data provided" }, { status: 400 });

  let pass = null;
  if (token) pass = await getPassByQrToken(token);
  if (!pass && code) pass = await getPassByCode(code);

  if (!pass) {
    return NextResponse.json({ valid: false, error: "Invalid pass. No matching record found.", status: "INVALID" }, { status: 404 });
  }

  const settings = await getEventSettings();

  if (pass.used) {
    return NextResponse.json({
      valid: false,
      alreadyUsed: true,
      status: "ALREADY_USED",
      message: "⚠ PASS ALREADY USED",
      pass: {
        name: pass.name,
        branch: pass.branch,
        registrationNumber: pass.registrationNumber,
        passCode: pass.passCode,
        type: pass.type,
        usedAt: pass.usedAt,
        usedBy: pass.usedBy,
      },
      eventDate: settings.eventDate,
      venue: settings.venue,
    });
  }

  // Valid but not yet used — return details for confirmation before marking used
  return NextResponse.json({
    valid: true,
    status: "VALID",
    message: "✓ VALID PASS",
    pass: {
      name: pass.name,
      branch: pass.branch,
      registrationNumber: pass.registrationNumber,
      passCode: pass.passCode,
      type: pass.type,
      email: pass.email,
      phone: pass.phone,
      priceFinal: pass.priceFinal,
      status: pass.status,
    },
    eventDate: settings.eventDate,
    venue: settings.venue,
    action: "MARK_AS_USED",
  });
}

export async function PUT(req: NextRequest) {
  const user = await requireAuth(["SUPER_ADMIN", "ORGANISER", "SCANNER"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { passCode, qrToken, qrData } = body;

  let targetCode: string | null = passCode || null;
  let targetToken: string | null = qrToken || null;

  if (qrData && !targetCode && !targetToken) {
    try {
      const parsed = typeof qrData === "string" ? JSON.parse(qrData) : qrData;
      targetToken = parsed.t || null;
      targetCode = parsed.c || null;
    } catch {
      if (String(qrData).startsWith("F26-")) targetCode = String(qrData);
      else targetToken = String(qrData);
    }
  }

  let pass = null;
  if (targetCode) {
    const { getPassByCode } = await import("@/lib/db");
    pass = await getPassByCode(targetCode);
  }
  if (!pass && targetToken) pass = await getPassByQrToken(targetToken);
  if (!pass) return NextResponse.json({ error: "Pass not found" }, { status: 404 });

  const result = await markPassUsed(pass.passCode, user.id);
  if (!result.success) {
    if (result.reason === "PASS_ALREADY_USED") {
      return NextResponse.json({ error: "Pass already used", pass: result.pass, alreadyUsed: true }, { status: 409 });
    }
    return NextResponse.json({ error: result.reason }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: "Pass marked as USED", pass: result.pass });
}
