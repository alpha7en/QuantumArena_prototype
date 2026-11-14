from qiskit import QuantumCircuit


def solve():
    qc = QuantumCircuit(10)
    for k in range(3):
        for i in range(7):
            if ((i + 1) >> k) & 1:
                qc.cx(i, 7 + k)
    return qc
