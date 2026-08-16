import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

export const stripe = key
  ? new Stripe(key, { apiVersion: "2024-06-20" })
  : null;

export const PLAN_PRICE_USD = Number(process.env.PLAN_PRICE_USD ?? 49);
