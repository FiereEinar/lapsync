import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  className?: string;
  accentColor?: string;
}

export function StatCard({ title, value, subtitle, icon: Icon, className, accentColor }: StatCardProps) {
  // Map accent colors to tailwind-compatible gradient/bg classes
  const colorMap: Record<string, { gradient: string; iconBg: string; iconColor: string }> = {
    teal: {
      gradient: "from-primary/10 via-primary/5 to-transparent",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    green: {
      gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
    },
    purple: {
      gradient: "from-violet-500/10 via-violet-500/5 to-transparent",
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-500",
    },
    amber: {
      gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500",
    },
  };

  const colors = colorMap[accentColor || "teal"] || colorMap.teal;

  return (
    <Card className={cn("group relative overflow-hidden", className)}>
      {/* Gradient background */}
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60 transition-opacity group-hover:opacity-100", colors.gradient)} />
      <CardContent className="p-5 relative">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{title}</p>
            <p className="text-3xl font-extrabold text-foreground tracking-tight">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground font-medium mt-1">{subtitle}</p>}
          </div>
          {Icon && (
            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", colors.iconBg)}>
              <Icon className={cn("w-5 h-5", colors.iconColor)} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
