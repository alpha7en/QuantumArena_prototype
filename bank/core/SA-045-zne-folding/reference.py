from qiskit import QuantumCircuit


def solve(k, gate, gate_dg):
    qc = QuantumCircuit(2)
    qc.append(gate, [0, 1])
    for _ in range(k):
        qc.append(gate_dg, [0, 1])
        qc.append(gate, [0, 1])
    return qc
