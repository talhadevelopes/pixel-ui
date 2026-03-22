"use client"

import FeatureCard from "./bento/FeatureCard"
import { Zap, MessageSquare, Plug, Network, Rocket, Gauge } from "lucide-react"

const BentoCard = ({ title, description, Component, icon: Icon, index }: any) => (
  <div
    className="overflow-hidden rounded-2xl border border-border flex flex-col justify-start items-start relative group transition-all duration-300 bg-card/60 dark:bg-card/20 hover:bg-card/70 dark:hover:bg-card/30 backdrop-blur-sm"
    style={{
      animation: `slideUp 0.6s ease-out ${index * 0.1}s both`,
    }}
  >
    <div
      className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-200/10 to-blue-200/5 dark:from-cyan-200/5 dark:to-blue-200/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      style={{
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    />
    <div className="absolute inset-0 bg-gradient-to-br from-white/50 dark:from-white/10 to-transparent rounded-2xl" />

    <div className="self-stretch p-6 flex flex-col justify-start items-start gap-4 relative z-10">
      <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
        <Icon className="w-5 h-5 text-accent-foreground" />
      </div>
      <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
        <p className="self-stretch text-foreground text-lg font-semibold leading-7">{title}</p>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
    <div className="self-stretch h-72 relative -mt-0.5 z-10">
      <Component />
    </div>
  </div>
)

export function BentoSection() {
  const cards = [
    {
      title: "AI-powered code reviews",
      description: "Get real-time, smart suggestions for cleaner code.",
      Component: FeatureCard,
      icon: Zap,
    },
    {
      title: "Real-time coding previews",
      description: "Chat, collaborate, and instantly preview changes together.",
      Component: FeatureCard,
      icon: MessageSquare,
    },
    {
      title: "One-click integrations",
      description: "Easily connect your workflow with popular dev tools.",
      Component: FeatureCard,
      icon: Plug,
    },
    {
      title: "Flexible MCP connectivity",
      description: "Effortlessly manage and configure MCP server access.",
      Component: FeatureCard,
      icon: Network,
    },
    
  ]

  return (
    <section className="w-full px-4 md:px-8 lg:px-12 flex flex-col justify-center items-center overflow-visible bg-transparent">
      <div className="w-full py-8 md:py-16 relative flex flex-col justify-start items-start gap-6">
        <div
          className="absolute top-0 left-0 w-96 h-96 bg-cyan-300/15 rounded-full blur-3xl -z-10"
          style={{
            animation: `float 8s ease-in-out infinite`,
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-80 h-80 bg-blue-300/10 rounded-full blur-3xl -z-10"
          style={{
            animation: `float 10s ease-in-out infinite 2s`,
          }}
        />

        <div className="self-stretch py-8 md:py-14 flex flex-col justify-center items-center gap-2 z-10">
          <div className="flex flex-col justify-start items-center gap-4">
            <h2 className="w-full text-center text-blue-900 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight md:leading-[66px]">
              Empower Your Workflow with AI
            </h2>
            <p className="w-full text-center text-blue-700/70 text-lg md:text-xl font-medium leading-relaxed max-w-4xl">
              Ask your AI Agent for real-time collaboration, seamless integrations, and actionable insights to
              streamline your operations.
            </p>
          </div>
        </div>

        <div className="self-stretch grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-10">
          {cards.map((card, index) => (
            <BentoCard key={card.title} {...card} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
