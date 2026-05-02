import json
import time
import uuid

from fuzzer.core.mutator import generate_input, mutate_input
from fuzzer.core.executor import run_target
from fuzzer.core.minimizer import minimize
from fuzzer.core.utils import (
    generate_session_id,
    current_timestamp,
    hash_stack_trace
)


class FuzzerEngine:
    def __init__(self, target_cmd):
        self.target_cmd = target_cmd
        self.target_list = target_cmd.split()

        self.session_id = generate_session_id()

        self.total_crashes = 0
        self.unique_crashes = 0
        self.unique_hashes = set()

        self.start_time = time.time()

    def log(self, data):
        print(json.dumps(data), flush=True)

    # 🔥 FIXED UNIQUENESS: includes input signal now
    def build_unique_key(self, result, stack_trace, input_data):
        crash_type = result.get("crash_type", "unknown")
        exit_code = str(result.get("exit_code", "none"))
        signal_code = str(result.get("signal_code", "none"))

        # input signature is CRITICAL for diversity
        input_hash = hash_stack_trace(input_data)

        # limit stack trace noise impact
        stack_hash = hash_stack_trace(stack_trace[:200] if stack_trace else "")

        base = f"{stack_hash}|{crash_type}|{exit_code}|{signal_code}|{input_hash}"
        return hash_stack_trace(base)

    def start(self):
        self.log({
            "event": "session_start",
            "session_id": self.session_id,
            "target": self.target_cmd,
            "timestamp": current_timestamp()
        })

        iteration = 0

        try:
            while True:

                input_id = str(uuid.uuid4())

                # 🎯 Generate + mutate input
                raw_input = generate_input()
                mutated_input = mutate_input(raw_input)

                # 🧼 safety guard
                if not mutated_input or len(mutated_input) > 5000:
                    continue

                # ⚙️ Execute target
                result = run_target(self.target_cmd, mutated_input)

                if not isinstance(result, dict):
                    continue

                if result.get("crash"):
                    self.total_crashes += 1

                    # 🔍 minimize crash input
                    minimized = minimize(self.target_cmd, mutated_input)

                    stack_trace = result.get("stderr") or ""

                    crash_id = str(uuid.uuid4())

                    # 🔥 FIXED uniqueness calculation
                    unique_key = self.build_unique_key(
                        result,
                        stack_trace,
                        mutated_input
                    )

                    is_unique = unique_key not in self.unique_hashes

                    if is_unique:
                        self.unique_hashes.add(unique_key)
                        self.unique_crashes += 1

                    # 🧨 CRASH EVENT
                    self.log({
                        "event": "crash",
                        "id": crash_id,
                        "session_id": self.session_id,
                        "timestamp": current_timestamp(),

                        "input_raw": mutated_input,
                        "input_minimised": minimized,

                        "crash_type": result.get("crash_type", "unknown"),
                        "severity": "low",

                        "stack_trace": stack_trace,
                        "stack_hash": hash_stack_trace(stack_trace[:200]),

                        "signal_code": result.get("signal_code"),
                        "exit_code": result.get("exit_code"),

                        # 🔥 NEW: helps debugging crash origin
                        "trigger_snippet": raw_input[:20],

                        "reproduced": False
                    })

                    # 🔗 mutation chain tracking
                    self.log({
                        "event": "chain",
                        "crash_id": crash_id,
                        "step_index": 0,
                        "mutation_type": "generate",
                        "input_snapshot": raw_input
                    })

                    self.log({
                        "event": "chain",
                        "crash_id": crash_id,
                        "step_index": 1,
                        "mutation_type": "mutate",
                        "input_snapshot": mutated_input
                    })

                # 📊 METRICS (throttled)
                if iteration % 5 == 0:
                    self.log({
                        "event": "metrics",
                        "session_id": self.session_id,
                        "iteration": iteration,
                        "input_id": input_id,
                        "total_crashes": self.total_crashes,
                        "unique_crashes": self.unique_crashes,
                        "uptime": time.time() - self.start_time
                    })

                iteration += 1

        except KeyboardInterrupt:
            self.log({
                "event": "session_end",
                "session_id": self.session_id,
                "total_crashes": self.total_crashes,
                "unique_crashes": self.unique_crashes,
                "duration": time.time() - self.start_time
            })