"""Собрать производные файлы банка из карточек: INDEX.md, RESERVE.md, tree.html.

    python3 bank/tools/build_docs.py                # пишет в bank/
    python3 bank/tools/build_docs.py --page FILE    # дополнительно: страница дерева без оболочки <html>

Источники правды — bank/tree.yaml, bank/core/*/task.yaml, bank/reserve/reserve.yaml. Сгенерированные файлы руками не правят.
"""
from __future__ import annotations

import json
import os
import sys
from collections import Counter

import yaml

HERE = os.path.dirname(os.path.abspath(__file__))
BANK = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from verify import ENUMS  # noqa: E402

LEVEL = {1: "1 · вход", 2: "2 · практика", 3: "3 · контест"}
INPUT = {"zero": "$|0\\dots0\\rangle$", "any": "любое", "reg_anc": "регистр + анциллы", "promise": "обещание",
         "oracle": "чёрный ящик", "resource": "запутанность"}
ANSWER = {"fixed": "схема", "generator": "генератор", "dynamic": "динамическая", "hybrid": "программа", "value": "число"}
METHOD = {"fact": "один факт", "combo": "комбинация", "constraint": "под ограничением", "generalize": "обобщение",
          "reverse": "реверс", "transfer": "перенос сюжета", "open": "открытый оптимум"}


def load():
    tree = yaml.safe_load(open(os.path.join(BANK, "tree.yaml"), encoding="utf-8"))
    core = []
    root = os.path.join(BANK, "core")
    for d in sorted(os.listdir(root)):
        p = os.path.join(root, d, "task.yaml")
        if os.path.exists(p):
            t = yaml.safe_load(open(p, encoding="utf-8"))
            t["_dir"] = d
            core.append(t)
    reserve = yaml.safe_load(open(os.path.join(BANK, "reserve", "reserve.yaml"), encoding="utf-8"))["tasks"]
    return tree, core, reserve


def check_reserve(tree, core, reserve):
    branches = {b["id"] for t in tree["trunks"] for b in t["branches"]}
    seen, errs = set(), []
    for r in reserve:
        i, c = r["f"][0], r["f"][2]
        if r["id"] in seen:
            errs.append(f"{r['id']}: повтор id")
        seen.add(r["id"])
        if r["branch"] not in branches:
            errs.append(f"{r['id']}: нет ветви {r['branch']}")
        if i not in ENUMS["input"] or r["f"][1] not in ENUMS["answer"] or c not in ENUMS["check"]:
            errs.append(f"{r['id']}: f = {r['f']}")
        if r["m"] not in ENUMS["method"] or r["level"] not in (1, 2, 3):
            errs.append(f"{r['id']}: метод или уровень")
    used = {t["tree"]["branch"] for t in core} | {r["branch"] for r in reserve}
    errs += [f"ветвь {b} без задач" for b in sorted(branches - used)]
    return errs


def limits_text(t):
    names = {"gates": "гейтов", "depth": "глубина", "two_qubit": "многокубитных", "cx": "CX", "t": "T",
             "oracle_calls": "вызовов оракула", "measurements": "измерений"}
    parts = [f"{names[k]} не больше {v}" for k, v in (t.get("limits") or {}).items() if k in names]
    g = t["facets"]["gates"]
    if g["mode"] != "free" and g["set"]:
        parts.append("базис: " + ", ".join(g["set"]))
    if t["facets"].get("coupling", "all") != "all":
        parts.append("связность: " + {"line": "цепочка", "ring": "кольцо", "star": "звезда", "custom": "граф"}[t["facets"]["coupling"]])
    return "; ".join(parts)


def write_index(tree, core):
    out = ["# Ядро банка: эталонные задачи", "",
           "> Файл собран командой `python3 bank/tools/build_docs.py` из карточек `bank/core/*/task.yaml`. Руками не править.", "",
           f"Задач: **{len(core)}**. У каждой есть условие, эталонное решение и проверка; все проходят `bank/tools/verify.py`.", ""]
    lv = Counter(t["level"] for t in core)
    out += ["| Уровень | Задач |", "|---|--:|"] + [f"| {LEVEL[k]} | {lv[k]} |" for k in (1, 2, 3)] + [""]
    for tr in tree["trunks"]:
        rows = [t for t in core if t["tree"]["trunk"] == tr["id"]]
        out += [f"## {tr['id']}. {tr['title']} — {len(rows)}", "",
                "| id | Задача | Ур. | Ветвь | Вход | Ответ | Проверка | Как составлена | Источник |",
                "|---|---|:-:|---|---|---|---|---|---|"]
        for t in rows:
            f = t["facets"]
            out.append(f"| [{t['id']}](core/{t['_dir']}/task.yaml) | {t['title']} | {t['level']} | {t['tree']['branch']} | "
                       f"{INPUT[f['input']]} | {ANSWER[f['answer']]} | `{f['check']}` | {METHOD[t['method']['kind']]} | {t['source']['ref']} |")
        out.append("")
    open(os.path.join(BANK, "INDEX.md"), "w", encoding="utf-8").write("\n".join(out))


def write_reserve(tree, reserve):
    out = ["# Резервный банк: идеи задач", "",
           "> Файл собран командой `python3 bank/tools/build_docs.py` из `bank/reserve/reserve.yaml`. Руками не править.", "",
           f"Идей: **{len(reserve)}**. У идеи есть механика, место в дереве и источник; условия, эталона и тестов нет.", ""]
    for tr in tree["trunks"]:
        rows = [r for r in reserve if r["branch"].startswith(tr["id"] + ".")]
        out += [f"## {tr['id']}. {tr['title']} — {len(rows)}", "",
                "| id | Идея | Ур. | Ветвь | Вход | Ответ | Проверка | Как составлена | Источник |", "|---|---|:-:|---|---|---|---|---|---|"]
        for r in rows:
            out.append(f"| {r['id']} | **{r['title']}.** {r['idea']} | {r['level']} | {r['branch']} | {INPUT[r['f'][0]]} | "
                       f"{ANSWER[r['f'][1]]} | `{r['f'][2]}` | {METHOD[r['m']]} | {r['src']} |")
        out.append("")
    open(os.path.join(BANK, "RESERVE.md"), "w", encoding="utf-8").write("\n".join(out))


def page_data(tree, core, reserve):
    tasks = []
    for t in core:
        f = t["facets"]
        tasks.append({"id": t["id"], "title": t["title"], "level": t["level"], "branch": t["tree"]["branch"],
                      "hybrid": t["tree"].get("hybrid", []), "bank": "core", "input": f["input"], "answer": f["answer"],
                      "check": f["check"], "method": t["method"]["kind"], "source": t["source"]["ref"], "io": t["io"],
                      "idea": t["method"]["key_idea"], "limits": limits_text(t)})
    for r in reserve:
        tasks.append({"id": r["id"], "title": r["title"], "level": r["level"], "branch": r["branch"], "bank": "reserve",
                      "input": r["f"][0], "answer": r["f"][1], "check": r["f"][2], "method": r["m"], "source": r["src"],
                      "idea": r["idea"]})
    return {"trunks": tree["trunks"], "tasks": tasks}


def main():
    tree, core, reserve = load()
    errs = check_reserve(tree, core, reserve)
    if errs:
        print("\n".join(errs))
        sys.exit(1)
    write_index(tree, core)
    write_reserve(tree, reserve)
    body = open(os.path.join(HERE, "tree_template.html"), encoding="utf-8").read()
    body = body.replace("/*DATA*/", json.dumps(page_data(tree, core, reserve), ensure_ascii=False).replace("</", "<\\/"))
    shell = ('<!doctype html>\n<html lang="ru">\n<head>\n<meta charset="utf-8">\n'
             '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
             "<style>body{margin:0}[hidden]{display:none!important}</style>\n</head>\n<body>\n" + body + "</body>\n</html>\n")
    open(os.path.join(BANK, "tree.html"), "w", encoding="utf-8").write(shell)
    if "--page" in sys.argv:
        open(sys.argv[sys.argv.index("--page") + 1], "w", encoding="utf-8").write(body)
    lv = Counter(t["level"] for t in core)
    print(f"ядро: {len(core)} (уровни {lv[1]}/{lv[2]}/{lv[3]}), резерв: {len(reserve)}, ветвей: "
          f"{sum(len(t['branches']) for t in tree['trunks'])}")
    for key, label in (("answer", "ответ"), ("input", "вход"), ("check", "проверка")):
        print(label, dict(Counter(t["facets"][key] for t in core)))
    print("метод", dict(Counter(t["method"]["kind"] for t in core)))


if __name__ == "__main__":
    main()
