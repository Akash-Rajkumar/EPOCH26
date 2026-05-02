import sys

def main():
    data = sys.stdin.read()

    # 1. Length-based crash
    if len(data) > 20:
        raise Exception("Length crash!")

    # 2. Division by zero
    if "DIV0" in data:
        x = 1 / 0

    # 3. Type error
    if "TYPE" in data:
        x = "string" + 5

    # 4. Index error
    if "INDEX" in data:
        arr = []
        x = arr[1]

    # 5. Value error
    if "VALUE" in data:
        int("not_a_number")

    # 6. Key error
    if "KEY" in data:
        d = {}
        x = d["missing"]

    # 7. Attribute error
    if "ATTR" in data:
        x = None
        x.some_method()

    # 8. Import error
    if "IMPORT" in data:
        import non_existent_module

    # 9. Assertion error
    if "ASSERT" in data:
        assert False, "Assertion crash!"

    # 10. Recursion error
    if "RECURSE" in data:
        def recurse():
            return recurse()
        recurse()

    # 11. Memory error (simulated safe version)
    if "MEM" in data:
        raise MemoryError("Simulated memory crash")

    # 12. Unicode error
    if "UNICODE" in data:
        b = b'\xff'
        b.decode('utf-8')

    # 13. Overflow-like crash
    if "OVERFLOW" in data:
        import math
        math.exp(1000)

    # 14. Custom runtime error
    if "RUNTIME" in data:
        raise RuntimeError("Custom runtime crash")

    # 15. Stop iteration misuse
    if "STOP" in data:
        raise StopIteration("Manual stop crash")

    # If no crash triggered
    print("OK")


if __name__ == "__main__":
    main()