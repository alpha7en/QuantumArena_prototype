"""Проверка банка: каждое эталонное решение проходит, каждое «почти верное» из WRONG — нет.

Запуск из корня репозитория:
    python3 bank/tools/verify.py            # все задачи bank/core
    python3 bank/tools/verify.py SA-005     # одна задача (по id или части имени папки)

Пакет задачи: task.yaml (карточка), reference.py (solve), check.py (spec/GRID либо verify, WRONG).
"""
from __future__ import annotations

import importlib.util
import os
import sys
import traceback

import yaml

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import sakit  # noqa: E402

BANK = os.path.dirname(HERE)
CORE = os.path.join(BANK, "core")

ENUMS = {
    "input": {"zero", "any", "reg_anc", "promise", "oracle", "resource"},
    "answer": {"fixed", "generator", "dynamic", "hybrid", "value"},
    "coupling": {"all", "line", "ring", "star", "custom"},
    "measure": {"none", "final", "mid"},
    "check": set(sakit.RELATIONS) | {"dist", "prob", "channel", "classical", "score", "fidelity"},
    "method": {"fact", "combo", "constraint", "generalize", "reverse", "transfer", "open"},
    "gates_mode": {"free", "basis", "native"},
    "source": {"own", "adapted", "real"},
}
REQUIRED = ["id", "slug", "title", "status", "level", "tree", "facets", "method", "source", "statement", "io"]


def load_module(path, name):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def validate_card(task, tree):
    errs = [f"нет поля {k}" for k in REQUIRED if k not in task]
    if errs:
        return errs
    f = task["facets"]
    for key in ("input", "answer", "coupling", "measure", "check"):
        if f.get(key, "none" if key == "measure" else None) not in ENUMS[key] and not (key == "coupling" and key not in f):
            errs.append(f"facets.{key} = {f.get(key)!r}")
    if f["gates"]["mode"] not in ENUMS["gates_mode"]:
        errs.append("facets.gates.mode")
    if task["method"]["kind"] not in ENUMS["method"]:
        errs.append(f"method.kind = {task['method']['kind']!r}")
    if task["source"]["kind"] not in ENUMS["source"]:
        errs.append("source.kind")
    if task["level"] not in (1, 2, 3):
        errs.append("level")
    branches = {b["id"] for t in tree["trunks"] for b in t["branches"]}
    for b in [task["tree"]["branch"]] + list(task["tree"].get("hybrid", [])):
        if b not in branches:
            errs.append(f"нет ветви {b} в tree.yaml")
    if not task["tree"]["branch"].startswith(task["tree"]["trunk"] + "."):
        errs.append("ветвь не принадлежит стволу")
    return errs


def run_solution(task, check, solve, params):
    qc = solve(**params)
    ok, msg = sakit.check_limits(qc, task, params)
    if not ok:
        return False, msg
    rel = task["facets"]["check"]
    if rel == "score":  # задача с оценкой: корректность проверяется отношением из scoring.relation
        rel = task["scoring"]["relation"]
    W, d_in, d_out = check.spec(**params)
    return sakit.check_isometry(qc, W, d_in, d_out, sakit.RELATIONS[rel])


def verify_task(path, tree):
    task = yaml.safe_load(open(os.path.join(path, "task.yaml"), encoding="utf-8"))
    errs = validate_card(task, tree)
    if errs:
        return task, False, "карточка: " + "; ".join(errs)
    ref = load_module(os.path.join(path, "reference.py"), "reference")
    check = load_module(os.path.join(path, "check.py"), "check")
    custom = hasattr(check, "verify")

    def judge(solve):
        """True/False и сообщение по всем наборам параметров."""
        if custom:
            return check.verify(solve, task, sakit)
        for params in check.GRID:
            ok, msg = run_solution(task, check, solve, params)
            if not ok:
                return False, f"{params}: {msg}"
        return True, ""

    ok, msg = judge(ref.solve)
    if not ok:
        return task, False, "эталон не прошёл — " + msg
    wrong = getattr(check, "WRONG", {})
    for name, fn in wrong.items():
        try:
            bad_ok, _ = judge(fn)
        except Exception as e:  # ошибка исполнения — тоже отказ
            bad_ok = False
            _ = str(e)
        if bad_ok:
            return task, False, f"неверное решение «{name}» прошло проверку"
    return task, True, f"эталон принят; отклонено неверных: {len(wrong)}"


def main():
    tree = yaml.safe_load(open(os.path.join(BANK, "tree.yaml"), encoding="utf-8"))
    pick = sys.argv[1:] or None
    dirs = sorted(d for d in os.listdir(CORE) if os.path.isdir(os.path.join(CORE, d)))
    failed = 0
    seen = set()
    for d in dirs:
        if pick and not any(p in d for p in pick):
            continue
        try:
            task, ok, msg = verify_task(os.path.join(CORE, d), tree)
            if task["id"] in seen:
                ok, msg = False, "повтор id"
            seen.add(task["id"])
            if not d.startswith(task["id"]):
                ok, msg = False, "имя папки не начинается с id"
        except Exception:
            ok, msg = False, traceback.format_exc(limit=3).strip().splitlines()[-1]
        failed += not ok
        print(f"{'OK  ' if ok else 'FAIL'} {d:44s} {msg}")
    print(f"\nзадач: {len(seen)}, с ошибками: {failed}")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
