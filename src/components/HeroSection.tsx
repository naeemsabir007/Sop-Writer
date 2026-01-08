import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="gradient-hero min-h-screen pt-24 pb-16 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, hsl(160 84% 39% / 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, hsl(38 92% 50% / 0.2) 0%, transparent 50%)`
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-6rem)]">
          {/* Left Column - Content */}
          <div className="text-primary-foreground">
            {/* Success Badge */}
            <div className="opacity-0 animate-fade-in-up inline-flex items-center gap-2 px-4 py-2 rounded-pill border border-emerald/40 bg-emerald/10 mb-8">
              <span className="text-emerald">✅</span>
              <span className="text-emerald font-medium text-sm">98% Visa Success Rate</span>
            </div>

            {/* Headline */}
            <h1 className="opacity-0 animate-fade-in-up-delay-1 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-balance text-white">
              Don't Let a Bad SOP{" "}
              <span className="text-emerald">Reject Your Visa.</span>
            </h1>

            {/* Subheadline */}
            <p className="opacity-0 animate-fade-in-up-delay-2 text-lg md:text-xl text-slate-400 mb-8 max-w-xl leading-relaxed">
              The only AI in Pakistan calibrated to your IELTS score. Better than a Rs 50,000 Consultant. Accepted by all major embassies.
            </p>

            {/* CTA Button */}
            <div className="opacity-0 animate-fade-in-up-delay-3">
              <Button
                size="lg"
                className="rounded-pill px-8 py-6 text-lg bg-emerald hover:bg-emerald-light text-accent-foreground font-semibold glow-green transition-all hover:scale-105"
              >
                Draft My Letter - Free
              </Button>
            </div>

            {/* Trust Text */}
            <div className="opacity-0 animate-fade-in-up-delay-4 mt-10 flex flex-wrap items-center gap-4 text-slate-400 text-sm">
              <span className="flex items-center gap-1">
                <span className="text-gold">⭐️</span> Trusted by 2,000+ Students
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                🇵🇰 Made in Pakistan
              </span>
            </div>
          </div>

          {/* Right Column - Document Card */}
          <div className="opacity-0 animate-fade-in-up-delay-2 lg:pl-8">
            <div className="relative max-w-md mx-auto lg:mx-0 lg:ml-auto">
              {/* Document Card */}
              <div className="bg-card rounded-lg shadow-2xl overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-500">
                {/* Document Header */}
              <div className="bg-secondary dark:bg-slate-800 px-6 py-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                </div>

                {/* Document Content */}
                <div className="p-6 bg-card">
                  <h3 className="text-center text-lg font-semibold text-foreground mb-4 pb-3 border-b">
                    Statement of Purpose
                  </h3>

                  {/* Visible Paragraph */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    As a dedicated Computer Science graduate from LUMS with a 3.8 GPA, I am applying to the Master's program in Artificial Intelligence at TU Munich. My passion for machine learning began during my final year project...
                  </p>

                  {/* Blurred Section */}
                  <div className="relative">
                    <div className="blur-sm select-none">
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        Throughout my academic journey, I have consistently demonstrated excellence in research methodologies and analytical thinking. My internship at a leading tech company...
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        Germany's commitment to innovation and TU Munich's renowned faculty in AI research make it the ideal destination for my academic pursuits...
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        I am confident that my unique perspective as a Pakistani student, combined with my technical expertise, will contribute meaningfully to your program...
                      </p>
                    </div>

                    {/* Lock Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Link 
                        to="/login" 
                        className="flex items-center gap-2 px-5 py-3 bg-navy rounded-lg shadow-lg hover:bg-navy-light transition-colors cursor-pointer"
                      >
                        <Lock className="w-4 h-4 text-white" />
                        <span className="text-white font-medium text-sm">
                          Unlock Full Draft
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-emerald/20 rounded-full blur-2xl" />
              <div className="absolute -top-4 -left-4 w-32 h-32 bg-gold/10 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
