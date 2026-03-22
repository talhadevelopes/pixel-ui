import type React from "react"

const FeatureCard: React.FC = () => {
  return (
    <div className="w-full h-full relative">
      <div className="absolute inset-0 rounded-xl overflow-hidden border border-border bg-card/50 dark:bg-card/20">
        <img
          src="https://placehold.co/800x600/png?text=Feature+Image"
          alt="Feature"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  )
}

export default FeatureCard
