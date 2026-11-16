from qiskit import QuantumCircuit


def solve():
    qc = QuantumCircuit(3, 1)
    qc.h(2)
    qc.measure(2, 0)
    with qc.if_test((qc.clbits[0], 1)):
        qc.z(0)
    return qc
