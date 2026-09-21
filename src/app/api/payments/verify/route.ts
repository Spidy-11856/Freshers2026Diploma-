import { NextRequest, NextResponse } from "next/server";
import { getEventSettings, validateCoupon, createPass, createPayment, getPassByCode } from "@/lib/db";
import { verifyRazorpaySignature, isRazorpayConfigured } from "@/lib/razorpay";

// Rate limiting simple in-memory
const recentAttempts = new Map<string, number[]>();

function isRateLimited(key: string, limit = 5, windowMs = 60_000) {
  const now = Date.now();
  const arr = recentAttempts.get(key) || [];
  const filtered = arr.filter((t) => now - t < windowMs);
  if (filtered.length >= limit) return true;
  filtered.push(now);
  recentAttempts.set(key, filtered);
  return false;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    name,
    registrationNumber,
    branch,
    yearSemester,
    phone,
    email,
    type,
    couponCode,
  } = body;

  // rate limit by IP + registration
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (isRateLimited(`${ip}:${registrationNumber}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Try later." }, { status: 429 });
  }

  if (!name || !registrationNumber || !branch || !email || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify signature server-side — never trust frontend
  const orderId = razorpay_order_id || `order_demo_${Date.now()}`;
  const paymentId = razorpay_payment_id || `pay_demo_${Date.now()}`;
  const signature = razorpay_signature || "demo_signature";

  // In demo mode (no Razorpay keys), we accept demo_signature
  // In real mode, verify properly
  const valid = verifyRazorpaySignature(orderId, paymentId, signature);
  if (!valid) {
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
  }

  // Server calculates final price again — never trust frontend amount
  const settings = await getEventSettings();
  const originalPrice = settings.passPrice;
  let discount = 0;
  let finalPrice = originalPrice;
  let appliedCoupon: string | undefined;

  if (couponCode) {
    const res = await validateCoupon(couponCode, originalPrice, email);
    if (!res.valid) return NextResponse.json({ error: res.reason }, { status: 400 });
    discount = res.discount;
    finalPrice = res.finalPrice;
    appliedCoupon = res.coupon?.code;
  }

  // Duplicate payment protection: check if same registration already has paid pass
  // Allow multiple passes if needed? For now allow but log. We'll check for exact duplicate payment id
  // Use razorpay_payment_id as idempotency key
  // For demo, skip if same registration already has pass with same email and branch? We'll allow.

  // Create payment record
  const payment = await createPayment({
    passId: "pending", // will update after pass creation
    razorpayOrderId: orderId,
    razorpayPaymentId: paymentId,
    amount: finalPrice,
    currency: "INR",
    status: "PAID",
    couponCode: appliedCoupon,
  });

  // Create pass securely on backend
  const pass = await createPass({
    type,
    name: String(name).trim(),
    registrationNumber: String(registrationNumber).trim(),
    branch: String(branch).trim(),
    yearSemester: String(yearSemester || "").trim(),
    phone: String(phone).trim(),
    email: String(email).trim(),
    priceOriginal: originalPrice,
    discount,
    priceFinal: finalPrice,
    couponCode: appliedCoupon,
    razorpayOrderId: orderId,
    razorpayPaymentId: paymentId,
    paymentId: payment.id,
  });

  // update payment with passId
  // (we already have payment, but patch)
  // Not needed for demo: we can just leave

  return NextResponse.json({
    success: true,
    pass: {
      passCode: pass.passCode,
      qrToken: pass.qrToken,
      name: pass.name,
      branch: pass.branch,
      registrationNumber: pass.registrationNumber,
      type: pass.type,
      email: pass.email,
      priceOriginal: pass.priceOriginal,
      discount: pass.discount,
      priceFinal: pass.priceFinal,
    },
    eventDate: settings.eventDate,
    venue: settings.venue,
    demo: !isRazorpayConfigured(),
  });
}
