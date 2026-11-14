import numpy as np
from qiskit import QuantumCircuit


def verify(solve, task, kit):
    for r, s, t in ((0, 0, 0), (0, 1, 1), (1, 0, 1), (1, 1, 0)):
        qc = QuantumCircuit(3)
        qc.h(0)
        qc.cx(0, 1)
        qc.cx(0, 2)
        for q, bit in enumerate((r, s, t)):
            part = solve(bit)
            ok, msg = kit.check_limits(part, task, {})
            if not ok:
                return False, msg
            qc.compose(part, [q], inplace=True)
        (_, psi, _), = kit.run_dynamic(qc)
        probs = np.abs(psi) ** 2
        win = sum(p for v, p in enumerate(probs) if bin(v).count("1") % 2 == (r | s | t))
        if win < 0.999:
            return False, f"вопросы {r}{s}{t}: вероятность выигрыша {win:.3f}"
    return True, ""


def always_x(bit):
    qc = QuantumCircuit(1)
    qc.h(0)
    return qc


WRONG = {"измерение X при любом вопросе": always_x}
