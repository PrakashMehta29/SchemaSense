export type GovernanceTag =
  | "PII"
  | "Sensitive"
  | "Financial"
  | "Internal"
  | "Public"
  | "Restricted";

export interface GovernanceAsset {
  columnName: string;
  dataType: string;
  tags: GovernanceTag[];
  riskScore: number;
  riskReason: string;
  piiType?: "Email" | "Phone Number" | "Address" | "Government ID" | "Bank Details" | "None";
  piiReason?: string;
  confidence: number;
}

export const GOVERNANCE_ASSETS: GovernanceAsset[] = [
  {
    columnName: "cust_id",
    dataType: "uuid",
    tags: ["Internal", "Restricted"],
    riskScore: 25,
    riskReason: "Account key linking customer transaction mappings.",
    piiType: "None",
    confidence: 98,
  },
  {
    columnName: "email",
    dataType: "string",
    tags: ["PII", "Sensitive"],
    riskScore: 92,
    riskReason: "Contains direct contact identifiers mapping to individual identities.",
    piiType: "Email",
    piiReason: "Identified standard SMTP formatting structures.",
    confidence: 95,
  },
  {
    columnName: "signup_ts",
    dataType: "timestamp",
    tags: ["Internal"],
    riskScore: 10,
    riskReason: "Standard temporal tracking index with no corporate privacy exposure.",
    piiType: "None",
    confidence: 99,
  },
  {
    columnName: "country",
    dataType: "string(2)",
    tags: ["Public"],
    riskScore: 5,
    riskReason: "Aggregated regional classification tags.",
    piiType: "None",
    confidence: 92,
  },
  {
    columnName: "revenue_usd",
    dataType: "decimal(12,2)",
    tags: ["Financial", "Restricted"],
    riskScore: 45,
    riskReason: "Contains corporate revenue values sensitive to financial disclosures.",
    piiType: "None",
    confidence: 94,
  },
  {
    columnName: "is_active",
    dataType: "boolean",
    tags: ["Internal"],
    riskScore: 8,
    riskReason: "Logical metrics tracker for corporate product utilization.",
    piiType: "None",
    confidence: 97,
  },
  {
    columnName: "plan_tier",
    dataType: "enum",
    tags: ["Internal"],
    riskScore: 12,
    riskReason: "Customer subscription classification settings.",
    piiType: "None",
    confidence: 96,
  },
  {
    columnName: "last_login",
    dataType: "timestamp",
    tags: ["Internal"],
    riskScore: 15,
    riskReason: "Audit timestamp tracing system authentication events.",
    piiType: "None",
    confidence: 93,
  },
];

export const getRiskSeverity = (score: number): "low" | "medium" | "high" | "critical" => {
  if (score >= 80) return "critical";
  if (score >= 50) return "high";
  if (score >= 20) return "medium";
  return "low";
};

export const getRiskColor = (score: number) => {
  if (score >= 80) return "text-red-500 border-red-500/20 bg-red-500/10";
  if (score >= 50) return "text-orange-500 border-orange-500/20 bg-orange-500/10";
  if (score >= 20) return "text-amber-500 border-amber-500/20 bg-amber-500/10";
  return "text-muted-foreground border-border bg-secondary/50";
};
