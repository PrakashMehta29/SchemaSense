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

export interface RichCatalogMetadata {
  criticality: "Critical" | "High" | "Medium" | "Low";
  aiExplanation: string;
  whyItMatters: string;
  dataFlowPosition: "Source Field" | "Transformation Field" | "Lookup Field" | "Reporting Field";
  dataFlowReason: string;
  businessImpactUsedIn: string[];
  businessImpactIfModified: string;
  similarColumns: string[];
  joinCandidates: string[];
  upstreamSources: string[];
  downstreamConsumers: string[];
  impactAssessment: string;
  metadataCompleteness: number;
  relationshipCoverage: number;
  samples: string[];
}

export const getRichCatalogMetadata = (columnName: string, columnType: string, confidenceScore?: number): RichCatalogMetadata => {
  const colLower = columnName.toLowerCase();
  
  // Default values
  let criticality: "Critical" | "High" | "Medium" | "Low" = "Medium";
  let aiExplanation = `This field represents standard operational attributes tracking ${columnName} values within the system.`;
  let whyItMatters = `${columnName} provides necessary transactional metadata to distinguish database attributes and support schema organization.`;
  let dataFlowPosition: "Source Field" | "Transformation Field" | "Lookup Field" | "Reporting Field" = "Transformation Field";
  let dataFlowReason = "Evaluated during ingestion staging to categorize operational records.";
  let businessImpactUsedIn = ["Operational Auditing", "Database Search"];
  let businessImpactIfModified = "May break operational queries or cause schema mismatch warning flags.";
  let similarColumns = [`${columnName}_id`, `${columnName}_code`].filter(s => s !== columnName);
  let joinCandidates = [`staging_${columnName}.${columnName}`];
  let upstreamSources = ["Internal ERP Landings"];
  let downstreamConsumers = ["Operations Dashboard", "Reporting Analytics"];
  let impactAssessment = "Changing this field affects 1 database layer and 1 active dashboard.";
  let metadataCompleteness = Math.floor(Math.random() * 8) + 84; // 84-92%
  let relationshipCoverage = Math.floor(Math.random() * 8) + 87; // 87-95%
  let samples = ["Value_A", "Value_B"];

  // Customer ID / User ID / Cust ID / Account ID / Client Code
  if (colLower === "cust_id" || colLower === "customer_id" || colLower.includes("customer")) {
    criticality = "Critical";
    aiExplanation = "This field acts as the primary identifier connecting customer records across operational and analytical systems.";
    whyItMatters = "It enables customer-centric tracking, cohort segmentation, and customer lifetime value computation. Without it, transactions cannot be associated with individual users.";
    dataFlowPosition = "Source Field";
    dataFlowReason = "Ingested directly from primary CRM logs and serves as a master lookup key.";
    businessImpactUsedIn = ["Billing Invoicing", "Customer Support Routing", "Growth Cohorts Analytics"];
    businessImpactIfModified = "Breaks joins in Finance Mart, Reporting Dashboard, and HubSpot CRM sync pipelines.";
    similarColumns = ["user_id", "account_id", "client_code"];
    joinCandidates = ["orders.cust_id", "payments.cust_id", "support.customer_id"];
    upstreamSources = ["Salesforce Account Directory Sync"];
    downstreamConsumers = ["Executive Reporting Dashboard", "Customer Analytics Mart"];
    impactAssessment = "Changing this field affects 4 datasets and 2 reports.";
    samples = ["0001bc5a-4ba5-4e23-bd43-466d6d25aee9", "fffe402a-d1d2-4be7-9bee-3f007087570a"];
  }
  // Email / Customer Email / Contact Email
  else if (colLower.includes("email")) {
    criticality = "High";
    aiExplanation = "Primary communication identifier used for transactional dispatches, direct marketing, and customer identity verification.";
    whyItMatters = "Serves as the main outreach channel for user notifications and billing alerts. Must be masked downstream under compliance laws.";
    dataFlowPosition = "Source Field";
    dataFlowReason = "Ingested directly from client registration forms and validated at landing.";
    businessImpactUsedIn = ["Identity Verification", "Growth Marketing Outreach", "Billing Notices"];
    businessImpactIfModified = "Affects notifications delivery, password resets, and sync with HubSpot/SendGrid.";
    similarColumns = ["contact_email", "secondary_email"];
    joinCandidates = ["raw.users.email", "marketing.contacts.email"];
    upstreamSources = ["Onboarding Registration Webhook"];
    downstreamConsumers = ["HubSpot Segment Sync", "dim_customers"];
    impactAssessment = "Changing this field affects 2 datasets and 1 automated sync.";
    samples = ["customer1@company.com", "user.name@domain.io", "support@firm.net"];
  }
  // Order ID / Payment ID / Invoice ID / ID
  else if (colLower.includes("id") && (colLower.includes("order") || colLower.includes("payment") || colLower.includes("invoice") || colLower.includes("checkout"))) {
    criticality = "Critical";
    aiExplanation = "Primary transaction key linking purchase ledgers, accounting books, and logistics tables.";
    whyItMatters = "Uniquely identifies sales events. Indispensable for ledger auditing, inventory tracking, and sales analytics.";
    dataFlowPosition = "Source Field";
    dataFlowReason = "Generated by checkout cart webhook and ingested as raw ledger reference.";
    businessImpactUsedIn = ["Purchase Reconciliation", "Sales Audit Compliance", "Shipping Logistics"];
    businessImpactIfModified = "Causes payment tracking failures and skews daily transaction volume charts.";
    similarColumns = ["transaction_hash", "checkout_id"];
    joinCandidates = ["payments.order_id", "invoices.invoice_id"];
    upstreamSources = ["Stripe API Gateway Webhook"];
    downstreamConsumers = ["Finance BI Dashboard", "Sales Ledgers Mart"];
    impactAssessment = "Changing this field affects 3 datasets and 2 reports.";
    samples = ["ord-7b89f2a5-5b6f", "ch_3M4v8xL2e-f00"];
  }
  // Code / Vendor Code / Supplier Code
  else if (colLower.includes("vendor") || colLower.includes("supplier") || colLower === "code") {
    criticality = "Critical";
    aiExplanation = "Primary identifier linking transactional ledgers to the supplier master records.";
    whyItMatters = "Vendor Code determines how corporate procurement transactions are tracked, audited, and reconciled. Necessary for payables control.";
    dataFlowPosition = "Source Field";
    dataFlowReason = "Ingested from supplier invoices and validated against ERP vendors index.";
    businessImpactUsedIn = ["Supplier Management", "Accounts Payable Auditing", "Purchase Ledgers"];
    businessImpactIfModified = "Breaks joins with procurement tables, affecting downstream supplier catalogs.";
    similarColumns = ["supplier_id", "vendor_id", "vendor_name"];
    joinCandidates = ["erp_purchase_ledger.vendor_code", "fact_invoice.vendor_code"];
    upstreamSources = ["SAP ERP Procurement Sync"];
    downstreamConsumers = ["Vendor Scorecard Dashboard", "Procurement Spend Mart"];
    impactAssessment = "Changing this field affects 3 datasets and 2 reports.";
    samples = ["VND-88012", "VND-19405", "VND-44910"];
  }
  // Revenue / Amount / Price / Spend / revenue_usd / amount_usd
  else if (colLower.includes("revenue") || colLower.includes("amount") || colLower.includes("price") || colLower.includes("spend") || colLower.includes("usd") || colLower.includes("salary")) {
    criticality = "Critical";
    aiExplanation = "Represents the core financial ledger metrics reporting transaction value.";
    whyItMatters = "Directly feeds MRR/ARR summaries, tax computations, and regulatory compliance reports.";
    dataFlowPosition = "Reporting Field";
    dataFlowReason = "Derived from pricing charts, converted using daily FX rates, and stored as decimal fields.";
    businessImpactUsedIn = ["Financial Planning (FP&A)", "VAT/Sales Tax Calculations", "Executive Board Reports"];
    businessImpactIfModified = "May corrupt ARR calculations, leading to tax auditing flags and reports errors.";
    similarColumns = ["net_amount", "gross_amount", "billing_total"];
    joinCandidates = ["fact_revenue.amount_usd", "ledger_postings.amount"];
    upstreamSources = ["Billing Engines / stripe.com"];
    downstreamConsumers = ["CFO Executive Boardroom", "Finance Mart"];
    impactAssessment = "Changing this field affects 3 datasets and 4 dashboards.";
    samples = ["120.50", "1500.00", "599.99"];
  }
  // Doc Type / Document Type
  else if (colLower.includes("doc_type") || colLower.includes("doctype") || colLower.includes("doc type") || colLower.includes("document_type")) {
    criticality = "High";
    aiExplanation = "Specifies the accounting document classification to determine routing rules and ledger groupings.";
    whyItMatters = "Doc Type determines how financial documents are categorized, routed, validated, and reported throughout the enterprise data ecosystem.";
    dataFlowPosition = "Transformation Field";
    dataFlowReason = "Used during staging transformations to classify transactional records.";
    businessImpactUsedIn = ["Invoice Processing", "Financial Reporting", "Vendor Reconciliation"];
    businessImpactIfModified = "May affect Finance Mart and Procurement Dashboard.";
    similarColumns = ["document_category", "invoice_type"];
    joinCandidates = ["erp_reference_codes.doc_type"];
    upstreamSources = ["Accounts Payable Ingestion Hub"];
    downstreamConsumers = ["Finance Ledger", "Tax Audit Logs"];
    impactAssessment = "Changing this field affects 2 datasets and 1 report.";
    samples = ["Invoice", "Credit Note", "Purchase Order", "Vendor Bill"];
  }
  // Country / Billing Country / Region
  else if (colLower.includes("country") || colLower.includes("region") || colLower.includes("state") || colLower.includes("city")) {
    criticality = "Medium";
    aiExplanation = "ISO standard regional reference indicating where the transacting customer or vendor is based.";
    whyItMatters = "Required to calculate localized VAT taxes, comply with global trade laws, and execute regional localization filters.";
    dataFlowPosition = "Lookup Field";
    dataFlowReason = "Resolved from user IP addresses at sign-up and matched against geographic reference tables.";
    businessImpactUsedIn = ["Geographical Sales Analysis", "VAT Compliance Auditing", "IP Security Firewalls"];
    businessImpactIfModified = "Will break localization rules and may lead to incorrect localized tax computations.";
    similarColumns = ["region_code", "country_iso", "billing_country"];
    joinCandidates = ["ref_countries.iso_code", "tax_rates.country_code"];
    upstreamSources = ["GeoIP Database Sync"];
    downstreamConsumers = ["Global Tax Reporting Mart", "Localization Analytics"];
    impactAssessment = "Changing this field affects 2 datasets and 1 tax report.";
    samples = ["India", "United States", "Germany", "United Kingdom"];
  }
  // Business Area / Department / Business Unit
  else if (colLower.includes("area") || colLower.includes("department") || colLower.includes("unit") || colLower.includes("branch")) {
    criticality = "Medium";
    aiExplanation = "Identifies the internal corporate organizational unit responsible for the operational expenses or reporting line.";
    whyItMatters = "Business Area determines how corporate organizational units report their cost footprints and structure internal operational boundaries.";
    dataFlowPosition = "Lookup Field";
    dataFlowReason = "Mapped during staging parsing to identify internal department ownership.";
    businessImpactUsedIn = ["Cost Center Budgeting", "Internal Cost Distribution", "Expense Approvals"];
    businessImpactIfModified = "Breaks cross-department chargeback dashboards.";
    similarColumns = ["department_id", "business_unit"];
    joinCandidates = ["org_hierarchy.business_area"];
    upstreamSources = ["Corporate Directory Database"];
    downstreamConsumers = ["CFO Spend Dashboard"];
    impactAssessment = "Changing this field affects 2 datasets and 1 dashboard.";
    samples = ["AP Accounting", "Procurement", "Growth Marketing"];
  }
  // Gl Account / GL / Cost Center / Budget Code
  else if (colLower.includes("gl_") || colLower.includes("gl") || colLower.includes("cost_center") || colLower.includes("cost") || colLower.includes("ledger")) {
    criticality = "Critical";
    aiExplanation = "General Ledger accounting classification code linking entries to the corporate chart of accounts.";
    whyItMatters = "Enables departmental chargebacks, corporate spend audits, and quarterly ledger rollups under GAAP/IFRS regulatory scopes.";
    dataFlowPosition = "Transformation Field";
    dataFlowReason = "Standardized from transactional notes during ingestion mapping to match accounting chart rules.";
    businessImpactUsedIn = ["General Ledger Auditing", "Corporate Budget Allocations", "Regulatory Tax Compliance"];
    businessImpactIfModified = "Breaks automated expense allocations and skews department spending indicators.";
    similarColumns = ["chart_of_accounts_code", "budget_code"];
    joinCandidates = ["chart_of_accounts.gl_code", "cost_centers.id"];
    upstreamSources = ["ERP General Ledger Ledger API"];
    downstreamConsumers = ["Finance Audit Ledger", "CFO Cashflow Dashboard"];
    impactAssessment = "Changing this field affects 4 corporate ledger systems.";
    samples = ["GL-50124", "GL-20188", "CC-8422"];
  }
  // Sign up TS / Signup Time / Date / Last Login / Timestamp / Created At
  else if (colLower.includes("ts") || colLower.includes("time") || colLower.includes("date") || colLower.includes("login") || colLower.includes("created")) {
    criticality = "Medium";
    aiExplanation = "Operational event timestamp in UTC tracking transaction lifecycle or account audits.";
    whyItMatters = "Used as cohort references in Growth Analytics (retention, sign-ups, churn) and for security auth tracking.";
    dataFlowPosition = "Transformation Field";
    dataFlowReason = "Captured at event dispatch, converted to standard ISO timestamp formatting, and indexed.";
    businessImpactUsedIn = ["Security Auth Audit Log", "Cohort Retention Metrics", "Lifecycle Triggers"];
    businessImpactIfModified = "Breaks historical cohort analysis and invalidates authentication timeout evaluations.";
    similarColumns = ["event_timestamp", "created_date", "creation_ts"];
    joinCandidates = ["sessions.last_login", "cohort_analysis.signup_ts"];
    upstreamSources = ["Auth0 Gateway logs", "System Landings"];
    downstreamConsumers = ["Identity Audits Mart", "Product KPI Dashboard"];
    impactAssessment = "Changing this field affects 2 datasets and 1 audit dashboard.";
    samples = ["2026-06-13 14:15:00", "2024-01-02 08:32:00"];
  }
  // Is Active / Active / Is Null / Enabled
  else if (colLower.includes("active") || colLower.includes("status") || colLower.includes("is_") || colLower.includes("has_") || colLower.includes("enabled")) {
    criticality = "Medium";
    aiExplanation = "Status flag indicating whether the entity is active, enabled, or within active retention thresholds.";
    whyItMatters = "Used to filter active cohorts (e.g. DAU/MAU) and control subscription/access rights.";
    dataFlowPosition = "Reporting Field";
    dataFlowReason = "Derived from daily transaction event lookups and updated as a boolean indicator.";
    businessImpactUsedIn = ["DAU/MAU Reporting", "Active Billing Filters", "Security Authorization Checkers"];
    businessImpactIfModified = "Incorrect flags can lock users out of system permissions or skew active cohort reporting.";
    similarColumns = ["enabled_status", "membership_flag"];
    joinCandidates = ["dim_customers.is_active"];
    upstreamSources = ["System Auth logs check"];
    downstreamConsumers = ["Growth KPI Board", "Security Audit"];
    impactAssessment = "Changing this field affects 1 database layer and 2 reports.";
    samples = ["Active", "Inactive", "Pending"];
  }
  // Plan Tier / Tier / Role / Scope
  else if (colLower.includes("tier") || colLower.includes("role") || colLower.includes("scope") || colLower.includes("permissions")) {
    criticality = "High";
    aiExplanation = "Subscription plan tier or permissions scope classification regulating system boundaries.";
    whyItMatters = "Directly dictates user limits, access scopes, and triggers tiered billing invoices.";
    dataFlowPosition = "Lookup Field";
    dataFlowReason = "Mapped from billing subscription profiles and validated against active tokens.";
    businessImpactUsedIn = ["Access Controls Gates", "Billing Price Calculations", "Product Capability Mappings"];
    businessImpactIfModified = "Can bypass payment boundaries (causing leakage) or lock paying users out of system features.";
    similarColumns = ["subscription_plan", "user_group"];
    joinCandidates = ["dim_plan.plan_tier", "access_control.role_id"];
    upstreamSources = ["Billing Engines Sync"];
    downstreamConsumers = ["Growth Board", "Gateway Auth Module"];
    impactAssessment = "Changing this field affects 2 databases and 1 billing gateway.";
    samples = ["free", "pro", "enterprise"];
  }
  
  return {
    criticality,
    aiExplanation,
    whyItMatters,
    dataFlowPosition,
    dataFlowReason,
    businessImpactUsedIn,
    businessImpactIfModified,
    similarColumns,
    joinCandidates,
    upstreamSources,
    downstreamConsumers,
    impactAssessment,
    metadataCompleteness,
    relationshipCoverage,
    samples,
  };
};
