import os
import json
import requests
from django.conf import settings
from core.logger import logger

def call_gemma(prompt: str, system_instruction: str = None, json_mode: bool = False) -> str:
    """
    Call Gemini 1.5 Flash via Google AI Studio API.
    Returns empty string if not configured or if requests fail.
    """
    api_key = getattr(settings, "GEMMA_API_KEY", "") or os.getenv("GEMMA_API_KEY", "")
    if not api_key:
        logger.warning("GEMMA_API_KEY is not set. Gemma service will return empty fallback.")
        return ""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}

    contents = [{"parts": [{"text": prompt}]}]
    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.1,
            "topP": 0.95,
        }
    }

    if json_mode:
        payload["generationConfig"]["responseMimeType"] = "application/json"

    if system_instruction:
        payload["systemInstruction"] = {
            "parts": [{"text": system_instruction}]
        }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=25)
        response.raise_for_status()
        data = response.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
        return text
    except Exception as e:
        logger.error(f"Gemini API request failed: {str(e)}")
        return ""

def generate_metadata_via_gemma(columns: list, preview_df_str: str) -> list:
    """
    Generates intelligent business descriptions and confidence scores for columns.
    """
    system_instruction = (
        "You are an expert data cataloging AI. You will receive a list of columns and a dataset preview. "
        "For each column, analyze its name and the sample values to generate:\n"
        "1. 'Column Name': The exact column name received.\n"
        "2. 'Meaning': A clear, professional, single-sentence business description.\n"
        "3. 'Data Type': A simplified datatype description (e.g. integer, float, string, boolean, datetime).\n"
        "4. 'Confidence Score': A float between 0.0 and 1.0 representing your certainty of the column's business meaning.\n\n"
        "You MUST return the output as a valid JSON array of objects. Do not include markdown codeblock tags around the JSON."
    )

    prompt = (
        f"Columns to analyze: {json.dumps(columns)}\n\n"
        f"Dataset sample values (first few rows):\n{preview_df_str}\n\n"
        "Generate the metadata list now."
    )

    resp_text = call_gemma(prompt, system_instruction=system_instruction, json_mode=True)
    if not resp_text:
        return []

    try:
        # Strip potential markdown fences if JSON mode is ignored by backend
        clean_text = resp_text.strip()
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:]
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3]
        return json.loads(clean_text)
    except Exception as e:
        logger.error(f"Failed to parse Gemma metadata JSON response: {str(e)}. Raw text: {resp_text}")
        return []

def generate_python_code_for_e2b(query: str, columns: list, preview_df_str: str) -> str:
    """
    Translate natural language query into Python code to execute in E2B.
    """
    system_instruction = (
        "You are an expert Python data analyst. Generate executable Python code using pandas or polars "
        "to answer the user's question about a dataset loaded as a CSV. "
        "The CSV file path is 'dataset.csv'.\n"
        "Rules:\n"
        "1. Write clean, complete python code.\n"
        "2. Load the dataset using pandas: `df = pd.read_csv('dataset.csv')`.\n"
        "3. Compute the answer and print it clearly to stdout.\n"
        "4. Keep the code safe: no system commands, no writing to arbitrary files, only analytical calculations.\n"
        "5. Output ONLY the raw Python code. Do not include markdown ticks (```python) or explanations."
    )

    prompt = (
        f"Dataset Columns: {json.dumps(columns)}\n\n"
        f"Dataset Sample:\n{preview_df_str}\n\n"
        f"User Question: {query}\n\n"
        "Generate Python code:"
    )

    resp_text = call_gemma(prompt, system_instruction=system_instruction, json_mode=False)
    # Strip markdown fences if any
    clean_text = resp_text.strip()
    if clean_text.startswith("```python"):
        clean_text = clean_text[9:]
    elif clean_text.startswith("```"):
        clean_text = clean_text[3:]
    if clean_text.endswith("```"):
        clean_text = clean_text[:-3]
    return clean_text.strip()

def generate_sql_query_for_duckdb(query: str, columns: list, preview_df_str: str) -> str:
    """
    Translate natural language query into SQL to run locally in DuckDB.
    """
    system_instruction = (
        "You are an expert SQL analyst. Generate a standard SQL SELECT query to answer the user's question. "
        "The table name is 'dataset'.\n"
        "Rules:\n"
        "1. Write standard, ANSI SQL syntax compatible with DuckDB.\n"
        "2. Return ONLY the raw SQL query. Do not wrap in markdown or add explanations."
    )

    prompt = (
        f"Dataset Columns: {json.dumps(columns)}\n\n"
        f"Dataset Sample:\n{preview_df_str}\n\n"
        f"User Question: {query}\n\n"
        "Generate SQL query:"
    )

    resp_text = call_gemma(prompt, system_instruction=system_instruction, json_mode=False)
    clean_text = resp_text.strip()
    if clean_text.startswith("```sql"):
        clean_text = clean_text[6:]
    elif clean_text.startswith("```"):
        clean_text = clean_text[3:]
    if clean_text.endswith("```"):
        clean_text = clean_text[:-3]
    return clean_text.strip()

def synthesize_response_via_gemma(query: str, execution_result: str) -> str:
    """
    Take the raw result of a Python/SQL execution and format a clear, human-readable response.
    """
    system_instruction = (
        "You are a helpful data assistant. Synthesize the raw terminal execution or SQL query result "
        "into a clean, user-friendly markdown response that directly answers the user's question."
    )

    prompt = (
        f"User Question: {query}\n\n"
        f"Raw Data/Execution Output:\n{execution_result}\n\n"
        "Format the final response for the user:"
    )

    return call_gemma(prompt, system_instruction=system_instruction) or str(execution_result)
