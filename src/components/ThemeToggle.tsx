import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const themes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 border border-border">
        {themes.map((t) => (
          <div
            key={t.value}
            className="flex items-center gap-2 px-3 py-2 rounded-md"
          >
            <t.icon className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">{t.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 border border-border">
      {themes.map((t) => {
        const Icon = t.icon;
        const isActive = theme === t.value;
        
        return (
          <button
            key={t.value}
            onClick={() => setTheme(t.value)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200",
              isActive
                ? "bg-emerald-500 text-white shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-background"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
