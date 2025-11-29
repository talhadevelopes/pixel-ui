import { HeroSection } from "./_components/HeroSection";
import  DashboardPreview  from "./_components/DashboardPreview";
import { AnimatedSection } from "./_components/AnimatedSection";
import { Footer } from "./_components/Footer";
import { PricingSection } from "./_components/PricingSection";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 relative overflow-hidden pb-0">
      {/* Abstract Squares Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Top right squares */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-100 dark:bg-blue-900/20 rotate-12"></div>
        <div className="absolute top-40 right-40 w-48 h-48 bg-purple-100 dark:bg-purple-900/20 -rotate-6"></div>
        <div className="absolute top-10 right-60 w-32 h-32 bg-cyan-100 dark:bg-cyan-900/20 rotate-45"></div>

        {/* Bottom left squares */}
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-amber-100 dark:bg-amber-900/20 -rotate-12"></div>
        <div className="absolute bottom-32 left-32 w-56 h-56 bg-rose-100 dark:bg-rose-900/20 rotate-6"></div>
        <div className="absolute bottom-48 left-56 w-40 h-40 bg-orange-100 dark:bg-orange-900/20 -rotate-45"></div>

        {/* Scattered small squares */}
        <div className="absolute top-1/3 left-1/4 w-24 h-24 bg-teal-100 dark:bg-teal-900/20 rotate-12"></div>
        <div className="absolute top-2/3 right-1/3 w-20 h-20 bg-violet-100 dark:bg-violet-900/20 -rotate-12"></div>
      </div>

      <div className="relative">
        <main className="relative w-full mb-54">
          <HeroSection />
          <div className="w-full flex justify-center px-4 md:px-8 lg:px-12 mt-8 md:mt-12 lg:mt-16 relative z-30">
            <AnimatedSection className="w-full flex justify-center">
              <DashboardPreview />
            </AnimatedSection>
          </div>
          
          {/* Pricing Section */}
          <AnimatedSection>
            <PricingSection />
          </AnimatedSection>
        </main>
        <Footer />
      </div>
    </div>
  );
}