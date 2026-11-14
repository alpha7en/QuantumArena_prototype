import numpy as np
from qiskit import QuantumCircuit


def functions(n, rng):
    N = 2 ** n
    yield "константа 0", [0] * N
    yield "константа 1", [1] * N
    yield "младший бит", [x & 1 for x in range(N)]
    yield "чётность", [bin(x).count("1") % 2 for x in range(N)]
    for k in range(3):
        f = [0] * (N // 2) + [1] * (N // 2)
        rng.shuffle(f)
        yield f"случайная сбалансированная {k}", list(f)


def verify(solve, task, kit):
    rng = np.random.default_rng(7)
    for n in (1, 2, 3, 5):
        for name, f in functions(n, rng):
            oracle = kit.as_gate(np.diag([(-1.0) ** b for b in f]))
            qc = solve(n, oracle)
            ok, msg = kit.check_limits(qc, task, {"n": n})
            if not ok:
                return False, msg
            if qc.num_clbits != n:
                return False, "нужно ровно n классических битов"
            p0 = kit.distribution(qc).get("0" * n, 0.0)
            want = 1.0 if len(set(f)) == 1 else 0.0
            if abs(p0 - want) > 1e-6:
                return False, f"n={n}, {name}: P(0...0) = {p0:.3f}, ожидалось {want:.0f}"
    return True, ""


def no_second_h(n, oracle):
    qc = QuantumCircuit(n, n)
    qc.h(range(n))
    qc.append(oracle, range(n))
    qc.measure(range(n), range(n))
    return qc


WRONG = {"без второго слоя H": no_second_h}
