import { HeroSection } from "../components/landing/HeroSection"
import { DashboardPreview } from "../components/landing/DashboardPreview"
import { BentoSection } from "../components/landing/BentoSection"
import { AnimatedSection } from "../components/landing/AnimatedSection"
import { Footer } from "../components/landing/Footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8f4ff] via-[#d4ebff] to-[#c0e0ff] dark:from-[#0b1220] dark:via-[#0a1a2b] dark:to-[#0a1726] relative overflow-hidden pb-0">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#b3e5fc]/30 to-transparent dark:from-[#0e1b2a]/60 dark:to-transparent" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300/10 dark:bg-cyan-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative">
        <main className="relative w-full">
          <HeroSection />
          <div className="w-full flex justify-center px-4 md:px-8 lg:px-12 -mt-8 md:-mt-24 lg:-mt-28 relative z-30">
            <AnimatedSection className="w-full flex justify-center">
              <DashboardPreview />
            </AnimatedSection>
          </div>
        </main>

        <AnimatedSection id="features-section" className="relative z-10 w-full px-4 md:px-8 lg:px-12 mt-28 md:mt-44" delay={0.2}>
          <BentoSection />
        </AnimatedSection>

        <Footer />
      </div>
    </div>
  )
}

