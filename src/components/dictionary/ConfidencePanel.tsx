import React from "react";
import { Check, AlertTriangle, Info } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui-bits"; // Or custom tooltips if we want to import Radix tooltips directly
import { Tooltip as RadixTooltip, TooltipTrigger as RadixTooltipTrigger, TooltipContent as RadixTooltipContent, TooltipProvider as RadixTooltipProvider } from "@/components/ui/tooltip";
import { motion } from "motion/react";

interface Factor {
  label: string;
  passed: boolean;
  tooltip: string;
}

interface ConfidencePanelProps {
  score: number;
}

export function ConfidencePanel({ score }: ConfidencePanelProps) {
  const getFactors = (): Factor[] => {
    if (score >= 95) {
      return [
        {
          label: "Consistent Column Values",
          passed: true,
          tooltip: "Data distribution conforms to type bounds and contains zero unexpected values.",
        },
        {
          label: "Strong Pattern Match",
          passed: true,
          tooltip: "Matches predefined formats like standard UUIDs, email patterns, or timestamp formats.",
        },
        {
          label: "High Column Quality",
          passed: true,
          tooltip: "99%+ fill rate with minimal null flags or anomalous deviations.",
        },
        {
          label: "Rich Lineage Context",
          passed: true,
          tooltip: "Lineage contains multiple hops and clear semantic relationships.",
        },
      ];
    }
    if (score >= 80) {
      return [
        {
          label: "Consistent Column Values",
          passed: true,
          tooltip: "Main data stream fits typical numerical/string distribution bounds.",
        },
        {
          label: "Strong Pattern Match",
          passed: true,
          tooltip: "Conforms to regional/standard formats for text variables.",
        },
        {
          label: "High Column Quality",
          passed: true,
          tooltip: "Null rate is within expected normal variance limits.",
        },
        {
          label: "Limited Context Available",
          passed: false,
          tooltip: "Metadata inferred mainly from database structure. Lacks active description inputs.",
        },
      ];
    }
    return [
      {
        label: "Inconsistent Sample Values",
        passed: false,
        tooltip: "Contains mixed character sets, negative/overflow entries, or formatting noise.",
      },
      {
        label: "Weak Semantic Matches",
        passed: false,
        tooltip: "No catalog schema definitions correlate with this column's header values.",
      },
      {
        label: "High Null Concentration",
        passed: false,
        tooltip: "Large percentage of empty values prevents profile modeling.",
      },
      {
        label: "Missing Downstream Lineage",
        passed: false,
        tooltip: "Field terminates at ingestion. No downstream dependencies detected.",
      },
    ];
  };

  const factors = getFactors();

  const getProgressColor = () => {
    if (score >= 95) return "bg-emerald-500 glow-lime";
    if (score >= 80) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <RadixTooltipProvider>
      <div className="rounded-xl border border-border/30 bg-background/50 p-4 space-y-4 shadow-sm">
        {/* Score progress bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-mono-tight text-muted-foreground uppercase tracking-wider mb-2">
            <span>Overall Score Accuracy</span>
            <span className="font-bold text-foreground">{score}%</span>
          </div>
          <div className="h-2 rounded-full bg-border/40 overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${getProgressColor()}`}
            />
          </div>
        </div>

        {/* Factors list */}
        <div>
          <h5 className="text-[10px] font-mono-tight text-muted-foreground uppercase tracking-widest mb-2.5">
            Confidence Factors
          </h5>
          <ul className="space-y-2">
            {factors.map((f, i) => (
              <li key={i} className="flex items-center justify-between text-xs text-foreground/90">
                <div className="flex items-center gap-2">
                  {f.passed ? (
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                  ) : (
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                      <AlertTriangle className="h-2.5 w-2.5" />
                    </span>
                  )}
                  <span>{f.label}</span>
                </div>
                
                <RadixTooltip>
                  <RadixTooltipTrigger asChild>
                    <button type="button" className="text-muted-foreground/60 hover:text-foreground p-0.5">
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </RadixTooltipTrigger>
                  <RadixTooltipContent side="top" className="max-w-[200px] text-[11px] leading-normal p-2.5 bg-background border border-border/80 text-foreground shadow-lg backdrop-blur">
                    {f.tooltip}
                  </RadixTooltipContent>
                </RadixTooltip>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </RadixTooltipProvider>
  );
}
