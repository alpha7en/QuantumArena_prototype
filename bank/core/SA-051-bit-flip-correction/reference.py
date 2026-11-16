from qiskit import QuantumCircuit


def solve():
    qc = QuantumCircuit(5, 2)
    qc.cx(0, 3)
    qc.cx(1, 3)
    qc.cx(1, 4)
    qc.cx(2, 4)
    qc.measure(3, 0)
    qc.measure(4, 1)
    creg = qc.cregs[0]
    for value, qubit in ((1, 0), (3, 1), (2, 2)):
        with qc.if_test((creg, value)):
            qc.x(qubit)
    return qc
