from qiskit import QuantumCircuit

import sakit

GRID = [{}]


def spec():
    return sakit.op(sakit.xor_oracle(2, lambda x: int(x == 3)))


def score(m):
    """Баллы по метрикам схемы (sakit.metrics)."""
    return max(0, 100 - 10 * max(0, m["cx"] - 8))


def all_pairs():
    qc = QuantumCircuit(3)
    qc.h(2)
    qc.cx(1, 2); qc.tdg(2); qc.cx(0, 2); qc.t(2); qc.cx(1, 2); qc.tdg(2); qc.cx(0, 2)
    qc.t(1); qc.t(2); qc.h(2)
    qc.cx(0, 1); qc.t(0); qc.tdg(1); qc.cx(0, 1)
    return qc


WRONG = {"разложение с CX между несоседями": all_pairs}
