import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isSubscriptionActive } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureSeedSignals, getRecentSignals } from "@/lib/signals";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || !isSubscriptionActive(user)) {
    return NextResponse.json({ error: "Subscription required" }, { status: 403 });
  }

  await ensureSeedSignals();
  const signals = await getRecentSignals(50);
  return NextResponse.json({ signals });
}
