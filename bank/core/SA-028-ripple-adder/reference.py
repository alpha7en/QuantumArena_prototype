from qiskit import QuantumCircuit


def _maj(qc, c, b, a):
    qc.cx(a, b)
    qc.cx(a, c)
    qc.ccx(c, b, a)


def _uma(qc, c, b, a):
    qc.ccx(c, b, a)
    qc.cx(a, c)
    qc.cx(c, b)


def solve(n):
    qc = QuantumCircuit(2 * n + 1)
    carry = [2 * n] + list(range(n))       # входящий перенос разряда i: анцилла, затем a_{i-1}
    for i in range(n):
        _maj(qc, carry[i], n + i, i)
    for i in reversed(range(n)):
        _uma(qc, carry[i], n + i, i)
    return qc
