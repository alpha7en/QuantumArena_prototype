from qiskit import QuantumCircuit


def verify(solve, task, kit):
    for n, s in ((1, 1), (2, 0b10), (3, 0b101), (3, 0), (5, 0b11010), (7, 0b1011101)):
        oracle = kit.as_gate(kit.xor_oracle(n, lambda x: bin(x & s).count("1") % 2))
        qc = solve(n, oracle)
        ok, msg = kit.check_limits(qc, task, {"n": n})
        if not ok:
            return False, msg
        if qc.num_clbits != n:
            return False, "нужно ровно n классических битов"
        p = kit.distribution(qc).get(format(s, f"0{n}b"), 0.0)
        if p < 0.999:
            return False, f"n={n}, s={s:b}: вероятность {p:.3f}"
    return True, ""


def no_kickback(n, oracle):
    qc = QuantumCircuit(n + 1, n)
    qc.h(range(n))
    qc.append(oracle, range(n + 1))
    qc.h(range(n))
    qc.measure(range(n), range(n))
    return qc


WRONG = {"кубит ответа в |0> (нет фазового отката)": no_kickback}
