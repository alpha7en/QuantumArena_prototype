from qiskit import QuantumCircuit


def verify(solve, task, kit):
    for n, w in ((2, 1), (3, 5), (3, 0), (4, 9), (5, 30), (6, 41)):
        oracle = kit.as_gate(kit.phase_oracle(n, lambda x: int(x == w)))
        qc = solve(n, oracle)
        ok, msg = kit.check_limits(qc, task, {"n": n})
        if not ok:
            return False, msg
        p = kit.distribution(qc).get(format(w, f"0{n}b"), 0.0)
        if p < 0.9:
            return False, f"n={n}, w={w}: вероятность {p:.3f}"
    return True, ""


def one_iteration(n, oracle):
    qc = QuantumCircuit(n, n)
    qc.h(range(n))
    qc.append(oracle, range(n))
    qc.h(range(n))
    qc.x(range(n))
    qc.h(n - 1)
    qc.mcx(list(range(n - 1)), n - 1)
    qc.h(n - 1)
    qc.x(range(n))
    qc.h(range(n))
    qc.measure(range(n), range(n))
    return qc


WRONG = {"одна итерация при любом n": one_iteration}
