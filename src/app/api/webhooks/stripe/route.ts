import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

export const runtime = "nodejs";

const ONE_MONTH_MS = 31 * 24 * 60 * 60 * 1000;

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    if (!signature || !webhookSecret) throw new Error("Missing signature or secret");
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err instanceof Error ? err.message : err}` },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      const userId = checkoutSession.metadata?.userId;
      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: "ACTIVE",
            subscriptionProvider: "STRIPE",
            subscriptionExpires: new Date(Date.now() + ONE_MONTH_MS),
            stripeSubscriptionId: checkoutSession.subscription as string | null,
          },
        });
        await prisma.payment.create({
          data: {
            userId,
            provider: "STRIPE",
            amountUsd: (checkoutSession.amount_total ?? 0) / 100,
            status: "paid",
            externalId: checkoutSession.id,
          },
        });
      }
      break;
    }
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      const user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionStatus: "ACTIVE",
            subscriptionExpires: new Date(Date.now() + ONE_MONTH_MS),
          },
        });
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const user = await prisma.user.findUnique({
        where: { stripeSubscriptionId: subscription.id },
      });
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { subscriptionStatus: "CANCELED" },
        });
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
