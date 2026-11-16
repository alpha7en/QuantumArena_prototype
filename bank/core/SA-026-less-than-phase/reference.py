from qiskit import QuantumCircuit


def _mark(qc, qubits, pattern):
    """Знак минус на состояниях, где qubits[i] == pattern[i] для всех i."""
    zeros = [q for q, b in zip(qubits, pattern) if b == 0]
    for q in zeros:
        qc.x(q)
    if len(qubits) == 1:
        qc.z(qubits[0])
    else:
        qc.h(qubits[-1])
        qc.mcx(qubits[:-1], qubits[-1])
        qc.h(qubits[-1])
    for q in zeros:
        qc.x(q)


def solve(n, L):
    qc = QuantumCircuit(n)
    if L >= 2 ** n:
        return qc
    for t in range(n):
        if (L >> t) & 1:
            qubits = list(range(t, n))
            _mark(qc, qubits, [0] + [(L >> j) & 1 for j in range(t + 1, n)])
    return qc
