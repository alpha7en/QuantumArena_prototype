from qiskit import QuantumCircuit


def verify(solve, task, kit):
    qc = solve()
    ok, msg = kit.check_limits(qc, task, {})
    if not ok:
        return False, msg
    for name, qs in kit.metrics(qc)["ops"]:
        if name == "cx" and qs != [0, 1]:
            return False, "гейт CX доступен только в направлении cx(0, 1)"
    target = kit.perm(2, lambda v: v ^ ((v >> 1) & 1))  # бит 1 управляет битом 0
    return kit.check_isometry(qc, target, 2, 2, "global")


def direct():
    qc = QuantumCircuit(2)
    qc.cx(1, 0)
    return qc


def native_direction():
    qc = QuantumCircuit(2)
    qc.cx(0, 1)
    return qc


def h_on_one():
    qc = QuantumCircuit(2)
    qc.h(1)
    qc.cx(0, 1)
    qc.h(1)
    return qc


WRONG = {"cx(1, 0) напрямую": direct, "CX в исходном направлении": native_direction, "H только на одном кубите": h_on_one}
