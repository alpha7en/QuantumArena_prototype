from qiskit import QuantumCircuit


def verify(solve, task, kit):
    for b0 in (0, 1):
        for b1 in (0, 1):
            alice = solve(b0, b1)
            ok, msg = kit.check_limits(alice, task, {})
            if not ok:
                return False, msg
            qc = QuantumCircuit(2, 2)
            qc.h(0)
            qc.cx(0, 1)
            qc.compose(alice, [0], inplace=True)
            qc.cx(0, 1)
            qc.h(0)
            qc.measure([0, 1], [0, 1])
            if kit.distribution(qc).get(f"{b1}{b0}", 0.0) < 0.999:
                return False, f"биты ({b0}, {b1}) декодированы неверно"
    return True, ""


def swapped(b0, b1):
    qc = QuantumCircuit(1)
    if b0:
        qc.x(0)
    if b1:
        qc.z(0)
    return qc


WRONG = {"роли X и Z перепутаны": swapped}
