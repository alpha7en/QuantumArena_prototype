from qiskit import QuantumCircuit

import sakit

GRID = [{}]


def spec():
    return sakit.op(sakit.xor_oracle(2, lambda x: int(x == 3)))


def v_instead_of_vdg():
    qc = QuantumCircuit(3)
    qc.csx(1, 2)
    qc.cx(0, 1)
    qc.csx(1, 2)
    qc.cx(0, 1)
    qc.csx(0, 2)
    return qc


def parity_left():
    qc = QuantumCircuit(3)
    qc.csx(1, 2)
    qc.cx(0, 1)
    qc.csx(1, 2)
    qc.cx(1, 2)
    qc.csx(0, 2)
    return qc


def no_last():
    qc = QuantumCircuit(3)
    qc.csx(1, 2)
    qc.cx(0, 1)
    qc.csx(1, 2)
    qc.cx(1, 2)
    qc.cx(0, 1)
    return qc


def native_ccx():
    qc = QuantumCircuit(3)
    qc.ccx(0, 1, 2)
    return qc


WRONG = {"V вместо V†": v_instead_of_vdg, "чётность не убрана": parity_left, "нет последнего csx": no_last,
         "готовый CCX": native_ccx}
