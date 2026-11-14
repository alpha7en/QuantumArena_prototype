from qiskit import QuantumCircuit


def solve():
    qc = QuantumCircuit(4, 2)
    qc.h(0)
    qc.cx(0, 1)
    qc.h(2)
    qc.cx(2, 3)
    qc.cx(1, 2)
    qc.h(1)
    qc.measure(1, 0)
    qc.measure(2, 1)
    with qc.if_test((qc.clbits[1], 1)):
        qc.x(3)
    with qc.if_test((qc.clbits[0], 1)):
        qc.z(3)
    return qc
