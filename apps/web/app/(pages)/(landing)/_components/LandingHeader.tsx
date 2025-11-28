"use client"

import type React from "react"
import { Button, Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@workspace/ui"
import { Menu, Zap, Sun, Moon } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { useAuthToken } from "@/services/auth.api";
import { useProfileQuery } from "@/queries/"

export function LandingHeader() {
  const navItems = [
    { name: "Features", href: "#features-section" },
    { name: "Pricing", href: "#pricing-section" },
    { name: "Testimonials", href: "#testimonials-section" },
  ]

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const targetId = href.substring(1)
    const targetElement = document.getElementById(targetId)
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" })
    }
  }

  const { resolvedTheme, setTheme } = useTheme()
  const token = useAuthToken()
  const { data: profile } = useProfileQuery(token, { enabled: Boolean(token) })

  return (
    <header
      className=" fixed top-4 left-[5%] right-[5%] z-50 py-4 px-6 rounded-2xl backdrop-blur-md bg-background/40 border border-primary/15"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-foreground text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Pixel UI
          </span>
        </motion.div>

        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                href={item.href}
                onClick={(e) => handleScroll(e, item.href)}
                className="text-muted-foreground hover:text-primary px-4 py-2 rounded-full font-medium transition-colors duration-300 relative group"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300" />
              </Link>
            </motion.div>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-primary/10"
            aria-label="Toggle theme"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            {resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {profile ? (
            <span className="text-sm md:text-base text-foreground">{`Welcome, ${profile.name?.split(" ")[0] || "User"}`}</span>
          ) : (
            <Link href="/login" className="hidden md:block">
              <Button variant="outline" className="px-4 py-2 rounded-full font-semibold">
                Login
              </Button>
            </Link>
          )}

         

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-foreground hover:bg-primary/10">
                <Menu className="h-7 w-7" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="bg-background border-t border-primary/20 text-foreground">
              <SheetHeader>
                <SheetTitle className="text-left text-xl font-semibold text-foreground">Navigation</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-6">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleScroll(e, item.href)}
                    className="text-muted-foreground hover:text-primary justify-start text-lg py-2 transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="flex items-center justify-between mt-2">
                  {profile ? (
                    <span className="text-sm text-muted-foreground">{`Welcome, ${profile.name?.split(" ")[0] || "User"}`}</span>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-foreground hover:bg-primary/10"
                    aria-label="Toggle theme"
                    onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  >
                    {resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </Button>
                </div>
                {!profile && (
                  <Link href="/login" className="w-full mt-2">
                    <Button className="w-full" variant="outline">
                      Login
                    </Button>
                  </Link>
                )}
                <Link href="https://vercel.com/home" target="_blank" rel="noopener noreferrer" className="w-full mt-4">
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-full font-semibold shadow-lg shadow-primary/20">
                    Try for Free
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
