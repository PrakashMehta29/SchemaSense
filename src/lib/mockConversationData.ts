export interface ChatConversation {
  id: string;
  title: string;
  preview: string;
  messages: { id: string; role: "user" | "ai"; text: string; timestamp: string }[];
}

export interface AIInsightCard {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  metric?: string;
}

export const MOCK_CONVERSATIONS: ChatConversation[] = [
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

export const MOCK_INSIGHTS: AIInsightCard[] = [
  {
    id: "ins-1",
    title: "Potential PII Detected",
    description:
      "Fields 'email' and 'phone_number' in dim_customers contain direct identifier keys.",
    severity: "critical",
    metric: "2 Columns",
  },
  {
    id: "ins-2",
    title: "Schema Drift Alert",
    description: "Ingestion pipeline orders.v3 detects a missing upstream column 'discount_code'.",
    severity: "high",
    metric: "1 Incident",
  },
  {
    id: "ins-3",
    title: "Most Connected Table",
    description: "'analytics_table' feeds 4 downstream marts and dashboards.",
    severity: "medium",
    metric: "4 Hops",
  },
  {
    id: "ins-4",
    title: "Highest Quality Dataset",
    description: "'stg_customers' reports 100.0% formatting and type conformity.",
    severity: "low",
    metric: "100.0%",
  },
];
