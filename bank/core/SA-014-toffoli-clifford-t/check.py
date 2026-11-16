from qiskit import QuantumCircuit

import sakit

GRID = [{}]


def spec():
    return sakit.op(sakit.xor_oracle(2, lambda x: int(x == 3)))


def relative_phase():
    qc = QuantumCircuit(3)
    qc.h(2)
    qc.t(2)
    qc.cx(1, 2)
    qc.tdg(2)
    qc.cx(0, 2)
    qc.t(2)
    qc.cx(1, 2)
    qc.tdg(2)
    qc.h(2)
    return qc


WRONG = {"Тоффоли с точностью до относительной фазы (3 CX)": relative_phase}
