import hashlib
import uuid
import time
import re


def generate_session_id():
    return str(uuid.uuid4())


def current_timestamp():
    return time.time()


def normalize_stack_trace(stack_trace: str) -> str:
    """
    Removes noise from stack traces so similar crashes map together.
    """

    # remove memory addresses
    stack_trace = re.sub(r"0x[0-9a-fA-F]+", "ADDR", stack_trace)

    # remove file paths (Windows + Linux)
    stack_trace = re.sub(r"(/[^ ]+)+|([A-Z]:\\\\[^ ]+)", "FILE", stack_trace)

    # remove line numbers
    stack_trace = re.sub(r"line \d+", "line NUM", stack_trace)

    # collapse whitespace
    stack_trace = re.sub(r"\s+", " ", stack_trace).strip()

    return stack_trace


def hash_stack_trace(stack_trace: str):
    """
    FIXED: now hashes normalized stack traces instead of raw ones.
    """

    normalized = normalize_stack_trace(stack_trace)
    return hashlib.sha256(normalized.encode()).hexdigest()