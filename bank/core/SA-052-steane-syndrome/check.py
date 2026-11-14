import numpy as np
from qiskit import QuantumCircuit


def logical_states():
    rows = [sum((((i + 1) >> k) & 1) << i for i in range(7)) for k in range(3)]
    words = {0}
    for r in rows:
        words |= {w ^ r for w in words}
    zero = np.zeros(128, dtype=complex)
    one = np.zeros(128, dtype=complex)
    for w in words:
        zero[w] = 1
        one[w ^ 127] = 1
    return zero / np.sqrt(8), one / np.sqrt(8)


def verify(solve, task, kit):
    qc = solve()
    ok, msg = kit.check_limits(qc, task, {})
    if not ok:
        return False, msg
    zero, one = logical_states()
    rng = np.random.default_rng(6)
    for _ in range(2):
        a, b = kit.random_state(1, rng)
        code = a * zero + b * one
        for err in [None] + list(range(7)):
            data = code if err is None else kit.apply_matrix(code, kit.X, [err], 7)
            s = 0 if err is None else err + 1
            want = np.zeros(1024, dtype=complex)
            want[s * 128: (s + 1) * 128] = data
            (_, out, _), = kit.run_dynamic(qc, kit.embed(data, 7, 10))
            if abs(np.vdot(want, out)) ** 2 < 1 - 1e-6:
                return False, f"ошибка на кубите {err}: синдром или данные неверны"
    return True, ""


def zero_based():
    qc = QuantumCircuit(10)
    for k in range(3):
        for i in range(7):
            if (i >> k) & 1:
                qc.cx(i, 7 + k)
    return qc


WRONG = {"нумерация кубитов с нуля": zero_based}
