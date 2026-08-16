import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, PLAN_PRICE_USD } from "@/lib/stripe";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!stripe) {
    return NextResponse.json(
      { error: "Card payments are not configured on this server yet." },
      { status: 503 }
    );
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  let customerId = user.stripeCustomerId ?? undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const priceId = process.env.STRIPE_PRICE_ID;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: priceId
      ? [{ price: priceId, quantity: 1 }]
      : [
          {
            price_data: {
              currency: "usd",
              product_data: { name: "SignalPro — monthly live trading signals" },
              unit_amount: Math.round(PLAN_PRICE_USD * 100),
              recurring: { interval: "month" },
            },
            quantity: 1,
          },
        ],
    success_url: `${appUrl}/dashboard?payment=success`,
    cancel_url: `${appUrl}/pricing?payment=cancelled`,
    metadata: { userId: user.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
