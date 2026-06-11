import React from "react";
import { Link } from "@tanstack/react-router";
import { LucideIcon, Check, Database } from "lucide-react";
import { motion } from "motion/react";
import { GlassCard } from "./ui-bits";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  features?: string[];
  primaryActionLabel?: string;
  primaryActionTo?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  secondaryActionTo?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  icon: Icon = Database,
  title,
  description,
  features = [
    "AI Metadata generation",
    "Detailed Data Dictionary schemas",
    "Observability Data Lineage",
    "PII & Governance compliance insights",
  ],
  primaryActionLabel = "Upload Dataset",
  primaryActionTo = "/data-sources",
  onPrimaryAction,
  secondaryActionLabel = "Load Demo Dataset",
  secondaryActionTo,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ type: "spring", stiffness: 200, damping: 24 }}
      className="flex flex-col items-center justify-center text-center p-8 md:p-12 max-w-xl mx-auto rounded-3xl border border-border/40 bg-card/45 backdrop-blur-xl shadow-xl space-y-6 select-none"
    >
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl animate-pulse" />
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 text-primary shadow-[inset_0_0_12px_rgba(16,185,129,0.05)]"
        >
          <Icon className="h-7 w-7" />
        </motion.div>
      </div>

      <div className="space-y-2">
        <h3 className="font-display text-xl font-bold tracking-tight text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">{description}</p>
      </div>

      {features && features.length > 0 && (
        <GlassCard className="max-w-xs w-full p-4 border-border/30 bg-secondary/10 text-left space-y-2.5 mx-auto">
          {features.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-foreground/80">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-[8px] mt-0.5">
                <Check className="h-2.5 w-2.5 text-primary" />
              </span>
              <span className="leading-snug">{item}</span>
            </div>
          ))}
        </GlassCard>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm pt-2">
        {/* Primary CTA */}
        {primaryActionTo ? (
          <Link
            to={primaryActionTo}
            onClick={onPrimaryAction}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-xs font-semibold glow-lime transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {primaryActionLabel}
          </Link>
        ) : (
          <button
            onClick={onPrimaryAction}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-xs font-semibold glow-lime transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {primaryActionLabel}
          </button>
        )}

        {/* Secondary CTA */}
        {secondaryActionTo ? (
          <Link
            to={secondaryActionTo}
            onClick={onSecondaryAction}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background hover:bg-secondary text-foreground px-6 py-2.5 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {secondaryActionLabel}
          </Link>
        ) : (
          <button
            onClick={onSecondaryAction}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background hover:bg-secondary text-foreground px-6 py-2.5 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </motion.div>
  );
}
