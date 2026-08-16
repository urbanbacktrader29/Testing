import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createCryptoInvoice } from "@/lib/crypto-payments";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const invoice = await createCryptoInvoice({
      userId: session.user.id,
      email: session.user.email ?? "",
    });
    return NextResponse.json({ url: invoice.invoice_url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Crypto checkout failed" },
      { status: 503 }
    );
  }
}
