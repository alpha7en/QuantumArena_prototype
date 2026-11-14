import numpy as np
from qiskit import QuantumCircuit


def verify(solve, task, kit):
    for w in range(4):
        oracle = kit.as_gate(kit.phase_oracle(2, lambda x: int(x == w)))
        qc = solve(oracle)
        ok, msg = kit.check_limits(qc, task, {})
        if not ok:
            return False, msg
        p = kit.distribution(qc).get(format(w, "02b"), 0.0)
        if p < 0.999:
            return False, f"w={w}: вероятность {p:.3f}"
    return True, ""


def no_diffusion(oracle):
    qc = QuantumCircuit(2, 2)
    qc.h([0, 1])
    qc.append(oracle, [0, 1])
    qc.h([0, 1])
    qc.measure([0, 1], [0, 1])
    return qc


WRONG = {"без оператора диффузии": no_diffusion}
