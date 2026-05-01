import subprocess

def run_target(target_cmd, input_data, timeout=1):
    try:
        result = subprocess.run(
            target_cmd,
            input=input_data,
            text=True,
            capture_output=True,
            shell=True,
            timeout=timeout
        )

        return {
            "crashed": result.returncode != 0,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "exit_code": result.returncode
        }

    except subprocess.TimeoutExpired as e:
        return {
            "crashed": True,
            "stdout": e.stdout or "",
            "stderr": "TimeoutExpired",
            "exit_code": -1
        }