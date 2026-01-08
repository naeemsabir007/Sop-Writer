import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "light" | "dark" | "auto";
}

const Logo = ({ 
  className, 
  iconOnly = false, 
  size = "md", 
  variant = "auto" 
}: LogoProps) => {
  const sizes = {
    sm: { icon: 24, text: "text-lg" },
    md: { icon: 32, text: "text-xl" },
    lg: { icon: 44, text: "text-2xl" },
    xl: { icon: 56, text: "text-3xl" },
  };

  const { icon: iconSize, text: textSize } = sizes[size];

  // Text color based on variant
  const getTextColor = () => {
    switch (variant) {
      case "light":
        return "text-white";
      case "dark":
        return "text-slate-900";
      case "auto":
      default:
        return "text-slate-900 dark:text-white";
    }
  };

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* Pen Nib with Digital Flow Icon */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Glow Filter */}
        <defs>
          <filter id={`neonGlow-${size}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id={`penGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981"/>
            <stop offset="100%" stopColor="#34D399"/>
          </linearGradient>
        </defs>

        {/* Outer Pen Nib / Droplet Shape */}
        <path
          d="M24 4C24 4 10 18 10 30C10 38.284 16.716 45 25 45C33.284 45 40 38.284 40 30C40 18 24 4 24 4Z"
          stroke={`url(#penGradient-${size})`}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter={`url(#neonGlow-${size})`}
        />

        {/* Inner Flowing Digital Path - S Curve */}
        <path
          d="M24 14C24 14 18 22 18 28C18 32 21 35 24 35C27 35 30 32 30 28C30 22 24 14 24 14Z"
          stroke={`url(#penGradient-${size})`}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          filter={`url(#neonGlow-${size})`}
          opacity="0.9"
        />

        {/* Small accent dot at bottom */}
        <circle 
          cx="24" 
          cy="38" 
          r="2" 
          fill="#10B981"
          filter={`url(#neonGlow-${size})`}
        />
      </svg>

      {/* Logo Text - Dynamic color based on variant */}
      {!iconOnly && (
        <span className={cn("font-sans tracking-tight transition-colors duration-300", textSize)}>
          <span className={cn("font-bold", getTextColor())}>SOP</span>
          <span className={cn("font-normal text-emerald-500")}> Writer</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
