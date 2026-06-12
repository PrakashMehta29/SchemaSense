from apps.uploads.services import get_active_dataset
from core.polars_engine import load_dataset_lazy
from apps.health_score.score_engine import calculate_dataset_health

def get_active_dataset_health(session=None) -> dict:
    """
    Check active dataset and return its compiled health metrics.
    """
    dataset = get_active_dataset(session)
    if not dataset:
        raise FileNotFoundError("No active dataset found. Please upload a dataset first.")

    file_path = dataset.file.path
    lf, rows, cols, err = load_dataset_lazy(file_path)
    if err:
        raise ValueError(f"Failed to read dataset: {err}")

    return calculate_dataset_health(file_path, lf, rows, cols)
