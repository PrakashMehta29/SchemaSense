import React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

interface ConfidenceBadgeProps {
  score: number;
}

export function ConfidenceBadge({ score }: ConfidenceBadgeProps) {
  if (score === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-amber-500/30 bg-amber-500/5 px-2.5 py-0.5 font-mono-tight text-[10px] font-medium uppercase tracking-wider text-amber-500 shrink-0 select-none">
        Pending AI
      </span>
    );
  }

  const getBadgeStyle = () => {
    if (score >= 95) {
      return {
        classes: "text-emerald-500 border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-500/5",
        text: "High Confidence",
        icon: CheckCircle2,
        tooltip:
          "AI generated this description with high accuracy based on type matching and complete records analysis.",
      };
    }
    if (score >= 80) {
      return {
        classes: "text-amber-500 border-amber-500/20 bg-amber-500/10 dark:bg-amber-500/5",
        text: "Medium Confidence",
        icon: AlertTriangle,
        tooltip:
          "AI processed this field with minor assumptions. Review the business meaning context.",
      };
    }
    return {
      classes: "text-red-500 border-red-500/20 bg-red-500/10 dark:bg-red-500/5",
      text: "Low Confidence",
      icon: AlertCircle,
      tooltip: "Low sample consistency or pattern detection. Requires manual verification.",
    };
  };

  const { classes, text, icon: Icon, tooltip } = getBadgeStyle();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono-tight text-[10px] font-medium uppercase tracking-wider transition-all cursor-help shrink-0 ${classes}`}
          >
            <Icon className="h-3 w-3" />
            {score}% {text}
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-[200px] text-[11px] leading-normal p-2.5 bg-background border border-border/80 text-foreground shadow-lg backdrop-blur"
        >
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
