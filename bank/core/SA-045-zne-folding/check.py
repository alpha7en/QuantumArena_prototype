import numpy as np
from qiskit import QuantumCircuit


def verify(solve, task, kit):
    rng = np.random.default_rng(3)
    for k in (0, 1, 2, 5):
        A = rng.normal(size=(4, 4)) + 1j * rng.normal(size=(4, 4))
        G, _ = np.linalg.qr(A)
        qc = solve(k, kit.as_gate(G, "oracle"), kit.as_gate(G.conj().T, "oracle_dg"))
        ok, msg = kit.check_limits(qc, task, {"k": k})
        if not ok:
            return False, msg
        m = kit.metrics(qc)
        if m["oracle_calls"] != 2 * k + 1 or m["gates"] != 2 * k + 1:
            return False, f"k={k}: вызовов {m['oracle_calls']}, гейтов {m['gates']}, нужно {2 * k + 1}"
        ok, msg = kit.check_isometry(qc, G, 2, 2)
        if not ok:
            return False, f"k={k}: {msg}"
    return True, ""


def copies(k, gate, gate_dg):
    qc = QuantumCircuit(2)
    for _ in range(2 * k + 1):
        qc.append(gate, [0, 1])
    return qc


WRONG = {"2k+1 копий G подряд": copies}
