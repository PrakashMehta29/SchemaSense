import os
import pandas as pd
from apps.uploads.services import get_active_dataset
from core.polars_engine import get_dataframe_preview
from core.gemma_service import (
    generate_python_code_for_e2b,
    generate_sql_query_for_duckdb,
    synthesize_response_via_gemma,
)
from core.e2b_service import execute_code_in_sandbox
from core.duckdb_engine import execute_sql_query
from core.logger import logger

def heuristic_chat_fallback(query: str, df: pd.DataFrame) -> str:
    """Heuristic fallback to answer basic queries offline without Gemma."""
    lower = query.lower()
    total_rows = len(df)
    cols = df.columns.tolist()

    if "explain" in lower or "dataset" in lower or "what is" in lower:
        return (
            f"This dataset has **{total_rows} rows** and **{len(cols)} columns**: "
            f"{', '.join(cols[:8])}{'...' if len(cols) > 8 else ''}. "
            f"It contains {df.isnull().sum().sum()} missing values overall."
        )
    if "risk" in lower or "governance" in lower or "pii" in lower:
        keywords = ["email", "phone", "ssn", "aadhaar", "pan", "password", "credit", "salary"]
        risky_cols = [c for c in cols if any(k in c.lower() for k in keywords)]
        if not risky_cols:
            return "No obvious governance risks or PII fields were detected in the column names."
        return f"Potential governance risk fields: {', '.join(risky_cols)}."
    if "summary" in lower or "business" in lower or "meaning" in lower:
        return (
            f"This dataset contains attributes such as {', '.join(cols[:5])}. "
            "Please refer to the AI Data Dictionary tab for automated column description cataloging."
        )
    return (
        f"I analyzed the active dataset ({total_rows} rows, {len(cols)} columns). "
        "Try asking: 'Explain dataset', 'Find risky columns', or 'Summarize business meaning'."
    )

def process_chat_query(query: str, session=None) -> str:
    """
    Process NLQ query using a 4-tier fallback model:
    1. Gemma AI + E2B Sandbox (Code execution)
    2. Gemma AI + Local DuckDB (SQL execution)
    3. Heuristic chat analyzer (Offline)
    4. Default instructions
    """
    dataset = get_active_dataset(session)
    if not dataset:
        return "Please upload a dataset first so I can analyze it."

    file_path = dataset.file.path

    # Get preview of dataset
    try:
        preview_df = get_dataframe_preview(file_path, max_rows=5)
        preview_str = preview_df.to_string()
        columns_list = preview_df.columns.tolist()
    except Exception as e:
        logger.error(f"Error loading dataset preview for chat: {str(e)}")
        return f"Failed to load dataset: {str(e)}"

    # Check Gemma credentials
    gemma_key = getattr(os, "environ", {}).get("GEMMA_API_KEY", "") or os.getenv("GEMMA_API_KEY", "")
    if not gemma_key:
        logger.warning("GEMMA_API_KEY is not set. Falling back to local heuristic response.")
        return heuristic_chat_fallback(query, preview_df)

    # 1. E2B Execution Tier
    e2b_key = getattr(os, "environ", {}).get("E2B_API_KEY", "") or os.getenv("E2B_API_KEY", "")
    if e2b_key:
        try:
            logger.info("Tier 1: Code translation via Gemma...")
            python_code = generate_python_code_for_e2b(query, columns_list, preview_str)
            logger.info(f"Generated python code:\n{python_code}")
            
            logger.info("Executing code in E2B sandbox...")
            sandbox_output = execute_code_in_sandbox(file_path, python_code)
            
            logger.info("Synthesizing response...")
            return synthesize_response_via_gemma(query, sandbox_output)
        except Exception as e:
            logger.warning(f"E2B sandbox execution failed: {str(e)}. Falling back to local DuckDB.")

    # 2. DuckDB Execution Tier
    try:
        logger.info("Tier 2: SQL query generation via Gemma...")
        sql_query = generate_sql_query_for_duckdb(query, columns_list, preview_str)
        logger.info(f"Generated SQL: {sql_query}")
        
        logger.info("Executing local SQL query via DuckDB...")
        result_df = execute_sql_query(file_path, sql_query)
        result_str = result_df.to_string(index=False)
        
        logger.info("Synthesizing response...")
        return synthesize_response_via_gemma(query, result_str)
    except Exception as e:
        logger.error(f"DuckDB execution tier failed: {str(e)}")

    # 3. Heuristic Tier (Local Fallback)
    logger.info("Tier 3: Heuristic fallback...")
    return heuristic_chat_fallback(query, preview_df)
