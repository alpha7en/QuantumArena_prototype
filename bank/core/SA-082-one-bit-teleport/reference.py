from qiskit import QuantumCircuit


def solve():
    qc = QuantumCircuit(2, 1)
    qc.cx(0, 1)
    qc.h(0)
    qc.measure(0, 0)
    with qc.if_test((qc.clbits[0], 1)):
        qc.z(1)
    return qc
