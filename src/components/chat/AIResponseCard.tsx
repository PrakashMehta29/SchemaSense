import React from "react";
import { Layers, ShieldAlert, Cpu, Database, Eye } from "lucide-react";
import { GlassCard } from "@/components/ui-bits";

interface AIResponseCardProps {
  card: {
    title: string;
    type: string;
    nullPct: string;
    uniquePct: string;
    pii: boolean;
    sensitivity: "Low" | "Medium" | "High" | "Critical";
    tables: string[];
    description: string;
  };
}

export function AIResponseCard({ card }: AIResponseCardProps) {
  const getSensitivityColor = (level: string) => {
    switch (level) {
      case "Critical":
      case "High":
        return "text-red-500 border-red-500/20 bg-red-500/10";
      case "Medium":
        return "text-amber-500 border-amber-500/20 bg-amber-500/10";
      default:
        return "text-muted-foreground border-border bg-secondary/50";
    }
  };

  return (
    <GlassCard className="mt-4 border border-border/40 bg-background/50 p-4 space-y-4 max-w-lg shadow-[inset_0_0_12px_rgba(242,120,92,0.02)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/20 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <span className="font-mono-tight text-sm font-bold text-foreground">{card.title}</span>
          <span className="inline-flex items-center rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 font-mono-tight text-[10px] text-primary lowercase tracking-wide shrink-0">
            {card.type}
          </span>
        </div>

        {card.pii && (
          <span className="inline-flex items-center gap-1 rounded-md border border-red-500/30 bg-red-500/10 px-2 py-0.5 font-mono-tight text-[9px] text-red-500 uppercase font-bold">
            <ShieldAlert className="h-3 w-3" /> PII
          </span>
        )}
      </div>

      {/* Profiling stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border/30 bg-background/40 p-2.5">
          <span className="text-[8.5px] font-mono-tight text-muted-foreground uppercase tracking-wider block mb-0.5">
            Nulls
          </span>
          <span className="font-mono-tight text-xs font-bold text-foreground">{card.nullPct}</span>
        </div>
        <div className="rounded-lg border border-border/30 bg-background/40 p-2.5">
          <span className="text-[8.5px] font-mono-tight text-muted-foreground uppercase tracking-wider block mb-0.5">
            Uniqueness
          </span>
          <span className="font-mono-tight text-xs font-bold text-foreground">
            {card.uniquePct}
          </span>
        </div>
        <div className="rounded-lg border border-border/30 bg-background/40 p-2.5">
          <span className="text-[8.5px] font-mono-tight text-muted-foreground uppercase tracking-wider block mb-0.5">
            Sensitivity
          </span>
          <span
            className={`inline-flex items-center rounded-full border px-1.5 py-0.5 font-mono-tight text-[8px] uppercase font-bold mt-0.5 ${getSensitivityColor(card.sensitivity)}`}
          >
            {card.sensitivity}
          </span>
        </div>
      </div>

      {/* Description */}
      <div>
        <h5 className="font-mono-tight text-[9px] uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
          <Eye className="h-3 w-3" /> AI Context Definition
        </h5>
        <p className="text-xs text-foreground/80 leading-relaxed bg-secondary/20 rounded-lg p-3">
          {card.description}
        </p>
      </div>

      {/* Tables Reference */}
      <div>
        <h5 className="font-mono-tight text-[9px] uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
          <Database className="h-3 w-3" /> Reference Catalogs
        </h5>
        <div className="flex flex-wrap gap-1.5">
          {card.tables.map((tbl, idx) => (
            <span
              key={idx}
              className="font-mono-tight text-[10px] rounded border border-border bg-secondary/40 px-2 py-0.5 text-foreground/75"
            >
              {tbl}
            </span>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
