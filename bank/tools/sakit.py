"""sakit — набор проверок банка задач sparq arena.

Это НЕ боевая тестирующая система, а её заглушка для авторов задач: численная проверка на малых размерах
(вектор состояния и матрица, до ~12 кубитов). Интерфейс повторяет то, что должна уметь боевая система:
отношения эквивалентности из статьи о ladder_ec (eq, eq_phase, eq0, eq0_phase, eq_anc, eq_anc_phase)
и «особые» режимы (распределение измерений, чёрный ящик, динамические схемы, числовой ответ).

Соглашения банка (совпадают с data/own_generators/common.py репозитория ladder_ec):
  * порядок кубитов как в Qiskit: кубит i — это бит i целого числа (little-endian);
  * рабочие кубиты идут первыми, вспомогательные — последними;
  * спецификация задачи — изометрия W формы (2^d_out, 2^d_in): вход на кубитах 0..d_in-1, остальные
    стартуют в |0>; выход на кубитах 0..d_out-1, остальные обязаны вернуться в |0>.
"""
from __future__ import annotations

import math

import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator

ATOL = 1e-6
IGNORED = {"barrier"}
NON_GATES = {"barrier", "measure", "reset", "if_else"}

# ---------------------------------------------------------------- спецификации


def state(vec):
    """Спецификация «состояние из |0...0>»: возвращает (W, 0, n)."""
    v = np.asarray(vec, dtype=complex).reshape(-1)
    v = v / np.linalg.norm(v)
    return v.reshape(-1, 1), 0, int(round(math.log2(v.size)))


def ket(n, amps):
    """Вектор на n кубитах по словарю {индекс или битовая строка 'q_{n-1}...q_0': амплитуда}."""
    v = np.zeros(2 ** n, dtype=complex)
    for k, a in amps.items():
        v[int(k, 2) if isinstance(k, str) else k] = a
    return v


def op(U):
    """Спецификация «преобразование на d кубитах»: (U, d, d)."""
    U = np.asarray(U, dtype=complex)
    d = int(round(math.log2(U.shape[0])))
    return U, d, d


def perm(d, f):
    """Матрица перестановки базисных состояний |x> -> |f(x)> на d кубитах."""
    U = np.zeros((2 ** d, 2 ** d), dtype=complex)
    for x in range(2 ** d):
        U[f(x), x] = 1
    return U


def xor_oracle(n, f):
    """|x>|y> -> |x>|y xor f(x)>: x на кубитах 0..n-1, y — кубит n."""
    return perm(n + 1, lambda v: v ^ (f(v & (2 ** n - 1)) << n))


def phase_oracle(n, f):
    """|x> -> (-1)^f(x) |x> на n кубитах."""
    return np.diag([(-1.0) ** f(x) for x in range(2 ** n)]).astype(complex)


def kron(*ms):
    """Тензорное произведение в порядке Qiskit: kron(A_на_кубите_0, B_на_кубите_1, ...)."""
    out = np.array([[1]], dtype=complex)
    for m in ms:
        out = np.kron(np.asarray(m, dtype=complex), out)
    return out


I2 = np.eye(2, dtype=complex)
X = np.array([[0, 1], [1, 0]], dtype=complex)
Y = np.array([[0, -1j], [1j, 0]], dtype=complex)
Z = np.diag([1, -1]).astype(complex)
H = np.array([[1, 1], [1, -1]], dtype=complex) / math.sqrt(2)
PAULI = {"I": I2, "X": X, "Y": Y, "Z": Z}


def bits(x, n):
    """Список битов числа x: bits(x, n)[i] — бит i."""
    return [(x >> i) & 1 for i in range(n)]


# ---------------------------------------------------------------- симуляция


def unitary(qc: QuantumCircuit) -> np.ndarray:
    return Operator(qc).data


def check_isometry(qc, W, d_in, d_out, phase="global"):
    """Сравнить схему со спецификацией-изометрией. phase: 'global' (с точностью до фазы) или 'exact'."""
    N = qc.num_qubits
    if N < max(d_in, d_out):
        return False, f"в схеме {N} кубитов, нужно не меньше {max(d_in, d_out)}"
    if N <= 10:
        V = unitary(qc)[:, : 2 ** d_in]
    else:  # большие схемы: по одному столбцу через вектор состояния
        from qiskit.quantum_info import Statevector
        V = np.zeros((2 ** N, 2 ** d_in), dtype=complex)
        for x in range(2 ** d_in):
            e = np.zeros(2 ** N, dtype=complex)
            e[x] = 1
            V[:, x] = Statevector(e).evolve(qc).data
    top, rest = V[: 2 ** d_out, :], V[2 ** d_out:, :]
    if np.linalg.norm(rest) > 1e-5:
        return False, "вспомогательные кубиты не вернулись в |0>"
    W = np.asarray(W, dtype=complex)
    if phase == "exact":
        ok = np.allclose(top, W, atol=1e-5)
        return ok, "" if ok else "матрица отличается от целевой (фаза учитывается)"
    ov = np.vdot(W, top)
    norm = np.linalg.norm(W) ** 2
    ok = abs(abs(ov) - norm) < 1e-5 * norm
    return ok, "" if ok else "результат отличается от целевого"


RELATIONS = {
    "eq": "exact", "eq_phase": "global",
    "eq0": "exact", "eq0_phase": "global",
    "eq_anc": "exact", "eq_anc_phase": "global",
}


def apply_matrix(psi, mat, qubits, N):
    """Применить матрицу (little-endian по списку qubits) к вектору состояния на N кубитах."""
    k = len(qubits)
    t = psi.reshape([2] * N)
    in_axes = [N - 1 - qubits[k - 1 - a] for a in range(k)]
    m = np.asarray(mat, dtype=complex).reshape([2] * (2 * k))
    t = np.tensordot(m, t, axes=(list(range(k, 2 * k)), in_axes))
    t = np.moveaxis(t, list(range(k)), in_axes)
    return t.reshape(-1)


def _project(psi, q, bit, N):
    idx = np.arange(psi.size)
    mask = ((idx >> q) & 1) == bit
    out = np.where(mask, psi, 0)
    p = float(np.vdot(out, out).real)
    return p, (out / math.sqrt(p) if p > 1e-12 else out)


def run_dynamic(qc: QuantumCircuit, psi0=None):
    """Перебор ветвей схемы с измерениями, reset и if_test.

    Возвращает список ветвей (вероятность, вектор состояния, кортеж классических битов).
    """
    N, C = qc.num_qubits, qc.num_clbits
    if psi0 is None:
        psi0 = np.zeros(2 ** N, dtype=complex)
        psi0[0] = 1
    branches = [(1.0, np.asarray(psi0, dtype=complex), (0,) * C)]

    def run(circ, qmap, cmap, branches):
        for inst in circ.data:
            name = inst.operation.name
            qs = [qmap[circ.find_bit(q).index] for q in inst.qubits]
            cs = [cmap[circ.find_bit(c).index] for c in inst.clbits]
            if name in IGNORED:
                continue
            new = []
            if name == "measure":
                for p, psi, cl in branches:
                    for b in (0, 1):
                        pb, out = _project(psi, qs[0], b, N)
                        if pb > 1e-12:
                            c2 = list(cl)
                            c2[cs[0]] = b
                            new.append((p * pb, out, tuple(c2)))
            elif name == "reset":
                for p, psi, cl in branches:
                    for b in (0, 1):
                        pb, out = _project(psi, qs[0], b, N)
                        if pb > 1e-12:
                            if b:
                                out = apply_matrix(out, X, [qs[0]], N)
                            new.append((p * pb, out, cl))
            elif name == "if_else":
                target, value = inst.operation.condition
                blocks = inst.operation.blocks
                for p, psi, cl in branches:
                    if hasattr(target, "__len__"):
                        got = sum(cl[cmap[circ.find_bit(c).index]] << i for i, c in enumerate(target))
                    else:
                        got = cl[cmap[circ.find_bit(target).index]]
                    block = blocks[0] if got == int(value) else (blocks[1] if len(blocks) > 1 else None)
                    if block is None:
                        new.append((p, psi, cl))
                    else:
                        new.extend(run(block, qs, cs, [(p, psi, cl)]))
            else:
                mat = Operator(inst.operation).data
                for p, psi, cl in branches:
                    new.append((p, apply_matrix(psi, mat, qs, N), cl))
            branches = new
        return branches

    return run(qc, list(range(N)), list(range(C)), branches)


def distribution(qc, psi0=None):
    """Распределение классических битов в конце схемы: {'c_{C-1}...c_0': вероятность}."""
    out = {}
    for p, _, cl in run_dynamic(qc, psi0):
        key = "".join(str(b) for b in reversed(cl))
        out[key] = out.get(key, 0.0) + p
    return out


def reduced_fidelity(psi, qubits, target, N):
    """<target| rho_qubits |target> для чистого состояния psi на N кубитах."""
    t = psi.reshape([2] * N)
    keep = [N - 1 - q for q in reversed(qubits)]
    rest = [a for a in range(N) if a not in keep]
    t = np.transpose(t, keep + rest).reshape(2 ** len(qubits), -1)
    rho = t @ t.conj().T
    v = np.asarray(target, dtype=complex).reshape(-1)
    return float(np.real(np.vdot(v, rho @ v)))


def random_state(d, rng):
    v = rng.normal(size=2 ** d) + 1j * rng.normal(size=2 ** d)
    return v / np.linalg.norm(v)


def embed(vec, d, N):
    """Вектор на кубитах 0..d-1, остальные N-d кубитов в |0>."""
    out = np.zeros(2 ** N, dtype=complex)
    out[: 2 ** d] = vec
    return out


def as_gate(U_or_qc, name="oracle"):
    """Чёрный ящик для задач на алгоритмы: гейт с именем `oracle` (считается лимитом oracle_calls)."""
    if isinstance(U_or_qc, QuantumCircuit):
        g = U_or_qc.to_gate()
    else:
        from qiskit.circuit.library import UnitaryGate
        g = UnitaryGate(np.asarray(U_or_qc, dtype=complex))
    g.name = name
    return g


# ---------------------------------------------------------------- ресурсы и ограничения

ALIASES = {
    "mcx": {"cx", "ccx", "mcx", "c3x", "c4x", "mcx_gray", "mcx_vchain", "mcx_recursive"},
    "mcp": {"cp", "mcphase"},
    "mcz": {"cz", "ccz", "mcz"},
}


def metrics(qc: QuantumCircuit) -> dict:
    ops = []

    def walk(circ, qmap):
        for inst in circ.data:
            name = inst.operation.name
            qs = [qmap[circ.find_bit(q).index] for q in inst.qubits]
            if name == "if_else":
                for b in inst.operation.blocks:
                    if b is not None:
                        walk(b, qs)
                continue
            ops.append((name, qs))

    walk(qc, list(range(qc.num_qubits)))
    gates = [(n, q) for n, q in ops if n not in NON_GATES]
    return {
        "qubits": qc.num_qubits,
        "gates": len(gates),
        "depth": qc.depth(lambda i: i.operation.name not in IGNORED),
        "two_qubit": sum(1 for n, q in gates if len(q) >= 2 and n != "oracle"),
        "cx": sum(1 for n, _ in gates if n == "cx"),
        "t": sum(1 for n, _ in gates if n in ("t", "tdg")),
        "oracle_calls": sum(1 for n, _ in gates if n.startswith("oracle")),
        "measurements": sum(1 for n, _ in ops if n == "measure"),
        "names": sorted({n for n, _ in ops}),
        "ops": ops,
    }


def _allowed(basis):
    out = set()
    for g in basis:
        out |= ALIASES.get(g, {g})
    return out | {"barrier"}


def coupling_ok(a, b, kind, n, edges=None):
    if kind == "all":
        return True
    if kind == "line":
        return abs(a - b) == 1
    if kind == "ring":
        return abs(a - b) in (1, n - 1)
    if kind == "star":
        return 0 in (a, b)
    if kind == "custom":
        return (a, b) in edges or (b, a) in edges
    raise ValueError(kind)


def evaluate(expr, params):
    """Лимит задачи: число или выражение от параметров, например 'ceil(n/2)+1'."""
    if isinstance(expr, (int, float)):
        return expr
    env = {"ceil": math.ceil, "floor": math.floor, "log2": math.log2, "max": max, "min": min, "pi": math.pi}
    env.update({k: v for k, v in params.items() if isinstance(v, (int, float))})
    return eval(expr, {"__builtins__": {}}, env)  # noqa: S307 — выражения пишет автор задачи, не участник


def check_limits(qc, task, params):
    """Дешёвые проверки каскада: число кубитов, базис, связность, бюджеты. Возвращает (ok, сообщение)."""
    m = metrics(qc)
    f = task["facets"]
    q = task.get("qubits")
    if q is not None:
        cap = evaluate(q["data"], params) + evaluate(q.get("ancilla_max", 0), params)
        if m["qubits"] > cap:
            return False, f"число кубитов: {m['qubits']} из {cap}"
    g = f["gates"]
    if g["mode"] != "free":
        allowed = _allowed(g["set"]) | {"oracle"}
        if f.get("measure", "none") != "none":
            allowed |= {"measure", "if_else", "reset"} if f["measure"] == "mid" else {"measure"}
        bad = [n for n in m["names"] if n not in allowed and not n.startswith("oracle")]
        if bad:
            return False, f"гейт вне базиса: {bad[0]}"
    elif f.get("measure", "none") == "none" and (m["measurements"] or "reset" in m["names"]):
        return False, "измерения в этой задаче не разрешены"
    kind = f.get("coupling", "all")
    if kind != "all":
        edges = [tuple(e) for e in f.get("edges", [])]
        for name, qs in m["ops"]:
            if name in NON_GATES or len(qs) < 2:
                continue
            if len(qs) > 2 or not coupling_ok(qs[0], qs[1], kind, m["qubits"], edges):
                return False, f"нарушена связность: {name} на кубитах {qs}"
    for key, expr in (task.get("limits") or {}).items():
        if key in ("time_ms", "memory_mb"):
            continue
        cap = evaluate(expr, params)
        if m[key] > cap:
            return False, f"превышен лимит {key}: {m[key]} из {cap}"
    return True, ""
