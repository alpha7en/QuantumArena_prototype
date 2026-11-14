from qiskit import QuantumCircuit


def solve(d):
    qc = QuantumCircuit(2)
    e = [x * d[0] for x in d]
    if e[1] == -1:
        qc.z(0)
    if e[2] == -1:
        qc.z(1)
    if e[3] != e[1] * e[2]:
        qc.cz(0, 1)
    return qc
