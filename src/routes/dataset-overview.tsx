import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Database,
  Rows3,
  Columns3,
  ArrowRight,
  FileSpreadsheet,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { GlassCard, SectionTitle } from "@/components/ui-bits";
import { SmartSamplingBanner } from "@/components/SmartSamplingBanner";
import { motion } from "motion/react";
import { useWorkspace } from "@/lib/WorkspaceContext";

export const Route = createFileRoute("/dataset-overview")({
  head: () => ({
    meta: [
      { title: "Dataset Overview · SchemaSense" },
      { name: "description", content: "Review your uploaded dataset before generating AI metadata." },
    ],
  }),
  component: DatasetOverviewPage,
});

interface DatasetOverviewInfo {
  name: string;
  rows: string;
  columns: number;
  size: string;
  uploadDate: string;
}

function DatasetOverviewPage() {
  const navigate = useNavigate();
  const { columns, activeDatasetName, refreshWorkspace } = useWorkspace();
  const [overviewInfo, setOverviewInfo] = useState<DatasetOverviewInfo | null>(null);

  useEffect(() => {
    try {
      // Try to load recently uploaded dataset info
      const raw = localStorage.getItem("schema_sense_last_upload_overview");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          setOverviewInfo(parsed);
          return;
        }
      }
      // Fall back to inferring from workspace context
      if (activeDatasetName) {
        setOverviewInfo({
          name: activeDatasetName,
          rows: "Calculating...",
          columns: columns.length || 0,
          size: "Unknown",
          uploadDate: new Date().toISOString().split("T")[0],
        });
      }
    } catch (_) {}
  }, [activeDatasetName, columns]);

  const handleGenerateMetadata = () => {
    navigate({ to: "/dictionary" });
  };

  const handleBackToSources = () => {
    navigate({ to: "/data-sources" });
  };

  const info = overviewInfo || {
    name: activeDatasetName || "Unknown Dataset",
    rows: "—",
    columns: columns.length,
    size: "—",
    uploadDate: new Date().toISOString().split("T")[0],
  };

  const metaCards = [
    {
      label: "Dataset Name",
      value: info.name,
      icon: FileSpreadsheet,
      color: "text-primary",
      bg: "border-primary/20 bg-primary/5",
    },
    {
      label: "Row Count",
      value: info.rows,
      icon: Rows3,
      color: "text-emerald-500",
      bg: "border-emerald-500/20 bg-emerald-500/5",
    },
    {
      label: "Column Count",
      value: String(info.columns || columns.length),
      icon: Columns3,
      color: "text-blue-400",
      bg: "border-blue-400/20 bg-blue-400/5",
    },
    {
      label: "File Size",
      value: info.size,
      icon: Database,
      color: "text-amber-400",
      bg: "border-amber-400/20 bg-amber-400/5",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[10px] font-mono-tight text-emerald-500 uppercase tracking-widest">
          <CheckCircle2 className="h-4 w-4" />
          <span>Upload Successful</span>
        </div>
        <SectionTitle
          kicker="Dataset Ready"
          title={<>Dataset <span className="text-primary">Overview.</span></>}
          sub="Your dataset has been ingested. Review the summary below, then generate AI-powered metadata to unlock the full platform."
        />
      </div>

      {/* Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 px-5 py-3.5"
      >
        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">Analysis Readiness: <span className="text-emerald-500">Ready</span></p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Dataset ingested and indexed. AI metadata generation is available.</p>
        </div>
        <div className="ml-auto">
          <span className="font-mono-tight text-[9px] uppercase tracking-widest text-muted-foreground">Status</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[10px] font-mono-tight text-emerald-500 font-semibold">Active</span>
          </div>
        </div>
      </motion.div>

      {/* Dataset Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metaCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
            >
              <GlassCard className={`p-4 border ${card.bg} text-center`}>
                <Icon className={`h-5 w-5 ${card.color} mx-auto mb-2`} />
                <div className={`font-display text-lg font-bold ${card.color} truncate`}>
                  {card.value}
                </div>
                <div className="text-[9px] font-mono-tight text-muted-foreground uppercase tracking-wider mt-1">
                  {card.label}
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Smart Sampling Banner */}
      <SmartSamplingBanner rowCount={info.rows} samplePct={15} estimatedAccuracy={92} />

      {/* What happens next */}
      <GlassCard className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          What happens when you Generate Metadata?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: Database, label: "Analyzing Dataset", desc: "Schema structure profiling and type inference" },
            { icon: Columns3, label: "Detecting Data Types", desc: "UUID, timestamps, enums, decimals auto-tagged" },
            { icon: FileSpreadsheet, label: "Generating Definitions", desc: "AI-written column descriptions and meanings" },
            { icon: ShieldCheck, label: "Running Governance Scan", desc: "PII detection, GDPR, CCPA, SOC2 flags" },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl border border-border/30 bg-secondary/10">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/5 text-primary">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground">{item.label}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          onClick={handleGenerateMetadata}
          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-3 text-sm font-semibold glow-lime transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-[0_4px_20px_rgba(242,120,92,0.2)]"
        >
          <Sparkles className="h-4 w-4" />
          Generate Metadata
          <ArrowRight className="h-4 w-4" />
        </button>
        <button
          onClick={handleBackToSources}
          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border border-border bg-background hover:bg-secondary text-foreground px-6 py-3 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          Back to Data Sources
        </button>
      </div>
    </div>
  );
}
