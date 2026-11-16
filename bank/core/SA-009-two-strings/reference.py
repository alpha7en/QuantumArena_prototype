import math

from qiskit import QuantumCircuit


def solve(n, a, b, p):
    qc = QuantumCircuit(n)
    ab = [(a >> i) & 1 for i in range(n)]
    bb = [(b >> i) & 1 for i in range(n)]
    k = next(i for i in range(n) if ab[i] != bb[i])
    theta = 2 * math.acos(math.sqrt(p)) if ab[k] == 0 else 2 * math.asin(math.sqrt(p))
    qc.ry(theta, k)
    for j in range(n):
        if j == k:
            continue
        if ab[j] == bb[j]:
            if ab[j]:
                qc.x(j)
        else:
            qc.cx(k, j)
            if ab[j] != ab[k]:
                qc.x(j)
    return qc
