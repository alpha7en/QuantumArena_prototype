from qiskit import QuantumCircuit


def solve(n):
    qc = QuantumCircuit(2 * n - 1)
    anc = list(range(n + 1, 2 * n - 1))
    ladder = [(0, 1, anc[0])] + [(i, anc[i - 2], anc[i - 1]) for i in range(2, n - 1)]
    for g in ladder:
        qc.ccx(*g)
    qc.ccx(n - 1, anc[n - 3], n)
    for g in reversed(ladder):
        qc.ccx(*g)
    return qc
