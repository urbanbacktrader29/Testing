import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { TrustBar } from "@/components/landing/TrustBar";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { LiveSignalTeaser } from "@/components/landing/LiveSignalTeaser";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <TrustBar />
      <ProblemSection />
      <FeaturesSection />
      <LiveSignalTeaser />
      <HowItWorks />
      <TestimonialsSection />
      <PricingSection />
      <FaqSection />
      <FinalCta />
      <Footer />
    </main>
  );
}
