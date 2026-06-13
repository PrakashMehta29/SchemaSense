export interface HealthScorecard {
  overallScore: number;
  metadataCoverage: number;
  lineageCoverage: number;
  governanceReadiness: number;
  documentationQuality: number;
}

export interface ExecutiveKPIs {
  totalDatasets: number;
  totalColumns: number;
  governedAssets: number;
  piiAssets: number;
  criticalRisks: number;
  metadataCoverage: number;
}

export const EXECUTIVE_KPI_DATA: ExecutiveKPIs = {
  totalDatasets: 6,
  totalColumns: 45,
  governedAssets: 8,
  piiAssets: 2,
  criticalRisks: 1,
  metadataCoverage: 95,
};

export const EXECUTIVE_HEALTH_SCORECARD: HealthScorecard = {
  overallScore: 89,
  metadataCoverage: 95,
  lineageCoverage: 87,
  governanceReadiness: 82,
  documentationQuality: 90,
};

export const EXECUTIVE_RECOMMENDATIONS = [
  {
    id: "rec-1",
    title: "Apply column masking on email field",
    description:
      "Column 'email' in dim_customers contains unmasked email addresses. Configure SHA-256 hashing to limit PII propagation.",
    dataset: "dim_customers",
    impact: "high",
  },
  {
    id: "rec-2",
    title: "Verify structural schemas in orders.v3",
    description:
      "Ongoing schema drift detected in the ingestion pipelines. Re-profile orders.v3 mappings to restore consistency.",
    dataset: "orders.v3",
    impact: "critical",
  },
  {
    id: "rec-3",
    title: "Document field definitions in churn models",
    description:
      "Field 'churn_risk' contains high null levels and lacks corporate metadata catalog summaries.",
    dataset: "mart_growth",
    impact: "medium",
  },
];
