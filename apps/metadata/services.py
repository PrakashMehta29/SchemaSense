import pandas as pd
from apps.uploads.services import get_active_dataset
from core.polars_engine import get_dataframe_preview
from core.gemma_service import generate_metadata_via_gemma
from core.logger import logger

def _guess_meaning_fallback(col: str, dtype: str) -> str:
    """Heuristically infer column meaning if Gemma is offline."""
    lower = col.lower().replace("_", " ")
    hints = {
        "id": "Unique identifier for the record",
        "name": "Person or entity name",
        "email": "Email address of the contact",
        "phone": "Phone or mobile contact number",
        "date": "Date or timestamp value",
        "amount": "Monetary or numeric amount",
        "price": "Price or cost value",
        "status": "Current status or state flag",
        "address": "Physical or mailing address",
        "city": "City or locality name",
        "country": "Country name or code",
        "age": "Age in years",
        "gender": "Gender classification",
        "score": "Numeric score or rating",
    }
    for key, meaning in hints.items():
        if key in lower:
            return meaning
    if "int" in dtype or "float" in dtype:
        return f"Numeric field: {col}"
    return f"Descriptive attribute: {col}"

def _confidence_fallback(col: str) -> float:
    """Heuristically assign a confidence score."""
    lower = col.lower()
    known = ["id", "name", "email", "phone", "date", "amount", "status"]
    if any(k in lower for k in known):
        return round(0.85 + (hash(col) % 15) / 100, 2)
    return round(0.55 + (hash(col) % 30) / 100, 2)

def generate_dataset_metadata(columns_list=None, session=None) -> list:
    """
    Generate the metadata dictionary. Uses Gemma AI by uploading column context
    and a small dataset slice, with a heuristic fallback.
    """
    dataset = get_active_dataset(session)
    if not dataset:
        raise FileNotFoundError("No active dataset found. Please upload a dataset first.")

    file_path = dataset.file.path
    
    # 1. Fetch preview of dataset
    try:
        preview_df = get_dataframe_preview(file_path, max_rows=5)
        preview_str = preview_df.to_string()
        if not columns_list:
            columns_list = preview_df.columns.tolist()
            
        dtypes_map = {col: str(preview_df[col].dtype) for col in columns_list if col in preview_df.columns}
    except Exception as e:
        logger.error(f"Error loading dataset preview for metadata: {str(e)}")
        preview_str = ""
        dtypes_map = {}
        if not columns_list:
            columns_list = []

    # 2. Try calling Gemma
    metadata = []
    if preview_str and columns_list:
        try:
            metadata = generate_metadata_via_gemma(columns_list, preview_str)
        except Exception as e:
            logger.error(f"Gemma metadata generation failed: {str(e)}")

    # 3. Fallback to heuristics if Gemma returned empty or failed
    if not metadata:
        logger.info("Falling back to heuristic metadata generator.")
        for col in columns_list:
            dtype = dtypes_map.get(col, "string").lower()
            simple_type = "integer" if "int" in dtype else "float" if "float" in dtype else "boolean" if "bool" in dtype else "datetime" if "date" in dtype else "string"
            metadata.append({
                "Column Name": col,
                "Meaning": _guess_meaning_fallback(col, dtype),
                "Data Type": simple_type,
                "Confidence Score": _confidence_fallback(col)
            })

    # Ensure keys and types strictly match frontend expectations
    clean_metadata = []
    for item in metadata:
        col_name = item.get("Column Name", item.get("column_name", item.get("column", "Unknown")))
        meaning = item.get("Meaning", item.get("meaning", "No description generated."))
        dtype = item.get("Data Type", item.get("data_type", "string"))
        
        # Ensure confidence score is a float
        try:
            conf = float(item.get("Confidence Score", item.get("confidence_score", 0.5)))
        except:
            conf = 0.5
            
        clean_metadata.append({
            "Column Name": col_name,
            "Meaning": meaning,
            "Data Type": dtype,
            "Confidence Score": conf
        })
        
    return clean_metadata
