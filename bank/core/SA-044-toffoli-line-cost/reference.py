from qiskit import QuantumCircuit


def solve():
    qc = QuantumCircuit(3)
    qc.h(2)
    qc.t(0)
    qc.t(1)
    qc.t(2)
    qc.cx(0, 1)
    qc.tdg(1)          # q0 xor q1
    qc.cx(1, 2)
    qc.t(2)            # q0 xor q1 xor q2
    qc.cx(0, 1)
    qc.cx(1, 2)
    qc.tdg(2)          # q0 xor q2
    qc.cx(0, 1)
    qc.cx(1, 2)
    qc.tdg(2)          # q1 xor q2
    qc.cx(0, 1)
    qc.cx(1, 2)
    qc.h(2)
    return qc
