import os
import logging
from pathlib import Path

# Ensure logs directory exists
LOGS_DIR = Path(__file__).resolve().parent.parent / "logs"
os.makedirs(LOGS_DIR, exist_ok=True)

log_file = LOGS_DIR / "schemasense.log"

# Get root logger
logger = logging.getLogger("schemasense")
logger.setLevel(logging.INFO)

# Formatting
formatter = logging.Formatter(
    "[%(asctime)s] %(levelname)s [%(name)s:%(lineno)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

# Avoid adding duplicate handlers if already initialized
if not logger.handlers:
    # File Handler
    file_handler = logging.FileHandler(log_file, encoding="utf-8")
    file_handler.setFormatter(formatter)
    file_handler.setLevel(logging.INFO)
    logger.addHandler(file_handler)

    # Console Handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    console_handler.setLevel(logging.INFO)
    logger.addHandler(console_handler)
