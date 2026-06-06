import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { Search, Sparkles, Pencil, Check, X, ShieldAlert, Filter } from "lucide-react";
import { GlassCard, Pill, SectionTitle } from "@/components/ui-bits";

export const Route = createFileRoute("/dictionary")({
  head: () => ({
    meta: [
      { title: "Dictionary · SchemaSense" },
      { name: "description", content: "AI-written definitions, types, nullability, and lineage for every column." },
    ],
  }),
  component: Dictionary,
});

// ─── Column data ──────────────────────────────────────────────────────────────
type ColRow = {
  col: string;
  type: string;
  nullable: boolean;
  pii: boolean;
  missingDef: boolean;
  def: string;
  lineage: string[];
};

const defaultRows: ColRow[] = [
  {
    col: "cust_id", type: "uuid", nullable: false, pii: false, missingDef: false,
    def: "Unique customer identifier assigned at account creation. Immutable once set.",
    lineage: ["raw.users", "stg_customers", "dim_customer"],
  },
  {
    col: "email", type: "string", nullable: true, pii: true, missingDef: false,
    def: "Primary contact email address. Lower-cased and trimmed during ingestion pipeline.",
    lineage: ["raw.users", "dim_customer"],
  },
  {
    col: "signup_ts", type: "timestamp", nullable: false, pii: false, missingDef: false,
    def: "UTC moment the user completed onboarding and account verification.",
    lineage: ["raw.events", "fact_signup"],
  },
  {
    col: "country", type: "string(2)", nullable: false, pii: false, missingDef: false,
    def: "ISO 3166-1 alpha-2 country code resolved from IP address at signup time.",
    lineage: ["raw.events", "dim_geo"],
  },
  {
    col: "revenue_usd", type: "decimal(12,2)", nullable: true, pii: false, missingDef: false,
    def: "Trailing 30-day gross revenue in USD, normalized across currencies using daily FX rates.",
    lineage: ["raw.payments", "fact_revenue", "mart_finance"],
  },
  {
    col: "is_active", type: "boolean", nullable: false, pii: false, missingDef: false,
    def: "True when the user has authenticated at least once within the last 30 days.",
    lineage: ["fact_sessions", "dim_customer"],
  },
  {
    col: "plan_tier", type: "enum", nullable: false, pii: false, missingDef: false,
    def: "Subscription tier — one of: free, pro, team, or enterprise.",
    lineage: ["raw.subscriptions", "dim_plan"],
  },
  {
    col: "last_login", type: "timestamp", nullable: true, pii: false, missingDef: false,
    def: "Most recent successful authentication event timestamp in UTC.",
    lineage: ["raw.auth", "fact_sessions"],
  },
  {
    col: "churn_risk", type: "float", nullable: true, pii: false, missingDef: true,
    def: "",
    lineage: ["model.churn_v3", "mart_growth"],
  },
  {
    col: "lifetime_orders", type: "int", nullable: false, pii: false, missingDef: true,
    def: "",
    lineage: ["fact_orders", "dim_customer"],
  },
  {
    col: "phone_number", type: "string", nullable: true, pii: true, missingDef: false,
    def: "E.164-formatted contact phone number. Used for 2FA and support escalation only.",
    lineage: ["raw.users", "dim_customer"],
  },
];

// ─── Type badge colours ────────────────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  uuid:           "bg-violet-500/15 text-violet-600 border-violet-400/30",
  string:         "bg-blue-500/15 text-blue-600 border-blue-400/30",
  "string(2)":    "bg-blue-500/15 text-blue-600 border-blue-400/30",
  timestamp:      "bg-amber-500/15 text-amber-600 border-amber-400/30",
  "decimal(12,2)":"bg-emerald-500/15 text-emerald-600 border-emerald-400/30",
  float:          "bg-emerald-500/15 text-emerald-600 border-emerald-400/30",
  int:            "bg-emerald-500/15 text-emerald-600 border-emerald-400/30",
  boolean:        "bg-sky-500/15 text-sky-600 border-sky-400/30",
  enum:           "bg-pink-500/15 text-pink-600 border-pink-400/30",
};
function typeCls(t: string) {
  return TYPE_COLORS[t] ?? "bg-muted text-muted-foreground border-border";
}

// ─── Filter chips ─────────────────────────────────────────────────────────────
type FilterId = "all" | "missing" | "pii";
const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all",     label: "All Columns"         },
  { id: "missing", label: "Missing Definitions" },
  { id: "pii",     label: "PII / Sensitive"     },
];

// ─── Editable definition cell ─────────────────────────────────────────────────
function DefCell({ def, missingDef, onSave }: { def: string; missingDef: boolean; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(def);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) taRef.current?.focus();
  }, [editing]);

  const commit = () => { onSave(draft); setEditing(false); };
  const cancel = () => { setDraft(def); setEditing(false); };

  if (editing) {
    return (
      <div className="flex flex-col gap-2">
        <textarea
          ref={taRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-lg border border-primary/40 bg-background/70 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <div className="flex gap-1.5">
          <button
            onClick={commit}
            className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Check className="h-3 w-3" /> Save
          </button>
          <button
            onClick={cancel}
            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" /> Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group/def flex items-start gap-2">
      {missingDef || !def ? (
        <span className="italic text-muted-foreground/50 text-xs">No definition yet — click to add.</span>
      ) : (
        <span className="text-xs text-muted-foreground leading-relaxed">{def}</span>
      )}
      <button
        onClick={() => { setDraft(def); setEditing(true); }}
        className="mt-0.5 flex-shrink-0 opacity-0 group-hover/def:opacity-100 transition-opacity rounded p-0.5 hover:bg-primary/10 text-muted-foreground hover:text-primary"
        aria-label="Edit definition"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
function Dictionary() {
  const [rows,    setRows]    = useState<ColRow[]>(defaultRows);
  const [query,   setQuery]   = useState("");
  const [filter,  setFilter]  = useState<FilterId>("all");

  // Load from localStorage if a schema was uploaded
  useEffect(() => {
    try {
      const saved = localStorage.getItem("schema_sense_cols");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRows(parsed.map((p: any) => ({
            col: p.name,
            type: p.type,
            nullable: p.null !== "0%",
            pii: false,
            missingDef: true,
            def: "",
            lineage: ["raw.upload", "stg_dynamic"],
          })));
        }
      }
    } catch (_) {}
  }, []);

  const saveDefinition = (col: string, def: string) => {
    setRows((prev) => prev.map((r) => r.col === col ? { ...r, def, missingDef: !def } : r));
  };

  // Apply filter + search
  const visible = rows.filter((r) => {
    const matchSearch = !query || r.col.toLowerCase().includes(query.toLowerCase()) || r.def.toLowerCase().includes(query.toLowerCase());
    const matchFilter =
      filter === "all"     ? true :
      filter === "missing" ? r.missingDef || !r.def :
      filter === "pii"     ? r.pii : true;
    return matchSearch && matchFilter;
  });

  const missingCount = rows.filter((r) => r.missingDef || !r.def).length;
  const piiCount     = rows.filter((r) => r.pii).length;

  return (
    <div>
      <SectionTitle
        kicker="Step 02 / Dictionary"
        title={<>Every column, <span className="text-primary">defined.</span></>}
        sub="AI-written definitions, types, nullability, and lineage tags for every field — editable in place."
      />

      {/* ── Search + filter bar ── */}
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-2.5 backdrop-blur">
          <Search className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <input
            id="dict-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Search columns, types, definitions…"
          />
          <Pill tone="lime"><Sparkles className="h-3 w-3" /> AI</Pill>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          {FILTERS.map((f) => {
            const active = filter === f.id;
            const count  = f.id === "all" ? rows.length : f.id === "missing" ? missingCount : piiCount;
            return (
              <button
                key={f.id}
                id={`dict-filter-${f.id}`}
                onClick={() => setFilter(f.id)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono-tight text-[11px] uppercase tracking-wider transition-all ${
                  active
                    ? f.id === "pii"
                      ? "border-orange-400/60 bg-orange-500/15 text-orange-600"
                      : "border-primary/40 bg-primary/12 text-primary"
                    : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {f.id === "pii" && <ShieldAlert className="h-3 w-3" />}
                {f.label}
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${active ? "bg-primary/20" : "bg-muted"}`}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Table ── */}
      <GlassCard className="overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-3 border-b border-border/60 px-5 py-3 font-mono-tight text-[10px] uppercase tracking-wider text-muted-foreground">
          <div className="col-span-2">Column</div>
          <div className="col-span-2">Type &amp; Nullability</div>
          <div className="col-span-1">Tags</div>
          <div className="col-span-4">AI Definition</div>
          <div className="col-span-3">Lineage</div>
        </div>

        {/* Rows */}
        <ul>
          <AnimatePresence initial={false}>
            {visible.length === 0 ? (
              <motion.li
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 text-center text-sm text-muted-foreground"
              >
                No columns match your current filter.
              </motion.li>
            ) : (
              visible.map((r, i) => (
                <motion.li
                  key={r.col}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ delay: i * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="grid grid-cols-12 items-start gap-3 border-b border-border/40 px-5 py-4 text-sm transition-colors hover:bg-primary/[0.03]"
                >
                  {/* Column name */}
                  <div className="col-span-2 flex items-center gap-2 font-mono-tight text-xs pt-0.5">
                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary glow-lime" />
                    <span className="truncate">{r.col}</span>
                  </div>

                  {/* Type + Nullability combined */}
                  <div className="col-span-2 flex flex-wrap gap-1 pt-0.5">
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 font-mono-tight text-[10px] uppercase tracking-wide ${typeCls(r.type)}`}>
                      {r.type}
                    </span>
                    {!r.nullable && (
                      <span className="inline-flex items-center rounded-md border border-destructive/30 bg-destructive/10 px-2 py-0.5 font-mono-tight text-[10px] text-destructive uppercase tracking-wide">
                        Required
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="col-span-1 pt-0.5">
                    {r.pii && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-orange-400/40 bg-orange-500/12 px-2 py-0.5 font-mono-tight text-[10px] text-orange-600 uppercase tracking-wide">
                        <ShieldAlert className="h-2.5 w-2.5" />
                        PII
                      </span>
                    )}
                  </div>

                  {/* Editable definition */}
                  <div className="col-span-4">
                    <DefCell
                      def={r.def}
                      missingDef={r.missingDef}
                      onSave={(v) => saveDefinition(r.col, v)}
                    />
                  </div>

                  {/* Lineage */}
                  <div className="col-span-3 flex flex-wrap gap-1.5 pt-0.5">
                    {r.lineage.map((l) => (
                      <span
                        key={l}
                        className="font-mono-tight text-[10px] rounded border border-border bg-secondary/60 px-1.5 py-0.5 text-foreground/70"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                </motion.li>
              ))
            )}
          </AnimatePresence>
        </ul>

        {/* Footer summary */}
        <div className="flex items-center justify-between border-t border-border/40 px-5 py-3">
          <span className="font-mono-tight text-[11px] text-muted-foreground">
            Showing {visible.length} of {rows.length} columns
          </span>
          <div className="flex gap-3 font-mono-tight text-[11px] text-muted-foreground">
            {missingCount > 0 && (
              <span className="text-amber-500">{missingCount} missing definition{missingCount > 1 ? "s" : ""}</span>
            )}
            {piiCount > 0 && (
              <span className="text-orange-500">{piiCount} PII field{piiCount > 1 ? "s" : ""}</span>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}