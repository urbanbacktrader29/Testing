import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions, isSubscriptionActive } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { SignalFeed } from "@/components/dashboard/SignalFeed";
import { LogoutButton } from "@/components/dashboard/LogoutButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    redirect("/login");
  }

  if (!isSubscriptionActive(user)) {
    redirect("/pricing");
  }

  return (
    <main className="min-h-screen bg-base-950">
      <header className="border-b border-white/10 bg-base-900/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-500 text-base-950">
              S
            </span>
            SignalPro
          </Link>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span>Angemeldet als {user.name ?? user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-2xl font-bold text-white">Live Trading-Signale</h1>
        <p className="mt-1 text-sm text-slate-400">
          Neue Signale erscheinen automatisch — keine Aktualisierung nötig.
        </p>

        <div className="mt-8">
          <SignalFeed />
        </div>
      </div>
    </main>
  );
}
