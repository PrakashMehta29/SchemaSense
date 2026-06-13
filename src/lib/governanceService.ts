export type AIDataCategory = 
  | "Business Identifier"
  | "Financial Data"
  | "Operational Data"
  | "Organizational Data"
  | "Reference Data"
  | "Sensitive Data"
  | "PII"
  | "Public Data";

export type GovernanceTag = "PII" | "Sensitive" | "Financial" | "Internal" | "Public" | "Restricted";

export interface GovernanceAsset {
  columnName: string;
  dataType: string;
  tags: string[]; // General compliance references (e.g. GDPR, CCPA, PCI-DSS)
  businessMeaning: string;
  governanceCategory: AIDataCategory;
  classification: string; // Detailed label: Financial Identifier, Accounting Classification, etc.
  complianceNotes: string;
  suggestedUsage: string;
  confidence: number;
  owner?: string;
  lastUpdated?: string;
}

export const getGovernanceCategory = (columnName: string): AIDataCategory => {
  const colLower = columnName.toLowerCase();
  
  if (colLower === "cust_id" || colLower === "customer_id") return "Business Identifier";
  if (colLower === "vendor_code" || colLower === "vendorcode" || colLower === "code") return "Business Identifier";
  if (colLower.includes("email") || colLower.includes("phone")) return "PII";
  if (colLower.includes("bank") || colLower.includes("gl_") || colLower.includes("revenue") || colLower.includes("amount") || colLower.includes("cost")) return "Financial Data";
  if (colLower.includes("ts") || colLower.includes("time") || colLower.includes("date") || colLower === "is_active") return "Operational Data";
  if (colLower.includes("area") || colLower === "plan_tier") return "Organizational Data";
  if (colLower === "country" || colLower === "doc_type" || colLower === "doctype" || colLower === "reference" || colLower === "ref") return "Reference Data";
  if (colLower.includes("text")) return "Public Data";
  
  return "Operational Data";
};

export const getClassificationLabel = (columnName: string): string => {
  const colLower = columnName.toLowerCase();
  
  if (colLower.includes("bank") && colLower.includes("id")) return "Financial Identifier";
  if (colLower.includes("gl") && colLower.includes("account")) return "Accounting Classification";
  if (colLower.includes("vendor") && colLower.includes("code")) return "Business Identifier";
  if (colLower.includes("cost") && colLower.includes("centre")) return "Financial Dimension";
  if (colLower.includes("cost") && colLower.includes("center")) return "Financial Dimension";
  if (colLower === "cust_id" || colLower === "customer_id") return "Business Identifier";
  if (colLower === "code") return "Business Identifier";
  if (colLower.includes("email")) return "PII (Email Address)";
  if (colLower.includes("phone")) return "PII (Phone Number)";
  if (colLower === "billing_zip" || colLower === "zip") return "Financial Location Metadata";
  if (colLower.includes("revenue") || colLower.includes("amount")) return "Financial Ledger Metric";
  if (colLower.includes("ts") || colLower.includes("time") || colLower.includes("date")) return "Operational Timestamp";
  if (colLower === "country") return "Geographic Reference";
  if (colLower === "is_active") return "Account Activity Flag";
  if (colLower === "plan_tier") return "Customer Tier Grouping";
  if (colLower === "doc_type" || colLower === "doctype") return "Document Category Classification";
  if (colLower === "reference" || colLower === "ref") return "Transaction Reference Key";
  if (colLower.includes("text")) return "Descriptive Text Field";
  
  return "Standard Data Attribute";
};

export const getComplianceNotes = (columnName: string): string => {
  const colLower = columnName.toLowerCase();
  
  if (colLower.includes("bank") && colLower.includes("id")) {
    return "Subject to GLBA financial privacy audits. Requires strict access controls and logging.";
  }
  if (colLower.includes("gl") && colLower.includes("account")) {
    return "SOX scope financial asset. Audit trails required for General Ledger postings.";
  }
  if (colLower.includes("vendor") && colLower.includes("code")) {
    return "Corporate procurement master data. Governed by supplier validation policies.";
  }
  if (colLower.includes("cost") && colLower.includes("centre")) {
    return "Internal corporate financial dimension. Access restricted to management and accounting groups.";
  }
  if (colLower.includes("cost") && colLower.includes("center")) {
    return "Internal corporate financial dimension. Access restricted to management and accounting groups.";
  }
  if (colLower.includes("email") || colLower.includes("phone")) {
    return "High PII risk under GDPR / CCPA. Requires hashing, encryption, or masking in non-production environments.";
  }
  if (colLower === "billing_zip" || colLower === "zip") {
    return "Subject to PCI-DSS scope constraints if stored adjacent to credit card assets.";
  }
  if (colLower.includes("revenue") || colLower.includes("amount")) {
    return "Subject to internal corporate disclosure compliance and SEC accounting validation.";
  }
  
  return "Standard corporate attribute. Covered under default internal metadata retention and usage policies.";
};

export const getSuggestedUsage = (columnName: string): string => {
  const colLower = columnName.toLowerCase();
  
  if (colLower.includes("bank") && colLower.includes("id")) {
    return "Used to resolve bank routing and financial institution lookups in payables and payout pipelines.";
  }
  if (colLower.includes("gl") && colLower.includes("account")) {
    return "Used by corporate accounting to categorize transaction postings in the General Ledger.";
  }
  if (colLower.includes("vendor") && colLower.includes("code")) {
    return "Primary join key for mapping transaction logs to supplier profile directories.";
  }
  if (colLower.includes("cost") && colLower.includes("centre")) {
    return "Used in budgeting modules to allocate transaction expenses to specific business divisions.";
  }
  if (colLower.includes("cost") && colLower.includes("center")) {
    return "Used in budgeting modules to allocate transaction expenses to specific business divisions.";
  }
  if (colLower.includes("email")) {
    return "Primary contact target for notifications, marketing campaigns, and transaction receipt dispatches.";
  }
  if (colLower === "cust_id" || colLower === "customer_id") {
    return "Primary lookup key for activity profiling, profile consolidation, and activity routing.";
  }
  if (colLower.includes("revenue") || colLower.includes("amount")) {
    return "Aggregated for revenue projections, sales metrics reporting, and executive dashboards.";
  }
  if (colLower === "doc_type" || colLower === "doctype") {
    return "Used to branch processing logic based on invoice vs. PO vs. rebate documents.";
  }
  
  return "Used in general database reporting, lookup conversions, and catalog profiling.";
};

export const getBusinessMeaning = (columnName: string): string => {
  const colLower = columnName.toLowerCase();
  
  if (colLower.includes("vendor") && colLower.includes("code")) {
    return "Unique identifier assigned to a supplier within the procurement system.";
  }
  if (colLower.includes("business") && colLower.includes("area")) {
    return "Organizational unit responsible for business operations and reporting.";
  }
  if (colLower === "reference" || colLower === "ref") {
    return "External document or transaction reference used for traceability.";
  }
  if (colLower.includes("item") && colLower.includes("text")) {
    return "Human-readable description of the product or service.";
  }
  if (colLower.includes("bank") && colLower.includes("id")) {
    return "Financial institution identifier associated with banking transactions.";
  }
  if (colLower.includes("gl") && colLower.includes("account")) {
    return "General Ledger account used for accounting classification and reporting.";
  }
  if (colLower.includes("cost") && colLower.includes("centre")) {
    return "Organizational cost allocation unit used for budgeting and financial control.";
  }
  if (colLower.includes("cost") && colLower.includes("center")) {
    return "Organizational cost allocation unit used for budgeting and financial control.";
  }
  if (colLower.includes("header") && colLower.includes("text")) {
    return "High-level description summarizing the business transaction.";
  }
  if (colLower === "code") {
    return "Unique identifier assigned to a business record or transaction.";
  }
  if (colLower === "doc_type" || colLower === "doctype") {
    return "Category of business document such as invoice, purchase order, or credit note.";
  }
  if (colLower.includes("email")) {
    return "Email address associated with a customer account.";
  }
  if (colLower.includes("revenue") || colLower.includes("amount")) {
    return "Monetary value generated from a business transaction.";
  }
  if (colLower === "cust_id" || colLower === "customer_id") {
    return "Unique customer identifier assigned at account creation.";
  }
  if (colLower === "signup_ts" || colLower === "signup_time") {
    return "UTC timestamp marking the moment the user completed onboarding.";
  }
  if (colLower === "country") {
    return "Geographic classification code for localized tax computing and reporting.";
  }
  if (colLower === "is_active") {
    return "Boolean flag indicating whether the customer has been active in the last 30 days.";
  }
  if (colLower === "plan_tier") {
    return "Subscription tier classification determining resource limits and access scopes.";
  }
  if (colLower === "last_login") {
    return "Most recent successful authentication timestamp in UTC.";
  }
  if (colLower === "order_id") {
    return "Unique transactional checkout lookup key mapping purchases in sales tables.";
  }
  if (colLower === "order_date") {
    return "Standard order creation date cohort used for computing daily sales metrics.";
  }
  if (colLower === "payment_id") {
    return "Merchant ledger transaction verification ID for Stripe payouts.";
  }
  if (colLower === "payment_method") {
    return "Payment channel selected during checkout (e.g. credit_card, paypal).";
  }
  if (colLower === "billing_zip" || colLower === "zip") {
    return "Billing postal code verified through Address Verification System.";
  }
  
  const readableName = columnName
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return `Business attribute representing the logical '${readableName}' data metric.`;
};

export const GOVERNANCE_ASSETS: GovernanceAsset[] = [
  {
    columnName: "cust_id",
    dataType: "uuid",
    tags: ["GDPR", "CCPA"],
    businessMeaning: "Unique customer identifier assigned at account creation.",
    governanceCategory: "Business Identifier",
    classification: "Business Identifier",
    complianceNotes: getComplianceNotes("cust_id"),
    suggestedUsage: getSuggestedUsage("cust_id"),
    confidence: 98,
    owner: "Identity Platform Team",
    lastUpdated: "2026-06-12",
  },
  {
    columnName: "email",
    dataType: "string",
    tags: ["PII", "GDPR"],
    businessMeaning: "Email address associated with a customer account.",
    governanceCategory: "PII",
    classification: "PII (Email Address)",
    complianceNotes: getComplianceNotes("email"),
    suggestedUsage: getSuggestedUsage("email"),
    confidence: 95,
    owner: "Growth Marketing Team",
    lastUpdated: "2026-06-13",
  },
  {
    columnName: "signup_ts",
    dataType: "timestamp",
    tags: ["Internal"],
    businessMeaning: "UTC timestamp marking the moment the user completed onboarding.",
    governanceCategory: "Operational Data",
    classification: "Operational Timestamp",
    complianceNotes: getComplianceNotes("signup_ts"),
    suggestedUsage: getSuggestedUsage("signup_ts"),
    confidence: 99,
    owner: "Product Analytics Team",
    lastUpdated: "2026-06-10",
  },
  {
    columnName: "country",
    dataType: "string(2)",
    tags: ["Public"],
    businessMeaning: "Geographic classification code for localized tax computing and reporting.",
    governanceCategory: "Reference Data",
    classification: "Geographic Reference",
    complianceNotes: getComplianceNotes("country"),
    suggestedUsage: getSuggestedUsage("country"),
    confidence: 92,
    owner: "Localization Ops",
    lastUpdated: "2026-06-08",
  },
  {
    columnName: "revenue_usd",
    dataType: "decimal(12,2)",
    tags: ["Financial", "Restricted"],
    businessMeaning: "Monetary value generated from a business transaction.",
    governanceCategory: "Financial Data",
    classification: "Financial Ledger Metric",
    complianceNotes: getComplianceNotes("revenue_usd"),
    suggestedUsage: getSuggestedUsage("revenue_usd"),
    confidence: 94,
    owner: "Finance Systems",
    lastUpdated: "2026-06-11",
  },
  {
    columnName: "is_active",
    dataType: "boolean",
    tags: ["Internal"],
    businessMeaning: "Boolean flag indicating whether the customer has been active in the last 30 days.",
    governanceCategory: "Operational Data",
    classification: "Account Activity Flag",
    complianceNotes: getComplianceNotes("is_active"),
    suggestedUsage: getSuggestedUsage("is_active"),
    confidence: 97,
    owner: "Growth Marketing Team",
    lastUpdated: "2026-06-12",
  },
  {
    columnName: "plan_tier",
    dataType: "enum",
    tags: ["Internal"],
    businessMeaning: "Subscription tier classification determining resource limits and access scopes.",
    governanceCategory: "Organizational Data",
    classification: "Customer Tier Grouping",
    complianceNotes: getComplianceNotes("plan_tier"),
    suggestedUsage: getSuggestedUsage("plan_tier"),
    confidence: 96,
    owner: "Billing Platform Team",
    lastUpdated: "2026-06-13",
  },
  {
    columnName: "last_login",
    dataType: "timestamp",
    tags: ["Internal"],
    businessMeaning: "Most recent successful authentication timestamp in UTC.",
    governanceCategory: "Operational Data",
    classification: "Operational Timestamp",
    complianceNotes: getComplianceNotes("last_login"),
    suggestedUsage: getSuggestedUsage("last_login"),
    confidence: 93,
    owner: "Security Ops",
    lastUpdated: "2026-06-12",
  },
];
