from fuzzer.core.executor import run_target


def minimize(target_cmd, input_data):
    print("\n Minimizing input...")

    baseline = run_target(target_cmd, input_data)
    if not baseline.get("crash"):
        return input_data

    best = input_data

    best_type = baseline.get("crash_type")
    best_signature = (
        baseline.get("stderr", "")[:100]  # keep context signal
    )

    i = 0

    while i < len(best):
        test = best[:i] + best[i+1:]

        if not test:
            i += 1
            continue

        result = run_target(target_cmd, test)

        if result.get("crash"):
            current_type = result.get("crash_type")
            current_sig = result.get("stderr", "")[:100]

            # 🔥 FIX: preserve BOTH type + context signature
            if current_type == best_type and current_sig == best_signature:
                best = test
                print(f"Reduced -> {repr(best)}")

                i = 0
                continue

        i += 1

    print(f" Final minimized input: {repr(best)}")
    return best
