// Razorpay integration — server-side only
// Secrets must live in env vars: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
// Never expose secrets to client.

import crypto from "crypto";

export function isRazorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export async function createRazorpayOrder(amountPaise: number, receipt: string, notes?: Record<string, string>) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    // Demo mode: return mock order when keys not configured
    return {
      id: `order_demo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      amount: amountPaise,
      currency: "INR",
      receipt,
      status: "created",
      notes,
      demo: true as const,
    };
  }

  // Real Razorpay order via REST API (avoids SDK dependency issues)
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt,
      notes,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Razorpay order creation failed: ${err}`);
  }
  const order = await res.json();
  return { ...order, demo: false as const };
}

export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    // In demo mode, accept any signature that is non-empty (or "demo_signature")
    // This allows end-to-end testing without real Razorpay
    return signature === "demo_signature" || signature.length > 10;
  }
  const expected = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  // timingSafeEqual
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export function getRazorpayKeyId() {
  return process.env.RAZORPAY_KEY_ID || "rzp_test_demo_key";
}
