"use client"

import { Button, Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@workspace/ui"
import { Menu, Sparkles } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useAuthToken } from "@/services/auth.api";
import { useProfileQuery } from "@/queries/"
import { useAuthModal } from "@/components/global/AuthModalContext";

export function LandingHeader() {
  const { openLogin } = useAuthModal();
  const token = useAuthToken()
  const { data: profile } = useProfileQuery(token);

  return (
    <header
      className="fixed top-2 inset-x-3 md:top-4 md:left-[5%] md:right-[5%] md:inset-x-auto z-50 py-2.5 px-3 md:py-4 md:px-6 rounded-xl md:rounded-2xl backdrop-blur-md bg-background/40 border border-primary/15"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <motion.div
          className="flex items-center gap-2 md:gap-3 min-w-0"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'blue' }}>
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <span className="text-foreground text-base md:text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent truncate">
            Pixel UI
          </span>
        </motion.div>

        <div className="flex items-center gap-1.5 md:gap-4 shrink-0">
          {profile ? (
            <Link href="/workspace" className="hidden sm:block">
              <span className="text-sm md:text-base text-foreground cursor-pointer hover:text-primary transition-colors truncate max-w-[140px] md:max-w-none inline-block">
                {`Welcome, ${profile.name?.split(" ")[0] || "User"}`}
              </span>
            </Link>
          ) : (
            <div className="hidden md:block">
              <button
                onClick={() => openLogin()}
                className="text-sm md:text-base text-foreground cursor-pointer hover:text-primary transition-colors"
              >
                Please SignIn to continue
              </button>
            </div>
          )}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-foreground hover:bg-primary/10 h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="bg-background border-t border-primary/20 text-foreground rounded-t-2xl px-0 pb-8">
              <SheetHeader className="px-5">
                <SheetTitle className="text-left text-lg font-semibold text-foreground">Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-3 mt-4 px-5">
                {profile ? (
                  <Link href="/workspace">
                    <Button className="w-full justify-center" variant="outline">
                      Go to Workspace
                    </Button>
                  </Link>
                ) : (
                  <Button
                    className="w-full justify-center"
                    variant="outline"
                    onClick={() => openLogin()}
                  >
                    Sign in
                  </Button>
                )}
                <Link href="/workspace" className="w-full">
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full font-semibold shadow-lg shadow-primary/20">
                    Try it free
                  </Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
