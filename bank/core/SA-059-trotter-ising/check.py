import numpy as np
from qiskit import QuantumCircuit

import sakit

GRID = [
    {"n": 2, "J": 1.0, "h": 0.5, "t": 0.4, "r": 1},
    {"n": 3, "J": 1.0, "h": 0.7, "t": 1.0, "r": 2},
    {"n": 5, "J": 0.8, "h": 1.2, "t": 0.6, "r": 3},
    {"n": 6, "J": -1.0, "h": 1.0, "t": 0.5, "r": 4},
]


def spec(n, J, h, t, r):
    dt = t / r
    zz = np.zeros(2 ** n)
    for x in range(2 ** n):
        z = [1 - 2 * b for b in sakit.bits(x, n)]
        zz[x] = sum(z[i] * z[i + 1] for i in range(n - 1))
    u_zz = np.diag(np.exp(1j * J * dt * zz))
    one = np.cos(h * dt) * sakit.I2 + 1j * np.sin(h * dt) * sakit.X
    u_x = sakit.kron(*[one] * n)
    return sakit.op(np.linalg.matrix_power(u_x @ u_zz, r))


def sequential(n, J, h, t, r):
    qc = QuantumCircuit(n)
    dt = t / r
    for _ in range(r):
        for i in range(n - 1):
            qc.cx(i, i + 1)
            qc.rz(-2 * J * dt, i + 1)
            qc.cx(i, i + 1)
        for i in range(n):
            qc.rx(-2 * h * dt, i)
    return qc


def wrong_sign(n, J, h, t, r):
    qc = QuantumCircuit(n)
    dt = t / r
    for _ in range(r):
        for start in (0, 1):
            for i in range(start, n - 1, 2):
                qc.cx(i, i + 1)
                qc.rz(2 * J * dt, i + 1)
                qc.cx(i, i + 1)
        for i in range(n):
            qc.rx(2 * h * dt, i)
    return qc


WRONG = {"связи по очереди (глубина шага 3(n-1)+1)": sequential, "углы с обратным знаком": wrong_sign}
