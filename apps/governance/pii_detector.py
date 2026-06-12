import re
import polars as pl

# Regex rules for PII
PATTERNS = {
    "Email Address": (re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+"), "High"),
    "Phone Number": (re.compile(r"\+?\d[\d\s\-()]{7,15}"), "Medium"),
    "Aadhaar Number": (re.compile(r"\b\d{4}\s?\d{4}\s?\d{4}\b"), "High"),
    "PAN Number": (re.compile(r"\b[A-Z]{5}\d{4}[A-Z]\b"), "High"),
    "Credit Card Number": (re.compile(r"\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b"), "High"),
}

# Column name keyword mappings
COLUMN_KEYWORD_RISKS = {
    "ssn": ("Social Security Number", "High"),
    "password": ("Credential Field", "High"),
    "salary": ("Sensitive Personal Data", "Medium"),
    "credit": ("Payment Information", "High"),
    "secret": ("Credential Field", "High"),
    "email": ("Email Address", "High"),
    "phone": ("Phone Number", "Medium"),
    "mobile": ("Phone Number", "Medium"),
    "aadhaar": ("Aadhaar Number", "High"),
    "pan": ("PAN Number", "High"),
}

def scan_column_for_risks(col_name: str, col_data: pl.Series) -> dict | None:
    """
    Scans a column name and sample values for PII or governance risks.
    """
    col_lower = col_name.lower().replace("_", " ")

    # 1. Name heuristics
    for kw, (risk_type, level) in COLUMN_KEYWORD_RISKS.items():
        if kw in col_lower:
            return {
                "column": col_name,
                "risk_type": risk_type,
                "level": level,
                "sample_count": 0  # To be filled in by service
            }

    # 2. Content regex heuristics
    # Sample first 100 non-null values
    sample_values = col_data.drop_nulls().head(100).cast(pl.String).to_list()
    for s_val in sample_values:
        if not s_val:
            continue
        for risk_type, (regex, level) in PATTERNS.items():
            if regex.search(s_val):
                return {
                    "column": col_name,
                    "risk_type": risk_type,
                    "level": level,
                    "sample_count": 0  # To be filled in by service
                }

    return None
