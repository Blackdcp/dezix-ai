import { HeroSection } from "@/components/marketing/hero-section";
import { ProvidersBar } from "@/components/marketing/providers-bar";
import { FeaturesSection } from "@/components/marketing/features-section";
import { ModelsShowcase } from "@/components/marketing/models-showcase";
import { PricingSection } from "@/components/marketing/pricing-section";
import { StatsBar } from "@/components/marketing/stats-bar";
import { CtaSection } from "@/components/marketing/cta-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProvidersBar />
      <FeaturesSection />
      <ModelsShowcase />
      <StatsBar />
      <PricingSection />
      <CtaSection />
    </>
  );
}
