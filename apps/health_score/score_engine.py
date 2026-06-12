import polars as pl
from core.logger import logger

def calculate_dataset_health(file_path: str, lf: pl.LazyFrame, total_rows: int, total_cols: int) -> dict:
    """
    Calculate the health metrics, warnings, and recommendations for a dataset.
    """
    total_cells = max(1, total_rows * total_cols)

    try:
        # 1. Completeness Check
        null_exprs = [pl.col(c).null_count().alias(c) for c in lf.collect_schema().names()]
        null_counts = lf.select(null_exprs).collect(streaming=True).row(0)
        total_nulls = sum(null_counts)
        missing_pct = (total_nulls / total_cells) * 100
        completeness = max(0.0, 100.0 - missing_pct * 2.0)

        # 2. Uniqueness Check
        unique_rows = lf.unique().select(pl.len()).collect(streaming=True).item()
        duplicates = max(0, total_rows - unique_rows)
        dup_pct = (duplicates / total_rows) * 100.0 if total_rows > 0 else 0.0
        uniqueness = max(0.0, 100.0 - dup_pct * 3.0)

        # 3. Consistency Check
        # Base consistency on the ratio of clear types and string column volume
        schema = lf.collect_schema()
        str_cols = sum(1 for col, dtype in schema.items() if dtype in [pl.Utf8, pl.String])
        consistency = max(50.0, 100.0 - str_cols * 3.0)

        # Overall Score
        overall_score = int((completeness + uniqueness + consistency) / 3.0)

        # Generate warnings and recommendations
        warnings = []
        recommendations = []

        if missing_pct > 2.0:
            warnings.append(f"{missing_pct:.1f}% of cells contain missing values ({total_nulls:,} empty cells).")
            recommendations.append("Impute missing numeric values using mean/median or drop highly sparse columns.")
            
        if dup_pct > 0.5:
            warnings.append(f"{dup_pct:.1f}% of dataset consists of duplicate records ({duplicates:,} duplicate rows).")
            recommendations.append("Run a deduplication sequence using unique keys before downstream training.")

        # Identify any column with extremely high sparsity (>80% null)
        high_null_cols = []
        for i, col in enumerate(lf.collect_schema().names()):
            col_nulls = null_counts[i]
            col_null_pct = (col_nulls / total_rows) * 100 if total_rows > 0 else 0
            if col_null_pct > 80.0:
                high_null_cols.append(f"{col} ({col_null_pct:.1f}%)")

        if high_null_cols:
            warnings.append(f"Highly sparse columns detected: {', '.join(high_null_cols[:3])}.")
            recommendations.append("Consider dropping columns that are more than 80% empty.")

        if not warnings:
            warnings.append("No critical quality issues detected. The dataset layout is clean.")
            recommendations.append("Dataset is clean and profiled. Ready for downstream tasks.")

        return {
            "score": min(100, overall_score),
            "dimensions": {
                "Completeness": round(completeness, 1),
                "Uniqueness": round(uniqueness, 1),
                "Consistency": round(consistency, 1),
            },
            "warnings": warnings,
            "recommendations": recommendations,
        }

    except Exception as e:
        logger.error(f"Error calculating health score: {str(e)}")
        raise RuntimeError(f"Failed to calculate health score: {str(e)}")
