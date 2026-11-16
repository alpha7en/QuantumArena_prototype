import math

from qiskit import QuantumCircuit


def ansatz(a, b):
    qc = QuantumCircuit(2)
    qc.ry(a, 0)
    qc.cx(0, 1)
    qc.ry(b, 1)
    return qc


def solve(theta, expval):
    s = math.pi / 2
    da = (expval(ansatz(theta + s, theta)) - expval(ansatz(theta - s, theta))) / 2
    db = (expval(ansatz(theta, theta + s)) - expval(ansatz(theta, theta - s))) / 2
    return da + db
