from typing import Dict, List


# --------------------------------------------------
# Governance Rules
# --------------------------------------------------

PII_PATTERNS = {
    "email": {"risk": 95, "tag": "PII"},
    "phone": {"risk": 90, "tag": "PII"},
    "mobile": {"risk": 90, "tag": "PII"},
    "aadhaar": {"risk": 100, "tag": "CRITICAL"},
    "pan": {"risk": 95, "tag": "CRITICAL"},
    "address": {"risk": 75, "tag": "SENSITIVE"},
    "salary": {"risk": 70, "tag": "FINANCIAL"},
    "dob": {"risk": 85, "tag": "PII"},
    "birth": {"risk": 85, "tag": "PII"},
    "ssn": {"risk": 100, "tag": "CRITICAL"},
    "account": {"risk": 90, "tag": "FINANCIAL"},
    "bank": {"risk": 90, "tag": "FINANCIAL"},
}


# --------------------------------------------------
# Scan Single Column
# --------------------------------------------------

def scan_column(column_name: str) -> Dict:
    """
    Analyze a column name and determine:
    - PII status
    - Governance tag
    - Risk score
    """

    column_lower = column_name.lower()

    for pattern, metadata in PII_PATTERNS.items():

        if pattern in column_lower:
            return {
                "column": column_name,
                "pii": True,
                "risk_score": metadata["risk"],
                "risk_level": calculate_risk_level(metadata["risk"]),
                "tag": metadata["tag"],
            }

    return {
        "column": column_name,
        "pii": False,
        "risk_score": 10,
        "risk_level": "LOW",
        "tag": "PUBLIC",
    }

def scan_dataset_columns(columns):
    """
    Scan all columns in a dataset and return governance results.
    """

    results = []

    for column in columns:
        results.append(scan_column(column))

    return results


# --------------------------------------------------
# Risk Level
# --------------------------------------------------

def calculate_risk_level(score: int) -> str:
    """
    Convert numeric score to readable level.
    """

    if score >= 90:
        return "CRITICAL"

    if score >= 70:
        return "HIGH"

    if score >= 40:
        return "MEDIUM"

    return "LOW"


# --------------------------------------------------
# Scan Entire Dataset
# --------------------------------------------------

def scan_dataset(columns: List[str]) -> Dict:
    """
    Run governance analysis on all columns.
    """

    results = []

    for column in columns:
        results.append(scan_column(column))

    summary = generate_governance_summary(results)

    return {
        "columns": results,
        "summary": summary,
    }


# --------------------------------------------------
# Governance Summary
# --------------------------------------------------

def generate_governance_summary(results: List[Dict]) -> Dict:
    """
    Create executive governance metrics.
    """

    pii_columns = 0
    high_risk_columns = 0
    medium_risk_columns = 0

    total_risk = 0

    for item in results:

        total_risk += item["risk_score"]

        if item["pii"]:
            pii_columns += 1

        if item["risk_level"] in ["HIGH", "CRITICAL"]:
            high_risk_columns += 1

        elif item["risk_level"] == "MEDIUM":
            medium_risk_columns += 1

    dataset_risk_score = (
        round(total_risk / len(results), 2)
        if results
        else 0
    )

    return {
        "total_columns": len(results),
        "pii_columns": pii_columns,
        "high_risk_columns": high_risk_columns,
        "medium_risk_columns": medium_risk_columns,
        "dataset_risk_score": dataset_risk_score,
    }


# --------------------------------------------------
# Example Run
# --------------------------------------------------

if __name__ == "__main__":

    sample_columns = [
        "customer_id",
        "email",
        "phone",
        "salary",
        "country",
    ]

    print(scan_dataset(sample_columns))