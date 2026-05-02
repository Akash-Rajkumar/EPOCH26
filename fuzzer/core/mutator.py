import random
import string

# 🔥 High-impact crash seeds
SEEDS = [
    "DIV0",
    "INDEX_OUT_OF_RANGE",
    "TYPE_ERROR",
    "VALUE_ERROR",
    "NULL",
    "\x00",
    "\xff",
    "A" * 100,
    "[]" ,
    "{}",
    "(((((((((())))))))))",
    "/0",
    "../" * 5,
]


def random_ascii():
    return chr(random.randint(32, 126))


def generate_input():
    # 40% structured seed injection (increased for crash diversity)
    if random.random() < 0.4:
        base = random.choice(SEEDS)
    else:
        base = ''.join(random_ascii() for _ in range(random.randint(5, 20)))

    return base


def mutate_input(data):
    if not data:
        return ""

    data = list(data)

    # 🔥 MULTI-MUTATION PASS (important fix)
    mutation_count = random.randint(1, 4)

    for _ in range(mutation_count):
        action = random.choice(["flip", "insert", "delete", "append", "expand"])

        if action == "flip" and len(data) > 0:
            idx = random.randint(0, len(data) - 1)
            data[idx] = random_ascii()

        elif action == "insert":
            idx = random.randint(0, len(data))
            data.insert(idx, random_ascii())

        elif action == "delete" and len(data) > 1:
            idx = random.randint(0, len(data) - 1)
            data.pop(idx)

        elif action == "append":
            data.append(random_ascii())

        elif action == "expand":
            # 🔥 explosion mutation (VERY IMPORTANT for crashes)
            pattern = random.choice(["A", "0", "{}", "[]", "\x00"])
            data.extend(list(pattern * random.randint(3, 10)))

    mutated = ''.join(data)

    # 🔥 20% chance structural corruption injection
    if random.random() < 0.2:
        mutated += random.choice([
            "DIV0",
            "TYPE",
            "INDEX",
            "NULL",
            "\x00\x00\x00",
            "/////" * 3,
            "{{{{}}}}",
        ])

    return mutated