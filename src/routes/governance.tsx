import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import {
  Shield,
  Search,
  Filter,
  AlertTriangle,
  ShieldCheck,
  Tag,
  Plus,
  Check,
  Trash2,
  Database,
} from "lucide-react";
import { GlassCard, SectionTitle } from "@/components/ui-bits";
import { EmptyState } from "@/components/EmptyState";
import {
  GOVERNANCE_ASSETS,
  GovernanceAsset,
  GovernanceTag,
  getRiskColor,
} from "@/lib/governanceService";
import { motion, AnimatePresence } from "motion/react";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { enableDemoMode } from "@/lib/demoModeService";

export const Route = createFileRoute("/governance")({
  head: () => ({
    meta: [
      { title: "Governance Center · SchemaSense" },
      {
        name: "description",
        content:
          "Audit PII records, evaluate security risk scores, and manage compliance classifications.",
      },
    ],
  }),
  component: GovernanceComponent,
});

function GovernanceComponent() {
  const { hasDataset, refreshWorkspace } = useWorkspace();
  const [assets, setAssets] = useState<GovernanceAsset[]>([]);
  const [query, setQuery] = useState("");
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>("All");

  // Bulk tagging state
  const [selectedColumns, setSelectedColumns] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      // Load or seed governance assets
      const savedGov = localStorage.getItem("schema_sense_governance_assets");
      if (savedGov) {
        setAssets(JSON.parse(savedGov));
      } else {
        setAssets(GOVERNANCE_ASSETS);
        localStorage.setItem("schema_sense_governance_assets", JSON.stringify(GOVERNANCE_ASSETS));
      }
    } catch (err) {
      console.warn("Could not load governance assets:", err);
    }
  }, []);

  const saveAssetsState = (updated: GovernanceAsset[]) => {
    setAssets(updated);
    try {
      localStorage.setItem("schema_sense_governance_assets", JSON.stringify(updated));
    } catch (err) {
      console.warn("Could not save governance assets:", err);
    }
  };

  // Bulk tag actions
  const handleBulkAddTag = (tag: GovernanceTag) => {
    const updated = assets.map((asset) => {
      if (selectedColumns[asset.columnName]) {
        // Avoid duplicate tags
        const tags = asset.tags.includes(tag) ? asset.tags : [...asset.tags, tag];

        // Re-compute risk score if tagging as PII or Financial
        let riskScore = asset.riskScore;
        if (tag === "PII") riskScore = Math.max(90, riskScore);
        if (tag === "Restricted") riskScore = Math.max(70, riskScore);
        if (tag === "Financial") riskScore = Math.max(50, riskScore);

        return { ...asset, tags, riskScore };
      }
      return asset;
    });

    saveAssetsState(updated);
    setSelectedColumns({});
  };

  const handleBulkClearTags = () => {
    const updated = assets.map((asset) => {
      if (selectedColumns[asset.columnName]) {
        return { ...asset, tags: ["Internal"], riskScore: 10 };
      }
      return asset;
    });

    saveAssetsState(updated);
    setSelectedColumns({});
  };

  const toggleSelectColumn = (colName: string) => {
    setSelectedColumns((prev) => ({
      ...prev,
      [colName]: !prev[colName],
    }));
  };

  const toggleSelectAll = () => {
    const allSelected = filtered.every((a) => selectedColumns[a.columnName]);
    const nextState: Record<string, boolean> = {};
    if (!allSelected) {
      filtered.forEach((a) => {
        nextState[a.columnName] = true;
      });
    }
    setSelectedColumns(nextState);
  };

  // Filter & Search mapping
  const filtered = assets.filter((asset) => {
    const term = query.toLowerCase();
    const matchSearch =
      asset.columnName.toLowerCase().includes(term) ||
      asset.riskReason.toLowerCase().includes(term);
    const matchTag =
      selectedTagFilter === "All" || asset.tags.includes(selectedTagFilter as GovernanceTag);
    return matchSearch && matchTag;
  });

  const selectedCount = Object.values(selectedColumns).filter(Boolean).length;

  // 1. Show empty state if no dataset is uploaded
  if (!hasDataset) {
    return (
      <div className="py-12 space-y-8">
        <SectionTitle
          kicker="Governance"
          title={
            <>
              Data Governance <span className="text-primary">Center.</span>
            </>
          }
          sub="Identify sensitive fields, assign compliance tags, and evaluate column-level security metrics."
        />
        <div className="mt-8">
          <EmptyState
            title="No Dataset Connected"
            description="Upload a dataset to perform AI-powered governance categorization and audit regulatory risks."
            features={[
              "PII & financial category tagging",
              "GDPR, CCPA, and PCI-DSS compliance audits",
              "Column sensitivity rating parameters",
              "Access permission & usage log triggers",
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
        kicker="Governance Control"
        title={
          <>
            Governance <span className="text-primary">Intelligence.</span>
          </>
        }
        sub="Bulk-tag security classifications, audit PII triggers, and monitor compliance risks across data catalog columns."
      />

      {/* ── Section 1: AI Insights Command Center ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Critical Alerts */}
        <GlassCard className="p-4 border-red-500/25 bg-red-500/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-red-500/35" />
          <div className="flex items-center gap-2 text-red-500 font-mono-tight text-[10px] uppercase tracking-wider mb-2">
            <AlertTriangle className="h-4 w-4 animate-pulse" />
            <span>Critical Security Alerts</span>
          </div>
          <h4 className="text-sm font-bold text-foreground">Unmasked PII email field</h4>
          <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
            Standard customer emails are propagated downstream in dim_customers without
            cryptographic masking.
          </p>
        </GlassCard>

        {/* Quality Audit */}
        <GlassCard className="p-4 border-amber-500/25 bg-amber-500/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-amber-500/35" />
          <div className="flex items-center gap-2 text-amber-500 font-mono-tight text-[10px] uppercase tracking-wider mb-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Pending Compliance Reviews</span>
          </div>
          <h4 className="text-sm font-bold text-foreground">
            Missing financial metrics description
          </h4>
          <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
            Revenue tracking metrics are classified as restricted but lack formal usage
            descriptions.
          </p>
        </GlassCard>

        {/* Governed Coverage */}
        <GlassCard className="p-4 border-emerald-500/25 bg-emerald-500/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-emerald-500/35" />
          <div className="flex items-center gap-2 text-emerald-500 font-mono-tight text-[10px] uppercase tracking-wider mb-2">
            <ShieldCheck className="h-4 w-4" />
            <span>Governance Coverage</span>
          </div>
          <h4 className="text-sm font-bold text-foreground">100% Schema Assets Governed</h4>
          <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
            All catalog attributes successfully assigned to access groups. zero orphaned metrics.
          </p>
        </GlassCard>
      </div>

      {/* ── Section 2: Search & Filter Toolbar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/20 pb-4">
        {/* Search */}
        <div className="flex-1 max-w-md flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/60 px-3.5 py-2 backdrop-blur shadow-sm">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search columns, risk comments..."
            className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground/60 text-foreground"
          />
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          {["All", "PII", "Sensitive", "Financial", "Restricted", "Public"].map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTagFilter(tag)}
              className={`px-2.5 py-1 rounded-full border font-mono-tight text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                selectedTagFilter === tag
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* ── Section 3: Governance Asset List ── */}
      <GlassCard className="overflow-hidden border border-border/40 bg-card/30">
        {/* Header row */}
        <div className="grid grid-cols-12 gap-4 border-b border-border/60 px-5 py-3 font-mono-tight text-[9px] uppercase tracking-widest text-muted-foreground">
          <div className="col-span-1 flex items-center justify-center">
            <input
              type="checkbox"
              onChange={toggleSelectAll}
              checked={filtered.length > 0 && filtered.every((a) => selectedColumns[a.columnName])}
              className="cursor-pointer"
            />
          </div>
          <div className="col-span-3">Column</div>
          <div className="col-span-2 text-center">Type</div>
          <div className="col-span-4">Governance tags</div>
          <div className="col-span-2 text-right">Risk Factor</div>
        </div>

        {/* Asset Rows */}
        <ul className="divide-y divide-border/20">
          {filtered.map((asset) => {
            const isChecked = !!selectedColumns[asset.columnName];
            return (
              <li
                key={asset.columnName}
                className={`grid grid-cols-12 gap-4 items-center px-5 py-3.5 text-xs transition-colors ${
                  isChecked ? "bg-primary/5" : "hover:bg-secondary/20"
                }`}
              >
                {/* Checkbox */}
                <div className="col-span-1 flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleSelectColumn(asset.columnName)}
                    className="cursor-pointer"
                  />
                </div>

                {/* Column details */}
                <div className="col-span-3">
                  <span className="font-mono-tight font-bold text-foreground block">
                    {asset.columnName}
                  </span>
                  {asset.piiType !== "None" && (
                    <span className="text-[9px] text-red-500 font-mono-tight uppercase flex items-center gap-1 mt-0.5">
                      <AlertTriangle className="h-3 w-3" /> PII Detected: {asset.piiType}
                    </span>
                  )}
                </div>

                {/* Data Type */}
                <div className="col-span-2 text-center font-mono-tight text-muted-foreground">
                  {asset.dataType}
                </div>

                {/* Tags */}
                <div className="col-span-4 flex flex-wrap gap-1.5">
                  {asset.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono-tight text-[9px] uppercase font-semibold ${
                        tag === "PII" || tag === "Sensitive"
                          ? "border-red-500/20 bg-red-500/10 text-red-500"
                          : tag === "Financial" || tag === "Restricted"
                            ? "border-amber-500/20 bg-amber-500/10 text-amber-500"
                            : "border-border bg-secondary/60 text-muted-foreground"
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Risk scoring */}
                <div className="col-span-2 text-right flex items-center justify-end gap-2">
                  <span className="text-muted-foreground font-mono-tight truncate max-w-[100px] text-[10px] hidden sm:block">
                    {asset.riskReason}
                  </span>
                  <span
                    className={`inline-flex items-center justify-center w-8 py-0.5 rounded font-mono-tight font-bold border ${getRiskColor(asset.riskScore)}`}
                  >
                    {asset.riskScore}
                  </span>
                </div>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="py-12 text-center text-sm text-muted-foreground">
              No governed columns match your criteria.
            </li>
          )}
        </ul>
      </GlassCard>

      {/* ── Section 4: Bulk Tagging Floating Action Bar ── */}
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-6 left-[50%] translate-x-[-50%] z-40 w-full max-w-xl px-4 pointer-events-none"
          >
            <div className="border border-primary/20 bg-background/95 shadow-2xl backdrop-blur rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pointer-events-auto shadow-[0_12px_40px_rgba(242,120,92,0.12)]">
              <div className="flex items-center gap-2 text-xs font-mono-tight text-foreground font-semibold">
                <Tag className="h-4 w-4 text-primary animate-pulse" />
                <span>Bulk Action: {selectedCount} Columns selected</span>
              </div>

              <div className="flex gap-2 flex-wrap items-center">
                {/* Tag Buttons */}
                {["PII", "Sensitive", "Financial", "Restricted"].map((t) => (
                  <button
                    key={t}
                    onClick={() => handleBulkAddTag(t as GovernanceTag)}
                    className="flex items-center gap-1 bg-secondary hover:bg-secondary-heavy border border-border px-2 py-1 rounded text-[10px] font-mono-tight uppercase text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Plus className="h-2.5 w-2.5" />
                    {t}
                  </button>
                ))}

                <button
                  onClick={handleBulkClearTags}
                  className="flex items-center gap-1 border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20 px-2 py-1 rounded text-[10px] font-mono-tight uppercase cursor-pointer"
                >
                  <Trash2 className="h-2.5 w-2.5" />
                  Reset
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
