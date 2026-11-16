from qiskit import QuantumCircuit


def solve(n, oracle, run):
    qc = QuantumCircuit(2 * n, n)
    qc.h(range(n))
    qc.append(oracle, range(2 * n))
    qc.h(range(n))
    qc.measure(range(n), range(n))
    ys = {run(qc) for _ in range(10 * n)}
    for s in range(1, 2 ** n):
        if all(bin(y & s).count("1") % 2 == 0 for y in ys):
            return s
    return 0
