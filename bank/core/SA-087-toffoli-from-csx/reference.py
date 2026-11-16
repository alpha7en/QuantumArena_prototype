from qiskit import QuantumCircuit


def solve():
    qc = QuantumCircuit(3)
    qc.csx(1, 2)
    qc.cx(0, 1)
    qc.csx(1, 2)  # csx и cx подряд — управляемый sx†
    qc.cx(1, 2)
    qc.cx(0, 1)
    qc.csx(0, 2)
    return qc
