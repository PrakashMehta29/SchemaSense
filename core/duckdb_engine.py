import os
import re
import duckdb
import pandas as pd
from core.logger import logger

def execute_sql_query(file_path: str, sql_query: str) -> pd.DataFrame:
    """
    Execute an analytical SQL query on the dataset using DuckDB.
    Registers common aliases (df, dataset, data, filename) for high compatibility.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    ext = os.path.splitext(file_path)[-1].lower()
    conn = duckdb.connect(database=":memory:")

    # Clean file path for DuckDB SQL string
    clean_path = file_path.replace(os.sep, "/")

    try:
        if ext == ".xlsx":
            # Read excel into pandas, then register in DuckDB
            pdf = pd.read_excel(file_path)
            # Ensure columns are strings
            pdf.columns = [str(c) for c in pdf.columns]
            conn.register("dataset_raw", pdf)
            query_base = "SELECT * FROM dataset_raw"
        else:
            # CSV: load directly with DuckDB read_csv_auto (much faster for large files)
            query_base = f"SELECT * FROM read_csv_auto('{clean_path}')"

        # Create virtual tables/views for common references
        conn.execute(f"CREATE VIEW dataset AS {query_base}")
        conn.execute(f"CREATE VIEW df AS {query_base}")
        conn.execute(f"CREATE VIEW data AS {query_base}")

        # Add sanitized filename as an alias
        basename = os.path.splitext(os.path.basename(file_path))[0].lower()
        sanitized_name = re.sub(r"[^a-z0-9_]", "_", basename)
        if sanitized_name not in ["df", "dataset", "data", "select", "insert", "update", "delete"]:
            conn.execute(f"CREATE VIEW {sanitized_name} AS {query_base}")

        logger.info(f"Running local DuckDB query: {sql_query}")
        result_df = conn.execute(sql_query).fetchdf()
        conn.close()
        return result_df

    except Exception as e:
        logger.error(f"DuckDB query execution failed: {str(e)}")
        try:
            conn.close()
        except:
            pass
        raise RuntimeError(f"SQL execution error: {str(e)}")
