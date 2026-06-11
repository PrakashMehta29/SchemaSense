import React from "react";
import { BookOpen, GitBranch, MessageSquare, Check, Clock, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { GlassCard } from "../ui-bits";
import { Dataset, switchDataset } from "@/lib/demoModeService";

interface DatasetCardProps {
  dataset: Dataset;
  isActive: boolean;
}

export function DatasetCard({ dataset, isActive }: DatasetCardProps) {
  const navigate = useNavigate();

  const handleAction = (route: string) => {
    switchDataset(dataset.name);
    navigate({ to: route });
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return "text-emerald-500 border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-500/5";
    if (score >= 80) return "text-amber-500 border-amber-500/20 bg-amber-500/10 dark:bg-amber-500/5";
    return "text-red-500 border-red-500/20 bg-red-500/10 dark:bg-red-500/5";
  };

  return (
    <GlassCard
      className={`p-5 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group border ${
        isActive
          ? "border-primary/30 bg-primary/5 shadow-[inset_0_0_24px_rgba(16,185,129,0.03)]"
          : "border-border/40 bg-card/30 hover:border-primary/20 hover:scale-[1.01]"
      }`}
    >
      {/* Top glowing line for active dataset */}
      {isActive && (
        <div className="absolute top-0 left-0 w-full h-[1.5px] bg-primary glow-lime" />
      )}

      <div className="space-y-4">
        {/* Header: Name and Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="font-mono-tight font-bold text-sm text-foreground block truncate select-all group-hover:text-primary transition-colors">
              {dataset.name}
            </span>
            <span className="text-[10px] text-muted-foreground/80 font-mono-tight">
              Rows: <span className="text-foreground font-semibold">{dataset.rows || "Unknown"}</span> · Size: {dataset.size}
            </span>
          </div>

          {/* Health index circular badge */}
          <div
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono-tight text-[10px] uppercase font-bold shrink-0 ${getHealthColor(
              dataset.healthScore
            )}`}
            title="Dataset Health Score"
          >
            Health: {dataset.healthScore}
          </div>
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap gap-2 pt-1">
          {dataset.metadataGenerated ? (
            <span className="inline-flex items-center gap-1 rounded border border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-500/5 px-2 py-0.5 font-mono-tight text-[9px] text-emerald-500 uppercase font-semibold">
              <ShieldCheck className="h-3 w-3 shrink-0" />
              Metadata Generated
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 font-mono-tight text-[9px] text-amber-500 uppercase font-semibold animate-pulse">
              <Clock className="h-3 w-3 shrink-0" />
              Pending Analysis
            </span>
          )}

          {isActive && (
            <span className="inline-flex items-center gap-1 rounded border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono-tight text-[9px] text-primary uppercase font-bold">
              Active Workspace
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="mt-5 pt-3 border-t border-border/20 grid grid-cols-3 gap-2">
        <button
          onClick={() => handleAction("/dictionary")}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-border/60 bg-background/50 hover:bg-secondary hover:text-foreground text-[10px] font-mono-tight uppercase font-medium py-2 text-muted-foreground cursor-pointer transition-colors"
          title="Open Dictionary Catalog"
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Dictionary</span>
        </button>

        <button
          onClick={() => handleAction("/lineage")}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-border/60 bg-background/50 hover:bg-secondary hover:text-foreground text-[10px] font-mono-tight uppercase font-medium py-2 text-muted-foreground cursor-pointer transition-colors"
          title="View Data Lineage flow"
        >
          <GitBranch className="h-3.5 w-3.5" />
          <span>Lineage</span>
        </button>

        <button
          onClick={() => handleAction("/chat")}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-border/60 bg-background/50 hover:bg-secondary hover:text-foreground text-[10px] font-mono-tight uppercase font-medium py-2 text-muted-foreground cursor-pointer transition-colors"
          title="Ask AI in Natural Language"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Ask AI</span>
        </button>
      </div>
    </GlassCard>
  );
}
