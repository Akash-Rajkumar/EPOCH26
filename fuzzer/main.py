import argparse
from fuzzer.core.engine import FuzzerEngine

def main():
    print("DEBUG: Starting main...")

    parser = argparse.ArgumentParser()
    parser.add_argument("--target", required=True)
    parser.add_argument("--iterations", type=int, default=None)  # kept for compatibility (not used)
    parser.add_argument("--timeout", type=float, default=1.0)    # kept for compatibility (not used)

    args = parser.parse_args()

    print(f"Target: {args.target}")
    print("Iterations: ∞")

    # ✅ Updated engine initialization
    engine = FuzzerEngine(args.target)

    # ✅ Updated method name
    engine.start()

if __name__ == "__main__":
    main()