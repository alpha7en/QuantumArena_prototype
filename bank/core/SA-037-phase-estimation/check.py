import math

from qiskit import QuantumCircuit


def verify(solve, task, kit):
    for t, m in ((1, 1), (2, 3), (3, 1), (3, 6), (4, 11), (5, 21), (4, 0)):
        u = QuantumCircuit(2)
        u.cp(2 * math.pi * m / 2 ** t, 0, 1)
        qc = solve(t, kit.as_gate(u))
        ok, msg = kit.check_limits(qc, task, {"t": t})
        if not ok:
            return False, msg
        p = kit.distribution(qc).get(format(m, f"0{t}b"), 0.0)
        if p < 0.999:
            return False, f"t={t}, m={m}: вероятность {p:.3f}"
    return True, ""


def forward_qft(t, cu):
    qc = QuantumCircuit(t + 1, t)
    qc.x(t)
    qc.h(range(t))
    for j in range(t):
        for _ in range(2 ** j):
            qc.append(cu, [j, t])
    for i in range(t // 2):
        qc.swap(i, t - 1 - i)
    for i in range(t):
        for j in range(i):
            qc.cp(math.pi / 2 ** (i - j), j, i)
        qc.h(i)
    qc.measure(range(t), range(t))
    return qc


WRONG = {"углы обратного преобразования Фурье с плюсом": forward_qft}
