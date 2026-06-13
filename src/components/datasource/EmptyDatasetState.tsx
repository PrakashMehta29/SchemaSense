import React from "react";
import { Database, UploadCloud, Play, Check } from "lucide-react";
import { GlassCard } from "../ui-bits";

interface EmptyDatasetStateProps {
  onUploadClick: () => void;
  onLoadDemoClick: () => void;
}

export function EmptyDatasetState({ onUploadClick, onLoadDemoClick }: EmptyDatasetStateProps) {
  const deliverables = [
    "AI Metadata generation",
    "Detailed Data Dictionary schemas",
    "Observability Data Lineage",
    "PII & Governance compliance insights",
    "Conversational natural language search",
  ];

  return (
    <div className="max-w-xl mx-auto text-center py-10 space-y-8 select-none">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-muted-foreground/30 text-muted-foreground/80 bg-secondary/10 shadow-inner">
        <Database className="h-7 w-7 text-muted-foreground" />
      </div>

      <div className="space-y-2.5">
        <h2 className="font-display text-2xl font-bold text-foreground">No Datasets Connected</h2>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Upload your first dataset in order to map database definitions and generate advanced schema analytics:
        </p>
      </div>

      {/* Structured checklist cards */}
      <GlassCard className="max-w-xs mx-auto p-4.5 border-border/40 bg-secondary/15 text-left space-y-3">
        {deliverables.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2.5 text-xs text-foreground/80">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-[8px] mt-0.5">
              <Check className="h-2.5 w-2.5" />
            </span>
            <span className="leading-snug">{item}</span>
          </div>
        ))}
      </GlassCard>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
        <button
          onClick={onUploadClick}
          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-xs font-semibold glow-lime transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <UploadCloud className="h-4 w-4" />
          Upload Dataset
        </button>
        <button
          onClick={onLoadDemoClick}
          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border border-border bg-background hover:bg-secondary text-foreground px-6 py-2.5 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Play className="h-4 w-4 fill-current" />
          Load Demo Dataset
        </button>
      </div>
    </div>
  );
}
