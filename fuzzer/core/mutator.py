import random
import string

def generate_input(length=20):
    return ''.join(random.choices(string.printable, k=length))

def mutate_input(data):
    data = list(data)

    for _ in range(random.randint(1, 3)):
        idx = random.randint(0, len(data) - 1)
        data[idx] = random.choice(string.printable)

    return ''.join(data)