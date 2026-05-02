import subprocess
import time
import re


TIMEOUT_CRASH = "timeout"
PYTHON_EXCEPTION = "python_exception"
NON_ZERO_EXIT = "non_zero_exit"
ASSERTION_FAILURE = "assertion_failure"
LOGIC_ERROR = "logic_error"
RESOURCE_ERROR = "resource_exhaustion"
UNKNOWN_ERROR = "unknown_error"


def extract_exception_type(stderr_text):
    """
    Extract actual Python exception type.
    More precise than before.
    """
    match = re.search(r"([a-zA-Z_]+Error|Exception|StopIteration|MemoryError|RecursionError|KeyError|ValueError|TypeError|IndexError|ZeroDivisionError)", stderr_text)
    if match:
        return match.group(1)
    return "UnknownException"


def classify_crash(stderr, stdout, returncode, exec_time):
    combined = stderr + stdout

    # 🔴 Assertion failure
    if "AssertionError" in combined:
        return f"{ASSERTION_FAILURE}:AssertionError"

    # 🔴 Resource errors
    if "MemoryError" in combined:
        return f"{RESOURCE_ERROR}:MemoryError"
    if "RecursionError" in combined:
        return f"{RESOURCE_ERROR}:RecursionError"

    # 🔴 Python exceptions (FIXED: now granular)
    if "Traceback" in combined:
        exc_type = extract_exception_type(combined)
        return f"{PYTHON_EXCEPTION}:{exc_type}"

    # 🔴 Logic-based failure
    for word in ["ERROR", "FAIL", "INVALID", "CRASH"]:
        if word in combined:
            return f"{LOGIC_ERROR}:{word}"

    # 🔴 Non-zero exit (enhanced)
    if returncode != 0:
        return f"{NON_ZERO_EXIT}:{returncode}"

    return None


def run_target(target_cmd, input_data, timeout=1):
    start = time.time()

    try:
        # FIX 1: safer execution (no .split())
        result = subprocess.run(
            target_cmd,
            input=input_data.encode(),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=timeout,
            shell=True  # IMPORTANT FIX for real-world fuzzing stability
        )

        exec_time = time.time() - start

        stderr = result.stderr.decode(errors="ignore")
        stdout = result.stdout.decode(errors="ignore")

        crash_type = classify_crash(stderr, stdout, result.returncode, exec_time)

        return {
            "crash": crash_type is not None,
            "crash_type": crash_type,
            "stdout": stdout,
            "stderr": stderr,
            "exit_code": result.returncode,
            "signal_code": None,
            "timeout": False,
            "exec_time": exec_time
        }

    except subprocess.TimeoutExpired:
        return {
            "crash": True,
            "crash_type": TIMEOUT_CRASH,
            "stdout": "",
            "stderr": "Timeout",
            "exit_code": None,
            "signal_code": None,
            "timeout": True,
            "exec_time": time.time() - start
        }

    except Exception as e:
        # 🔥 catches hidden executor failures (VERY IMPORTANT)
        return {
            "crash": True,
            "crash_type": f"{UNKNOWN_ERROR}:{type(e).__name__}",
            "stdout": "",
            "stderr": str(e),
            "exit_code": None,
            "signal_code": None,
            "timeout": False,
            "exec_time": time.time() - start
        }