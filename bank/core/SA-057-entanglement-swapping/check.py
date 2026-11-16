import numpy as np
from qiskit import QuantumCircuit


def verify(solve, task, kit):
    qc = solve()
    ok, msg = kit.check_limits(qc, task, {})
    if not ok:
        return False, msg
    bell = np.array([1, 0, 0, 1]) / np.sqrt(2)
    for p, out, _ in kit.run_dynamic(qc):
        if kit.reduced_fidelity(out, [0, 3], bell, 4) < 1 - 1e-6:
            return False, "в одной из ветвей кубиты q0 и q3 не в состоянии Белла"
    return True, ""


def no_corrections():
    qc = QuantumCircuit(4, 2)
    qc.h(0)
    qc.cx(0, 1)
    qc.h(2)
    qc.cx(2, 3)
    qc.cx(1, 2)
    qc.h(1)
    qc.measure(1, 0)
    qc.measure(2, 1)
    return qc


def ghz_chain():
    qc = QuantumCircuit(4, 2)
    qc.h(0)
    qc.cx(0, 1)
    qc.cx(1, 2)
    qc.cx(2, 3)
    return qc


WRONG = {"без условных поправок": no_corrections, "цепочка GHZ без измерений": ghz_chain}
