import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { Search, Layers, Database, Check, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";
import { SectionTitle, GlassCard } from "@/components/ui-bits";
import { MetadataCard, ColMetadata } from "@/components/dictionary/MetadataCard";
import { MetadataGenerationModal } from "@/components/dictionary/MetadataGenerationModal";
import { MetadataSkeleton } from "@/components/dictionary/MetadataSkeleton";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { enableDemoMode } from "@/lib/demoModeService";
import { EmptyState } from "@/components/EmptyState";
import { 
  getBusinessMeaning, 
  getGovernanceCategory, 
  getClassificationLabel, 
  getComplianceNotes, 
  getSuggestedUsage 
} from "@/lib/governanceService";
import { SmartSamplingBanner } from "@/components/SmartSamplingBanner";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/dictionary")({
  head: () => ({
    meta: [
      { title: "Dictionary · SchemaSense" },
      { name: "description", content: "AI-powered definitions, types, business meaning, and confidence for every column." },
    ],
  }),
  component: Dictionary,
});

// ─── Default Detail Mock Metadata Database ─────────────────────────────────────
const MOCK_METADATA_DATABASE: Record<string, Omit<ColMetadata, "name" | "type">> = {
  cust_id: {
    nullPct: "0.0%",
    uniquePct: "100.0%",
    description: "Unique customer identifier assigned at account creation. Immutable once set.",
    meaning: "Primary lookup key for customer profile routing. Syncs downstream with Salesforce Account ID.",
    context: "Referenced by billing, support systems, product analytics, and customer success teams.",
    samples: ["0001bc5a-4ba5-4e23-bd43-466d6d25aee9", "fffe402a-d1d2-4be7-9bee-3f007087570a"],
    pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
    relations: ["orders.cust_id", "payments.cust_id", "sessions.cust_id"],
    isFk: true,
    sensitivity: "Medium",
    pii: false,
    complianceTags: ["GDPR", "CCPA"],
    confidence: 98,
  },
  email: {
    nullPct: "2.1%",
    uniquePct: "92.4%",
    description: "Primary contact email address. Lower-cased, validated and trimmed during ingestion.",
    meaning: "Primary email address for marketing campaigns, billing invoices, and notification dispatches.",
    context: "Used across marketing automation, CRM integrations, and billing servers.",
    samples: ["customer1@company.com", "user.name@domain.io"],
    pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
    relations: ["raw.users.email", "marketing.contacts.email"],
    isFk: false,
    sensitivity: "Critical",
    pii: true,
    complianceTags: ["GDPR", "HIPAA"],
    confidence: 95,
  },
  signup_ts: {
    nullPct: "0.0%",
    uniquePct: "10.4%",
    description: "UTC timestamp marking the moment the user completed onboarding, signed terms, and activated account.",
    meaning: "Cohort reference timestamp for product activation, retention models, and churn metrics.",
    context: "Required by Growth Analytics, Product Management, and Finance reporting.",
    samples: ["2024-01-02 08:32:00", "2026-06-03 15:00:00"],
    pattern: "^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}$",
    relations: [],
    isFk: false,
    sensitivity: "Low",
    pii: false,
    complianceTags: [],
    confidence: 99,
  },
  country: {
    nullPct: "0.4%",
    uniquePct: "0.01%",
    description: "ISO 3166-1 alpha-2 country code resolved from IP address at signup time.",
    meaning: "Geographic code for localized tax computing, billing currencies, and geographic feature flags.",
    context: "Referenced by Billing compliance, regional localization teams, and security firewalls.",
    samples: ["US", "GB", "DE", "FR"],
    pattern: "^[A-Z]{2}$",
    relations: [],
    isFk: false,
    sensitivity: "Low",
    pii: false,
    complianceTags: ["GDPR"],
    confidence: 92,
  },
  revenue_usd: {
    nullPct: "8.7%",
    uniquePct: "5.0%",
    description: "Trailing 30-day gross revenue in USD, normalized using daily currency FX rates.",
    meaning: "Core financial KPI representing customer spending tiers and corporate subscription tier.",
    context: "Read by Finance, Executive Dashboard, billing engines, and investor relations.",
    samples: ["120.50", "1500.00", "0.00"],
    pattern: "^\\d+\\.\\d{2}$",
    relations: ["fact_revenue.amount_usd"],
    isFk: true,
    sensitivity: "Medium",
    pii: false,
    complianceTags: ["SOC2"],
    confidence: 94,
  },
  is_active: {
    nullPct: "0.0%",
    uniquePct: "0.0%",
    description: "True when the user has authenticated at least once within the last 30 days.",
    meaning: "Standard flag defining active user metrics (DAU/MAU) for active product tracking.",
    context: "Referenced by Growth marketing campaigns, Product analytics, and system monitoring.",
    samples: ["true", "false"],
    pattern: "^(true|false)$",
    relations: [],
    isFk: false,
    sensitivity: "Low",
    pii: false,
    complianceTags: [],
    confidence: 97,
  },
  plan_tier: {
    nullPct: "0.0%",
    uniquePct: "0.0%",
    description: "Subscription tier classification (free, basic, pro, team, or enterprise).",
    meaning: "Dictates system resource limits, user seating capacities, and access control scopes.",
    context: "Used by Billing engines, authentication gateways, and customer metrics.",
    samples: ["free", "pro", "enterprise"],
    pattern: "^(free|basic|pro|team|enterprise)$",
    relations: ["dim_plan.plan_tier"],
    isFk: true,
    sensitivity: "Low",
    pii: false,
    complianceTags: [],
    confidence: 96,
  },
  last_login: {
    nullPct: "12.3%",
    uniquePct: "10.0%",
    description: "Most recent successful authentication event timestamp in UTC.",
    meaning: "Last authentication audit trail used to trace session lifecycle and clean up inactive sessions.",
    context: "Monitored by Security and compliance, support engineering, and session garbage collector.",
    samples: ["2026-06-03 14:15:00", "2026-06-10 11:00:00"],
    pattern: "^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}$",
    relations: ["sessions.last_login"],
    isFk: true,
    sensitivity: "Low",
    pii: false,
    complianceTags: [],
    confidence: 93,
  },
  
  // Orders columns metadata
  order_id: {
    nullPct: "0.0%",
    uniquePct: "100.0%",
    description: "Unique order hash generated during Stripe checkout initiation.",
    meaning: "Primary transactional checkout lookup key mapping purchases in sales tables.",
    context: "Referenced by logistics, invoicing pipelines, and customer order management.",
    samples: ["ord-7b89f2a5-5b6f", "ord-fa025619-bc9d"],
    pattern: "^ord-[0-9a-f]{8}-[0-9a-f]{4}$",
    relations: ["payments.order_id"],
    isFk: false,
    sensitivity: "Low",
    pii: false,
    complianceTags: [],
    confidence: 99,
  },
  order_date: {
    nullPct: "0.0%",
    uniquePct: "100.0%",
    description: "Ingestion time when invoice was generated and processed.",
    meaning: "Standard order creation date cohort used for computing daily sales metrics.",
    context: "Finance reporting databases and inventory metrics lookup tables.",
    samples: ["2026-06-10 14:30:00", "2026-06-11 09:12:00"],
    pattern: "^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}$",
    relations: [],
    isFk: false,
    sensitivity: "Low",
    pii: false,
    complianceTags: [],
    confidence: 98,
  },
  amount_usd: {
    nullPct: "5.4%",
    uniquePct: "45.0%",
    description: "Gross payment total in USD processed through merchant gateway.",
    meaning: "Net transaction price charged to client, excluding applicable tax rebates.",
    context: "Referenced in payment ledgers, bookkeeping reconciliation, and executive dashboards.",
    samples: ["45.99", "129.00", "599.99"],
    pattern: "^\\d+\\.\\d{2}$",
    relations: ["fact_revenue.amount_usd"],
    isFk: false,
    sensitivity: "Medium",
    pii: false,
    complianceTags: [],
    confidence: 94,
  },
  status: {
    nullPct: "0.0%",
    uniquePct: "0.0%",
    description: "Checkout state ('pending', 'completed', 'cancelled').",
    meaning: "Fulfillment tracking trigger specifying whether products are shipped or active.",
    context: "Inventory routing logic, refunds process gates, and analytics monitors.",
    samples: ["completed", "pending", "cancelled"],
    pattern: "^(completed|pending|cancelled)$",
    relations: [],
    isFk: false,
    sensitivity: "Low",
    pii: false,
    complianceTags: [],
    confidence: 97,
  },

  // Payments columns metadata
  payment_id: {
    nullPct: "0.0%",
    uniquePct: "100.0%",
    description: "Merchant ledger transaction verification ID.",
    meaning: "Stripe payout token mapping transactional details for legal bookkeeping.",
    context: "Legal audits, reconciliation systems, and dispute resolution portals.",
    samples: ["ch_3M4v8xL2e", "ch_9Kd1p0E5w"],
    pattern: "^ch_[a-zA-Z0-9]{9,15}$",
    relations: [],
    isFk: false,
    sensitivity: "High",
    pii: false,
    complianceTags: ["PCI-DSS"],
    confidence: 96,
  },
  payment_method: {
    nullPct: "1.2%",
    uniquePct: "0.0%",
    description: "Payment channel name ('credit_card', 'paypal', 'apple_pay').",
    meaning: "Customer checkout choice mapping transactional fees processing classes.",
    context: "Invoicing tools, marketing conversion funnels, and checkout optimization logs.",
    samples: ["credit_card", "paypal", "apple_pay"],
    pattern: "^(credit_card|paypal|apple_pay|wire)$",
    relations: [],
    isFk: false,
    sensitivity: "Medium",
    pii: false,
    complianceTags: [],
    confidence: 95,
  },
  billing_zip: {
    nullPct: "18.5%",
    uniquePct: "10.0%",
    description: "Billing card ZIP / Postal Code verified through AVS.",
    meaning: "Zip code associated with card credit limit checks for fraud mitigation.",
    context: "Fraud monitors, payment gateways validation, and regional sales distribution audits.",
    samples: ["94103", "90210", "10011"],
    pattern: "^[0-9]{5}(-[0-9]{4})?$",
    relations: [],
    isFk: false,
    sensitivity: "High",
    pii: true,
    complianceTags: ["GDPR", "CCPA"],
    confidence: 91,
  },
};

function Dictionary() {
  const navigate = useNavigate();
  const { hasDataset, activeDatasetName, columns: wsColumns, metadataGenerated, refreshWorkspace } = useWorkspace();
  const [activeDataset, setActiveDataset] = useState("customers.csv");
  const [columns, setColumns] = useState<{ name: string; type: string }[]>([]);
  const [metadata, setMetadata] = useState<Record<string, ColMetadata>>({});
  const [isGenerated, setIsGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [query, setQuery] = useState("");
  const [expandedCols, setExpandedCols] = useState<Record<string, boolean>>({});

  // Sync from workspace context whenever hasDataset or wsColumns change
  useEffect(() => {
    if (!hasDataset) return;
    setActiveDataset(activeDatasetName || "customers.csv");
    if (wsColumns.length > 0) {
      setColumns(wsColumns.map((c) => ({ name: c.name, type: c.type })));
    }

    // Load metadata if already generated
    const generatedFlag = localStorage.getItem("schema_sense_metadata_generated");
    if (generatedFlag === "1") {
      setIsGenerated(true);
      const savedMeta = localStorage.getItem("schema_sense_dictionary_metadata");
      if (savedMeta) {
        try { setMetadata(JSON.parse(savedMeta)); } catch (_) {}
      }
    }
  }, [hasDataset, activeDatasetName, wsColumns, metadataGenerated]);


  const handleOpenGenerationModal = () => {
    setIsModalOpen(true);
  };

  const handleGenerationComplete = () => {
    setIsModalOpen(false);
    setIsGenerating(true);
    setGenerationStep(0);

    const GENERATION_STEPS = [
      "Analyzing Dataset",
      "Detecting Data Types",
      "Generating Definitions",
      "Mapping Relationships",
      "Running Governance Scan",
      "Preparing AI Context",
    ];

    // Animate through steps
    let step = 0;
    const stepInterval = setInterval(() => {
      step += 1;
      setGenerationStep(step);
      if (step >= GENERATION_STEPS.length) {
        clearInterval(stepInterval);
      }
    }, 700);

    // Call the backend governance API
    fetch("http://localhost:8000/governance/scan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        columns: columns.map((c) => c.name),
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        const scanMap = new Map();
        if (data && data.results) {
          data.results.forEach((r: any) => {
            scanMap.set(r.column, r);
          });
        }

        const newMeta: Record<string, ColMetadata> = { ...metadata };
        columns.forEach((col) => {
          const defaults = MOCK_METADATA_DATABASE[col.name];
          const scan = scanMap.get(col.name);

          let sensitivity = (defaults?.sensitivity || "Low") as "Low" | "Medium" | "High" | "Critical";
          if (scan) {
            const rl = scan.risk_level.toLowerCase();
            sensitivity = (rl.charAt(0).toUpperCase() + rl.slice(1)) as "Low" | "Medium" | "High" | "Critical"; // Capitalize: Low, Medium, High, Critical
          }

          let complianceTags = defaults?.complianceTags || [];
          if (scan && scan.tag && scan.tag !== "PUBLIC") {
            complianceTags = Array.from(new Set([...complianceTags, scan.tag]));
          }

          newMeta[col.name] = {
            name: col.name,
            type: col.type,
            nullPct: defaults?.nullPct || "0.0%",
            uniquePct: defaults?.uniquePct || "80.0%",
            description: defaults?.description || `AI-inferred description for column '${col.name}' identifying patterns and range bounds.`,
            meaning: defaults?.meaning || `Business definition mapping column '${col.name}' to core business entities.`,
            context: defaults?.context || "Used across database queries, lookup transformations, and analytical schemas.",
            samples: defaults?.samples || ["Value_A", "Value_B"],
            pattern: defaults?.pattern,
            relations: defaults?.relations || [],
            isFk: defaults?.isFk || false,
            sensitivity: sensitivity,
            pii: scan ? scan.pii : (defaults?.pii || false),
            complianceTags: complianceTags,
            confidence: defaults?.confidence || Math.floor(Math.random() * 15) + 82,
          };
        });

        // Also save scan data directly to schema_sense_governance_assets so the Governance page is updated!
        const govAssets = columns.map((col) => {
          const scan = scanMap.get(col.name);
          const defaults = MOCK_METADATA_DATABASE[col.name];

          let tagList = ["Internal"];
          if (scan && scan.tag && scan.tag !== "PUBLIC") {
            tagList = [scan.tag];
          } else if (defaults && defaults.complianceTags && defaults.complianceTags.length > 0) {
            tagList = defaults.complianceTags;
          }

          return {
            columnName: col.name,
            dataType: col.type,
            tags: tagList,
            businessMeaning: getBusinessMeaning(col.name),
            governanceCategory: getGovernanceCategory(col.name),
            classification: getClassificationLabel(col.name),
            complianceNotes: getComplianceNotes(col.name),
            suggestedUsage: getSuggestedUsage(col.name),
            piiType: scan && scan.pii ? (scan.tag === "PII" ? "Email" : "Government ID") : "None",
            confidence: defaults?.confidence || Math.floor(Math.random() * 15) + 82,
            owner: defaults?.sensitivity === "Critical" ? "Security Team" : "Data Platform Team",
            lastUpdated: new Date().toISOString().split("T")[0],
          };
        });

        localStorage.setItem("schema_sense_governance_assets", JSON.stringify(govAssets));
        setMetadata(newMeta);
        setIsGenerated(true);
        setIsGenerating(false);
        setGenerationStep(0);
        refreshWorkspace();

        try {
          localStorage.setItem("schema_sense_metadata_generated", "1");
          localStorage.setItem("schema_sense_dictionary_metadata", JSON.stringify(newMeta));
        } catch (_) {}
      })
      .catch((err) => {
        console.error("Backend scan failed, falling back to mock metadata:", err);
        // Fallback mock logic if server is offline
        const newMeta: Record<string, ColMetadata> = { ...metadata };
        columns.forEach((col) => {
          const defaults = MOCK_METADATA_DATABASE[col.name];
          newMeta[col.name] = {
            name: col.name,
            type: col.type,
            nullPct: defaults?.nullPct || "0.0%",
            uniquePct: defaults?.uniquePct || "80.0%",
            description: defaults?.description || `AI-inferred description for column '${col.name}' identifying patterns and range bounds.`,
            meaning: defaults?.meaning || `Business definition mapping column '${col.name}' to core business entities.`,
            context: defaults?.context || "Used across database queries, lookup transformations, and analytical schemas.",
            samples: defaults?.samples || ["Value_A", "Value_B"],
            pattern: defaults?.pattern,
            relations: defaults?.relations || [],
            isFk: defaults?.isFk || false,
            sensitivity: defaults?.sensitivity || "Low",
            pii: defaults?.pii || false,
            complianceTags: defaults?.complianceTags || [],
            confidence: defaults?.confidence || Math.floor(Math.random() * 15) + 82,
          };
        });
        setMetadata(newMeta);
        setIsGenerated(true);
        setIsGenerating(false);
        setGenerationStep(0);
        refreshWorkspace();

        try {
          localStorage.setItem("schema_sense_metadata_generated", "1");
          localStorage.setItem("schema_sense_dictionary_metadata", JSON.stringify(newMeta));
        } catch (_) {}
      });
  };

  const toggleExpand = (colName: string) => {
    setExpandedCols((prev) => ({
      ...prev,
      [colName]: !prev[colName],
    }));
  };

  // 1. Show Redesigned Empty State if no dataset exists
  if (!hasDataset) {
    return (
      <div className="py-12 space-y-8">
        <SectionTitle
          kicker="Data Dictionary"
          title={<>Data <span className="text-primary">Dictionary.</span></>}
          sub="Browse catalog attributes, database types, business definitions, and data compliance metadata."
        />
        <div className="mt-8">
          <EmptyState
            title="No Dataset Connected"
            description="Upload a dataset to generate visual data dictionaries, profile field formats, and trace metadata stats."
            features={[
              "AI definition generation",
              "Column type & null analysis",
              "Primary & foreign key detection",
              "PII classification tags",
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

  // Filter columns based on search query
  const filteredColumns = columns.filter((col) => {
    const term = query.toLowerCase();
    const meta = metadata[col.name];
    const matchName = col.name.toLowerCase().includes(term);
    const matchDesc = meta?.description?.toLowerCase().includes(term);
    const matchMeaning = meta?.meaning?.toLowerCase().includes(term);
    return matchName || matchDesc || matchMeaning;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <SectionTitle
            kicker={`Data Dictionary · ${activeDataset}`}
            title={<>Data <span className="text-primary">Dictionary.</span></>}
            sub="Browse catalog attributes, database types, business definitions, and data compliance metadata."
          />
        </div>

        {/* Generate / Action Button */}
        <div className="flex-shrink-0 self-start md:self-center">
          <button
            onClick={handleOpenGenerationModal}
            disabled={isGenerating}
            className="group flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground glow-lime transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-lg shadow-primary/20"
          >
            <Layers className="h-4 w-4" />
            {isGenerating ? "Generating..." : isGenerated ? "Regenerate Metadata" : "Generate Metadata"}
          </button>
        </div>
      </div>

      {/* ── Top Metrics Summary Scorecard Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <GlassCard className="p-4 flex flex-col justify-between min-h-[90px] border-border/40 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-primary/20" />
          <span className="text-[9px] font-mono-tight text-muted-foreground uppercase tracking-widest block mb-2">
            Metadata Coverage
          </span>
          <span className="font-display text-2xl font-bold text-foreground">
            {isGenerated ? "100.0%" : "0.0%"}
          </span>
        </GlassCard>
        
        <GlassCard className="p-4 flex flex-col justify-between min-h-[90px] border-border/40 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-primary/20" />
          <span className="text-[9px] font-mono-tight text-muted-foreground uppercase tracking-widest block mb-2">
            Total Columns Mapped
          </span>
          <span className="font-display text-2xl font-bold text-foreground">
            {columns.length}
          </span>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col justify-between min-h-[90px] border-border/40 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-primary/20" />
          <span className="text-[9px] font-mono-tight text-muted-foreground uppercase tracking-widest block mb-2">
            Governance Audit
          </span>
          <span className={`font-display text-sm font-bold flex items-center gap-1.5 ${isGenerated ? "text-emerald-500" : "text-amber-500 animate-pulse"}`}>
            {isGenerated ? (
              <>
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>100% Audited</span>
              </>
            ) : (
              <>
                <HelpCircle className="h-4 w-4 text-amber-500" />
                <span>Pending Audit</span>
              </>
            )}
          </span>
        </GlassCard>
      </div>

      {/* Search Bar */}
      <div>
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/60 px-4 py-3.5 backdrop-blur shadow-sm transition-all focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/5">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            id="dict-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search columns, definitions, business meaning..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 text-foreground"
          />
        </div>
      </div>

      {/* Main Content (Columns Grid/List) */}
      <div className="space-y-4">
        {isGenerating ? (
          // ── Full 6-step animated generation workflow ──
          <AnimatePresence mode="wait">
            <motion.div
              key="generating"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Smart Sampling Banner */}
              <SmartSamplingBanner samplePct={15} estimatedAccuracy={92} />

              {/* 6-step checklist card */}
              <GlassCard className="p-8 border-primary/20 bg-primary/5 shadow-[0_8px_30px_rgba(242,120,92,0.06)] relative overflow-hidden">
                {/* Animated top progress bar */}
                <motion.div
                  className="absolute top-0 left-0 h-1 bg-gradient-to-r from-primary to-emerald-400 shadow-[0_0_10px_rgba(242,120,92,0.8)]"
                  initial={{ width: "0%" }}
                  animate={{ width: `${Math.min(100, (generationStep / 6) * 100)}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />

                <div className="flex flex-col items-center justify-center text-center space-y-6">
                  <div className="space-y-1">
                    <h3 className="font-display text-lg font-bold tracking-tight text-foreground">
                      Generating AI Metadata
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Analyzing your dataset and building intelligent definitions...
                    </p>
                  </div>

                  {/* Step checklist */}
                  <div className="w-full max-w-sm border border-border/40 bg-background/50 rounded-2xl p-5 text-left space-y-3 shadow-inner">
                    {[
                      "Analyzing Dataset",
                      "Detecting Data Types",
                      "Generating Definitions",
                      "Mapping Relationships",
                      "Running Governance Scan",
                      "Preparing AI Context",
                    ].map((stepLabel, idx) => {
                      const isDone = idx < generationStep;
                      const isRunning = idx === generationStep;
                      const isPending = idx > generationStep;

                      return (
                        <motion.div
                          key={stepLabel}
                          initial={{ opacity: 0.4 }}
                          animate={{ opacity: isDone || isRunning ? 1 : 0.4 }}
                          className={`flex items-center justify-between text-xs transition-all duration-300 ${
                            isDone
                              ? "text-emerald-500 font-medium"
                              : isRunning
                              ? "text-primary font-bold"
                              : "text-muted-foreground/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {isDone ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            ) : isRunning ? (
                              <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border border-border bg-secondary/20 shrink-0 flex items-center justify-center text-[9px] font-bold">
                                {idx + 1}
                              </div>
                            )}
                            <span>{stepLabel}</span>
                          </div>
                          <span className="text-[9px] font-mono-tight uppercase tracking-wider">
                            {isDone ? "Done" : isRunning ? "Running" : "Queue"}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Progress percentage */}
                  <div className="w-full max-w-sm space-y-2">
                    <div className="flex justify-between font-mono-tight text-[10px] uppercase tracking-wider text-muted-foreground">
                      <span>Progress</span>
                      <span className="font-bold text-foreground">{Math.round((generationStep / 6) * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-border/40 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary glow-lime"
                        initial={{ width: "0%" }}
                        animate={{ width: `${Math.min(100, (generationStep / 6) * 100)}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Skeletons below the workflow card */}
              {Array.from({ length: 3 }).map((_, i) => <MetadataSkeleton key={i} />)}
            </motion.div>
          </AnimatePresence>
        ) : filteredColumns.length === 0 ? (
          <GlassCard className="py-12 text-center text-sm text-muted-foreground border-border/40">
            No columns match your search query.
          </GlassCard>
        ) : (
          filteredColumns.map((col) => {
            const hasMeta = !!metadata[col.name];
            
            // Build fallback mock metadata if not generated yet to prevent blank/broken pages
            const meta = metadata[col.name] || {
              name: col.name,
              type: col.type,
              nullPct: "Pending Inferences...",
              uniquePct: "Pending Inferences...",
              description: "AI description is pending audit. Please trigger 'Generate Metadata' to start automated catalog profiling.",
              meaning: "Business definitions mapping is pending audit.",
              context: "Usage context logs are pending database metadata profiles.",
              samples: ["Pending Ingestion"],
              relations: [],
              isFk: false,
              sensitivity: "Low",
              pii: false,
              complianceTags: [],
              confidence: 0, // 0 indicates pending
            };

            return (
              <MetadataCard
                key={col.name}
                column={col}
                meta={meta}
                isExpanded={!!expandedCols[col.name]}
                onToggle={() => toggleExpand(col.name)}
              />
            );
          })
        )}
      </div>


      {/* Generation Flow Modal */}
      <MetadataGenerationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onComplete={handleGenerationComplete}
      />
    </div>
  );
}