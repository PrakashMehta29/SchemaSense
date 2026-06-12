import os
from apps.uploads.models import UploadedDataset
from core.polars_engine import load_dataset_lazy
from core.logger import logger

def process_and_save_upload(file_obj) -> UploadedDataset:
    """
    Save the uploaded file, profile its row and column count lazily via Polars,
    and update the DB record. If profiling fails (corrupt file), deletes file and record.
    """
    # 1. Instantiate model (filename is captured)
    dataset = UploadedDataset(filename=file_obj.name)
    
    # 2. Save Django FileField (this writes the file to media/uploads/)
    dataset.file.save(file_obj.name, file_obj, save=True)
    
    file_path = dataset.file.path
    logger.info(f"Processing upload for '{dataset.filename}', path: {file_path}")
    
    # 3. Profile file shape lazily
    _, row_count, col_count, err = load_dataset_lazy(file_path)
    if err:
        # File is corrupt or unparseable. Delete file from storage and database record.
        logger.error(f"Failed to profile uploaded file: {err}. Deleting record.")
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as delete_err:
                logger.error(f"Failed to delete corrupt file {file_path}: {str(delete_err)}")
        dataset.delete()
        raise ValueError(f"Corrupt or unparseable dataset file: {err}")
        
    # 4. Save parsed dimensions
    dataset.row_count = row_count
    dataset.column_count = col_count
    dataset.save()
    
    logger.info(f"Dataset '{dataset.filename}' uploaded and profiled. Shape: ({row_count} x {col_count})")
    return dataset

def get_active_dataset(session=None) -> UploadedDataset:
    """
    Retrieve the active dataset.
    First tries to fetch from session. Fallback to the most recently uploaded file in the database.
    """
    dataset = None
    
    if session and "active_dataset_id" in session:
        try:
            dataset = UploadedDataset.objects.get(id=session["active_dataset_id"])
        except UploadedDataset.DoesNotExist:
            pass
            
    if dataset is None:
        # Fallback to the most recently uploaded dataset
        dataset = UploadedDataset.objects.order_by("-uploaded_at").first()
        if dataset and session:
            session["active_dataset_id"] = dataset.id
            session["active_dataset_path"] = dataset.file.path
            
    return dataset
