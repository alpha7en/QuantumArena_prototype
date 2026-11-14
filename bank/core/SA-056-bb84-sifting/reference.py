from qiskit import QuantumCircuit


def encode(bit, basis):
    qc = QuantumCircuit(1)
    if bit:
        qc.x(0)
    if basis:
        qc.h(0)
    return qc


def decode(basis):
    qc = QuantumCircuit(1, 1)
    if basis:
        qc.h(0)
    qc.measure(0, 0)
    return qc


def sift(alice_bases, bob_bases, bits):
    return [b for a, c, b in zip(alice_bases, bob_bases, bits) if a == c]


def check(key_a, key_b):
    qber = sum(a != b for a, b in zip(key_a, key_b)) / max(1, len(key_a))
    return qber, qber > 0.11


def solve():
    return {"encode": encode, "decode": decode, "sift": sift, "check": check}
