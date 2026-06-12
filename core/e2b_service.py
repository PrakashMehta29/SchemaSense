import os
from django.conf import settings
from core.logger import logger

def execute_code_in_sandbox(file_path: str, python_code: str) -> str:
    """
    Execute Python code inside an E2B secure sandbox.
    Uploads the dataset at file_path to the sandbox as 'dataset.csv' first.
    """
    api_key = getattr(settings, "E2B_API_KEY", "") or os.getenv("E2B_API_KEY", "")
    if not api_key:
        raise ValueError("E2B_API_KEY environment variable is not set.")

    # Import locally to prevent startup failure if library is missing
    try:
        from e2b_code_interpreter import CodeInterpreter
    except ImportError as e:
        logger.error("e2b-code-interpreter package not found or failed to import.")
        raise e

    logger.info("Initializing E2B Secure Sandbox...")
    try:
        with CodeInterpreter(api_key=api_key) as sandbox:
            logger.info("Uploading dataset to E2B sandbox...")
            with open(file_path, "rb") as f:
                # E2B upload_file returns the remote path inside the sandbox
                sandbox.upload_file(f, filename="dataset.csv")

            logger.info("Executing analytical Python code...")
            execution = sandbox.notebook.exec_cell(python_code)

            if execution.error:
                error_msg = f"{execution.error.name}: {execution.error.value}\n{execution.error.traceback}"
                logger.error(f"E2B execution error: {error_msg}")
                return f"Execution Error:\n{error_msg}"

            # Capture stdout and stderr
            output_parts = []
            if execution.logs.stdout:
                output_parts.append("\n".join(execution.logs.stdout))
            if execution.logs.stderr:
                output_parts.append("Stderr logs:\n" + "\n".join(execution.logs.stderr))

            # If no text output, look at notebook results (e.g. formatted dataframes or variables)
            if not output_parts:
                if execution.results:
                    for r in execution.results:
                        if hasattr(r, "text"):
                            output_parts.append(r.text)
                        else:
                            output_parts.append(str(r))
                else:
                    output_parts.append("Execution completed successfully with no output.")

            return "\n".join(output_parts)

    except Exception as e:
        logger.error(f"E2B Sandbox execution failed: {str(e)}")
        raise RuntimeError(f"E2B execution failed: {str(e)}")
