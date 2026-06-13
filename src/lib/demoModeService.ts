export interface DatasetColumn {
  name: string;
  type: string;
  null: string;
}

export interface Dataset {
  name: string;
  size: string;
  uploadDate: string;
  status: "Active" | "Pending";
  metadataGenerated: boolean;
  healthScore: number;
  columns: DatasetColumn[];
  rows?: string;
}

export const CUSTOMERS_COLUMNS: DatasetColumn[] = [
  { name: "cust_id", type: "uuid", null: "0%" },
  { name: "email", type: "string", null: "2.1%" },
  { name: "signup_ts", type: "timestamp", null: "0%" },
  { name: "country", type: "string", null: "0.4%" },
  { name: "revenue_usd", type: "decimal(12,2)", null: "8.7%" },
  { name: "is_active", type: "boolean", null: "0%" },
  { name: "plan_tier", type: "enum", null: "0%" },
  { name: "last_login", type: "timestamp", null: "12.3%" },
];

export const ORDERS_COLUMNS: DatasetColumn[] = [
  { name: "order_id", type: "uuid", null: "0%" },
  { name: "cust_id", type: "uuid", null: "0%" },
  { name: "order_date", type: "timestamp", null: "0%" },
  { name: "amount_usd", type: "decimal(12,2)", null: "5.4%" },
  { name: "status", type: "enum", null: "0%" },
];

export const PAYMENTS_COLUMNS: DatasetColumn[] = [
  { name: "payment_id", type: "uuid", null: "0%" },
  { name: "order_id", type: "uuid", null: "0%" },
  { name: "payment_method", type: "string", null: "1.2%" },
  { name: "billing_zip", type: "string", null: "18.5%" },
];

export const DEMO_DATASETS: Dataset[] = [
  {
    name: "customers.csv",
    size: "24.5 MB",
    uploadDate: "2026-06-11",
    status: "Active",
    metadataGenerated: true,
    healthScore: 92,
    columns: CUSTOMERS_COLUMNS,
    rows: "1.2M",
  },
  {
    name: "orders.csv",
    size: "12.8 MB",
    uploadDate: "2026-06-11",
    status: "Active",
    metadataGenerated: true,
    healthScore: 88,
    columns: ORDERS_COLUMNS,
    rows: "3.4M",
  },
  {
    name: "payments.csv",
    size: "6.2 MB",
    uploadDate: "2026-06-11",
    status: "Active",
    metadataGenerated: true,
    healthScore: 95,
    columns: PAYMENTS_COLUMNS,
    rows: "900K",
  },
];

const DEMO_METADATA = {
  cust_id: {
    name: "cust_id",
    type: "uuid",
    nullPct: "0.0%",
    uniquePct: "100.0%",
    description: "Unique customer identifier assigned at account creation. Immutable once set.",
    meaning:
      "Primary lookup key for customer profile routing. Syncs downstream with Salesforce Account ID.",
    context:
      "Referenced by billing, support systems, product analytics, and customer success teams.",
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
    name: "email",
    type: "string",
    nullPct: "2.1%",
    uniquePct: "92.4%",
    description:
      "Primary contact email address. Lower-cased, validated and trimmed during ingestion.",
    meaning:
      "Primary email address for marketing campaigns, billing invoices, and notification dispatches.",
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
    name: "signup_ts",
    type: "timestamp",
    nullPct: "0.0%",
    uniquePct: "10.4%",
    description:
      "UTC timestamp marking the moment the user completed onboarding, signed terms, and activated account.",
    meaning:
      "Cohort reference timestamp for product activation, retention models, and churn metrics.",
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
    name: "country",
    type: "string(2)",
    nullPct: "0.4%",
    uniquePct: "0.01%",
    description: "ISO 3166-1 alpha-2 country code resolved from IP address at signup time.",
    meaning:
      "Geographic code for localized tax computing, billing currencies, and geographic feature flags.",
    context:
      "Referenced by Billing compliance, regional localization teams, and security firewalls.",
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
    name: "revenue_usd",
    type: "decimal(12,2)",
    nullPct: "8.7%",
    uniquePct: "5.0%",
    description: "Trailing 30-day gross revenue in USD, normalized using daily currency FX rates.",
    meaning:
      "Core financial KPI representing customer spending tiers and corporate subscription tier.",
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
    name: "is_active",
    type: "boolean",
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
    name: "plan_tier",
    type: "enum",
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
    name: "last_login",
    type: "timestamp",
    nullPct: "12.3%",
    uniquePct: "10.0%",
    description: "Most recent successful authentication event timestamp in UTC.",
    meaning:
      "Last authentication audit trail used to trace session lifecycle and clean up inactive sessions.",
    context:
      "Monitored by Security and compliance, support engineering, and session garbage collector.",
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
    name: "order_id",
    type: "uuid",
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
    name: "order_date",
    type: "timestamp",
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
    name: "amount_usd",
    type: "decimal(12,2)",
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
    name: "status",
    type: "enum",
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
    name: "payment_id",
    type: "uuid",
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
    name: "payment_method",
    type: "string",
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
    name: "billing_zip",
    type: "string",
    nullPct: "18.5%",
    uniquePct: "10.0%",
    description: "Billing card ZIP / Postal Code verified through AVS.",
    meaning: "Zip code associated with card credit limit checks for fraud mitigation.",
    context: "Fraud monitors, payment gateways validation, and regional sales distribution audits.",
    samples: ["94103", "90210", "10011"],
    pattern: "^[0-9]{5}(-[0-9]{4})?$",
    relations: [],
    isFk: false,
    sensitivity: "Sensitive",
    pii: true,
    complianceTags: ["GDPR", "CCPA"],
    confidence: 91,
  },
};

const DEMO_CONVERSATIONS = [
  {
    id: "conv-1",
    title: "PII Security Audit",
    preview: "Which datasets contain sensitive user data?",
    messages: [
      { id: "m-1", role: "user", text: "Which datasets contain PII?", timestamp: "10:24 AM" },
      {
        id: "m-2",
        role: "ai",
        text: "Personally Identifiable Information (PII) is flagged in two columns in dim_customers: email (Critical) and phone_number (High). Compliance locks suggest masking these downstream.",
        timestamp: "10:25 AM",
      },
    ],
  },
  {
    id: "conv-2",
    title: "Revenue Table Lineage",
    preview: "Where does revenue_usd come from?",
    messages: [
      { id: "m-3", role: "user", text: "Explain revenue_usd.", timestamp: "Yesterday" },
      {
        id: "m-4",
        role: "ai",
        text: "revenue_usd stores gross transactional values in US Dollars, computed by checking local purchase rates during payment processing. It is consumed by executive reporting dashboards.",
        timestamp: "Yesterday",
      },
    ],
  },
];

export const isDemoModeActive = () => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("schema_sense_demo_active") === "1";
};

export const getActiveDatasetName = (): string => {
  if (typeof window === "undefined") return "customers.csv";
  return localStorage.getItem("schema_sense_active_dataset") || "customers.csv";
};

export const getDatasets = (): Dataset[] => {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem("schema_sense_datasets");
  return saved ? JSON.parse(saved) : [];
};

export const switchDataset = (name: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("schema_sense_active_dataset", name);
  const datasets = getDatasets();
  const dataset = datasets.find((d) => d.name === name);
  if (dataset) {
    localStorage.setItem("schema_sense_cols", JSON.stringify(dataset.columns));
  }
};

export const enableDemoMode = () => {
  if (typeof window === "undefined") return;
  localStorage.setItem("schema_sense_datasets", JSON.stringify(DEMO_DATASETS));
  localStorage.setItem("schema_sense_active_dataset", "customers.csv");
  localStorage.setItem("schema_sense_cols", JSON.stringify(CUSTOMERS_COLUMNS));
  localStorage.setItem("schema_sense_metadata_generated", "1");
  localStorage.setItem("schema_sense_dictionary_metadata", JSON.stringify(DEMO_METADATA));
  localStorage.setItem("schema_sense_lineage_generated", "1");
  localStorage.setItem("schema_sense_all_conversations", JSON.stringify(DEMO_CONVERSATIONS));
  localStorage.setItem("schema_sense_demo_active", "1");
  window.location.reload();
};

export const disableDemoMode = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("schema_sense_datasets");
  localStorage.removeItem("schema_sense_active_dataset");
  localStorage.removeItem("schema_sense_cols");
  localStorage.removeItem("schema_sense_metadata_generated");
  localStorage.removeItem("schema_sense_dictionary_metadata");
  localStorage.removeItem("schema_sense_lineage_generated");
  localStorage.removeItem("schema_sense_all_conversations");
  localStorage.removeItem("schema_sense_demo_active");
  window.location.reload();
};
