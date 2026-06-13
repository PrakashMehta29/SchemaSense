import { Route as ExecutiveRoute, createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import {
  Shield,
  BarChart3,
  AlertTriangle,
  Layers,
  BookOpen,
  CheckCircle,
  Database,
} from "lucide-react";
import { GlassCard, SectionTitle, CountUp, Pill } from "@/components/ui-bits";
import { EmptyState } from "@/components/EmptyState";
import {
  EXECUTIVE_KPI_DATA,
  EXECUTIVE_HEALTH_SCORECARD,
  EXECUTIVE_RECOMMENDATIONS,
} from "@/lib/executiveInsightsService";
import { motion } from "motion/react";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { enableDemoMode } from "@/lib/demoModeService";

export const Route = createFileRoute("/executive")({
  head: () => ({
    meta: [
      { title: "Executive Dashboard · SchemaSense" },
      {
        name: "description",
        content:
          "Executive overview of data governance compliance, schema quality, and metadata health.",
      },
    ],
  }),
  component: ExecutiveComponent,
});

function ExecutiveComponent() {
  const { hasDataset } = useWorkspace();

  const health = EXECUTIVE_HEALTH_SCORECARD;
  const kpis = EXECUTIVE_KPI_DATA;

  // 1. Show empty state if no dataset is uploaded
  if (!hasDataset) {
    return (
      <div className="py-12 space-y-8">
        <SectionTitle
          kicker="Executive Board"
          title={
            <>
              Executive <span className="text-primary">Dashboard.</span>
            </>
          }
          sub="Observe high-level statistics, compliance readiness scorecard, and core schema quality coverage."
        />
        <div className="mt-8">
          <EmptyState
            title="No Dataset Connected"
            description="Upload a dataset to view high-level summaries of schema health and compliance scoring metrics."
            features={[
              "VP-level health indexes",
              "Critical governance alert diagnostics",
              "AI priority recommendation suggestions",
              "Metadata coverage summaries",
            ]}
            onSecondaryAction={() => {
              enableDemoMode();
              refreshWorkspace();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <SectionTitle
        kicker="Executive View"
        title={
          <>
            Enterprise Health & <span className="text-primary">Visibility.</span>
          </>
        }
        sub="VP-level data dictionary health scores, catalog metadata coverage, access controls, and critical risk suggestions."
      />

      {/* ── KPI Metrics Cards Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Datasets", val: kpis.totalDatasets, color: "text-foreground" },
          { label: "Total Columns", val: kpis.totalColumns, color: "text-foreground" },
          { label: "Governed Columns", val: kpis.governedAssets, color: "text-primary text-glow" },
          { label: "PII Assets", val: kpis.piiAssets, color: "text-red-500" },
          {
            label: "Critical Risks",
            val: kpis.criticalRisks,
            color: "text-orange-500 animate-pulse",
          },
          {
            label: "Metadata Coverage",
            val: kpis.metadataCoverage,
            suffix: "%",
            color: "text-emerald-500",
          },
        ].map((kpi, idx) => (
          <GlassCard key={idx} className="p-4 flex flex-col justify-between">
            <span className="text-[9px] font-mono-tight text-muted-foreground uppercase tracking-wider block mb-2">
              {kpi.label}
            </span>
            <span className={`font-display text-2xl font-bold ${kpi.color}`}>
              <CountUp to={kpi.val} suffix={kpi.suffix ?? ""} />
            </span>
          </GlassCard>
        ))}
      </div>

      {/* ── Main Area: Health Scorecard & AI Suggestions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-6">
        {/* Scorecard panel */}
        <GlassCard className="p-6 flex flex-col gap-6 items-center">
          <div className="w-full text-left">
            <h3 className="font-mono-tight text-[10px] uppercase text-muted-foreground tracking-widest mb-1.5 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              Dataset Health Scorecard
            </h3>
            <p className="text-[10px] text-muted-foreground">
              Overall compliance and documentation indices.
            </p>
          </div>

          {/* Radial score gauge */}
          <div className="relative flex items-center justify-center h-32 w-32 rounded-full border border-primary/20 bg-primary/5 shadow-[0_0_24px_rgba(242,120,92,0.08)]">
            <div className="absolute inset-1.5 rounded-full border border-dashed border-primary/30" />
            <div className="text-center z-10">
              <span className="font-display text-4xl font-bold text-primary text-glow block">
                {health.overallScore}
              </span>
              <span className="font-mono-tight text-[9px] text-muted-foreground uppercase tracking-widest">
                Health Index
              </span>
            </div>
          </div>

          {/* Detailed Progress breakdown */}
          <div className="w-full space-y-3 pt-2">
            {[
              { label: "Metadata Catalog Coverage", pct: health.metadataCoverage },
              { label: "Lineage Path Coverage", pct: health.lineageCoverage },
              { label: "Governance Readiness Scale", pct: health.governanceReadiness },
              { label: "Documentation Quality", pct: health.documentationQuality },
            ].map((metric, i) => (
              <div key={i} className="space-y-1 text-xs">
                <div className="flex justify-between text-[10px] font-mono-tight text-muted-foreground">
                  <span>{metric.label}</span>
                  <span className="font-bold text-foreground">{metric.pct}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-border/40 overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.pct}%` }}
                    transition={{ duration: 0.8, delay: i * 0.05 }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* AI Recommendations panel */}
        <div className="space-y-4">
          <div className="border-b border-border/20 pb-3 flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-foreground">
              Corporate AI Governance Recommendations
            </h3>
            <span className="font-mono-tight text-[9px] uppercase tracking-wider text-muted-foreground">
              {EXECUTIVE_RECOMMENDATIONS.length} Critical Actions Pending
            </span>
          </div>

          <div className="space-y-3.5">
            {EXECUTIVE_RECOMMENDATIONS.map((rec) => {
              const isCritical = rec.impact === "critical";
              const isHigh = rec.impact === "high";

              return (
                <GlassCard
                  key={rec.id}
                  className={`p-4 border transition-all hover:scale-[1.01] ${
                    isCritical
                      ? "border-red-500/25 bg-red-500/5 hover:border-red-500/40"
                      : isHigh
                        ? "border-orange-500/25 bg-orange-500/5 hover:border-orange-500/40"
                        : "border-border/60 bg-card/45 hover:border-primary/20"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Badge */}
                    <div className="shrink-0 mt-0.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono-tight text-[8px] uppercase font-bold tracking-widest ${
                          isCritical
                            ? "border-red-500/30 bg-red-500/10 text-red-500"
                            : isHigh
                              ? "border-orange-500/30 bg-orange-500/10 text-orange-500"
                              : "border-border bg-secondary/80 text-muted-foreground"
                        }`}
                      >
                        {rec.impact} impact
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-foreground leading-tight">
                        {rec.title}
                      </h4>
                      <p className="mt-1.5 text-[11px] text-muted-foreground/90 leading-relaxed font-sans font-normal">
                        {rec.description}
                      </p>

                      {/* Target Dataset footer */}
                      <div className="mt-2.5 flex items-center gap-1.5 text-[9px] font-mono-tight text-muted-foreground">
                        <Database className="h-3 w-3 shrink-0" />
                        Target: <span className="text-foreground font-bold">{rec.dataset}</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
