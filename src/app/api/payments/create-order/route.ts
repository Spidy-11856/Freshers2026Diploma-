import { NextRequest, NextResponse } from "next/server";
import { getEventSettings, validateCoupon } from "@/lib/db";
import { createRazorpayOrder } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, registrationNumber, branch, yearSemester, phone, email, type, couponCode } = body;

  if (!name || !registrationNumber || !branch || !phone || !email || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!["FRESHER", "SENIOR"].includes(type)) return NextResponse.json({ error: "Invalid type" }, { status: 400 });

  const settings = await getEventSettings();
  const originalPrice = settings.passPrice; // paise

  let discount = 0;
  let finalPrice = originalPrice;
  let appliedCoupon: string | undefined;

  if (couponCode) {
    const res = await validateCoupon(couponCode, originalPrice, email);
    if (!res.valid) return NextResponse.json({ error: res.reason || "Invalid coupon" }, { status: 400 });
    discount = res.discount;
    finalPrice = res.finalPrice;
    appliedCoupon = res.coupon?.code;
  }

  // create Razorpay order — amount must be server calculated, never trust frontend
  const receipt = `freshers_${Date.now()}_${registrationNumber}`;
  const order = await createRazorpayOrder(finalPrice, receipt, {
    registrationNumber,
    email,
    name,
    type,
    couponCode: appliedCoupon || "",
  });

  return NextResponse.json({
    orderId: order.id,
    amount: finalPrice,
    currency: "INR",
    originalPrice,
    discount,
    finalPrice,
    couponCode: appliedCoupon,
    keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_demo_key",
    demo: (order as any).demo || false,
  });
}
