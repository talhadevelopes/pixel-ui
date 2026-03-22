import { Button } from "@workspace/ui";
import { Check, Zap } from "lucide-react";

const features = [
  'Basic AI features',
  'Community support',
  'Export designs',
  'Priority support',
  'Custom branding',
  'Team collaboration'
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 relative z-10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-black dark:text-white">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your needs. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <div className="bg-card rounded-2xl p-8 border border-border/50 hover:border-primary/50 transition-all duration-300">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <div className="flex items-baseline mb-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground ml-1">/month</span>
              </div>
              <p className="text-muted-foreground mb-6">Perfect for trying out</p>
              <Button className="w-full" variant="outline">
                Get Started
              </Button>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>5 projects per day</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Basic AI features</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Community support</span>
              </li>
            </ul>
          </div>

          {/* Pro Plan */}
          <div className="bg-card rounded-2xl p-8 border-2 border-primary/50 shadow-lg shadow-primary/10 transform hover:scale-105 transition-all duration-300 relative">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg rounded-tr-lg">
              POPULAR
            </div>
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="flex items-baseline mb-4">
                <span className="text-4xl font-bold">$0.99</span>
                <span className="text-muted-foreground ml-1">/month</span>
              </div>
              <p className="text-muted-foreground mb-6">For regular users</p>
              <Button className="w-full group">
                <Zap className="h-4 w-4 mr-2 group-hover:animate-ping" />
                Upgrade to Pro
              </Button>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>20 projects per day</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Advanced AI features</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Priority support</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Export designs</span>
              </li>
            </ul>
          </div>

          {/* Premium Plan */}
          <div className="bg-card rounded-2xl p-8 border border-border/50 hover:border-primary/50 transition-all duration-300">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Premium</h3>
              <div className="flex items-baseline mb-4">
                <span className="text-4xl font-bold">$3.99</span>
                <span className="text-muted-foreground ml-1">/month</span>
              </div>
              <p className="text-muted-foreground mb-6">For power users</p>
              <Button className="w-full" variant="outline">
                Get Premium
              </Button>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>100 projects per day</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>All AI features</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Premium support</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Custom branding</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Team collaboration</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
