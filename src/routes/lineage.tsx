import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Database, ArrowRight, X, GitBranch, Table2, Info, Network } from "lucide-react";
import { SectionTitle, Pill } from "@/components/ui-bits";
import { EmptyState } from "@/components/EmptyState";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { enableDemoMode } from "@/lib/demoModeService";

export const Route = createFileRoute("/lineage")({
  head: () => ({
    meta: [
      { title: "Lineage · SchemaSense" },
      { name: "description", content: "Interactive node-graph visualising the full data lineage from raw sources to marts." },
    ],
  }),
  component: Lineage,
});

// ─── Data model ───────────────────────────────────────────────────────────────
type Layer = "raw" | "staging" | "mart";

type NodeDef = {
  id: string;
  label: string;
  layer: Layer;
  cols?: string[];
  rowCount?: string;
};

type EdgeDef = { from: string; to: string };

const DEFAULT_NODES: NodeDef[] = [
  // RAW
  { id: "raw_users",    label: "raw.users",    layer: "raw",     cols: ["id","email","signup_ts","country"],       rowCount: "2.1M" },
  { id: "raw_events",   label: "raw.events",   layer: "raw",     cols: ["user_id","event","ts","payload"],         rowCount: "18.4M" },
  { id: "raw_payments", label: "raw.payments", layer: "raw",     cols: ["user_id","amount","currency","ts"],       rowCount: "4.7M" },
  // STAGING
  { id: "stg_customers",label: "stg_customers",layer: "staging", cols: ["cust_id","email","country","signup_ts"],  rowCount: "2.1M" },
  { id: "stg_orders",   label: "stg_orders",   layer: "staging", cols: ["order_id","cust_id","ts","status"],      rowCount: "11.2M" },
  { id: "stg_revenue",  label: "stg_revenue",  layer: "staging", cols: ["cust_id","amount_usd","ts"],             rowCount: "4.7M" },
  // MART
  { id: "dim_customers",label: "dim_customers",layer: "mart",    cols: ["cust_id","email","country","plan_tier"], rowCount: "2.1M" },
  { id: "fact_sales",   label: "fact_sales",   layer: "mart",    cols: ["order_id","cust_id","revenue_usd","ts"], rowCount: "11.2M" },
];

const DEFAULT_EDGES: EdgeDef[] = [
  { from: "raw_users",    to: "stg_customers" },
  { from: "raw_events",   to: "stg_customers" },
  { from: "raw_events",   to: "stg_orders"    },
  { from: "raw_payments", to: "stg_revenue"   },
  { from: "stg_customers",to: "dim_customers" },
  { from: "stg_orders",   to: "fact_sales"    },
  { from: "stg_revenue",  to: "fact_sales"    },
];

// ─── Layout constants ─────────────────────────────────────────────────────────
const NODE_W  = 160;
const NODE_H  = 68;
const COL_GAP = 220; // horizontal gap between layer centres
const ROW_GAP = 100; // vertical gap between nodes in the same layer

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
  const canvasH = allY.length > 0 ? Math.max(...allY) + NODE_H + 60 : 300;

  return { positions, colCentres, canvasH };
}

// ─── Layer colours ─────────────────────────────────────────────────────────────
const LAYER_META: Record<Layer, { label: string; colour: string; dim: string; badge: string }> = {
  raw:     { label: "RAW",     colour: "#6B9DF2", dim: "rgba(107,157,242,0.15)", badge: "bg-blue-500/15 text-blue-400 border-blue-500/30"   },
  staging: { label: "STAGING", colour: "#8B5CF6", dim: "rgba(139,92,246,0.15)",  badge: "bg-violet-500/15 text-violet-400 border-violet-500/30"},
  mart:    { label: "MART",    colour: "#F2785C", dim: "rgba(242,120,92,0.2)",   badge: "bg-primary/15 text-primary border-primary/30"       },
};

const CORAL = "#F2785C";
const DIM   = 0.2;

// ─── SVG cubic bezier path ────────────────────────────────────────────────────
function bezierPath(
  x1: number, y1: number,
  x2: number, y2: number,
): string {
  const cx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
}

// ─── Lineage main component ───────────────────────────────────────────────────
function Lineage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasW, setCanvasW] = useState(900);
  const [selected, setSelected] = useState<string | null>(null);
  
  const { hasDataset, refreshWorkspace } = useWorkspace();
  const [isCustomDataset, setIsCustomDataset] = useState(false);
  const [lineageGenerated, setLineageGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [nodes, setNodes] = useState<NodeDef[]>([]);
  const [edges, setEdges] = useState<EdgeDef[]>([]);

  // Measure container width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setCanvasW(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [hasDataset, lineageGenerated]);

  // Load configuration from localStorage
  useEffect(() => {
    try {
      const savedCols = localStorage.getItem("schema_sense_cols");
      if (savedCols) {
        const parsed = JSON.parse(savedCols);
        if (Array.isArray(parsed) && parsed.length > 0) {
          
          // Check if it's a custom dataset (doesn't contain default columns like "signup_ts" or "plan_tier")
          const hasDefaults = parsed.some((c: any) => c.name === "signup_ts" || c.name === "plan_tier");
          if (!hasDefaults) {
            setIsCustomDataset(true);
            const generatedFlag = localStorage.getItem("schema_sense_lineage_generated");
            if (generatedFlag === "1") {
              setLineageGenerated(true);
              buildCustomLineage(parsed);
            } else {
              setLineageGenerated(false);
            }
          } else {
            setIsCustomDataset(false);
            setLineageGenerated(true);
            setNodes(DEFAULT_NODES);
            setEdges(DEFAULT_EDGES);
          }
        }
      }
    } catch (_) {}
  }, []);

  // Construct mock tables & nodes from custom columns
  const buildCustomLineage = (cols: { name: string; type: string }[]) => {
    const colNames = cols.map((c) => c.name);
    
    // Split columns list to mock different transformations
    const rawCols = colNames;
    const stgCols = colNames.slice(0, Math.max(2, Math.floor(colNames.length * 0.75)));
    const martCols = colNames.slice(0, Math.max(1, Math.floor(colNames.length * 0.5)));

    const customNodes: NodeDef[] = [
      {
        id: "raw_custom",
        label: "raw.uploaded_dataset",
        layer: "raw",
        cols: rawCols,
        rowCount: "24.5k",
      },
      {
        id: "stg_custom",
        label: "stg_uploaded_dataset",
        layer: "staging",
        cols: stgCols,
        rowCount: "24.5k",
      },
      {
        id: "mart_custom",
        label: "mart_analytics_summary",
        layer: "mart",
        cols: martCols,
        rowCount: "12.2k",
      },
    ];

    const customEdges: EdgeDef[] = [
      { from: "raw_custom", to: "stg_custom" },
      { from: "stg_custom", to: "mart_custom" },
    ];

    setNodes(customNodes);
    setEdges(customEdges);
  };

  const handleGenerateLineage = () => {
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const savedCols = localStorage.getItem("schema_sense_cols");
        if (savedCols) {
          const parsed = JSON.parse(savedCols);
          buildCustomLineage(parsed);
          setLineageGenerated(true);
          localStorage.setItem("schema_sense_lineage_generated", "1");
        }
      } catch (_) {}
      setIsGenerating(false);
    }, 1500);
  };

  const { positions, colCentres, canvasH } = buildLayout(nodes, canvasW);

  // Which node ids are connected to selected?
  const connectedIds = useCallback((): Set<string> => {
    if (!selected) return new Set();
    const ids = new Set<string>([selected]);
    edges.forEach((e) => {
      if (e.from === selected) ids.add(e.to);
      if (e.to   === selected) ids.add(e.from);
    });
    return ids;
  }, [selected, edges])();

  const isEdgeHighlighted = (e: EdgeDef) =>
    selected === null ||
    e.from === selected ||
    e.to   === selected;

  const isNodeHighlighted = (id: string) =>
    selected === null || connectedIds.has(id);

  const selectedNode = nodes.find((n) => n.id === selected);

  // 1. Show empty state if no dataset is uploaded
  if (!hasDataset) {
    return (
      <div className="py-12 space-y-8">
        <SectionTitle
          kicker="Lineage"
          title={<>Data <span className="text-primary">flow.</span></>}
          sub="Interactive node-graph visualising the full data lineage from raw sources to marts."
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

  // 2. Show empty state if lineage is not available (for custom datasets)
  if (isCustomDataset && !lineageGenerated && !isGenerating) {
    return (
      <div className="py-12 space-y-8">
        <SectionTitle
          kicker="Lineage"
          title={<>Data <span className="text-primary">flow.</span></>}
          sub="Interactive node-graph visualising the full data lineage from raw sources to marts."
        />
        <div className="mt-8">
          <EmptyState
            icon={Network}
            title="No Lineage Generated"
            description="Profile relationships and map references to generate an interactive data flow diagram."
            features={[
              "Generate foreign key inferences",
              "Resolve source-to-mart connections",
              "Compute dependencies metrics",
            ]}
            primaryActionLabel="Generate Inferences"
            onPrimaryAction={handleGenerateLineage}
            onSecondaryAction={() => {
              enableDemoMode();
              refreshWorkspace();
            }}
          />
        </div>
      </div>
    );
  }

  // 3. Show Loading skeleton during lineage mapping
  if (isGenerating) {
    return (
      <div className="py-12">
        <SectionTitle
          kicker="Lineage"
          title={<>Data <span className="text-primary">flow.</span></>}
          sub="Interactive node-graph visualising the full data lineage from raw sources to marts."
        />
        <div className="flex flex-col items-center justify-center py-20 bg-card/25 border border-border/40 rounded-3xl animate-pulse">
          <Network className="h-10 w-10 text-primary mb-4 animate-spin" style={{ animationDuration: "3s" }} />
          <h3 className="font-display text-lg font-bold text-foreground">Mapping Data Pipeline...</h3>
          <p className="mt-2 text-xs text-muted-foreground">Tracing schema references and foreign key lineages.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionTitle
        kicker="Lineage"
        title={<>Data <span className="text-primary">flow.</span></>}
        sub="Interactive node-graph of every source, staging table, and downstream mart. Click any node to trace its connections."
      />

      {/* Stats row */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Pill tone="muted">{nodes.length} nodes</Pill>
        <Pill tone="muted">{edges.length} edges</Pill>
        <Pill tone="lime">3 layers</Pill>
        {selected && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setSelected(null)}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-0.5 font-mono-tight text-[10px] uppercase tracking-wider text-primary hover:bg-primary/20 transition-colors"
          >
            <X className="h-3 w-3" />
            Clear selection
          </motion.button>
        )}
      </div>

      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-2xl border border-border/60 glass-panel-heavy"
        style={{ minHeight: canvasH + 40 }}
      >
        {/* Layer header labels */}
        {LAYER_ORDER.map((layer, li) => (
          <div
            key={layer}
            className="absolute top-4 flex flex-col items-center"
            style={{ left: colCentres[li] - 48, width: 96 }}
          >
            <span
              className="font-mono-tight text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border"
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

        {/* Vertical column separators */}
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

        {/* SVG canvas for edges */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={canvasW}
          height={canvasH}
          style={{ overflow: "visible" }}
        >
          <defs>
            <marker id="arrow-dim"    markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="rgba(148,163,184,0.2)" />
            </marker>
            <marker id="arrow-active" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill={CORAL} />
            </marker>
            <filter id="edge-glow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
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
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.7, ease: "easeOut" }}
                />
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
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
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{
                opacity: highlighted ? 1 : DIM,
                scale: isSelected ? 1.05 : 1,
                x: pos.x,
                y: pos.y,
              }}
              transition={{
                opacity: { duration: 0.2 },
                scale: { type: "spring", stiffness: 300, damping: 22 },
                x: { type: "spring", stiffness: 200, damping: 28 },
                y: { duration: 0 },
                default: { delay: 0.05 + i * 0.05 },
              }}
              style={{ position: "absolute", width: NODE_W, height: NODE_H, top: 0, left: 0 }}
              onClick={() => setSelected(isSelected ? null : node.id)}
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
                    ? `rgba(232,97,63,0.15)`
                    : `var(--card)`,
                  opacity: isSelected ? 1 : 0.92,
                  boxShadow: isSelected
                    ? `0 0 0 2px ${CORAL}40, 0 8px 24px rgba(242,120,92,0.2)`
                    : highlighted && selected
                    ? `0 0 0 1px ${meta.colour}20`
                    : "none",
                }}
              >
                {/* top accent stripe */}
                <div
                  className="absolute top-0 left-0 right-0 h-0.5 transition-opacity"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${isSelected ? CORAL : meta.colour}, transparent)`,
                    opacity: isSelected ? 1 : 0.4,
                  }}
                />

                <div className="flex h-full flex-col justify-center px-3 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Database
                      className="h-3.5 w-3.5 flex-shrink-0"
                      style={{ color: isSelected ? CORAL : meta.colour }}
                    />
                    <span
                      className="font-mono-tight text-[11px] font-semibold leading-tight truncate"
                      style={{ color: isSelected ? CORAL : "var(--foreground)" }}
                    >
                      {node.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pl-5">
                    <span className="font-mono-tight text-[9px] text-slate-500">
                      {node.rowCount} rows
                    </span>
                    <span
                      className="font-mono-tight text-[9px] px-1.5 py-0.5 rounded border"
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

                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${meta.colour}10, transparent 70%)` }}
                />
              </div>
            </motion.button>
          );
        })}

        {/* Canvas min-height spacer */}
        <div style={{ height: canvasH }} />
      </div>

      {/* ── Detail panel ── */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="mt-4 rounded-2xl border border-border/60 bg-card/90 p-5 backdrop-blur"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg border"
                  style={{
                    borderColor: `${LAYER_META[selectedNode.layer].colour}30`,
                    background: LAYER_META[selectedNode.layer].dim,
                  }}
                >
                  <Table2 className="h-4 w-4" style={{ color: LAYER_META[selectedNode.layer].colour }} />
                </div>
                <div>
                  <div className="font-mono-tight text-sm font-bold text-foreground">{selectedNode.label}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono-tight text-[9px] uppercase tracking-wider ${LAYER_META[selectedNode.layer].badge}`}>
                      {selectedNode.layer}
                    </span>
                    <span className="font-mono-tight text-[11px] text-muted-foreground">{selectedNode.rowCount} rows</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {/* Columns */}
              <div>
                <div className="mb-2 font-mono-tight text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Info className="h-3 w-3" /> Columns
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.cols?.map((c) => (
                    <span key={c} className="font-mono-tight text-[10px] rounded border border-border bg-secondary/60 px-1.5 py-0.5 text-foreground/70">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Upstream */}
              <div>
                <div className="mb-2 font-mono-tight text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ArrowRight className="h-3 w-3 rotate-180" /> Upstream
                </div>
                {edges.filter((e) => e.to === selectedNode.id).length === 0 ? (
                  <span className="text-xs text-muted-foreground italic">Source table</span>
                ) : (
                  edges.filter((e) => e.to === selectedNode.id).map((e) => (
                    <button
                      key={e.from}
                      onClick={() => setSelected(e.from)}
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline text-left"
                    >
                      <GitBranch className="h-3 w-3" />
                      {nodes.find((n) => n.id === e.from)?.label}
                    </button>
                  ))
                )}
              </div>

              {/* Downstream */}
              <div>
                <div className="mb-2 font-mono-tight text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ArrowRight className="h-3 w-3" /> Downstream
                </div>
                {edges.filter((e) => e.from === selectedNode.id).length === 0 ? (
                  <span className="text-xs text-muted-foreground italic">Terminal node</span>
                ) : (
                  edges.filter((e) => e.from === selectedNode.id).map((e) => (
                    <button
                      key={e.to}
                      onClick={() => setSelected(e.to)}
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline text-left"
                    >
                      <GitBranch className="h-3 w-3" />
                      {nodes.find((n) => n.id === e.to)?.label}
                    </button>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}