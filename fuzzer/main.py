import argparse
from fuzzer.core.engine import FuzzerEngine


def main():
    print("DEBUG: Starting main...")

    parser = argparse.ArgumentParser()
    parser.add_argument("--target", required=True)
    parser.add_argument("--iterations", type=int, default=None)
    parser.add_argument("--timeout", type=float, default=1.0)

    args = parser.parse_args()

    print(f"Target: {args.target}")
    print(f"Iterations: {args.iterations if args.iterations else '∞'}")
    print(f"Timeout: {args.timeout}")

    engine = FuzzerEngine(args.target)

    try:
        # 🔥 FIX: pass iteration control if needed
        if args.iterations:
            engine.start(max_iterations=args.iterations)
        else:
            engine.start()

    except KeyboardInterrupt:
        print("\n[MAIN] Stopping fuzz engine (KeyboardInterrupt)")
        print({
            "event": "session_end_request",
            "reason": "keyboard_interrupt"
        })

    except Exception as e:
        print(f"\n[MAIN] Fatal error: {e}")

    finally:
        print("[MAIN] Execution ended.")


if __name__ == "__main__":
    main()