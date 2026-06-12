from apps.uploads.services import get_active_dataset
from core.polars_engine import get_profile_metrics

def profile_active_dataset(session=None) -> dict:
    """
    Find the currently active dataset and run Polars analytical profiling on it.
    """
    dataset = get_active_dataset(session)
    if not dataset:
        raise FileNotFoundError("No active dataset found. Please upload a CSV or XLSX file first.")
        
    return get_profile_metrics(dataset.file.path)
