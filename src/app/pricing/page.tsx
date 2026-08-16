import { Navbar } from "@/components/landing/Navbar";
import { PricingSection } from "@/components/landing/PricingSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { Footer } from "@/components/landing/Footer";

export default function PricingPage({
  searchParams,
}: {
  searchParams: { payment?: string };
}) {
  return (
    <main>
      <Navbar />
      {searchParams.payment === "cancelled" && (
        <div className="mx-auto mt-6 max-w-md rounded-lg border border-gold-500/30 bg-gold-500/10 px-4 py-3 text-center text-sm text-gold-400">
          Zahlung abgebrochen. Du kannst es jederzeit erneut versuchen.
        </div>
      )}
      <PricingSection />
      <FaqSection />
      <Footer />
    </main>
  );
}
