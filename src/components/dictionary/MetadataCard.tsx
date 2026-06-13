import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ChevronUp, Brain, ShieldAlert, Network, Braces, Eye, Shield, Tag, Calendar, Database } from "lucide-react";
import { GlassCard, Pill } from "@/components/ui-bits";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { ConfidencePanel } from "./ConfidencePanel";

export interface ColMetadata {
  name: string;
  type: string;
  nullPct: string;
  uniquePct: string;
  description: string;
  meaning: string;
  context: string;
  samples: string[];
  pattern?: string;
  relations: string[];
  isFk: boolean;
  sensitivity: "Low" | "Medium" | "High" | "Critical";
  pii: boolean;
  complianceTags: string[];
  confidence: number;
}

interface MetadataCardProps {
  column: { name: string; type: string };
  meta: ColMetadata;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdateContext?: (newContext: string) => void;
}

export function MetadataCard({ column, meta, isExpanded, onToggle, onUpdateContext }: MetadataCardProps) {
  
  const getSensitivityColor = (level: string) => {
    switch (level) {
      case "Critical":
      case "High":
        return "text-red-500 border-red-500/20 bg-red-500/10 dark:bg-red-500/5";
      case "Medium":
        return "text-amber-500 border-amber-500/20 bg-amber-500/10 dark:bg-amber-500/5";
      default:
        return "text-muted-foreground border-border bg-secondary/50";
    }
  };

  return (
    <GlassCard className="overflow-hidden border border-border/40 bg-card/30 transition-all hover:border-primary/20">
      {/* ── Collapsed Header ── */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-4 min-w-0">
          <span className={`h-2 w-2 rounded-full shrink-0 ${meta.pii ? "bg-red-500 animate-pulse glow-red" : "bg-primary glow-lime"}`} />
          <span className="font-mono-tight text-sm font-bold text-foreground truncate">
            {column.name}
          </span>
          <span className="inline-flex items-center rounded-md border border-primary/20 bg-primary/5 px-2.5 py-0.5 font-mono-tight text-[11px] text-primary lowercase tracking-wide shrink-0">
            {column.type}
          </span>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {/* Confidence Badge */}
          <ConfidenceBadge score={meta.confidence} />

          {/* Governance Badge preview */}
          {meta.pii && (
            <span className="hidden sm:inline-flex items-center gap-1 rounded-md border border-red-500/30 bg-red-500/10 px-2 py-0.5 font-mono-tight text-[9px] text-red-500 uppercase font-bold shrink-0">
              <ShieldAlert className="h-3.5 w-3.5" /> PII
            </span>
          )}

          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* ── Expanded Drawer ── */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
          >
            <div className="border-t border-border/40 px-6 py-5 bg-secondary/5 space-y-6">
              
              {/* SECTION 1: Metadata Stats */}
              <div>
                <h4 className="text-[10px] font-mono-tight text-muted-foreground uppercase tracking-widest mb-2.5">
                  Section 1: Data Profiling
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="rounded-xl border border-border/30 bg-background/40 p-3.5">
                    <span className="text-[9px] font-mono-tight text-muted-foreground uppercase tracking-wider block mb-1">
                      Null Percentage
                    </span>
                    <span className="font-display text-xl font-bold text-foreground">{meta.nullPct}</span>
                  </div>
                  <div className="rounded-xl border border-border/30 bg-background/40 p-3.5">
                    <span className="text-[9px] font-mono-tight text-muted-foreground uppercase tracking-wider block mb-1">
                      Unique Ratio
                    </span>
                    <span className="font-display text-xl font-bold text-foreground">{meta.uniquePct}</span>
                  </div>
                  <div className="rounded-xl border border-border/30 bg-background/40 p-3.5">
                    <span className="text-[9px] font-mono-tight text-muted-foreground uppercase tracking-wider block mb-1">
                      Column Format
                    </span>
                    <span className="font-mono-tight text-sm font-bold text-primary truncate block">{column.type}</span>
                  </div>
                  <div className="rounded-xl border border-border/30 bg-background/40 p-3.5">
                    <span className="text-[9px] font-mono-tight text-muted-foreground uppercase tracking-wider block mb-1">
                      Quality Score
                    </span>
                    <span className="font-display text-xl font-bold text-emerald-500">100.0%</span>
                  </div>
                </div>
              </div>

              <hr className="border-border/20" />

              {/* SECTION 2: AI Description */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <h4 className="font-mono-tight text-[10px] uppercase tracking-widest text-primary font-bold flex items-center gap-1.5 mb-2">
                      <Brain className="h-3.5 w-3.5" /> AI Description
                    </h4>
                    <p className="text-xs text-foreground/90 leading-relaxed bg-background/50 border border-border/30 rounded-xl p-4 shadow-inner">
                      {meta.description}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-mono-tight text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-2">
                      <Eye className="h-3.5 w-3.5" /> Business Meaning
                    </h4>
                    <p className="text-xs text-foreground/90 leading-relaxed bg-background/50 border border-border/30 rounded-xl p-4 shadow-inner">
                      {meta.meaning}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-mono-tight text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-2">
                    <Database className="h-3.5 w-3.5" /> Usage Context
                  </h4>
                  <textarea
                    value={meta.context}
                    onChange={(e) => onUpdateContext?.(e.target.value)}
                    placeholder="Add your usage context or tags here... e.g. purchase regularly"
                    className="w-full text-xs text-foreground/90 leading-relaxed bg-background/50 border border-border/30 rounded-xl p-4 shadow-inner min-h-[80px] h-[calc(100%-24px)] flex items-center justify-center text-center italic text-muted-foreground/90 resize-none outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>

              <hr className="border-border/20" />

              {/* SECTION 3: Examples & Pattern Recognition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <h4 className="font-mono-tight text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-2.5">
                    <Braces className="h-3.5 w-3.5" /> Sample Values
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {meta.samples.map((val, idx) => (
                      <span
                        key={idx}
                        className="font-mono-tight text-xs rounded-lg border border-border/50 bg-background/50 px-3 py-1.5 text-foreground/80 shadow-sm"
                      >
                        {val}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-mono-tight text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-2.5">
                    <Tag className="h-3.5 w-3.5" /> Pattern Recognition
                  </h4>
                  <div className="rounded-xl border border-border/30 bg-background/40 p-3.5 font-mono text-xs text-muted-foreground leading-relaxed">
                    <div className="flex items-center justify-between border-b border-border/20 pb-1.5 mb-2">
                      <span className="text-[10px] text-muted-foreground uppercase">Evaluator Regex Match</span>
                      <span className="text-emerald-500 font-bold">100% Match</span>
                    </div>
                    {meta.pattern ? (
                      <span className="text-primary break-all">{meta.pattern}</span>
                    ) : (
                      <span className="italic">No custom regular expression constraints mapped.</span>
                    )}
                  </div>
                </div>
              </div>

              <hr className="border-border/20" />

              {/* SECTION 4 & 5: Relationships & Governance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Relationships */}
                <div>
                  <h4 className="font-mono-tight text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-2.5">
                    <Network className="h-3.5 w-3.5" /> Relationships
                  </h4>
                  <div className="space-y-2">
                    {meta.relations.map((rel, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 font-mono-tight text-xs text-foreground/85 border border-border/20 bg-background/40 px-3 py-2 rounded-lg"
                      >
                        <Network className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{rel}</span>
                        {meta.isFk && (
                          <span className="ml-auto inline-flex items-center rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 text-[9px] text-primary uppercase font-semibold">
                            FK Match
                          </span>
                        )}
                      </div>
                    ))}
                    {meta.relations.length === 0 && (
                      <div className="text-xs italic text-muted-foreground">No interschema dependencies detected.</div>
                    )}
                  </div>
                </div>

                {/* Governance & Quality breakdown */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-mono-tight text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-2.5">
                      <Shield className="h-3.5 w-3.5" /> Governance Security
                    </h4>
                    <div className="flex flex-wrap gap-2.5">
                      {/* Sensitivity Badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono-tight text-[10px] uppercase tracking-wider font-semibold ${getSensitivityColor(
                          meta.sensitivity
                        )}`}
                      >
                        Sensitivity: {meta.sensitivity}
                      </span>

                      {/* PII Detection */}
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono-tight text-[10px] uppercase tracking-wider font-semibold ${
                          meta.pii
                            ? "text-red-500 border-red-500/20 bg-red-500/10 dark:bg-red-500/5"
                            : "text-muted-foreground border-border bg-secondary/50"
                        }`}
                      >
                        PII Detected: {meta.pii ? "Yes" : "No"}
                      </span>

                      {/* Compliance Tags */}
                      {meta.complianceTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/80 px-3 py-1 font-mono-tight text-[10px] uppercase tracking-wider text-muted-foreground font-semibold"
                        >
                          Compliance: {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Confidence Breakdown Panel */}
                  <ConfidencePanel score={meta.confidence} />
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
