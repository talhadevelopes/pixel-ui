"use client";
import { Button } from "@workspace/ui";
import { LandingHeader } from "./LandingHeader";
import Link from "next/link";
import { ArrowRight, Waves, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="flex flex-col items-center text-center relative w-full min-h-screen overflow-hidden py-0 px-0">
      {/* Ocean Gradient Background */}
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
          <span className="text-sm font-semibold text-blue-700 dark:text-cyan-300">
            AI-Powered Design Studio
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-tight w-full max-w-6xl">
          <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Design Interfaces with AI
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground font-medium leading-relaxed w-full max-w-4xl">
          Generate responsive Tailwind UI layouts in seconds. Chat-driven
          workflow with real-time previews and seamless integrations.
        </p>

        {/* CTA Buttons - MOVED UP */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2 w-full -mb-4">
          <Link href={"/workspace"} target="_blank" rel="noopener noreferrer">
            <button className="c-button c-button--gooey">
              Workspace <ArrowRight className="inline-block w-4 h-4 ml-1" />
              <div className="c-button__blobs">
                <div></div>
                <div></div>
                <div></div>
              </div>
            </button>
          </Link>

          {/* Add this SVG filter somewhere in your component */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            style={{ display: "block", height: 0, width: 0 }}
          >
            <defs>
              <filter id="goo">
                <feGaussianBlur
                  in="SourceGraphic"
                  stdDeviation="10"
                  result="blur"
                ></feGaussianBlur>
                <feColorMatrix
                  in="blur"
                  mode="matrix"
                  values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
                  result="goo"
                ></feColorMatrix>
                <feBlend in="SourceGraphic" in2="goo"></feBlend>
              </filter>
            </defs>
          </svg>
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
  );
}