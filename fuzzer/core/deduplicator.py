seen = set()

def is_new(crash_input):
    if crash_input in seen:
        return False
    seen.add(crash_input)
    return True