import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { isDemoModeActive, enableDemoMode, disableDemoMode } from "../lib/demoModeService";
import {
  UploadCloud, Brain, Play, FileSpreadsheet, Database, ShieldAlert, MessageSquare,
  AlertTriangle, CheckCircle, ArrowRight, ShieldCheck, Activity, BarChart3, HelpCircle
} from "lucide-react";
import { GlassCard, SectionTitle } from "../components/ui-bits";
import { useWorkspace } from "../lib/WorkspaceContext";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const navigate = useNavigate();
  const {
    hasDataset,
    activeDatasetName,
    healthScore,
    metadataGenerated,
    piiCount,
    lastScanTime,
    refreshWorkspace,
  } = useWorkspace();

  const onboardingSteps = [
    {
      step: "01",
      title: "Upload Dataset",
      desc: "Connect CSV, Excel, Parquet, or enterprise databases in seconds.",
      icon: UploadCloud,
    },
    {
      step: "02",
      title: "Generate Metadata",
      desc: "AI-generated database definitions, null stats, and unique constraints.",
      icon: Brain,
    },
    {
      step: "03",
      title: "Explore Dictionary",
      desc: "Search, filter, and inspect detailed visual column-level data cards.",
      icon: FileSpreadsheet,
    },
    {
      step: "04",
      title: "Ask AI Questions",
      desc: "Query tables and metadata in plain language with cited source maps.",
      icon: MessageSquare,
    },
    {
      step: "05",
      title: "Review Governance",
      desc: "Tag PII categories, compute risk indices, and audit compliance metrics.",
      icon: ShieldAlert,
    },
  ];

  const handleLoadDemo = () => {
    enableDemoMode();
    refreshWorkspace();
  };

  // State 1: Welcome Dashboard (No dataset connected)
  if (!hasDataset) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-12 select-none">
        {/* Title & Introduction */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-[10px] font-mono-tight text-primary uppercase tracking-widest">
            <Brain className="h-3.5 w-3.5 animate-pulse" />
            <span>Intelligent Data Agent</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-foreground leading-none">
            Welcome to <span className="text-primary">SchemaSense.</span>
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The autonomous AI platform designed to map raw datasets to structured schema definitions, interactive data lineage flows, and corporate governance compliance gates.
          </p>
        </div>

        {/* Process Onboarding Journey Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {onboardingSteps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <GlassCard key={idx} className="p-5 flex flex-col justify-between border-border/40 hover:border-primary/20 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono-tight text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 rounded-md px-2 py-0.5">
                      {item.step}
                    </span>
                    <Icon className="h-4.5 w-4.5 text-muted-foreground/75" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground leading-snug">{item.title}</h4>
                  <p className="mt-1.5 text-[11px] text-muted-foreground leading-relaxed font-sans font-normal">
                    {item.desc}
                  </p>
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* Call to Actions Card */}
        <GlassCard className="p-8 border-primary/20 bg-primary/5 shadow-[0_12px_40px_rgba(242,120,92,0.05)] text-center relative overflow-hidden">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/10 to-transparent opacity-20 pointer-events-none" />
          <div className="max-w-md mx-auto space-y-6 relative z-10">
            <h3 className="font-display text-xl font-bold tracking-tight">Ready to map your catalog schemas?</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ingest your own files to verify columns and data parameters, or trigger Demo Mode to instantly populate active lineage nodes, conversation threads, and compliance audits.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                onClick={() => navigate({ to: "/data-sources" })}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold glow-lime transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <UploadCloud className="h-4 w-4" />
                Upload Dataset
              </button>
              <button
                onClick={handleLoadDemo}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border border-border bg-background hover:bg-secondary text-foreground px-6 py-3 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Play className="h-4 w-4 fill-current" />
                Load Demo Workspace
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  // State 2: Executive Summary Panel (Dataset active)
  return (
    <div className="max-w-5xl mx-auto space-y-8 select-none">
      
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-border/20">
        <div>
          <SectionTitle
            kicker={`Overview · ${activeDatasetName}`}
            title={<>Executive Summary <span className="text-primary">Dashboard.</span></>}
            sub="VP-level data dictionary health scores, catalog metadata coverage, access controls, and critical risk findings."
          />
        </div>
        <div className="flex-shrink-0 flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/chat" })}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground glow-lime transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <MessageSquare className="h-4 w-4" />
            Ask AI Questions
          </button>
        </div>
      </div>

      {/* Primary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Radial Health Gauge */}
        <GlassCard className="p-5 flex flex-col items-center justify-center border-primary/20 bg-primary/5 min-h-[140px] text-center">
          <div className="relative flex items-center justify-center h-20 w-20 rounded-full border border-primary/20 bg-primary/10 mb-2">
            <span className="font-display text-2xl font-black text-primary text-glow">{healthScore}</span>
          </div>
          <span className="text-[10px] font-mono-tight uppercase tracking-wider text-muted-foreground">Dataset Health</span>
        </GlassCard>

        {/* Metadata Coverage */}
        <GlassCard className="p-5 flex flex-col justify-between min-h-[140px] border-border/40">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[9px] font-mono-tight text-muted-foreground uppercase tracking-widest">Metadata Coverage</span>
            <FileSpreadsheet className="h-4 w-4 text-muted-foreground/60" />
          </div>
          <div>
            <span className="font-display text-3xl font-bold text-foreground">
              {metadataGenerated ? "95%" : "0%"}
            </span>
            <p className="text-[10px] text-muted-foreground/80 mt-1 leading-snug">
              {metadataGenerated ? "AI column audits completed" : "Awaiting AI profile run"}
            </p>
          </div>
        </GlassCard>

        {/* PII Columns */}
        <GlassCard className="p-5 flex flex-col justify-between min-h-[140px] border-border/40">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[9px] font-mono-tight text-muted-foreground uppercase tracking-widest">PII Vulnerability</span>
            <ShieldAlert className="h-4 w-4 text-red-500" />
          </div>
          <div>
            <span className={`font-display text-3xl font-bold ${piiCount > 0 ? "text-red-500" : "text-foreground"}`}>
              {piiCount}
            </span>
            <p className="text-[10px] text-muted-foreground/80 mt-1 leading-snug">
              {piiCount > 0 ? "Sensitive columns flagged" : "No high-risk PII detected"}
            </p>
          </div>
        </GlassCard>

        {/* Governance Readiness */}
        <GlassCard className="p-5 flex flex-col justify-between min-h-[140px] border-border/40">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[9px] font-mono-tight text-muted-foreground uppercase tracking-widest">Compliance Score</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div>
            <span className="font-display text-3xl font-bold text-emerald-500">
              {metadataGenerated ? "82%" : "10%"}
            </span>
            <p className="text-[10px] text-muted-foreground/80 mt-1 leading-snug">
              {metadataGenerated ? "SOC2 & GDPR auditing complete" : "Awaiting data audit"}
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Main Panel Content (Key Findings & Recommendations) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
        
        {/* Left: AI Findings Feed */}
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border/20 pb-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Brain className="h-4.5 w-4.5 text-primary" />
              Top AI Findings
            </h3>
            <span className="text-[9px] font-mono-tight text-muted-foreground/60 uppercase tracking-widest">
              Scan completed {lastScanTime}
            </span>
          </div>

          <div className="space-y-3">
            {/* Finding 1 */}
            <div className="flex items-start gap-3 p-3 rounded-xl border border-red-500/15 bg-red-500/5 hover:bg-red-500/10 transition-colors cursor-pointer" onClick={() => navigate({ to: "/governance" })}>
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-red-500/20 bg-red-500/10 text-red-500 font-bold text-[10px] mt-0.5">
                ⚠
              </span>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-foreground">Sensitive PII columns detected</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Columns <strong>email</strong> and <strong>billing_zip</strong> contain sensitive client identifiers. Unmasked records should be hashed in staging tables.
                </p>
              </div>
            </div>

            {/* Finding 2 */}
            <div className="flex items-start gap-3 p-3 rounded-xl border border-amber-500/15 bg-amber-500/5 hover:bg-amber-500/10 transition-colors cursor-pointer" onClick={() => navigate({ to: "/quality" })}>
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-amber-500/20 bg-amber-500/10 text-amber-500 font-bold text-[10px] mt-0.5">
                ⚠
              </span>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-foreground">Schema drift diagnostics warning</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Ingestion stream detected unannounced column deletion <strong>discount_code</strong> upstream in model mappings.
                </p>
              </div>
            </div>

            {/* Finding 3 */}
            <div className="flex items-start gap-3 p-3 rounded-xl border border-emerald-500/15 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors cursor-pointer" onClick={() => navigate({ to: "/dictionary" })}>
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 font-bold text-[10px] mt-0.5">
                ✓
              </span>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-foreground">Data profiling complete</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Automated null checks, data type inferences, and primary keys successfully generated for dataset.
                </p>
              </div>
            </div>


          </div>
        </GlassCard>

        {/* Right: Quick Actions Navigation */}
        <div className="space-y-5">
          <GlassCard className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-primary" />
              Explore Platform
            </h3>
            
            <div className="flex flex-col gap-2.5">
              {[
                { label: "Data Dictionary", desc: "Profile schemas & data formats", to: "/dictionary", icon: FileSpreadsheet },
                { label: "Governance Center", desc: "Manage PII risk & SOC2 constraints", to: "/governance", icon: ShieldAlert },
                { label: "Data Sources Registry", desc: "Add CSVs, DBs, or sync warehouses", to: "/data-sources", icon: Database },
              ].map((act, idx) => {
                const Icon = act.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => navigate({ to: act.to })}
                    className="flex items-center justify-between p-3 rounded-xl border border-border/40 hover:border-primary/20 bg-secondary/5 hover:bg-secondary/15 transition-all text-left w-full cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-background border border-border/60 rounded-lg text-muted-foreground group-hover:text-primary group-hover:border-primary/20 transition-colors">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{act.label}</span>
                        <span className="text-[9px] text-muted-foreground mt-0.5">{act.desc}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </button>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
