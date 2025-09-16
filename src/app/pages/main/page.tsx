import { HeroSection } from "@/app/pages/main/content/hero-section"
import { HowItWorksSection } from "@/app/pages/main/content/howitworks-section"
import { ProductSection } from "@/app/pages/main/content/product-section"
import { SaasCommercial } from "@/app/pages/main/content/saas-commercial"
import { UsageGuide } from "@/app/pages/main/content/usage-guide"
import { LearningResources } from "@/app/pages/main/content/learning-resource"

export default function MainContent() {
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