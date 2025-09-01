import { HeroSection } from "@/components/hero-section"
import { HowItWorksSection } from "@/components/howitworks-section"
import { ProductSection } from "@/components/product-section"
import { SaasCommercial } from "@/components/saas-commercial"
import { UsageGuide } from "@/components/usage-guide"
import { LearningResources } from "@/components/learning-resource"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <HowItWorksSection />
      <ProductSection />
      <SaasCommercial />
      <UsageGuide />
      <LearningResources />
    </div>
  )
}
