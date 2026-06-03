import { HeroSection } from "./_components/HeroSection";
import { ShowcaseSection } from "./_components/ShowcaseSection";
import { LandingFooter } from "./_components/LandingFooter";


export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 relative overflow-hidden pb-0">
      {/* Abstract Squares Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Top right squares */}
        <div className="absolute top-10 right-4 w-40 h-40 sm:top-20 sm:right-20 sm:w-72 sm:h-72 bg-blue-100 dark:bg-blue-900/20 rotate-12"></div>
        <div className="absolute top-24 right-8 w-28 h-28 sm:top-40 sm:right-40 sm:w-48 sm:h-48 bg-purple-100 dark:bg-purple-900/20 -rotate-6"></div>
        <div className="absolute top-6 right-16 w-20 h-20 sm:top-10 sm:right-60 sm:w-32 sm:h-32 bg-cyan-100 dark:bg-cyan-900/20 rotate-45"></div>

        {/* Bottom left squares */}
        <div className="absolute -bottom-10 -left-10 w-56 h-56 sm:-bottom-20 sm:-left-20 sm:w-96 sm:h-96 bg-amber-100 dark:bg-amber-900/20 -rotate-12"></div>
        <div className="absolute bottom-16 left-8 w-36 h-36 sm:bottom-32 sm:left-32 sm:w-56 sm:h-56 bg-rose-100 dark:bg-rose-900/20 rotate-6"></div>
        <div className="absolute bottom-24 left-16 w-24 h-24 sm:bottom-48 sm:left-56 sm:w-40 sm:h-40 bg-orange-100 dark:bg-orange-900/20 -rotate-45"></div>

        {/* Scattered small squares */}
        <div className="absolute top-1/3 left-[10%] w-16 h-16 sm:left-1/4 sm:w-24 sm:h-24 bg-teal-100 dark:bg-teal-900/20 rotate-12"></div>
        <div className="absolute top-2/3 right-[15%] w-14 h-14 sm:right-1/3 sm:w-20 sm:h-20 bg-violet-100 dark:bg-violet-900/20 -rotate-12"></div>
      </div>

      <div className="relative">
        <main className="relative w-full mb-54">
          <HeroSection />
          <ShowcaseSection/>
          <LandingFooter />
          <div className="w-full flex justify-center px-4 md:px-8 lg:px-12 mt-8 md:mt-12 lg:mt-16 relative z-30">
            
          </div>

          {/* Pricing Section */}

        </main>
      </div>
    </div>
  );
}