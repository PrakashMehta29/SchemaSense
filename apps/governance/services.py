import polars as pl
from apps.uploads.services import get_active_dataset
from core.polars_engine import load_dataset_lazy
from apps.governance.pii_detector import scan_column_for_risks
from core.logger import logger

def generate_governance_report(session=None) -> list:
    """
    Profile the active dataset for security vulnerabilities and governance risks.
    """
    dataset = get_active_dataset(session)
    if not dataset:
        raise FileNotFoundError("No active dataset found. Please upload a dataset first.")

    file_path = dataset.file.path
    lf, _, _, err = load_dataset_lazy(file_path)
    if err:
        raise ValueError(f"Failed to read dataset: {err}")

    # Gather a sample of 100 rows for regex analysis
    try:
        df_sample = lf.limit(100).collect()
    except Exception as e:
        logger.error(f"Error collecting sample for governance scan: {str(e)}")
        raise RuntimeError(f"Error scanning dataset: {str(e)}")

    risks = []
    for col in df_sample.columns:
        col_data = df_sample[col]
        hit = scan_column_for_risks(col, col_data)
        if hit:
            # Calculate total non-null values for the risk ledger
            total_rows = dataset.row_count
            try:
                null_count = lf.select(pl.col(col).null_count()).collect(streaming=True).item()
                hit["sample_count"] = max(0, total_rows - null_count)
            except Exception as e:
                logger.error(f"Failed to calculate exact null count for {col}: {str(e)}")
                hit["sample_count"] = total_rows
                
            risks.append(hit)

    return risks
