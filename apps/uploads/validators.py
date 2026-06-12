import os
from django.core.exceptions import ValidationError
from core.constants import ALLOWED_EXTENSIONS, MAX_FILE_SIZE_BYTES, MAX_XLSX_SIZE_BYTES

def validate_file_extension(value):
    """Validate that the file has a permitted extension."""
    ext = os.path.splitext(value.name)[-1].lower().lstrip(".")
    if ext not in ALLOWED_EXTENSIONS:
        raise ValidationError(
            f"Unsupported file format: '{ext}'. Allowed extensions: {', '.join(ALLOWED_EXTENSIONS)}"
        )

def validate_file_size(value):
    """Validate that the file is not empty and conforms to size limits."""
    size = value.size
    if size == 0:
        raise ValidationError("The uploaded file is empty.")
        
    if size > MAX_FILE_SIZE_BYTES:
        raise ValidationError(
            f"File size exceeds the limit of 6 GB (Size: {size / (1024**3):.2f} GB)"
        )

    ext = os.path.splitext(value.name)[-1].lower().lstrip(".")
    if ext == "xlsx" and size > MAX_XLSX_SIZE_BYTES:
        raise ValidationError(
            f"Excel files cannot exceed 500 MB (Size: {size / (1024**2):.1f} MB). Please convert to CSV."
        )
