import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateRandomSignal } from "../src/lib/signals";

const prisma = new PrismaClient();

async function main() {
  const demoEmail = "demo@signalpro.app";
  const existing = await prisma.user.findUnique({ where: { email: demoEmail } });

  if (!existing) {
    await prisma.user.create({
      data: {
        name: "Demo Trader",
        email: demoEmail,
        passwordHash: await bcrypt.hash("password123", 12),
        subscriptionStatus: "ACTIVE",
        subscriptionProvider: "STRIPE",
        subscriptionExpires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    console.log(`Seeded demo user: ${demoEmail} / password123`);
  }

  const signalCount = await prisma.signal.count();
  if (signalCount === 0) {
    const seeds = Array.from({ length: 15 }, () => generateRandomSignal());
    await prisma.signal.createMany({ data: seeds });
    console.log("Seeded 15 demo signals.");
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
