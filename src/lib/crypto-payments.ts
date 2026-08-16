import crypto from "crypto";
import { PLAN_PRICE_USD } from "@/lib/stripe";

const NOWPAYMENTS_API = "https://api.nowpayments.io/v1";
const API_KEY = process.env.NOWPAYMENTS_API_KEY;
const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const CRYPTO_PAYMENTS_ENABLED = Boolean(API_KEY);

/**
 * Creates a hosted crypto invoice via NOWPayments for one month of access.
 * See https://documenter.getpostman.com/view/7907941/S1a32n38 for the API.
 */
export async function createCryptoInvoice(params: {
  userId: string;
  email: string;
}) {
  if (!API_KEY) {
    throw new Error("Crypto payments are not configured (NOWPAYMENTS_API_KEY missing).");
  }

  const orderId = `${params.userId}-${Date.now()}`;

  const res = await fetch(`${NOWPAYMENTS_API}/invoice`, {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      price_amount: PLAN_PRICE_USD,
      price_currency: "usd",
      order_id: orderId,
      order_description: "SignalPro monthly subscription",
      ipn_callback_url: `${APP_URL}/api/webhooks/crypto`,
      success_url: `${APP_URL}/dashboard?payment=success`,
      cancel_url: `${APP_URL}/pricing?payment=cancelled`,
      is_fixed_rate: true,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`NOWPayments invoice creation failed: ${text}`);
  }

  return (await res.json()) as { id: string; invoice_url: string };
}

/** Verifies the HMAC-SHA512 signature NOWPayments sends on IPN webhooks. */
export function verifyCryptoWebhookSignature(rawBody: string, signature: string | null) {
  if (!IPN_SECRET || !signature) return false;

  const sorted = JSON.stringify(sortObjectKeys(JSON.parse(rawBody)));
  const expected = crypto.createHmac("sha512", IPN_SECRET).update(sorted).digest("hex");

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

function sortObjectKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortObjectKeys);
  if (obj && typeof obj === "object") {
    return Object.keys(obj as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return obj;
}
