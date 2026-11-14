from qiskit import QuantumCircuit


def solve(n, J, h, t, r):
    qc = QuantumCircuit(n)
    dt = t / r
    for _ in range(r):
        for start in (0, 1):
            for i in range(start, n - 1, 2):
                qc.cx(i, i + 1)
                qc.rz(-2 * J * dt, i + 1)
                qc.cx(i, i + 1)
        for i in range(n):
            qc.rx(-2 * h * dt, i)
    return qc
