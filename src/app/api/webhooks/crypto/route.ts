import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCryptoWebhookSignature } from "@/lib/crypto-payments";
import { PLAN_PRICE_USD } from "@/lib/stripe";

export const runtime = "nodejs";

const ONE_MONTH_MS = 31 * 24 * 60 * 60 * 1000;
const SUCCESS_STATUSES = new Set(["finished", "confirmed"]);

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-nowpayments-sig");

  if (!verifyCryptoWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as {
    order_id?: string;
    payment_status?: string;
    payment_id?: string | number;
    price_amount?: number;
  };

  if (!payload.order_id || !payload.payment_status) {
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  }

  if (!SUCCESS_STATUSES.has(payload.payment_status)) {
    return NextResponse.json({ received: true, ignored: payload.payment_status });
  }

  const userId = payload.order_id.split("-")[0];
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "Unknown user" }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: "ACTIVE",
      subscriptionProvider: "CRYPTO",
      subscriptionExpires: new Date(Date.now() + ONE_MONTH_MS),
    },
  });

  await prisma.payment.create({
    data: {
      userId: user.id,
      provider: "CRYPTO",
      amountUsd: payload.price_amount ?? PLAN_PRICE_USD,
      status: payload.payment_status,
      externalId: String(payload.payment_id ?? payload.order_id),
    },
  }).catch(() => {
    // duplicate webhook delivery for an already-recorded payment id — safe to ignore
  });

  return NextResponse.json({ received: true });
}
