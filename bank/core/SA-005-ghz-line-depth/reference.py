from qiskit import QuantumCircuit


def solve(n):
    qc = QuantumCircuit(n)
    m = (n - 1) // 2
    qc.h(m)
    qc.cx(m, m + 1)
    left, right = m, m + 1
    while left > 0 or right < n - 1:
        if left > 0:
            qc.cx(left, left - 1)
            left -= 1
        if right < n - 1:
            qc.cx(right, right + 1)
            right += 1
    return qc
