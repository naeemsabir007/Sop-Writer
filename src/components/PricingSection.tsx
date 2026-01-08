import { Check, X, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

const pricingTiers = [
  {
    name: "Student Trial",
    price: "Free",
    description: "Get a taste of quality",
    features: [
      { text: "First Paragraph Only", included: true },
      { text: "Structure Check", included: true },
      { text: "PDF Download", included: false },
      { text: "Full Document", included: false },
    ],
    buttonText: "Try Now",
    buttonVariant: "outline" as const,
    highlighted: false,
    badge: null,
    borderColor: "border-border",
  },
  {
    name: "Visa Ready",
    price: "Rs 1,000",
    description: "Everything you need",
    features: [
      { text: "Full PDF Download", included: true },
      { text: "Humanized Tone", included: true },
      { text: "Plagiarism Free", included: true },
      { text: "IELTS Calibrated", included: true },
    ],
    buttonText: "Buy Now",
    buttonVariant: "default" as const,
    highlighted: true,
    badge: "MOST POPULAR",
    borderColor: "border-emerald",
    paymentNote: "Pay via JazzCash / Easypaisa",
  },
  {
    name: "Agent Verified",
    price: "Rs 5,000",
    description: "Premium human review",
    features: [
      { text: "Everything in Standard", included: true },
      { text: "Manual Expert Review", included: true },
      { text: "100% Satisfaction Guarantee", included: true },
      { text: "Priority Support", included: true },
    ],
    buttonText: "Get Expert Help",
    buttonVariant: "gold" as const,
    highlighted: false,
    badge: null,
    borderColor: "border-gold",
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 bg-secondary dark:bg-slate-900/50">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Simple Pricing for Students
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            No hidden fees. No complicated subscriptions. Just pay for what you need.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl bg-card dark:bg-slate-800 p-8 border-2 ${tier.borderColor} transition-all duration-300 hover:shadow-card-hover opacity-0 animate-fade-in-up ${
                tier.highlighted ? "shadow-glow scale-105 md:scale-110" : "shadow-card"
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Badge */}
              {tier.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-pill bg-emerald text-accent-foreground text-xs font-semibold uppercase tracking-wide">
                    <Sparkles className="w-3 h-3" />
                    {tier.badge}
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className="mb-6">
                {tier.name === "Agent Verified" ? (
                  <Crown className="w-10 h-10 text-gold" />
                ) : tier.highlighted ? (
                  <Check className="w-10 h-10 text-emerald" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <span className="text-muted-foreground text-lg">🎓</span>
                  </div>
                )}
              </div>

              {/* Tier Name */}
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {tier.name}
              </h3>
              <p className="text-muted-foreground text-sm mb-6">{tier.description}</p>

              {/* Price */}
              <div className="mb-8">
                <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                {tier.price !== "Free" && (
                  <span className="text-muted-foreground text-sm ml-1">one-time</span>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature.text} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-emerald flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-muted flex-shrink-0" />
                    )}
                    <span
                      className={
                        feature.included ? "text-foreground" : "text-muted-foreground"
                      }
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Button */}
              <Button
                className={`w-full rounded-pill py-6 font-semibold transition-all hover:scale-105 ${
                  tier.buttonVariant === "gold"
                    ? "gradient-gold text-gold-foreground hover:opacity-90 glow-gold"
                    : tier.highlighted
                    ? "bg-emerald hover:bg-emerald-light text-accent-foreground glow-green"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
              >
                {tier.buttonText}
              </Button>

              {/* Payment Note */}
              {tier.paymentNote && (
                <p className="text-center text-xs text-muted-foreground mt-4">
                  {tier.paymentNote}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
