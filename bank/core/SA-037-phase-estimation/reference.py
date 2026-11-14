import math

from qiskit import QuantumCircuit


def solve(t, cu):
    qc = QuantumCircuit(t + 1, t)
    qc.x(t)
    qc.h(range(t))
    for j in range(t):
        for _ in range(2 ** j):
            qc.append(cu, [j, t])
    for i in range(t // 2):                      # обратное преобразование Фурье
        qc.swap(i, t - 1 - i)
    for i in range(t):
        for j in range(i):
            qc.cp(-math.pi / 2 ** (i - j), j, i)
        qc.h(i)
    qc.measure(range(t), range(t))
    return qc
