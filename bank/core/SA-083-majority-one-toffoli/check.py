from qiskit import QuantumCircuit


def verify(solve, task, kit):
    qc = solve()
    ok, msg = kit.check_limits(qc, task, {})
    if not ok:
        return False, msg
    toffoli = sum(1 for name, _ in kit.metrics(qc)["ops"] if name == "ccx")
    if toffoli > 1:
        return False, f"превышен лимит CCX: {toffoli} из 1"
    target = kit.xor_oracle(3, lambda x: int(bin(x).count("1") >= 2))
    return kit.check_isometry(qc, target, 4, 4, "global")


def three_toffoli():
    qc = QuantumCircuit(4)
    qc.ccx(0, 1, 3)
    qc.ccx(0, 2, 3)
    qc.ccx(1, 2, 3)
    return qc


def no_uncompute():
    qc = QuantumCircuit(4)
    qc.cx(0, 1)
    qc.cx(0, 2)
    qc.ccx(1, 2, 3)
    qc.cx(0, 3)
    return qc


def missing_a():
    qc = QuantumCircuit(4)
    qc.cx(0, 1)
    qc.cx(0, 2)
    qc.ccx(1, 2, 3)
    qc.cx(0, 2)
    qc.cx(0, 1)
    return qc


WRONG = {"три CCX": three_toffoli, "входы не возвращены": no_uncompute, "без слагаемого a": missing_a}
