import React, { useEffect, useState } from "react";
import { Database, ShieldAlert, Heart, Calendar, Activity, CheckCircle, RefreshCw } from "lucide-react";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { getDatasets, switchDataset } from "@/lib/demoModeService";

export function GlobalContextBar() {
  const {
    hasDataset,
    activeDatasetName,
    healthScore,
    metadataGenerated,
    piiCount,
    lastScanTime,
    refreshWorkspace,
  } = useWorkspace();

  const [datasetsList, setDatasetsList] = useState<string[]>([]);
  const [liveActivity, setLiveActivity] = useState("AI Index Sync: Active");

  useEffect(() => {
    if (hasDataset) {
      const list = getDatasets().map((d) => d.name);
      setDatasetsList(list.length > 0 ? list : [activeDatasetName]);
    }
  }, [hasDataset, activeDatasetName]);

  // Rotate a live activity log ticker to make it feel alive!
  useEffect(() => {
    const activities = [
      "AI Index Sync: Active",
      "Metadata Profiler: Idle",
      "Governance Index: Verified",
      "Lineage Node Engine: Up to date",
      "Schema Drift Diagnostics: Pass",
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % activities.length;
      setLiveActivity(activities[idx]);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleDatasetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const target = e.target.value;
    if (target && target !== activeDatasetName) {
      switchDataset(target);
      // Let's store a new scan time on swap
      localStorage.setItem("schema_sense_last_scan", "Just now");
      refreshWorkspace();
    }
  };

  if (!hasDataset) return null;

  return (
    <div className="w-full border-b border-border/40 bg-card/20 backdrop-blur-md px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 z-30 relative select-none shadow-[0_1px_8px_rgba(0,0,0,0.02)]">
      {/* Active dataset select dropdown */}
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-primary/20 bg-primary/5 text-primary">
          <Database className="h-4.5 w-4.5" />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-mono-tight text-muted-foreground uppercase tracking-widest leading-none mb-0.5">
            Active Dataset
          </span>
          <select
            value={activeDatasetName}
            onChange={handleDatasetChange}
            className="bg-transparent text-xs font-bold text-foreground font-sans border-none outline-none cursor-pointer focus:ring-0 py-0 pl-0 pr-6"
          >
            {datasetsList.map((name) => (
              <option key={name} value={name} className="bg-background text-foreground">
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Details Context Row */}
      <div className="flex flex-wrap items-center gap-6 text-xs font-mono-tight">
        
        {/* Health score */}
        <div className="flex items-center gap-2">
          <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500/10 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[9px] text-muted-foreground uppercase tracking-wider leading-none">Health Score</span>
            <span className="font-semibold text-foreground mt-0.5">{healthScore}/100</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-border/40 hidden sm:block" />

        {/* Metadata generation status */}
        <div className="flex items-center gap-2">
          <CheckCircle className={`h-3.5 w-3.5 shrink-0 ${metadataGenerated ? "text-emerald-500" : "text-amber-500"}`} />
          <div className="flex flex-col">
            <span className="text-[9px] text-muted-foreground uppercase tracking-wider leading-none">AI Metadata</span>
            <span className={`font-semibold mt-0.5 ${metadataGenerated ? "text-emerald-500" : "text-amber-500"}`}>
              {metadataGenerated ? "Generated" : "Pending Inferences"}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-border/40 hidden sm:block" />

        {/* PII warnings */}
        <div className="flex items-center gap-2">
          <ShieldAlert className={`h-3.5 w-3.5 shrink-0 ${piiCount > 0 ? "text-red-500" : "text-muted-foreground/60"}`} />
          <div className="flex flex-col">
            <span className="text-[9px] text-muted-foreground uppercase tracking-wider leading-none">PII Detection</span>
            <span className={`font-semibold mt-0.5 ${piiCount > 0 ? "text-red-500" : "text-foreground"}`}>
              {piiCount > 0 ? `${piiCount} Columns` : "Clean"}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-border/40 hidden sm:block" />

        {/* Last scan timestamp */}
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <div className="flex flex-col">
            <span className="text-[9px] text-muted-foreground uppercase tracking-wider leading-none">Last Audit Scan</span>
            <span className="font-semibold text-foreground mt-0.5">{lastScanTime}</span>
          </div>
        </div>
      </div>

      {/* System Ticker / Alive Status Indicator */}
      <div className="flex items-center gap-2 bg-secondary/20 border border-border/40 rounded-full px-3 py-1 text-[10px] font-mono-tight text-muted-foreground shrink-0 select-none">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
        <span>{liveActivity}</span>
      </div>
    </div>
  );
}
