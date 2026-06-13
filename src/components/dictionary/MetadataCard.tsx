import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronDown, ChevronUp, Brain, ShieldAlert, Network, Braces, 
  Eye, Shield, Tag, Database, Cpu, AlertTriangle, Activity, 
  Link, ShieldCheck, CheckCircle2, BarChart3, Briefcase 
} from "lucide-react";
import { GlassCard, Pill } from "@/components/ui-bits";
import { ConfidenceBadge } from "./ConfidenceBadge";

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
  
  // NEW rich architectural schema metadata
  criticality: "Critical" | "High" | "Medium" | "Low";
  aiExplanation: string;
  whyItMatters: string;
  dataFlowPosition: "Source Field" | "Transformation Field" | "Lookup Field" | "Reporting Field";
  dataFlowReason: string;
  businessImpactUsedIn: string[];
  businessImpactIfModified: string;
  similarColumns: string[];
  joinCandidates: string[];
  upstreamSources: string[];
  downstreamConsumers: string[];
  impactAssessment: string;
  metadataCompleteness: number;
  relationshipCoverage: number;
}

interface MetadataCardProps {
  column: { name: string; type: string };
  meta: ColMetadata;
  isExpanded: boolean;
  onToggle: () => void;
}

export function MetadataCard({ column, meta, isExpanded, onToggle }: MetadataCardProps) {
  
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
          {/* Business Criticality Badge */}
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono-tight text-[9px] uppercase tracking-wider font-semibold shrink-0 ${
            meta.criticality === "Critical" 
              ? "border-red-500/20 bg-red-500/10 text-red-500" 
              : meta.criticality === "High"
              ? "border-amber-500/20 bg-amber-500/10 text-amber-500"
              : meta.criticality === "Medium"
              ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
              : "border-border bg-secondary/50 text-muted-foreground"
          }`}>
            {meta.criticality}
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
              
              {/* HERO BANNER: Why This Field Matters & Business Criticality */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-violet-500" />
                <div className="flex flex-col md:flex-row gap-5 items-start">
                  <div className="flex-1 space-y-2">
                    <h4 className="font-mono-tight text-[10px] uppercase tracking-widest text-primary font-bold flex items-center gap-1.5">
                      <Brain className="h-3.5 w-3.5 animate-pulse" /> Why This Field Matters
                    </h4>
                    <p className="text-xs text-foreground/95 font-semibold leading-relaxed">
                      "{meta.whyItMatters}"
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      {meta.aiExplanation}
                    </p>
                  </div>
                  
                  <div className="md:w-56 w-full flex flex-col gap-2 rounded-xl border border-border bg-card/60 p-3.5">
                    <span className="text-[9px] font-mono-tight text-muted-foreground uppercase tracking-widest block">
                      Business Criticality
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono-tight text-[10px] uppercase tracking-wider font-bold ${
                        meta.criticality === "Critical" 
                          ? "border-red-500/20 bg-red-500/10 text-red-500" 
                          : meta.criticality === "High"
                          ? "border-amber-500/20 bg-amber-500/10 text-amber-500"
                          : meta.criticality === "Medium"
                          ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                          : "border-border bg-secondary/50 text-muted-foreground"
                      }`}>
                        {meta.criticality}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono-tight">
                        {meta.criticality === "Critical" || meta.criticality === "High" ? "System Core Key" : "General Context"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Two-Column Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* LEFT COLUMN: Data Flow, Business Impact & Profiling */}
                <div className="space-y-6">
                  
                  {/* Data Profiling Card */}
                  <div>
                    <h4 className="text-[10px] font-mono-tight text-muted-foreground uppercase tracking-widest mb-2.5">
                      Data Profiling & Formats
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl border border-border/30 bg-background/40 p-3">
                        <span className="text-[9px] font-mono-tight text-muted-foreground uppercase tracking-wider block mb-1">
                          Null Ratio
                        </span>
                        <span className="font-display text-base font-bold text-foreground">{meta.nullPct}</span>
                      </div>
                      <div className="rounded-xl border border-border/30 bg-background/40 p-3">
                        <span className="text-[9px] font-mono-tight text-muted-foreground uppercase tracking-wider block mb-1">
                          Unique Ratio
                        </span>
                        <span className="font-display text-base font-bold text-foreground">{meta.uniquePct}</span>
                      </div>
                      <div className="rounded-xl border border-border/30 bg-background/40 p-3">
                        <span className="text-[9px] font-mono-tight text-muted-foreground uppercase tracking-wider block mb-1">
                          Quality Metric
                        </span>
                        <span className="font-display text-base font-bold text-emerald-500">100.0%</span>
                      </div>
                    </div>
                  </div>

                  {/* Data Flow Position Section */}
                  <div>
                    <h4 className="font-mono-tight text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-2.5">
                      <Activity className="h-3.5 w-3.5 text-primary" /> Data Flow Position
                    </h4>
                    <div className="rounded-xl border border-border/30 bg-background/40 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono-tight text-xs font-bold text-foreground">
                          {meta.dataFlowPosition}
                        </span>
                        <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded border border-primary/20 bg-primary/5 text-primary">
                          Pipeline Stage
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {meta.dataFlowReason}
                      </p>
                    </div>
                  </div>

                  {/* Business Impact Section */}
                  <div>
                    <h4 className="font-mono-tight text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-2.5">
                      <Briefcase className="h-3.5 w-3.5 text-primary" /> Business Impact
                    </h4>
                    <div className="rounded-xl border border-border/30 bg-background/40 p-4 space-y-3">
                      <div>
                        <span className="text-[9px] font-mono-tight text-muted-foreground uppercase tracking-wider block mb-1">
                          Used In Business Workflows
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {meta.businessImpactUsedIn.map((workflow, idx) => (
                            <span key={idx} className="font-mono-tight text-[10px] rounded border border-border bg-secondary/35 px-2 py-0.5 text-foreground">
                              {workflow}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="border-t border-border/20 pt-2.5">
                        <span className="text-[9px] font-mono-tight text-amber-500 uppercase tracking-wider block mb-1">
                          ⚠️ Downstream Modification Risk
                        </span>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {meta.businessImpactIfModified}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sample values */}
                  <div>
                    <h4 className="font-mono-tight text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-2.5">
                      <Braces className="h-3.5 w-3.5" /> Smart Sample Values
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

                </div>

                {/* RIGHT COLUMN: Lineage, Governance & Trust */}
                <div className="space-y-6">

                  {/* Intelligent Relationship Lineage */}
                  <div>
                    <h4 className="font-mono-tight text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-2.5">
                      <Network className="h-3.5 w-3.5 text-primary" /> Interschema Relationships
                    </h4>
                    <div className="rounded-xl border border-border/30 bg-background/40 p-4 space-y-3.5">
                      {/* Join Candidates */}
                      {meta.joinCandidates.length > 0 && (
                        <div>
                          <span className="text-[9px] font-mono-tight text-muted-foreground uppercase tracking-wider block mb-1">
                            Join Candidates
                          </span>
                          <div className="space-y-1">
                            {meta.joinCandidates.map((join, idx) => (
                              <div key={idx} className="font-mono text-[10px] text-primary flex items-center gap-1">
                                <Link className="h-3 w-3 shrink-0" />
                                <span>{join}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Upstream / Downstream */}
                      <div className="grid grid-cols-2 gap-3 border-t border-border/20 pt-2.5">
                        <div>
                          <span className="text-[9px] font-mono-tight text-muted-foreground uppercase tracking-wider block mb-1">
                            Upstream Sources
                          </span>
                          <div className="space-y-1">
                            {meta.upstreamSources.length > 0 ? (
                              meta.upstreamSources.map((up, idx) => (
                                <span key={idx} className="font-mono text-[10px] text-foreground block truncate">
                                  {up}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-muted-foreground italic">None (Source Root)</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-[9px] font-mono-tight text-muted-foreground uppercase tracking-wider block mb-1">
                            Downstream Consumers
                          </span>
                          <div className="space-y-1">
                            {meta.downstreamConsumers.length > 0 ? (
                              meta.downstreamConsumers.map((down, idx) => (
                                <span key={idx} className="font-mono text-[10px] text-foreground block truncate">
                                  {down}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-muted-foreground italic">None (Terminal Asset)</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Similar Columns */}
                      {meta.similarColumns.length > 0 && (
                        <div className="border-t border-border/20 pt-2.5">
                          <span className="text-[9px] font-mono-tight text-muted-foreground uppercase tracking-wider block mb-1">
                            Similar Columns
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {meta.similarColumns.map((sim, idx) => (
                              <span key={idx} className="font-mono text-[9px] text-muted-foreground mr-2">
                                {sim}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Overall Impact statement */}
                      <div className="border-t border-border/20 pt-2.5">
                        <span className="text-[9px] font-mono-tight text-muted-foreground uppercase tracking-wider block mb-1">
                          Change Impact Analysis
                        </span>
                        <p className="text-[11px] text-foreground font-semibold leading-relaxed">
                          {meta.impactAssessment}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Governance Security Section */}
                  <div>
                    <h4 className="font-mono-tight text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-2.5">
                      <Shield className="h-3.5 w-3.5 text-primary" /> Governance Classification
                    </h4>
                    <div className="rounded-xl border border-border/30 bg-background/40 p-4 space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {/* Sensitivity Badge */}
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono-tight text-[9px] uppercase tracking-wider font-semibold ${getSensitivityColor(meta.sensitivity)}`}>
                          Sensitivity: {meta.sensitivity}
                        </span>
                        {/* PII Detection */}
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono-tight text-[9px] uppercase tracking-wider font-semibold ${meta.pii ? "text-red-500 border-red-500/20 bg-red-500/10" : "text-muted-foreground border-border bg-secondary/50"}`}>
                          PII: {meta.pii ? "Yes" : "No"}
                        </span>
                        {/* Compliance Tags */}
                        {meta.complianceTags.map((tag, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/80 px-2.5 py-0.5 font-mono-tight text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      {/* Pattern recognition if exists */}
                      {meta.pattern && (
                        <div className="border-t border-border/20 pt-2.5">
                          <span className="text-[9px] font-mono-tight text-muted-foreground uppercase tracking-wider block mb-1">
                            Pattern Regex Match
                          </span>
                          <span className="font-mono text-[10px] text-primary break-all block">
                            {meta.pattern}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Trust & Quality Section */}
                  <div>
                    <h4 className="font-mono-tight text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-2.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Trust & Quality Audits
                    </h4>
                    <div className="rounded-xl border border-border/30 bg-background/40 p-4 space-y-4 shadow-sm">
                      {/* AI Confidence */}
                      <div>
                        <div className="flex items-center justify-between text-xs font-mono-tight text-muted-foreground uppercase tracking-wider mb-1.5">
                          <span className="flex items-center gap-1"><Cpu className="h-3 w-3 text-primary" /> AI Confidence</span>
                          <span className="font-bold text-foreground">{meta.confidence}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-border/40 overflow-hidden relative">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${meta.confidence}%` }}
                            transition={{ duration: 0.8 }}
                            className="h-full rounded-full bg-primary glow-lime"
                          />
                        </div>
                      </div>

                      {/* Metadata Completeness */}
                      <div>
                        <div className="flex items-center justify-between text-xs font-mono-tight text-muted-foreground uppercase tracking-wider mb-1.5">
                          <span className="flex items-center gap-1"><BarChart3 className="h-3 w-3 text-violet-400" /> Metadata Completeness</span>
                          <span className="font-bold text-foreground">{meta.metadataCompleteness}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-border/40 overflow-hidden relative">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${meta.metadataCompleteness}%` }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="h-full rounded-full bg-violet-500"
                          />
                        </div>
                      </div>

                      {/* Relationship Coverage */}
                      <div>
                        <div className="flex items-center justify-between text-xs font-mono-tight text-muted-foreground uppercase tracking-wider mb-1.5">
                          <span className="flex items-center gap-1"><Network className="h-3 w-3 text-emerald-400" /> Relationship Coverage</span>
                          <span className="font-bold text-foreground">{meta.relationshipCoverage}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-border/40 overflow-hidden relative">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${meta.relationshipCoverage}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="h-full rounded-full bg-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
