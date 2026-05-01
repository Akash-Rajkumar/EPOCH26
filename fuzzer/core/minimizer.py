from fuzzer.core.executor import run_target

def minimize(target, input_data):
    data = input_data

    for i in range(len(data)):
        test = data[:i] + data[i+1:]
        result = run_target(target, test)

        if result["crashed"]:
            print(f"Reduced → {repr(test)}")
            data = test

    print(f"✅ Final minimized input: {repr(data)}")
    return data