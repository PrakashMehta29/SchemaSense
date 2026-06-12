import os
import polars as pl
import pandas as pd
from core.logger import logger

def map_dtype(pl_type) -> str:
    """Map Polars data types to simplified standard names."""
    type_str = str(pl_type).lower()
    if "int" in type_str:
        return "integer"
    elif "float" in type_str or "decimal" in type_str:
        return "float"
    elif "bool" in type_str:
        return "boolean"
    elif "date" in type_str or "time" in type_str:
        return "datetime"
    elif "str" in type_str or "utf8" in type_str:
        return "string"
    return "string"

def load_dataset_lazy(file_path: str):
    """
    Load a dataset lazily.
    Returns: (lazy_frame, row_count, col_count, error_message)
    """
    ext = os.path.splitext(file_path)[-1].lower()
    if not os.path.exists(file_path):
        return None, 0, 0, f"File not found: {file_path}"

    try:
        if ext == ".csv":
            # Scan CSV lazily to check dimensions without loading entire file
            lf = pl.scan_csv(file_path, infer_schema_length=5000, ignore_errors=True)
            # Fetch row count using streaming collection
            row_count = lf.select(pl.len()).collect(streaming=True).item()
            col_count = len(lf.collect_schema().names())
            return lf, row_count, col_count, None
        elif ext == ".xlsx":
            # Pandas is needed for excel files since Polars scanning is for CSV
            pdf = pd.read_excel(file_path)
            # Clean columns: convert to string to avoid serialization issues
            pdf.columns = [str(c) for c in pdf.columns]
            df = pl.from_pandas(pdf)
            row_count = df.height
            col_count = df.width
            return df.lazy(), row_count, col_count, None
        else:
            return None, 0, 0, f"Unsupported file extension: {ext}"
    except Exception as e:
        logger.error(f"Error loading dataset {file_path}: {str(e)}")
        return None, 0, 0, str(e)

def get_profile_metrics(file_path: str) -> dict:
    """
    Compute dataset shape, missing count, duplicates count, and schema types.
    Returns standard JSON structure.
    """
    lf, row_count, col_count, err = load_dataset_lazy(file_path)
    if err:
        raise ValueError(f"Profiling failed: {err}")

    try:
        # 1. Missing values count
        null_exprs = [pl.col(c).null_count().alias(c) for c in lf.collect_schema().names()]
        null_res = lf.select(null_exprs).collect(streaming=True)
        missing_count = sum(null_res.row(0))

        # 2. Duplicate rows count
        # For huge files, unique count can be expensive; use streaming
        unique_count = lf.unique().select(pl.len()).collect(streaming=True).item()
        duplicates_count = max(0, row_count - unique_count)

        # 3. Data type mapping
        schema = lf.collect_schema()
        data_types = {col: map_dtype(schema[col]) for col in lf.collect_schema().names()}

        return {
            "rows": row_count,
            "columns": col_count,
            "missing_values": int(missing_count),
            "duplicates": int(duplicates_count),
            "data_types": data_types
        }
    except Exception as e:
        logger.error(f"Error generating profiling metrics for {file_path}: {str(e)}")
        raise RuntimeError(f"Data profiling failed: {str(e)}")

def get_dataframe_preview(file_path: str, max_rows: int = 100) -> pd.DataFrame:
    """
    Load a small slice of the dataset into a pandas DataFrame for previews and local inspection.
    """
    lf, _, _, err = load_dataset_lazy(file_path)
    if err:
        raise ValueError(err)
    
    # Materialize preview
    df = lf.limit(max_rows).collect()
    return df.to_pandas()
