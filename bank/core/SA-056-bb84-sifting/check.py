import numpy as np
from qiskit import QuantumCircuit

N = 2000


def channel(fns, task, kit, eve, rng):
    """Возвращает (биты Алисы, базисы Алисы, базисы Боба, биты Боба) или строку с ошибкой."""
    a_bits, a_bases, b_bases = (rng.integers(0, 2, N) for _ in range(3))
    sent, p_one = {}, {}
    for bit in (0, 1):
        for basis in (0, 1):
            qc = fns["encode"](bit, basis)
            ok, msg = kit.check_limits(qc, task, {})
            if not ok:
                return msg
            (_, psi, _), = kit.run_dynamic(qc)
            sent[(bit, basis)] = psi
    states = {(0, 0): np.array([1, 0]), (1, 0): np.array([0, 1]),
              (0, 1): np.array([1, 1]) / np.sqrt(2), (1, 1): np.array([1, -1]) / np.sqrt(2)}
    decoders = {}
    for basis in (0, 1):
        qc = fns["decode"](basis)
        ok, msg = kit.check_limits(qc, task, {})
        if not ok:
            return msg
        decoders[basis] = qc
    b_bits = []
    for i in range(N):
        psi = sent[(int(a_bits[i]), int(a_bases[i]))]
        if eve:
            e = int(rng.integers(0, 2))
            p1 = abs(np.vdot(states[(1, e)], psi)) ** 2
            psi = states[(int(rng.random() < p1), e)]
        key = (tuple(np.round(psi, 9)), int(b_bases[i]))
        if key not in p_one:
            p_one[key] = kit.distribution(decoders[int(b_bases[i])], psi.astype(complex)).get("1", 0.0)
        b_bits.append(int(rng.random() < p_one[key]))
    return list(map(int, a_bits)), list(map(int, a_bases)), list(map(int, b_bases)), b_bits


def verify(solve, task, kit):
    fns = solve()
    rng = np.random.default_rng(8)
    for eve in (False, True):
        out = channel(fns, task, kit, eve, rng)
        if isinstance(out, str):
            return False, out
        a_bits, a_bases, b_bases, b_bits = out
        key_a = list(fns["sift"](a_bases, b_bases, a_bits))
        key_b = list(fns["sift"](a_bases, b_bases, b_bits))
        if key_a != [b for x, y, b in zip(a_bases, b_bases, a_bits) if x == y]:
            return False, "просеивание неверно"
        true_qber = sum(x != y for x, y in zip(key_a, key_b)) / len(key_a)
        qber, abort = fns["check"](key_a, key_b)
        if abs(qber - true_qber) > 1e-9:
            return False, "доля ошибок посчитана неверно"
        if not eve and (true_qber != 0 or abort):
            return False, f"без перехвата доля ошибок {true_qber:.3f}"
        if eve and not abort:
            return False, "перехват не обнаружен"
    return True, ""


def always_z():
    import importlib.util
    import os
    spec = importlib.util.spec_from_file_location("ref", os.path.join(os.path.dirname(__file__), "reference.py"))
    ref = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(ref)
    fns = ref.solve()

    def decode(basis):
        qc = QuantumCircuit(1, 1)
        qc.measure(0, 0)
        return qc

    fns["decode"] = decode
    return fns


WRONG = {"Боб всегда измеряет в базисе Z": always_z}
