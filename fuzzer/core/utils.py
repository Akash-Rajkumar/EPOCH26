import hashlib
import uuid
import time

def generate_session_id():
    return str(uuid.uuid4())

def current_timestamp():
    return time.time()

def hash_stack_trace(stack_trace: str):
    return hashlib.sha256(stack_trace.encode()).hexdigest()