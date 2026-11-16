// Примеры схем, шаблоны блоков и демонстрационная задача для режима «решение задачи».
const head = (n, nc) => `from qiskit import QuantumCircuit\nfrom math import pi\n\nqc = QuantumCircuit(${n}${nc ? ', ' + nc : ''})\n`;

export const EXAMPLES = [
  { name: 'ghz и блок', meta: '4 кубита · цикл for · блок с параметром', code: `from qiskit import QuantumCircuit
from math import pi

def oracle(qc, a, b, c, phi=pi / 2):
    qc.cz(a, c)
    qc.cx(b, c)
    qc.rz(phi, c)

qc = QuantumCircuit(4, 4)
qc.h(0)
for i in range(2):
    qc.cx(i, i + 1)
qc.ccx(0, 1, 3)
qc.rz(pi / 4, 2)
oracle(qc, 1, 2, 3, pi / 2)
qc.measure(range(4), range(4))` },
  { name: 'белл', meta: '2 кубита · клиффордова схема', code: head(2, 2) + 'qc.h(0)\nqc.cx(0, 1)\nqc.measure(range(2), range(2))' },
  { name: 'гровер-2', meta: '2 кубита · находит |11⟩ за один шаг', code: head(2, 2) + 'qc.h(0)\nqc.h(1)\nqc.cz(0, 1)\nqc.h(0)\nqc.h(1)\nqc.x(0)\nqc.x(1)\nqc.cz(0, 1)\nqc.x(0)\nqc.x(1)\nqc.h(0)\nqc.h(1)\nqc.measure(range(2), range(2))' },
  { name: 'телепортация', meta: '3 кубита · измерения и условные гейты', code: head(3, 3) + `qc.ry(pi / 3, 0)
qc.h(1)
qc.cx(1, 2)
qc.cx(0, 1)
qc.h(0)
qc.measure(0, 0)
qc.measure(1, 1)
with qc.if_test((qc.clbits[1], 1)):
    qc.x(2)
with qc.if_test((qc.clbits[0], 1)):
    qc.z(2)
qc.ry(-pi / 3, 2)
qc.measure(2, 2)` },
  { name: 'повтор до успеха', meta: '2 кубита · цикл while по измерению', code: head(2, 1) + `qc.h(0)
qc.h(1)
qc.cx(0, 1)
qc.measure(1, 0)
with qc.while_loop((qc.clbits[0], 1)):
    qc.reset(1)
    qc.h(0)
    qc.h(1)
    qc.cx(0, 1)
    qc.measure(1, 0)` },
  { name: 'qft-3', meta: '3 кубита · CP и SWAP', code: head(3, 3) + 'qc.x(0)\nqc.h(2)\nqc.cp(pi / 2, 1, 2)\nqc.cp(pi / 4, 0, 2)\nqc.h(1)\nqc.cp(pi / 2, 0, 1)\nqc.h(0)\nqc.swap(0, 2)\nqc.measure(range(3), range(3))' },
  { name: 'ghz-5', meta: '5 кубитов · цикл for', code: head(5, 5) + 'qc.h(0)\nfor i in range(4):\n    qc.cx(i, i + 1)\nqc.measure(range(5), range(5))' },
  { name: 'синдром кода повторения', meta: '5 кубитов · ошибка, синдром и условное исправление', code: head(5, 2) + `qc.ry(pi / 3, 0)
qc.cx(0, 1)
qc.cx(0, 2)
qc.barrier(0, 1, 2)
qc.x(2)
qc.barrier(0, 1, 2)
qc.cx(0, 3)
qc.cx(1, 3)
qc.cx(1, 4)
qc.cx(2, 4)
qc.measure(3, 0)
qc.measure(4, 1)
with qc.if_test((qc.clbits[1], 1)):
    qc.x(2)` },
];

export const TEMPLATES = {
  ghz3: 'def ghz3(qc, a, b, c, phi=0):\n    qc.h(a)\n    qc.cx(a, b)\n    qc.cx(b, c)\n    qc.rz(phi, c)',
  diffuser2: 'def diffuser2(qc, a, b):\n    qc.h(a)\n    qc.h(b)\n    qc.x(a)\n    qc.x(b)\n    qc.cz(a, b)\n    qc.x(a)\n    qc.x(b)\n    qc.h(a)\n    qc.h(b)',
  bell_pair: 'def bell_pair(qc, a, b, theta=pi / 2):\n    qc.ry(theta, a)\n    qc.cx(a, b)',
  phase_ladder: 'def phase_ladder(qc, a, b, c, theta=pi / 4, k=2):\n    for _ in range(k):\n        qc.cp(theta, a, c)\n    qc.cx(b, c)',
};

/** Пример контракта задачи (карточка SA-001 банка): так страница задачи настраивает песочницу. */
export const DEMO_TASK = {
  id: 'SA-001@1', code: 'SA-001', title: 'Состояние Белла со знаком минус', url: '../#/tasks',
  qubits: 2, clbits: 0, allow: ['H', 'X', 'Z', 'CX'], limits: { gates: 3, depth: 3 }, answer: 'fixed',
};
