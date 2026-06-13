export interface MockAIResponse {
  answer: string;
  sources: string[];
  confidence: number;
  contextCard?: {
    title: string;
    type: string;
    nullPct: string;
    uniquePct: string;
    pii: boolean;
    sensitivity: "Low" | "Medium" | "High" | "Critical";
    tables: string[];
    description: string;
  };
}

export const MOCK_RESPONSES: Record<string, MockAIResponse> = {
  customer_id: {
    answer:
      "The customer_id field is a unique identifier (UUID) assigned to each registered user. It originates in raw.users during onboarding and propagates downstream to dim_customers and fact_sales. It has zero null entries and 100% uniqueness.",
    sources: ["raw.users.id", "stg_customers.cust_id", "dim_customers.cust_id"],
    confidence: 98,
    contextCard: {
      title: "customer_id",
      type: "uuid",
      nullPct: "0.0%",
      uniquePct: "100.0%",
      pii: false,
      sensitivity: "Medium",
      tables: ["raw.users", "stg_customers", "dim_customers", "fact_sales"],
      description:
        "Primary key for identifying accounts. Indexed across CRM and transactional order registries.",
    },
  },
  revenue_usd: {
    answer:
      "revenue_usd holds normalized gross financial transaction amounts measured in USD. Ingestion logs convert local transactions into USD using daily spot rates. It is a critical metric consumed by downstream marts.",
    sources: ["raw.payments.amount", "stg_revenue.amount_usd", "fact_sales.revenue_usd"],
    confidence: 96,
    contextCard: {
      title: "revenue_usd",
      type: "decimal(12,2)",
      nullPct: "8.7%",
      uniquePct: "5.0%",
      pii: false,
      sensitivity: "Medium",
      tables: ["stg_revenue", "fact_sales"],
      description:
        "Aggregated gross sales values normalized to US dollars. Feeds the Executive Revenue reports.",
    },
  },
  pii: {
    answer:
      "Currently, PII (Personally Identifiable Information) has been detected in 2 catalog fields under the dim_customers schema: `email` (Customer electronic email address) and `phone_number` (Contact number). It is recommended to restrict access bounds for these fields.",
    sources: ["raw.users.email", "dim_customers.email", "dim_customers.phone_number"],
    confidence: 99,
  },
  relationships: {
    answer:
      "Yes, the primary dataset relationships follow the ingestion path: raw.users and raw.events join on user_id to form stg_customers. Transactions from raw.payments flow through stg_revenue and merge with stg_orders into the fact_sales mart, which ultimately feeds the executive_dashboard.",
    sources: ["stg_customers", "fact_sales", "executive_dashboard"],
    confidence: 94,
  },
  executive_dashboard: {
    answer:
      "The executive_dashboard relies directly on the fact_sales table. It reports trailing metric cards: Monthly Recurring Revenue (MRR), Active Subscription Tiers, and regional purchase breakdowns.",
    sources: ["fact_sales", "dim_customers"],
    confidence: 95,
  },
  default: {
    answer:
      "I checked the schema and data quality indices. The queried field contains normal values, matching catalog definitions with a high confidence score. Let me know if you would like me to audit its lineage paths or PII compliance rules.",
    sources: ["schema_sense_dictionary"],
    confidence: 90,
  },
};
