import numpy as np
from qiskit import QuantumCircuit


def verify(solve, task, kit):
    qc = solve()
    ok, msg = kit.check_limits(qc, task, {})
    if not ok:
        return False, msg
    for name, qs in kit.metrics(qc)["ops"]:
        if name == "measure" and qs[0] < 3:
            return False, "кубиты данных измерять нельзя"
    rng = np.random.default_rng(4)
    for _ in range(4):
        a, b = kit.random_state(1, rng)
        code = np.zeros(8, dtype=complex)
        code[0], code[7] = a, b
        for err in (None, 0, 1, 2):
            data = code if err is None else kit.apply_matrix(code, kit.X, [err], 3)
            for p, out, _ in kit.run_dynamic(qc, kit.embed(data, 3, 5)):
                if kit.reduced_fidelity(out, [0, 1, 2], code, 5) < 1 - 1e-6:
                    return False, f"ошибка на кубите {err} не исправлена"
    return True, ""


def swapped_table():
    qc = QuantumCircuit(5, 2)
    qc.cx(0, 3)
    qc.cx(1, 3)
    qc.cx(1, 4)
    qc.cx(2, 4)
    qc.measure(3, 0)
    qc.measure(4, 1)
    for value, qubit in ((1, 2), (3, 1), (2, 0)):
        with qc.if_test((qc.cregs[0], value)):
            qc.x(qubit)
    return qc


WRONG = {"строки таблицы исправлений перепутаны": swapped_table}
