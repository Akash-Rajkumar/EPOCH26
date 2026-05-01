import json
import time
import random
import sys

session_id = sys.argv[1] if len(sys.argv) > 1 else "test-session"

def emit(event):
    print(json.dumps(event), flush=True)

emit({
    "type": "session_start",
    "session_id": session_id
})

count = 0

while True:
    time.sleep(1)
    count += 1

    # metrics event
    emit({
        "type": "metrics",
        "inputs": count * 10,
        "crashes": count // 3,
        "coverage": round(random.random(), 2)
    })

    # crash event every 3 cycles
    if count % 3 == 0:
        emit({
            "type": "crash",
            "session_id": session_id,
            "input_raw": "deadbeef",
            "stack_trace": "Segmentation fault",
            "crash_type": "null_deref",
            "severity": "high",
            "chain": [
                {"step_index": 0, "mutation_type": "bit_flip"},
                {"step_index": 1, "mutation_type": "insert_bytes"}
            ]
        })