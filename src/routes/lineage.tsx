import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Database, ArrowRight, X, GitBranch, Table2, Info, Network, 
  HelpCircle, CheckCircle2, ShieldAlert, ArrowUpRight, Activity, Cpu 
} from "lucide-react";
import { SectionTitle, GlassCard, Pill } from "@/components/ui-bits";
import { EmptyState } from "@/components/EmptyState";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { enableDemoMode } from "@/lib/demoModeService";

export const Route = createFileRoute("/lineage")({
  head: () => ({
    meta: [
      { title: "Enterprise Data Lineage · SchemaSense" },
      { name: "description", content: "AI-powered data flow mapping, pipeline dependencies auditing, and schema change downstream impact analysis." },
    ],
  }),
  component: Lineage,
});

// ─── Data models ───────────────────────────────────────────────────────────────
type Layer = "raw" | "staging" | "mart";

type NodeDef = {
  id: string;
  label: string;
  layer: Layer;
  cols?: string[];
  rowCount?: string;
  owner?: string;
  description?: string;
};

type EdgeDef = { 
  from: string; 
  to: string;
  label?: string; // column join-key
};

// ─── Layout constants ─────────────────────────────────────────────────────────
const NODE_W  = 175;
const NODE_H  = 72;
const COL_GAP = 240; // horizontal gap between layer centres
const ROW_GAP = 110; // vertical gap between nodes in the same layer

const LAYER_ORDER: Layer[] = ["raw", "staging", "mart"];

function buildLayout(nodes: NodeDef[], canvasW: number) {
  const byLayer: Record<Layer, NodeDef[]> = { raw: [], staging: [], mart: [] };
  nodes.forEach((n) => byLayer[n.layer].push(n));

  const totalLayers = 3;
  const usableW     = Math.max(canvasW, totalLayers * (NODE_W + COL_GAP));
  const colCentres  = LAYER_ORDER.map((_, i) => {
    const step = usableW / totalLayers;
    return step * i + step / 2;
  });

  const positions: Record<string, { x: number; y: number }> = {};

  LAYER_ORDER.forEach((layer, li) => {
    const group = byLayer[layer];
    const startY = 80; // top padding
    group.forEach((n, ni) => {
      positions[n.id] = {
        x: colCentres[li] - NODE_W / 2,
        y: startY + ni * ROW_GAP,
      };
    });
  });

  const allY = Object.values(positions).map((p) => p.y);
  const canvasH = allY.length > 0 ? Math.max(...allY) + NODE_H + 60 : 350;

  return { positions, colCentres, canvasH, usableW };
}

// ─── Layer configs ─────────────────────────────────────────────────────────────
const LAYER_META: Record<Layer, { label: string; colour: string; dim: string; badge: string }> = {
  raw:     { label: "RAW LAYER",     colour: "#6B9DF2", dim: "rgba(107,157,242,0.12)", badge: "bg-blue-500/15 text-blue-400 border-blue-500/30"   },
  staging: { label: "STAGING LAYER", colour: "#8B5CF6", dim: "rgba(139,92,246,0.12)",  badge: "bg-violet-500/15 text-violet-400 border-violet-500/30"},
  mart:    { label: "MART LAYER",    colour: "#F2785C", dim: "rgba(242,120,92,0.15)",   badge: "bg-primary/15 text-primary border-primary/30"       },
};

const CORAL = "#F2785C";
const DIM   = 0.25;

// SVG Bezier path helper
function bezierPath(x1: number, y1: number, x2: number, y2: number): string {
  const cx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
}

function Lineage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasW, setCanvasW] = useState(900);
  const [selected, setSelected] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  
  const { hasDataset, activeDatasetName, columns: wsColumns, refreshWorkspace } = useWorkspace();
  const [nodes, setNodes] = useState<NodeDef[]>([]);
  const [edges, setEdges] = useState<EdgeDef[]>([]);
  const [lineageGenerated, setLineageGenerated] = useState(false);

  const isCustomerDataset = useMemo(() => {
    const activeName = activeDatasetName || "invoice_processing.xlsx";
    const colNames = wsColumns.map((c) => c.name);
    return activeName.toLowerCase().includes("customer") || colNames.some(c => c.toLowerCase().includes("cust_id") || c.toLowerCase().includes("customer"));
  }, [activeDatasetName, wsColumns]);

  // Measure container width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setCanvasW(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [hasDataset, lineageGenerated]);

  // Load and auto-generate lineage nodes dynamically based on active file name
  useEffect(() => {
    if (!hasDataset || wsColumns.length === 0) return;

    try {
      const activeName = activeDatasetName || "invoice_processing.xlsx";
      const baseName = activeName.replace(/\.[^/.]+$/, "");
      const colNames = wsColumns.map((c) => c.name);

      // Determine dataset flavor (invoice vs customers vs general)
      
      let generatedNodes: NodeDef[] = [];
      let generatedEdges: EdgeDef[] = [];

      if (isCustomerDataset) {
        // Staging splitting
        const headerCols = colNames.filter(c => c.toLowerCase().includes("id") || c.toLowerCase().includes("country") || c.toLowerCase().includes("signup"));
        const detailCols = colNames.filter(c => !headerCols.includes(c));

        generatedNodes = [
          // RAW Layer
          {
            id: "raw_file",
            label: `raw.${baseName}`,
            layer: "raw",
            cols: colNames,
            rowCount: "250K",
            owner: "CRM Sales Ops",
            description: `Raw uploaded data ingested from CRM source file ${activeName}.`
          },
          {
            id: "source_crm",
            label: "Salesforce CRM Sync",
            layer: "raw",
            cols: ["account_id", "email", "company", "tier"],
            rowCount: "2.1M",
            owner: "Global Admin",
            description: "Accounts database master record synchronized from Salesforce API."
          },
          // STAGING Layer
          {
            id: "stg_header",
            label: "stg_customers_header",
            layer: "staging",
            cols: headerCols.length > 0 ? headerCols : colNames.slice(0, 3),
            rowCount: "250K",
            owner: "Data Engineering",
            description: "Standardized customer profile attributes and system mappings."
          },
          {
            id: "stg_details",
            label: "stg_customers_details",
            layer: "staging",
            cols: detailCols.length > 0 ? detailCols : colNames.slice(3),
            rowCount: "250K",
            owner: "Marketing Operations",
            description: "Cleaned demographic details, tiers, and user statuses."
          },
          // MART Layer
          {
            id: "dim_customers",
            label: "dim_customers",
            layer: "mart",
            cols: colNames,
            rowCount: "250K",
            owner: "Marketing Analytics",
            description: "Consolidated dimensional customer entity dataset powering executive BI models."
          },
          {
            id: "marketing_dashboard",
            label: "Marketing BI Dashboard",
            layer: "mart",
            cols: ["cust_id", "email", "plan_tier", "is_active"],
            rowCount: "Real-time",
            owner: "Growth Marketing",
            description: "Standard reports dashboard tracking customer cohorts and metrics."
          }
        ];

        generatedEdges = [
          { from: "raw_file", to: "stg_header", label: colNames.includes("cust_id") ? "cust_id" : colNames[0] || "cust_id" },
          { from: "raw_file", to: "stg_details", label: "cust_id" },
          { from: "source_crm", to: "stg_details", label: "email" },
          { from: "stg_header", to: "dim_customers", label: "country" },
          { from: "stg_details", to: "dim_customers", label: colNames.includes("plan_tier") ? "plan_tier" : "is_active" },
          { from: "dim_customers", to: "marketing_dashboard", label: "is_active" }
        ];
      } else {
        // Default Invoice/ERP flavor
        const headerCols = colNames.filter(c => c.toLowerCase().includes("id") || c.toLowerCase().includes("date") || c.toLowerCase().includes("type") || c.toLowerCase().includes("code") || c.toLowerCase().includes("vendor"));
        const itemCols = colNames.filter(c => !headerCols.includes(c));

        generatedNodes = [
          // RAW Layer
          {
            id: "raw_file",
            label: `raw.${baseName}`,
            layer: "raw",
            cols: colNames,
            rowCount: "24.5K",
            owner: "Accounts Payable",
            description: `Raw transactional data ingested from supplier invoice spreadsheet ${activeName}.`
          },
          {
            id: "source_erp",
            label: "ERP Purchase Ledger",
            layer: "raw",
            cols: ["vendor_code", "business_area", "vendor_name", "tax_id"],
            rowCount: "1.2M",
            owner: "ERP Finance Systems",
            description: "Enterprise purchase ledger accounting subsystem from SAP/ERP."
          },
          // STAGING Layer
          {
            id: "stg_header",
            label: `stg_${baseName}_header`,
            layer: "staging",
            cols: headerCols.length > 0 ? headerCols : colNames.slice(0, 4),
            rowCount: "24.5K",
            owner: "AP Operations Team",
            description: "Cleaned and validated transactional metadata, header attributes, and source references."
          },
          {
            id: "stg_items",
            label: `stg_${baseName}_items`,
            layer: "staging",
            cols: itemCols.length > 0 ? itemCols : colNames.slice(4),
            rowCount: "82.4K",
            owner: "Procurement Systems",
            description: "Standardized invoice line items, expensed cost centers, and ledger codes."
          },
          // MART Layer
          {
            id: "fact_invoice",
            label: `fact_${baseName}`,
            layer: "mart",
            cols: colNames,
            rowCount: "24.5K",
            owner: "Finance Business Intelligence",
            description: "Consolidated transaction fact table supporting auditing procedures and metrics."
          },
          {
            id: "finance_dashboard",
            label: "Finance BI Dashboard",
            layer: "mart",
            cols: ["vendor_code", "revenue_amount", "gl_account", "cost_center"],
            rowCount: "Real-time",
            owner: "CFO Analytics Group",
            description: "Executive Business Intelligence dashboard tracking costs, GL distributions, and cost centers."
          }
        ];

        generatedEdges = [
          { from: "raw_file", to: "stg_header", label: colNames.includes("invoice_id") ? "invoice_id" : colNames[0] || "invoice_id" },
          { from: "raw_file", to: "stg_items", label: colNames.includes("invoice_id") ? "invoice_id" : colNames[0] || "invoice_id" },
          { from: "source_erp", to: "stg_header", label: "vendor_code" },
          { from: "stg_header", to: "fact_invoice", label: "vendor_code" },
          { from: "stg_items", to: "fact_invoice", label: colNames.some(c => c.toLowerCase().includes("gl")) ? "gl_account" : "item_text" },
          { from: "fact_invoice", to: "finance_dashboard", label: colNames.some(c => c.toLowerCase().includes("cost")) ? "cost_center" : "revenue_amount" }
        ];
      }

      setNodes(generatedNodes);
      setEdges(generatedEdges);
      setLineageGenerated(true);
    } catch (_) {}
  }, [hasDataset, activeDatasetName, wsColumns]);

  const { positions, colCentres, canvasH, usableW } = buildLayout(nodes, canvasW);

  // Connection highlighting maps
  const connectedIds = useMemo((): Set<string> => {
    if (!selected) return new Set();
    const ids = new Set<string>([selected]);
    edges.forEach((e) => {
      if (e.from === selected) ids.add(e.to);
      if (e.to === selected) ids.add(e.from);
    });
    return ids;
  }, [selected, edges]);

  const isEdgeHighlighted = (e: EdgeDef) =>
    selected === null || e.from === selected || e.to === selected;

  const isNodeHighlighted = (id: string) =>
    selected === null || connectedIds.has(id);

  const selectedNode = nodes.find((n) => n.id === selected);

  // Dynamic analysis info for impact panel
  const selectedNodeRisk = useMemo(() => {
    if (!selectedNode) return "Low";
    const name = selectedNode.label.toLowerCase();
    if (name.includes("raw") || name.includes("event") || name.includes("pay")) return "Medium";
    if (name.includes("dashboard")) return "Low";
    if (selectedNode.cols?.some(c => c.toLowerCase().includes("email") || c.toLowerCase().includes("bank") || c.toLowerCase().includes("gl_"))) return "High";
    return "Low";
  }, [selectedNode]);

  const selectedNodeGovDeps = useMemo(() => {
    if (!selectedNode) return [];
    const name = selectedNode.label.toLowerCase();
    const deps = ["Default Retention"];
    if (selectedNode.cols?.some(c => c.toLowerCase().includes("email") || c.toLowerCase().includes("phone"))) {
      deps.push("GDPR Masking");
      deps.push("CCPA Scope");
    }
    if (selectedNode.cols?.some(c => c.toLowerCase().includes("bank"))) {
      deps.push("GLBA Compliance");
      deps.push("PCI-DSS");
    }
    if (selectedNode.cols?.some(c => c.toLowerCase().includes("gl") || c.toLowerCase().includes("cost"))) {
      deps.push("SOX Audited");
    }
    return deps;
  }, [selectedNode]);

  // AI Pipeline explanation narratives
  const selectedNodeExplanation = useMemo(() => {
    if (!selectedNode) return "";
    const name = selectedNode.label;
    
    if (name.includes("raw")) {
      return `"${name}" acts as the raw operational landing zone, capturing raw spreadsheet entries at ingestion to record initial fields before downstream parsing.`;
    }
    if (name.includes("source")) {
      return `"${name}" maps the master ERP purchase registers and vendor identifiers, serving as the source-of-truth validation for vendor mappings.`;
    }
    if (name.includes("stg_") && name.includes("header")) {
      return `"${name}" cleanses invoice header data and maps Vendor Codes to ensure supplier records join correctly downstream.`;
    }
    if (name.includes("stg_") && name.includes("items")) {
      return `"${name}" parses and splits item descriptions, cost center allocations, and General Ledger accounts, enabling accurate cost distributions.`;
    }
    if (name.includes("fact_") || name.includes("dim_")) {
      return `"${name}" aggregates parsed headers and ledger items into business-ready records, serving as the core repository for financial metrics.`;
    }
    if (name.includes("dashboard")) {
      return `"${name}" visualizes terminal financial metrics (GL accounts, cost centers) for CFO auditing and cost control.`;
    }
    return `"${name}" processes schema attributes dynamically to standardize data structures and power analytics.`;
  }, [selectedNode]);

  const hoveredNode = nodes.find(n => n.id === hoveredNodeId);
  const hoveredPos = hoveredNode ? positions[hoveredNode.id] : null;

  // 1. Show empty state if no dataset is uploaded
  if (!hasDataset) {
    return (
      <div className="py-12 space-y-8">
        <SectionTitle
          kicker="Data Lineage"
          title={<>Data Ingestion <span className="text-primary">Flow.</span></>}
          sub="Interactive node-graph visualising the full data lineage from raw sources to reporting marts."
        />
        <div className="mt-8">
          <EmptyState
            title="No Dataset Connected"
            description="Upload a dataset to automatically generate dynamic, node-graph data lineage tracking."
            features={[
              "Column-to-column dependency resolution",
              "Interactive Raw-to-Mart transformation maps",
              "Downstream dependencies warnings",
              "Pipeline drift visual diagnostics",
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
      {/* Page Header */}
      <SectionTitle
        kicker="Pipeline Visualizer"
        title={<>Data Pipeline <span className="text-primary">Lineage.</span></>}
        sub="Track physical schema ingestion flows, identify critical dependency nodes, and evaluate downstream impact mapping."
      />

      {/* Main Grid: Left pane contains Scorecard + Lineage canvas. Right pane has sidebars. */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        
        {/* Left Column */}
        <div className="space-y-6">
          
          {/* ── Lineage Scorecard Metrics ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <GlassCard className="p-4 border-border/40 relative overflow-hidden flex flex-col justify-between min-h-[90px]">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-primary/20" />
              <span className="text-[9px] font-mono-tight text-muted-foreground uppercase tracking-widest">
                Total Assets
              </span>
              <span className="font-display text-2xl font-bold text-foreground">
                {nodes.length}
              </span>
            </GlassCard>
            
            <GlassCard className="p-4 border-border/40 relative overflow-hidden flex flex-col justify-between min-h-[90px]">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-primary/20" />
              <span className="text-[9px] font-mono-tight text-muted-foreground uppercase tracking-widest">
                Relationships
              </span>
              <span className="font-display text-2xl font-bold text-foreground">
                {edges.length}
              </span>
            </GlassCard>

            <GlassCard className="p-4 border-border/40 relative overflow-hidden flex flex-col justify-between min-h-[90px]">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-primary/20" />
              <span className="text-[9px] font-mono-tight text-muted-foreground uppercase tracking-widest">
                Critical Paths
              </span>
              <span className="font-display text-2xl font-bold text-foreground">
                2 Active
              </span>
            </GlassCard>

            <GlassCard className="p-4 border-border/40 relative overflow-hidden flex flex-col justify-between min-h-[90px]">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-primary/20" />
              <span className="text-[9px] font-mono-tight text-muted-foreground uppercase tracking-widest">
                Affected Reports
              </span>
              <span className="font-display text-2xl font-bold text-foreground">
                1 Dashboard
              </span>
            </GlassCard>
          </div>

          {/* ── Lineage Graph Canvas Card ── */}
          <div
            ref={containerRef}
            className="w-full overflow-x-auto rounded-2xl border border-border/60 glass-panel-heavy p-4 custom-scrollbar"
          >
            <div
              className="relative"
              style={{ width: usableW, minHeight: canvasH + 60 }}
            >
            {/* Layer labels */}
            {LAYER_ORDER.map((layer, li) => (
              <div
                key={layer}
                className="absolute top-4 flex flex-col items-center"
                style={{ left: colCentres[li] - 64, width: 128 }}
              >
                <span
                  className="font-mono-tight text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border"
                  style={{
                    color: LAYER_META[layer].colour,
                    borderColor: `${LAYER_META[layer].colour}30`,
                    background: LAYER_META[layer].dim,
                  }}
                >
                  {LAYER_META[layer].label}
                </span>
              </div>
            ))}

            {/* Column separator lines */}
            {[1, 2].map((i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-px"
                style={{
                  left: (colCentres[i - 1] + colCentres[i]) / 2,
                  background: "rgba(148,163,184,0.06)",
                }}
              />
            ))}

            {/* SVG edge connector canvas */}
            <svg
              className="absolute inset-0 pointer-events-none"
              width={usableW}
              height={canvasH}
              style={{ overflow: "visible" }}
            >
              <defs>
                <marker id="arrow-dim" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L6,3 z" fill="rgba(148,163,184,0.2)" />
                </marker>
                <marker id="arrow-active" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L6,3 z" fill={CORAL} />
                </marker>
                <filter id="edge-glow">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {edges.map((edge, i) => {
                const src = positions[edge.from];
                const dst = positions[edge.to];
                if (!src || !dst) return null;

                const x1 = src.x + NODE_W;
                const y1 = src.y + NODE_H / 2;
                const x2 = dst.x;
                const y2 = dst.y + NODE_H / 2;
                
                const highlighted = isEdgeHighlighted(edge);
                const d = bezierPath(x1, y1, x2, y2);
                
                // Calculate midpoint along path to render join labels
                const x_mid = (x1 + x2) / 2;
                const y_mid = (y1 + y2) / 2;

                return (
                  <g key={i}>
                    {/* glow layer */}
                    {highlighted && selected && (
                      <path
                        d={d}
                        fill="none"
                        stroke={CORAL}
                        strokeWidth={6}
                        strokeOpacity={0.15}
                        filter="url(#edge-glow)"
                      />
                    )}
                    <motion.path
                      d={d}
                      fill="none"
                      stroke={highlighted && selected ? CORAL : "rgba(148,163,184,0.2)"}
                      strokeWidth={highlighted && selected ? 2 : 1.5}
                      markerEnd={highlighted && selected ? "url(#arrow-active)" : "url(#arrow-dim)"}
                      strokeDasharray={highlighted && selected ? "0" : "4 4"}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{
                        pathLength: 1,
                        opacity: highlighted ? 1 : DIM,
                      }}
                      transition={{ delay: 0.1 + i * 0.05, duration: 0.7, ease: "easeOut" }}
                    />
                    
                    {/* Join Column Labels centered on curves */}
                    {edge.label && highlighted && (
                      <foreignObject
                        x={x_mid - 60}
                        y={y_mid - 11}
                        width={120}
                        height={22}
                        className="overflow-visible"
                      >
                        <div className="flex items-center justify-center w-full h-full">
                          <span className="bg-popover border border-border/80 text-[8px] font-mono-tight px-1.5 py-0.5 rounded-md text-foreground/80 shadow-md">
                            {edge.label}
                          </span>
                        </div>
                      </foreignObject>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Lineage Nodes */}
            {nodes.map((node, i) => {
              const pos = positions[node.id];
              if (!pos) return null;
              const highlighted = isNodeHighlighted(node.id);
              const isSelected  = selected === node.id;
              const meta        = LAYER_META[node.layer];

              return (
                <motion.button
                  key={node.id}
                  id={`lineage-node-${node.id}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: highlighted ? 1 : DIM,
                    scale: isSelected ? 1.04 : 1,
                    x: pos.x,
                    y: pos.y,
                  }}
                  transition={{
                    opacity: { duration: 0.2 },
                    scale: { type: "spring", stiffness: 300, damping: 20 },
                    x: { type: "spring", stiffness: 200, damping: 28 },
                    y: { duration: 0 },
                    default: { delay: 0.05 + i * 0.04 },
                  }}
                  style={{ position: "absolute", width: NODE_W, height: NODE_H, top: 0, left: 0 }}
                  onClick={() => setSelected(isSelected ? null : node.id)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  className="group text-left"
                >
                  <div
                    className="relative h-full w-full overflow-hidden rounded-xl border transition-all duration-200"
                    style={{
                      borderColor: isSelected
                        ? CORAL
                        : highlighted && selected
                        ? `${meta.colour}60`
                        : `${meta.colour}30`,
                      background: isSelected
                        ? `rgba(232,97,63,0.12)`
                        : `var(--card)`,
                      opacity: isSelected ? 1 : 0.94,
                      boxShadow: isSelected
                        ? `0 0 0 2px ${CORAL}35, 0 8px 24px rgba(242,120,92,0.18)`
                        : highlighted && selected
                        ? `0 0 0 1px ${meta.colour}20`
                        : "none",
                    }}
                  >
                    {/* Top Accent Color Line */}
                    <div
                      className="absolute top-0 left-0 right-0 h-0.5 transition-opacity"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${isSelected ? CORAL : meta.colour}, transparent)`,
                        opacity: isSelected ? 1 : 0.5,
                      }}
                    />

                    <div className="flex h-full flex-col justify-center px-3.5 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Database
                          className="h-3.5 w-3.5 flex-shrink-0"
                          style={{ color: isSelected ? CORAL : meta.colour }}
                        />
                        <span
                          className="font-mono-tight text-[11px] font-bold leading-tight truncate"
                          style={{ color: isSelected ? CORAL : "var(--foreground)" }}
                        >
                          {node.label}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between pl-5 pr-1 mt-0.5">
                        <span className="font-mono-tight text-[8px] text-slate-500">
                          {node.rowCount} rows
                        </span>
                        
                        <span
                          className="font-mono-tight text-[8px] px-1.5 py-0.5 rounded border scale-[0.95]"
                          style={{
                            color: meta.colour,
                            borderColor: `${meta.colour}30`,
                            background: meta.dim,
                          }}
                        >
                          {node.layer}
                        </span>
                      </div>
                    </div>

                    {/* Hover highlights */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none"
                      style={{ background: `radial-gradient(circle at 50% 0%, ${meta.colour}08, transparent 70%)` }}
                    />
                  </div>
                </motion.button>
              );
            })}

            {/* ── Hover HTML Metadata Tooltip ── */}
            {hoveredNode && hoveredPos && (
              <div 
                className="absolute z-50 bg-popover/95 border border-border p-3.5 rounded-xl shadow-xl w-64 pointer-events-none text-xs leading-normal font-sans text-foreground"
                style={{
                  left: hoveredPos.x + NODE_W / 2 - 128,
                  top: hoveredPos.y - 125, // display above the node
                }}
              >
                <div className="font-mono-tight font-bold text-foreground mb-1">{hoveredNode.label}</div>
                <div className="text-[8px] text-primary font-semibold uppercase tracking-wider mb-1.5 flex justify-between">
                  <span>{hoveredNode.layer} Layer</span>
                  <span>{hoveredNode.rowCount} Rows</span>
                </div>
                <p className="text-muted-foreground text-[10px] leading-relaxed mb-2">
                  {hoveredNode.description}
                </p>
                <div className="text-[9px] text-muted-foreground font-mono-tight border-t border-border/20 pt-1.5 flex justify-between">
                  <span>Owner: <span className="text-foreground">{hoveredNode.owner}</span></span>
                </div>
              </div>
            )}

            {/* Canvas height anchor */}
            <div style={{ height: canvasH }} />
          </div>
        </div>

        </div>

        {/* Right Column: AI Lineage Insights & Impact Analysis sidebars */}
        <div className="space-y-6">
          
          {/* ── AI Lineage Insights Panel ── */}
          <GlassCard className="p-5 border-border/40 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-primary/20" />
            <h4 className="font-mono-tight text-[10px] uppercase text-muted-foreground tracking-widest mb-4 flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-primary shrink-0" />
              AI Lineage Insights
            </h4>

            <div className="space-y-4 text-xs">
              <div className="border-b border-border/10 pb-3">
                <span className="text-[10px] text-muted-foreground block font-mono-tight uppercase">Most Connected Asset</span>
                <span className="font-mono-tight font-bold text-foreground mt-0.5 block">
                  {nodes.find(n => n.id === "stg_header")?.label || "stg_invoice_header"}
                </span>
              </div>

              <div className="border-b border-border/10 pb-3">
                <span className="text-[10px] text-muted-foreground block font-mono-tight uppercase">Critical Dependency</span>
                <span className="font-mono-tight font-bold text-primary mt-0.5 block">
                  {isCustomerDataset ? "cust_id / email" : "vendor_code / invoice_id"}
                </span>
              </div>

              <div className="border-b border-border/10 pb-3">
                <span className="text-[10px] text-muted-foreground block font-mono-tight uppercase">Downstream Impact Count</span>
                <span className="font-mono-tight font-bold text-foreground mt-0.5 block">
                  4 Reporting Assets Affected
                </span>
              </div>

              <div className="border-b border-border/10 pb-3">
                <span className="text-[10px] text-muted-foreground block font-mono-tight uppercase">Business Area Impact</span>
                <span className="font-mono-tight font-bold text-foreground mt-0.5 block">
                  AP Accounting & Corporate Reporting
                </span>
              </div>

              <div>
                <span className="text-[10px] text-amber-500 block font-mono-tight uppercase flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" /> Data Quality Warnings
                </span>
                <span className="text-[11px] text-muted-foreground mt-1.5 block leading-relaxed">
                  Missing General Ledger metrics mappings on items flow could affect financial reports downstream.
                </span>
              </div>
            </div>
          </GlassCard>

          {/* ── Impact Analysis Panel ── */}
          <AnimatePresence mode="wait">
            {selectedNode ? (
              <motion.div
                key={selectedNode.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <GlassCard className="p-5 border-primary/20 bg-primary/5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-primary/30" />
                  
                  <div className="flex items-center justify-between border-b border-border/20 pb-3.5 mb-4">
                    <div>
                      <h4 className="font-mono-tight text-[10px] uppercase text-muted-foreground tracking-widest">
                        Impact Analysis
                      </h4>
                      <span className="font-mono text-xs font-bold text-foreground truncate block max-w-[240px] mt-1">
                        {selectedNode.label}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => setSelected(null)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-4.5 text-xs">
                    {/* Upstream */}
                    <div>
                      <span className="text-[9px] text-muted-foreground block font-mono-tight uppercase">Upstream Sources</span>
                      <div className="mt-1 space-y-1">
                        {edges.filter((e) => e.to === selectedNode.id).length === 0 ? (
                          <span className="text-[10px] text-muted-foreground italic">Source node (none upstream)</span>
                        ) : (
                          edges.filter((e) => e.to === selectedNode.id).map((e) => (
                            <button
                              key={e.from}
                              onClick={() => setSelected(e.from)}
                              className="flex items-center gap-1.5 text-[11px] text-primary hover:underline text-left"
                            >
                              <GitBranch className="h-3 w-3" />
                              {nodes.find((n) => n.id === e.from)?.label}
                            </button>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Downstream */}
                    <div>
                      <span className="text-[9px] text-muted-foreground block font-mono-tight uppercase">Downstream Consumers</span>
                      <div className="mt-1 space-y-1">
                        {edges.filter((e) => e.from === selectedNode.id).length === 0 ? (
                          <span className="text-[10px] text-muted-foreground italic">Terminal node (none downstream)</span>
                        ) : (
                          edges.filter((e) => e.from === selectedNode.id).map((e) => (
                            <button
                              key={e.to}
                              onClick={() => setSelected(e.to)}
                              className="flex items-center gap-1.5 text-[11px] text-primary hover:underline text-left"
                            >
                              <GitBranch className="h-3 w-3" />
                              {nodes.find((n) => n.id === e.to)?.label}
                            </button>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Affected Reports */}
                    <div>
                      <span className="text-[9px] text-muted-foreground block font-mono-tight uppercase">Affected Reports</span>
                      <span className="font-mono text-[10px] text-foreground mt-0.5 block font-semibold">
                        {selectedNode.id === "finance_dashboard" || selectedNode.id === "marketing_dashboard"
                          ? "Self (Reporting Asset)"
                          : isCustomerDataset 
                          ? "Marketing BI Dashboard" 
                          : "Finance BI Dashboard"}
                      </span>
                    </div>

                    {/* Risk Rating */}
                    <div>
                      <span className="text-[9px] text-muted-foreground block font-mono-tight uppercase">Risk Level</span>
                      <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mt-1 border ${
                        selectedNodeRisk === "High" 
                          ? "border-red-500/20 bg-red-500/10 text-red-500" 
                          : selectedNodeRisk === "Medium"
                          ? "border-amber-500/20 bg-amber-500/10 text-amber-500"
                          : "border-border bg-secondary/50 text-muted-foreground"
                      }`}>
                        {selectedNodeRisk} Impact Risk
                      </span>
                    </div>

                    {/* Governance Deps */}
                    <div>
                      <span className="text-[9px] text-muted-foreground block font-mono-tight uppercase mb-1.5">Governance Dependencies</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedNodeGovDeps.map((dep) => (
                          <span key={dep} className="px-1.5 py-0.5 rounded border border-border/40 bg-background/50 text-[9px] font-mono-tight text-muted-foreground">
                            {dep}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* AI explanation flow text */}
                    <div className="border-t border-border/10 pt-3">
                      <span className="text-[9px] text-primary block font-mono-tight uppercase flex items-center gap-1 mb-1">
                        <Cpu className="h-3 w-3" /> AI Flow Explanation
                      </span>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        {selectedNodeExplanation}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ) : (
              // Default fallback sidebar panel if no node is selected
              <GlassCard className="p-5 border-border/40 text-center py-10 space-y-3.5 bg-secondary/5">
                <GitBranch className="h-8 w-8 text-muted-foreground/50 mx-auto animate-pulse" />
                <h5 className="font-display text-sm font-bold text-foreground/80">Interactive Analysis</h5>
                <p className="text-[11px] text-muted-foreground leading-normal max-w-[220px] mx-auto">
                  Click any data asset node inside the lineage pipeline diagram to inspect upstream sources, downstream consumers, and risk dependencies.
                </p>
              </GlassCard>
            )}
          </AnimatePresence>
          
        </div>

      </div>
    </div>
  );
}