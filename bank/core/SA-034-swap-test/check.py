import numpy as np
from qiskit import QuantumCircuit


def verify(solve, task, kit):
    qc = solve()
    ok, msg = kit.check_limits(qc, task, {})
    if not ok:
        return False, msg
    if qc.num_clbits != 1:
        return False, "нужен один классический бит"
    rng = np.random.default_rng(11)
    zero, one = np.array([1, 0], dtype=complex), np.array([0, 1], dtype=complex)
    pairs = [(zero, zero), (zero, one), (kit.H @ zero, zero)]
    pairs += [(kit.random_state(1, rng), kit.random_state(1, rng)) for _ in range(6)]
    for a, b in pairs:
        psi0 = np.kron(b, np.kron(a, zero))
        p0 = kit.distribution(qc, psi0).get("0", 0.0)
        want = (1 + abs(np.vdot(a, b)) ** 2) / 2
        if abs(p0 - want) > 1e-6:
            return False, f"P(0) = {p0:.4f}, ожидалось {want:.4f}"
    return True, ""


def no_second_h():
    qc = QuantumCircuit(3, 1)
    qc.h(0)
    qc.cswap(0, 1, 2)
    qc.measure(0, 0)
    return qc


WRONG = {"без второго H": no_second_h}
