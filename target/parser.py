import sys

data = sys.stdin.read()

if "CRASH" in data:
    raise Exception("Crash triggered!")

if len(data) > 15:
    raise Exception("Length crash!")

print("OK:", data)