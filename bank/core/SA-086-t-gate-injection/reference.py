from qiskit import QuantumCircuit


def solve():
    qc = QuantumCircuit(2, 1)
    qc.h(1)
    qc.t(1)
    qc.cx(0, 1)
    qc.measure(1, 0)
    with qc.if_test((qc.clbits[0], 1)):
        qc.s(0)
    return qc
