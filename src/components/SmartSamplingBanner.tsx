import React from "react";
import { motion } from "motion/react";
import { Cpu, TrendingUp, Info } from "lucide-react";

interface SmartSamplingBannerProps {
  rowCount?: string;
  samplePct?: number;
  estimatedAccuracy?: number;
  compact?: boolean;
}

export function SmartSamplingBanner({
  rowCount,
  samplePct = 15,
  estimatedAccuracy = 92,
  compact = false,
}: SmartSamplingBannerProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-[10px] font-mono-tight">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
        </span>
        <span className="text-primary font-bold uppercase tracking-wider">
          Smart Sampling Active
        </span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">Analyzing {samplePct}% of dataset</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-emerald-500 font-semibold">Est. Accuracy: {estimatedAccuracy}%</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/8 to-emerald-500/5 p-5 space-y-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">Smart Sampling Technology</span>
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
              </span>
              <span className="text-[9px] font-mono-tight text-primary uppercase tracking-widest">
                Active
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Metadata generated using a statistically representative sample
            </p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border/40 bg-background/60 p-3 text-center">
          <div className="text-lg font-bold text-primary font-display">{samplePct}%</div>
          <div className="text-[9px] font-mono-tight text-muted-foreground uppercase tracking-wider mt-0.5">
            Rows Analyzed
          </div>
        </div>
        <div className="rounded-xl border border-border/40 bg-background/60 p-3 text-center">
          <div className="text-lg font-bold text-emerald-500 font-display">
            {estimatedAccuracy}%
          </div>
          <div className="text-[9px] font-mono-tight text-muted-foreground uppercase tracking-wider mt-0.5">
            Est. Accuracy
          </div>
        </div>
        <div className="rounded-xl border border-border/40 bg-background/60 p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-[9px] font-mono-tight text-muted-foreground uppercase tracking-wider mt-0.5">
            High Confidence
          </div>
        </div>
      </div>

      {/* Info note */}
      <div className="flex items-start gap-2 text-[10px] text-muted-foreground">
        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground/60" />
        <span>
          SchemaSense analyzes a representative {samplePct}% sample of your dataset to generate
          accurate metadata, detect data types, and identify relationships — without requiring full
          dataset scans.
        </span>
      </div>
    </motion.div>
  );
}
