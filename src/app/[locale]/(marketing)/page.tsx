import { HeroSection } from "@/components/marketing/hero-section";
import { ProvidersBar } from "@/components/marketing/providers-bar";
import { StatsBar } from "@/components/marketing/stats-bar";
import { FeaturesSection } from "@/components/marketing/features-section";
import { ModelsShowcase } from "@/components/marketing/models-showcase";
import { PricingSection } from "@/components/marketing/pricing-section";
import { CtaSection } from "@/components/marketing/cta-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProvidersBar />
      <StatsBar />
      <FeaturesSection />
      <ModelsShowcase />
      <PricingSection />
      <CtaSection />
    </>
  );
}
