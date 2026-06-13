import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { 
  Shield, Search, Filter, AlertTriangle, ShieldCheck, Tag, Plus, Check, Trash2, Database, 
  BookOpen, FileDown, ChevronDown, ChevronUp, User, Clock, ArrowUpRight, CheckCircle2, HelpCircle 
} from "lucide-react";
import { GlassCard, SectionTitle } from "@/components/ui-bits";
import { EmptyState } from "@/components/EmptyState";
import { 
  GovernanceAsset, 
  AIDataCategory,
  getBusinessMeaning,
  getGovernanceCategory,
  getClassificationLabel,
  getComplianceNotes,
  getSuggestedUsage
} from "@/lib/governanceService";
import { motion, AnimatePresence } from "motion/react";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { enableDemoMode } from "@/lib/demoModeService";
import { toast } from "sonner";

export const Route = createFileRoute("/governance")({
  head: () => ({
    meta: [
      { title: "AI Business Metadata Catalog · SchemaSense" },
      { name: "description", content: "AI-powered metadata intelligence, logical business glossaries, schema understandings, and governance controls." },
    ],
  }),
  component: GovernanceComponent,
});

function GovernanceComponent() {
  const { hasDataset, activeDatasetName, columns: wsColumns, refreshWorkspace } = useWorkspace();
  const [assets, setAssets] = useState<GovernanceAsset[]>([]);
  const [query, setQuery] = useState("");
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>("All");
  
  // Bulk tagging state
  const [selectedColumns, setSelectedColumns] = useState<Record<string, boolean>>({});
  
  // Row expansion state
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  
  // Active Tab
  const [activeTab, setActiveTab] = useState<"catalog" | "glossary">("catalog");

  useEffect(() => {
    if (!hasDataset) return;

    try {
      const savedGov = localStorage.getItem("schema_sense_governance_assets");
      let parsedGov = null;
      if (savedGov) {
        try {
          const parsed = JSON.parse(savedGov);
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsedGov = parsed;
          }
        } catch (_) {}
      }

      // Check if saved assets exist and contain the updated metadata structure
      if (parsedGov && parsedGov.length > 0 && parsedGov.every((a: any) => wsColumns.some((col) => col.name === a.columnName) && 'governanceCategory' in a)) {
        setAssets(parsedGov);
      } else {
        const newAssets: GovernanceAsset[] = wsColumns.map((col) => {
          const defaults = col.name.toLowerCase().includes("email") ? ["PII", "GDPR"] : col.name.toLowerCase().includes("bank") ? ["GLBA", "PCI-DSS"] : ["Internal"];
          return {
            columnName: col.name,
            dataType: col.type,
            tags: defaults,
            businessMeaning: getBusinessMeaning(col.name),
            governanceCategory: getGovernanceCategory(col.name),
            classification: getClassificationLabel(col.name),
            complianceNotes: getComplianceNotes(col.name),
            suggestedUsage: getSuggestedUsage(col.name),
            confidence: Math.floor(Math.random() * 15) + 82,
            owner: col.name.toLowerCase().includes("email") ? "Security Ops" : col.name.toLowerCase().includes("revenue") ? "Finance Systems" : "Data Platform Team",
            lastUpdated: new Date().toISOString().split("T")[0],
          };
        });
        setAssets(newAssets);
        localStorage.setItem("schema_sense_governance_assets", JSON.stringify(newAssets));
      }
    } catch (_) {}
  }, [hasDataset, activeDatasetName, wsColumns]);

  const saveAssetsState = (updated: GovernanceAsset[]) => {
    setAssets(updated);
    try {
      localStorage.setItem("schema_sense_governance_assets", JSON.stringify(updated));
    } catch (_) {}
  };

  // Bulk tag actions
  const handleBulkAddTag = (tag: string) => {
    const updated = assets.map((asset) => {
      if (selectedColumns[asset.columnName]) {
        const tags = asset.tags.includes(tag) ? asset.tags : [...asset.tags, tag];
        return { ...asset, tags };
      }
      return asset;
    });

    saveAssetsState(updated);
    setSelectedColumns({});
    toast.success(`Successfully added compliance tag "${tag}" to selected columns.`);
  };

  const handleBulkClearTags = () => {
    const updated = assets.map((asset) => {
      if (selectedColumns[asset.columnName]) {
        return { ...asset, tags: ["Internal"] };
      }
      return asset;
    });

    saveAssetsState(updated);
    setSelectedColumns({});
    toast.success("Successfully reset compliance tags for selected columns.");
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

  const toggleRowExpansion = (colName: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [colName]: !prev[colName],
    }));
  };

  const handleExportGlossary = () => {
    const glossary = assets.map(asset => ({
      term: asset.columnName.replace(/_/g, " ").toUpperCase(),
      logical_column: asset.columnName,
      definition: asset.businessMeaning,
      data_type: asset.dataType,
      ai_data_category: asset.governanceCategory,
      classification: asset.classification,
      suggested_usage: asset.suggestedUsage,
      compliance_notes: asset.complianceNotes,
      tags: asset.tags,
      owner: asset.owner || "Data Platform Team",
      last_updated: asset.lastUpdated || new Date().toISOString().split("T")[0],
    }));
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(glossary, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${(activeDatasetName || "catalog").replace('.csv', '')}_metadata_glossary.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("AI Business Glossary exported successfully!");
  };

  // Filter & Search mapping
  const filtered = (assets || []).filter((asset) => {
    const term = query.toLowerCase();
    const matchSearch = 
      asset.columnName.toLowerCase().includes(term) || 
      asset.businessMeaning.toLowerCase().includes(term) ||
      asset.classification.toLowerCase().includes(term) ||
      asset.governanceCategory.toLowerCase().includes(term);
    const matchTag = selectedTagFilter === "All" || asset.governanceCategory === selectedTagFilter;
    return matchSearch && matchTag;
  });

  const selectedCount = Object.values(selectedColumns).filter(Boolean).length;

  // Compute stats metrics dynamically
  const totalAssetsMapped = wsColumns.length;
  const governedCount = assets.length;
  const metadataCoverage = assets.length > 0 ? "100.0%" : "0.0%";
  const piiCount = assets.filter(a => a.governanceCategory === "PII").length;

  // 1. Show empty state if no dataset is uploaded
  if (!hasDataset) {
    return (
      <div className="py-12 space-y-8">
        <SectionTitle
          kicker="Business Metadata Catalog"
          title={<>AI Business Metadata <span className="text-primary">Catalog.</span></>}
          sub="Automatically interpret database schemas, generate metadata understandings, and catalogue glossary definitions."
        />
        <div className="mt-8">
          <EmptyState
            title="No Dataset Connected"
            description="Connect a dataset to start generating AI Business Glossaries, mapping metadata coverage, and auditing sensitive resources."
            features={[
              "AI Business Definition extraction",
              "Dynamic metadata coverage scorecards",
              "Automated PII detection audits",
              "Exportable corporate Business Glossary",
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <SectionTitle
          kicker={`Data Catalog · ${activeDatasetName || "Dataset"}`}
          title={<>Business Metadata <span className="text-primary">Catalog.</span></>}
          sub="Examine automatic schema semantic translations, audit PII attributes, and sync your corporate glossary definitions."
        />
        
        {/* Export Actions */}
        <div className="flex items-center gap-3 self-start md:self-center">
          <button
            onClick={handleExportGlossary}
            className="flex items-center gap-2 rounded-full border border-border/80 bg-secondary/50 hover:bg-secondary hover:text-foreground px-4 py-2.5 text-xs font-semibold text-muted-foreground transition-all cursor-pointer"
          >
            <FileDown className="h-4 w-4" />
            <span>Export Metadata</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-border/20 gap-6">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`pb-3 text-xs font-semibold font-mono-tight uppercase tracking-wider transition-colors relative cursor-pointer ${
            activeTab === "catalog" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>Catalog Inventory</span>
          {activeTab === "catalog" && (
            <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("glossary")}
          className={`pb-3 text-xs font-semibold font-mono-tight uppercase tracking-wider transition-colors relative cursor-pointer ${
            activeTab === "glossary" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            <span>AI Business Glossary</span>
          </span>
          {activeTab === "glossary" && (
            <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {activeTab === "catalog" ? (
        <>
          {/* ── Section 1: Enterprise Catalog Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Metadata Coverage */}
            <GlassCard className="p-4 border-border/40 relative overflow-hidden flex flex-col justify-between min-h-[100px]">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-primary/20" />
              <div className="text-muted-foreground font-mono-tight text-[10px] uppercase tracking-wider mb-2">
                Metadata Coverage
              </div>
              <div>
                <h4 className="text-2xl font-bold text-foreground">{metadataCoverage}</h4>
                <p className="mt-1 text-[10px] text-muted-foreground">All attributes assigned definitions</p>
              </div>
            </GlassCard>

            {/* Cataloged Assets */}
            <GlassCard className="p-4 border-border/40 relative overflow-hidden flex flex-col justify-between min-h-[100px]">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-primary/20" />
              <div className="text-muted-foreground font-mono-tight text-[10px] uppercase tracking-wider mb-2">
                Governed Assets
              </div>
              <div>
                <h4 className="text-2xl font-bold text-foreground">{governedCount} / {totalAssetsMapped}</h4>
                <p className="mt-1 text-[10px] text-muted-foreground">Active schema column resources</p>
              </div>
            </GlassCard>

            {/* PII Detection Audit */}
            <GlassCard className="p-4 border-amber-500/20 bg-amber-500/5 relative overflow-hidden flex flex-col justify-between min-h-[100px]">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-amber-500/30" />
              <div className="text-amber-500 font-mono-tight text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" />
                <span>PII Detection Audit</span>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-foreground">{piiCount} Field{piiCount !== 1 ? 's' : ''}</h4>
                <p className="mt-1 text-[10px] text-muted-foreground">PII triggers identified and classified</p>
              </div>
            </GlassCard>

            {/* Glossary Synced */}
            <GlassCard className="p-4 border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden flex flex-col justify-between min-h-[100px]">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-emerald-500/30" />
              <div className="text-emerald-500 font-mono-tight text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>AI Glossary Synced</span>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-foreground">{assets.length} Terms</h4>
                <p className="mt-1 text-[10px] text-muted-foreground">Glossary synchronizations matching schemas</p>
              </div>
            </GlassCard>

          </div>

          {/* ── Section 2: Search & Filter Toolbar ── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/20 pb-4">
            {/* Search */}
            <div className="flex-1 max-w-md flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/60 px-3.5 py-2.5 backdrop-blur shadow-sm">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search catalog fields, categories, classifications..."
                className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground/60 text-foreground"
              />
            </div>

            {/* Filter chips */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              {["All", "Business Identifier", "Financial Data", "Operational Data", "Organizational Data", "Reference Data", "Sensitive Data", "PII", "Public Data"].map((tag) => (
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

          {/* ── Section 3: Data Catalog Directory ── */}
          <GlassCard className="overflow-hidden border border-border/40 bg-card/30">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 border-b border-border/60 px-5 py-3 font-mono-tight text-[9px] uppercase tracking-widest text-muted-foreground select-none">
              <div className="col-span-1 flex items-center justify-center">
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={filtered.length > 0 && filtered.every((a) => selectedColumns[a.columnName])}
                  className="cursor-pointer"
                />
              </div>
              <div className="col-span-3">Attribute & Classification</div>
              <div className="col-span-2 text-center">AI Data Category</div>
              <div className="col-span-4">AI Business Meaning</div>
              <div className="col-span-2 text-right">Custodian / Owner</div>
            </div>

            {/* Table Rows */}
            <ul className="divide-y divide-border/20">
              {filtered.map((asset) => {
                const isChecked = !!selectedColumns[asset.columnName];
                const isExpanded = !!expandedRows[asset.columnName];
                
                return (
                  <React.Fragment key={asset.columnName}>
                    <li
                      onClick={() => toggleRowExpansion(asset.columnName)}
                      className={`grid grid-cols-12 gap-4 items-center px-5 py-3.5 text-xs transition-colors cursor-pointer select-none ${
                        isChecked ? "bg-primary/5" : "hover:bg-secondary/15"
                      }`}
                    >
                      {/* Checkbox (Prevent row expansion when clicking checkbox) */}
                      <div 
                        className="col-span-1 flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectColumn(asset.columnName)}
                          className="cursor-pointer"
                        />
                      </div>

                      {/* Attribute Name & Specific Classification */}
                      <div className="col-span-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono-tight font-bold text-foreground truncate">{asset.columnName}</span>
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          )}
                        </div>
                        <span className="text-[9px] text-primary/80 font-mono-tight uppercase flex items-center gap-1 mt-0.5">
                          <Tag className="h-2.5 w-2.5" /> Class: {asset.classification}
                        </span>
                      </div>

                      {/* AI Data Category (Badges) */}
                      <div className="col-span-2 text-center font-mono-tight">
                        <span className={`px-2 py-0.5 rounded border text-[9px] font-semibold uppercase tracking-wider ${
                          asset.governanceCategory === "PII" || asset.governanceCategory === "Sensitive Data"
                            ? "border-red-500/20 bg-red-500/10 text-red-500"
                            : asset.governanceCategory === "Financial Data"
                            ? "border-amber-500/20 bg-amber-500/10 text-amber-500"
                            : asset.governanceCategory === "Business Identifier"
                            ? "border-blue-500/20 bg-blue-500/10 text-blue-500"
                            : "border-border bg-secondary/50 text-muted-foreground"
                        }`}>
                          {asset.governanceCategory}
                        </span>
                      </div>

                      {/* AI Business Meaning */}
                      <div className="col-span-4 pr-4 relative group">
                        <div className="truncate text-muted-foreground" title={asset.businessMeaning}>
                          {asset.businessMeaning}
                        </div>
                        {/* Hover mini-tooltip */}
                        <div className="absolute left-0 top-6 hidden group-hover:block z-30 bg-popover text-popover-foreground border border-border p-2.5 rounded-xl text-[10px] shadow-lg max-w-xs leading-normal">
                          <div className="font-semibold mb-1">Business Meaning:</div>
                          {asset.businessMeaning}
                        </div>
                      </div>

                      {/* Custodian / Owner */}
                      <div className="col-span-2 text-right">
                        <span className="font-mono-tight text-[10px] text-foreground font-semibold">
                          {asset.owner || "Data Platform Team"}
                        </span>
                      </div>
                    </li>

                    {/* Expandable row detail card */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.li
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="col-span-12 overflow-hidden bg-secondary/10 border-t border-b border-border/10 px-8 py-5 text-xs text-foreground/80 leading-relaxed space-y-4"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-8">
                            {/* Definition details */}
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <h5 className="font-mono-tight text-[9px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                                  <span>AI Glossary Definition</span>
                                </h5>
                                <p className="text-foreground text-sm font-medium leading-relaxed bg-background/40 p-3.5 rounded-xl border border-border/40">
                                  {asset.businessMeaning}
                                </p>
                              </div>
                              
                              <div className="space-y-2">
                                <h5 className="font-mono-tight text-[9px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                  <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
                                  <span>Suggested Usage</span>
                                </h5>
                                <p className="text-muted-foreground text-xs leading-relaxed bg-background/25 p-3 rounded-lg border border-border/20">
                                  {asset.suggestedUsage}
                                </p>
                              </div>
                            </div>

                            {/* Governance metadata and references */}
                            <div className="space-y-4 border-l border-border/20 pl-6">
                              <div>
                                <h5 className="font-mono-tight text-[9px] uppercase tracking-wider text-muted-foreground mb-1.5">Governance Classification</h5>
                                <div className="space-y-1 font-mono-tight text-[10px]">
                                  <div>Category: <span className="text-foreground font-semibold">{asset.governanceCategory}</span></div>
                                  <div>Logical Subclass: <span className="text-primary font-semibold">{asset.classification}</span></div>
                                </div>
                              </div>

                              <div>
                                <h5 className="font-mono-tight text-[9px] uppercase tracking-wider text-muted-foreground mb-1.5">Compliance Notes</h5>
                                <p className="text-[10px] text-muted-foreground/80 leading-relaxed bg-background/20 p-2.5 rounded border border-border/20">
                                  {asset.complianceNotes}
                                </p>
                              </div>

                              <div>
                                <h5 className="font-mono-tight text-[9px] uppercase tracking-wider text-muted-foreground mb-1">Downstream Mappings & Custodian</h5>
                                <div className="space-y-1 text-[10px] text-muted-foreground">
                                  <div>Asset Owner: <span className="text-foreground">{asset.owner}</span></div>
                                  <div>Last Scan: <span className="text-foreground">{asset.lastUpdated}</span></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.li>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })}
              {filtered.length === 0 && (
                <li className="py-12 text-center text-sm text-muted-foreground">
                  No catalog items match your search.
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
                className="fixed bottom-6 left-[50%] translate-x-[-50%] z-45 w-full max-w-xl px-4 pointer-events-none"
              >
                <div className="border border-primary/20 bg-background/95 shadow-2xl backdrop-blur rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pointer-events-auto shadow-[0_12px_40px_rgba(242,120,92,0.12)]">
                  <div className="flex items-center gap-2 text-xs font-mono-tight text-foreground font-semibold">
                    <Tag className="h-4 w-4 text-primary animate-pulse" />
                    <span>Catalog Action: {selectedCount} Fields selected</span>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap items-center">
                    {/* Tag Buttons */}
                    {["PII", "Sensitive Data", "Financial Data", "Operational Data"].map((t) => (
                      <button
                        key={t}
                        onClick={() => handleBulkAddTag(t)}
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
        </>
      ) : (
        /* ── AI Business Glossary Tab Panel ── */
        <div className="space-y-6">
          {/* Glossary Intro Banner */}
          <GlassCard className="p-6 border-primary/20 bg-primary/5 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h4 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span>AI Business Glossary Sync</span>
              </h4>
              <p className="mt-1 text-xs text-muted-foreground leading-normal max-w-xl">
                Automatically maps database schema abbreviations to logical business concepts and standardized definitions. Useful for downstream audits, BI context mapping, and developer onboarding.
              </p>
            </div>
            <button
              onClick={handleExportGlossary}
              className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground glow-lime transition-transform hover:scale-[1.02] cursor-pointer shrink-0 shadow-lg shadow-primary/20"
            >
              <FileDown className="h-4 w-4" />
              <span>Download Glossary (JSON)</span>
            </button>
          </GlassCard>

          {/* Search bar specifically for glossary definitions */}
          <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/60 px-3.5 py-2.5 backdrop-blur shadow-sm max-w-md">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search terms, definitions..."
              className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground/60 text-foreground"
            />
          </div>

          {/* Glossary Term Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((asset) => {
              const businessTerm = asset.columnName.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
              return (
                <GlassCard key={asset.columnName} className="p-5 border-border/40 bg-card/20 hover:border-primary/20 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between border-b border-border/20 pb-2.5 mb-3">
                      <div>
                        <h4 className="font-display text-sm font-bold text-foreground">{businessTerm}</h4>
                        <span className="font-mono text-[9px] text-muted-foreground mt-0.5 block">
                          Logical Column: {asset.columnName}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded border border-border/40 bg-secondary/50 text-[9px] font-mono-tight text-primary font-semibold uppercase tracking-wider">
                        {asset.governanceCategory}
                      </span>
                    </div>
                    
                    <div className="space-y-3 mt-3">
                      <p className="text-xs text-foreground/90 leading-relaxed font-sans">
                        {asset.businessMeaning}
                      </p>
                      
                      <div className="bg-background/30 p-2.5 rounded border border-border/20 text-[10px] text-muted-foreground leading-normal">
                        <span className="font-semibold text-foreground/80 block mb-0.5">Suggested Usage:</span>
                        {asset.suggestedUsage}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/10 pt-3 mt-4 text-[9px] font-mono-tight text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" /> Owner: {asset.owner || "Data Platform Team"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Updated: {asset.lastUpdated}
                    </span>
                  </div>
                </GlassCard>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-2 text-center py-12 text-sm text-muted-foreground border border-dashed border-border/40 rounded-3xl bg-secondary/5">
                No terms found matching your query.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
