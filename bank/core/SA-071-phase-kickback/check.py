from qiskit import QuantumCircuit


def verify(solve, task, kit):
    qc = solve()
    ok, msg = kit.check_limits(qc, task, {})
    if not ok:
        return False, msg
    for name, qs in kit.metrics(qc)["ops"]:
        if 0 in qs and not (name == "cx" and qs == [0, 1]):
            return False, f"кубит q0 может быть только управляющим в cx(0, 1), найден {name} на {qs}"
    return kit.check_isometry(qc, kit.Z, 1, 1, "global")


def direct_hxh():
    qc = QuantumCircuit(2)
    qc.h(0)
    qc.x(0)
    qc.h(0)
    return qc


def target_in_zero():
    qc = QuantumCircuit(2)
    qc.cx(0, 1)
    return qc


def target_in_plus():
    qc = QuantumCircuit(2)
    qc.h(1)
    qc.cx(0, 1)
    qc.h(1)
    return qc


def ancilla_left():
    qc = QuantumCircuit(2)
    qc.x(1)
    qc.h(1)
    qc.cx(0, 1)
    return qc


WRONG = {"HXH на рабочем кубите": direct_hxh, "целевой кубит в нуле": target_in_zero,
         "целевой кубит в плюсе": target_in_plus, "анцилла оставлена в минусе": ancilla_left}
