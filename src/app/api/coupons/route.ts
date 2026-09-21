import { NextRequest, NextResponse } from "next/server";
import { getCoupons, createCoupon, validateCoupon, getEventSettings } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const validate = searchParams.get("validate");
  if (code && validate) {
    // public coupon validation — needs original price
    const settings = await getEventSettings();
    const originalPrice = settings.passPrice;
    const result = await validateCoupon(code, originalPrice);
    return NextResponse.json(result);
  }
  // list coupons - auth required for full list, but allow public to see active codes? restrict
  const user = await requireAuth(["SUPER_ADMIN", "ORGANISER"]);
  if (!user) {
    // public can still check specific coupon via ?code=XXX, but not list
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const coupons = await getCoupons();
  return NextResponse.json(coupons);
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(["SUPER_ADMIN", "ORGANISER"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { code, discountType, discountValue, expiryDate, usageLimit, perUserLimit, minimumPurchase, active } = body;
  if (!code || !discountType || discountValue === undefined || !expiryDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!["PERCENTAGE", "FIXED"].includes(discountType)) return NextResponse.json({ error: "Invalid discountType" }, { status: 400 });
  if (discountType === "PERCENTAGE" && (discountValue <= 0 || discountValue > 100)) return NextResponse.json({ error: "Percentage must be 1-100" }, { status: 400 });
  const coupon = await createCoupon({
    code,
    discountType,
    discountValue: Number(discountValue),
    expiryDate: new Date(expiryDate).toISOString(),
    usageLimit: Number(usageLimit) || 100,
    perUserLimit: Number(perUserLimit) || 1,
    minimumPurchase: Number(minimumPurchase) || 0,
    active: active !== false,
  });
  return NextResponse.json(coupon, { status: 201 });
}
