"use client"
import { Button } from "@workspace/ui"
import { LandingHeader } from "./LandingHeader"
import Link from "next/link"
import { ArrowRight, Waves, Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="flex flex-col items-center text-center relative w-full min-h-screen overflow-hidden py-0 px-0">
      {/* Ocean Gradient Background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-cyan-200 via-blue-200 to-teal-300 dark:from-[#0e1b2a] dark:via-[#0c1f33] dark:to-[#0a1726]" />

      {/* Animated SVG Ocean Waves */}
      <svg
        className="absolute bottom-0 w-full h-96 z-1"
        viewBox="0 0 1200 400"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0891b2" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        
        {/* Deep wave layer */}
        <path
          d="M0,150 Q300,100 600,150 T1200,150 L1200,400 L0,400 Z"
          fill="url(#waveGrad1)"
          className="animate-wave"
        />
        
        {/* Mid wave layer */}
        <path
          d="M0,200 Q300,150 600,200 T1200,200 L1200,400 L0,400 Z"
          fill="url(#waveGrad2)"
          className="animate-wave"
          style={{ animationDelay: "1.5s" }}
        />
        
        {/* Surface wave layer */}
        <path
          d="M0,250 Q300,200 600,250 T1200,250 L1200,400 L0,400 Z"
          fill="#0891b2"
          opacity="0.4"
          className="animate-wave"
          style={{ animationDelay: "3s" }}
        />
      </svg>

      {/* Floating gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-400/20 dark:bg-cyan-500/15 rounded-full blur-3xl animate-float" />
      <div 
        className="absolute top-1/3 right-20 w-96 h-96 bg-blue-400/15 dark:bg-blue-500/10 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "2s" }}
      />
      <div 
        className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-teal-400/10 dark:bg-teal-500/10 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "4s" }}
      />

      {/* Light rays effect */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-white dark:from-white/30 to-transparent blur-2xl" />
        <div className="absolute top-0 right-1/4 w-1 h-full bg-gradient-to-b from-white/60 dark:from-white/20 to-transparent blur-2xl" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-300/40 dark:bg-cyan-400/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `bubble-rise ${6 + Math.random() * 4}s ease-in infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 w-full">
        <LandingHeader />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full px-4 md:px-8 lg:px-12 space-y-8 md:space-y-10">
        {/* Badge */}
        <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/40 dark:bg-white/10 backdrop-blur-md border border-white/60 dark:border-white/20">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          <span className="text-sm font-semibold text-blue-700 dark:text-cyan-300">AI-Powered Design Studio</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-tight w-full max-w-6xl">
          <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Design Interfaces with AI
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground font-medium leading-relaxed w-full max-w-4xl">
          Generate responsive Tailwind UI layouts in seconds. Chat-driven workflow with real-time previews and seamless integrations.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 w-full">
          <Link href={'/workspace'} target="_blank" rel="noopener noreferrer">
            <Button className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary hover:to-accent/90 px-10 py-4 rounded-full font-semibold text-base shadow-lg shadow-primary/40 flex items-center gap-2 group transition-all">
             Workspace
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Button
            variant="outline"
            className="px-10 py-4 rounded-full font-semibold text-base border-input text-foreground hover:bg-card/60 dark:hover:bg-card/30 bg-card/50 dark:bg-card/20 backdrop-blur-sm transition-all"
          >
            Watch Demo
          </Button>
        </div>
      </div>

      <style jsx>{`
        @keyframes bubble-rise {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-120vh) translateX(100px);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  )
}