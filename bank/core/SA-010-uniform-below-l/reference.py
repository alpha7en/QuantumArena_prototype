import math

from qiskit import QuantumCircuit


def _on_zero(qc, control, apply):
    """Гейт, управляемый значением 0 кубита control."""
    qc.x(control)
    apply()
    qc.x(control)


def solve(n, L):
    qc = QuantumCircuit(n)
    ones = [i for i in range(n + 1) if (L >> i) & 1]
    l0 = ones[0]
    for q in range(l0):             # младшие l0 битов свободны во всех блоках
        qc.h(q)
    if len(ones) == 1:              # L — степень двойки
        return qc
    for q in ones[1:]:
        qc.x(q)
    done = 2 ** l0                  # суммарный размер готовых блоков
    qc.ry(-2 * math.acos(math.sqrt(done / L)), ones[1])
    _on_zero(qc, ones[1], lambda: [qc.ch(ones[1], q) for q in range(l0, ones[1])])
    for m in range(1, len(ones) - 1):
        lm, nxt = ones[m], ones[m + 1]
        theta = -2 * math.acos(math.sqrt(2 ** lm / (L - done)))
        _on_zero(qc, lm, lambda: qc.cry(theta, lm, nxt))
        _on_zero(qc, nxt, lambda: [qc.ch(nxt, q) for q in range(lm, nxt)])
        done += 2 ** lm
    return qc
