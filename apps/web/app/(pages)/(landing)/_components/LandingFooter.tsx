import Link from "next/link";
import { Sparkles } from "lucide-react";

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-30 w-full border-t border-primary/10 bg-background/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-[#0B1740]">Pixel UI</span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link href="/workspace" className="hover:text-primary transition-colors">
              Workspace
            </Link>
            <Link href="/payments" className="hover:text-primary transition-colors">
              Pricing
            </Link>
          </nav>

          <p className="text-xs sm:text-sm text-muted-foreground text-center">
            © {year} Pixel UI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
