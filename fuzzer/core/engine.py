import json
import time
import uuid

from fuzzer.core.mutator import generate_input, mutate_input
from fuzzer.core.executor import run_target
from fuzzer.core.minimizer import minimize
from fuzzer.core.utils import generate_session_id, current_timestamp, hash_stack_trace


class FuzzerEngine:
    def __init__(self, target_cmd):
        self.target_cmd = target_cmd.split()
        self.session_id = generate_session_id()

        self.total_crashes = 0
        self.unique_crashes = 0
        self.unique_hashes = set()

        self.start_time = time.time()

    def log(self, data):
        print(json.dumps(data), flush=True)

    def start(self):
        # SESSION START
        self.log({
            "event": "session_start",
            "session_id": self.session_id,
            "target": " ".join(self.target_cmd),
            "timestamp": current_timestamp()
        })

        iteration = 0

        try:
            while True:
                input_id = str(uuid.uuid4())
                raw_input = generate_input()
                mutated_input = mutate_input(raw_input)

                result = run_target(self.target_cmd, mutated_input)

                if result["crashed"]:
                    self.total_crashes += 1

                    minimized = minimize(self.target_cmd, mutated_input)

                    stack_trace = result["stderr"]
                    stack_hash = hash_stack_trace(stack_trace)

                    is_unique = stack_hash not in self.unique_hashes
                    if is_unique:
                        self.unique_hashes.add(stack_hash)
                        self.unique_crashes += 1

                    crash_id = str(uuid.uuid4())

                    # 🔥 CRASH EVENT (DB COMPATIBLE)
                    self.log({
                        "event": "crash",
                        "id": crash_id,
                        "session_id": self.session_id,
                        "timestamp": current_timestamp(),
                        "input_raw": mutated_input,
                        "input_minimised": minimized,
                        "crash_type": "python_exception",
                        "severity": "low",
                        "stack_hash": stack_hash,
                        "stack_trace": stack_trace,
                        "signal_code": None,
                        "exit_code": result["exit_code"],
                        "reproduced": False
                    })

                    # 🔗 CHAINS (DB FORMAT)
                    chain_steps = [
                        {"step_index": 0, "mutation_type": "generate", "input_snapshot": raw_input},
                        {"step_index": 1, "mutation_type": "mutate", "input_snapshot": mutated_input}
                    ]

                    for step in chain_steps:
                        self.log({
                            "event": "chain",
                            "crash_id": crash_id,
                            "step_index": step["step_index"],
                            "parent_id": None,
                            "generation": iteration,
                            "mutation_type": step["mutation_type"],
                            "input_snapshot": step["input_snapshot"]
                        })

                # 📊 METRICS (optional for DB)
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
            # SESSION END
            self.log({
                "event": "session_end",
                "session_id": self.session_id,
                "total_crashes": self.total_crashes,
                "unique_crashes": self.unique_crashes,
                "duration": time.time() - self.start_time
            })