#!/usr/bin/env python3
"""
QuantumArena Visual Presentation Builder
- 28 slides strictly adhering to visual-first principles:
  1. Real SVG branching trees (root -> branches -> leaves with bezier curves).
  2. Zero code snippets (no Python / Qiskit code).
  3. Parametric circuits visualized with formulas directly ON gates and shaded/colored blocks.
  4. Radically minimal text: 2-4 word title, 1-line KaTeX math formula, parameter badges.
  5. Circuits occupy 75%+ of slide area.
  6. Topology slides include visual node-edge graphs (valid vs invalid links, SWAPs).
  7. Dynamic circuits show double lines, measurement gauges, and conditional feedforward.
"""

import os
import json

# ----------------------------------------------------------------------
# 1. SVG TREES FOR TAXONOMY SLIDES (Slides 2 - 7)
# ----------------------------------------------------------------------

def svg_tree_5axis():
    return """
    <svg viewBox="0 0 1000 460" class="w-full h-full max-h-[520px]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradRoot" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#1e293b"/>
        </linearGradient>
      </defs>

      <!-- ROOT NODE -->
      <rect x="360" y="15" width="280" height="46" rx="23" fill="url(#gradRoot)"/>
      <text x="500" y="44" font-family="system-ui, sans-serif" font-size="14" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">КВАНТОВАЯ ЗАДАЧА</text>

      <!-- BEZIER BRANCHES FROM ROOT TO 5 AXES -->
      <path d="M 410 61 C 410 95, 100 85, 100 120" fill="none" stroke="#475569" stroke-width="2.5"/>
      <path d="M 455 61 C 455 95, 300 85, 300 120" fill="none" stroke="#475569" stroke-width="2.5"/>
      <path d="M 500 61 L 500 120" fill="none" stroke="#475569" stroke-width="2.5"/>
      <path d="M 545 61 C 545 95, 700 85, 700 120" fill="none" stroke="#475569" stroke-width="2.5"/>
      <path d="M 590 61 C 590 95, 900 85, 900 120" fill="none" stroke="#475569" stroke-width="2.5"/>

      <!-- AXIS 1: ПАРАДИГМА -->
      <rect x="25" y="120" width="150" height="36" rx="10" fill="#f8fafc" stroke="#475569" stroke-width="2"/>
      <text x="100" y="143" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#0f172a" text-anchor="middle">1. ПАРАДИГМА</text>
      <!-- Leaves 1 -->
      <line x1="100" y1="156" x2="100" y2="185" stroke="#94a3b8" stroke-width="2"/>
      <rect x="15" y="185" width="170" height="30" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="100" y="204" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#1e293b" text-anchor="middle">Асимптотика O(2ⁿ)</text>
      <line x1="100" y1="215" x2="100" y2="230" stroke="#94a3b8" stroke-width="2"/>
      <rect x="15" y="230" width="170" height="30" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="100" y="249" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#1e293b" text-anchor="middle">NISQ / Ограничения</text>
      <line x1="100" y1="260" x2="100" y2="275" stroke="#94a3b8" stroke-width="2"/>
      <rect x="15" y="275" width="170" height="30" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="100" y="294" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#1e293b" text-anchor="middle">FTQC / Коррекция QEC</text>

      <!-- AXIS 2: ВХОД |ψ⟩ -->
      <rect x="225" y="120" width="150" height="36" rx="10" fill="#f8fafc" stroke="#475569" stroke-width="2"/>
      <text x="300" y="143" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#0f172a" text-anchor="middle">2. ВХОД |ψ⟩</text>
      <!-- Leaves 2 -->
      <line x1="300" y1="156" x2="300" y2="185" stroke="#94a3b8" stroke-width="2"/>
      <rect x="215" y="185" width="170" height="30" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="300" y="205" font-family="monospace" font-size="12" font-weight="800" fill="#475569" text-anchor="middle">|00...0⟩ (Вакуум)</text>
      <line x1="300" y1="215" x2="300" y2="230" stroke="#94a3b8" stroke-width="2"/>
      <rect x="215" y="230" width="170" height="30" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="300" y="250" font-family="monospace" font-size="12" font-weight="800" fill="#475569" text-anchor="middle">|ψ_in⟩ (Любой)</text>
      <line x1="300" y1="260" x2="300" y2="275" stroke="#94a3b8" stroke-width="2"/>
      <rect x="215" y="275" width="170" height="30" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="300" y="295" font-family="monospace" font-size="12" font-weight="800" fill="#475569" text-anchor="middle">|ψ(θ)⟩ (Параметр)</text>
      <line x1="300" y1="305" x2="300" y2="320" stroke="#94a3b8" stroke-width="2"/>
      <rect x="215" y="320" width="170" height="30" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="300" y="340" font-family="monospace" font-size="12" font-weight="800" fill="#475569" text-anchor="middle">|x⟩|0⟩ₐₙc (Анциллы)</text>

      <!-- AXIS 3: КОНТРАКТ -->
      <rect x="425" y="120" width="150" height="36" rx="10" fill="#f8fafc" stroke="#475569" stroke-width="2"/>
      <text x="500" y="143" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#0f172a" text-anchor="middle">3. ФОРМАТ РЕШЕНИЯ</text>
      <!-- Leaves 3 -->
      <line x1="500" y1="156" x2="500" y2="185" stroke="#94a3b8" stroke-width="2"/>
      <rect x="415" y="185" width="170" height="30" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="500" y="204" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#475569" text-anchor="middle">Тип A: GUI Composer</text>
      <line x1="500" y1="215" x2="500" y2="230" stroke="#94a3b8" stroke-width="2"/>
      <rect x="415" y="230" width="170" height="30" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="500" y="249" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#475569" text-anchor="middle">Тип B: Параметрический</text>
      <line x1="500" y1="260" x2="500" y2="275" stroke="#94a3b8" stroke-width="2"/>
      <rect x="415" y="275" width="170" height="30" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="500" y="294" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#475569" text-anchor="middle">Тип C: Динамика (c_if)</text>

      <!-- AXIS 4: ТОПОЛОГИЯ -->
      <rect x="625" y="120" width="150" height="36" rx="10" fill="#f8fafc" stroke="#475569" stroke-width="2"/>
      <text x="700" y="143" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#0f172a" text-anchor="middle">4. ТОПОЛОГИЯ</text>
      <!-- Leaves 4 -->
      <line x1="700" y1="156" x2="700" y2="185" stroke="#94a3b8" stroke-width="2"/>
      <rect x="615" y="185" width="170" height="30" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="700" y="204" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#475569" text-anchor="middle">All-to-All (Идеал)</text>
      <line x1="700" y1="215" x2="700" y2="230" stroke="#94a3b8" stroke-width="2"/>
      <rect x="615" y="230" width="170" height="30" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="700" y="249" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#475569" text-anchor="middle">Линейная цепь</text>
      <line x1="700" y1="260" x2="700" y2="275" stroke="#94a3b8" stroke-width="2"/>
      <rect x="615" y="275" width="170" height="30" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="700" y="294" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#475569" text-anchor="middle">Heavy-Hex (IBM Чип)</text>

      <!-- AXIS 5: АВТОСУДЬЯ -->
      <rect x="825" y="120" width="150" height="36" rx="10" fill="#f8fafc" stroke="#475569" stroke-width="2"/>
      <text x="900" y="143" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#0f172a" text-anchor="middle">5. АВТОСУДЬЯ</text>
      <!-- Leaves 5 -->
      <line x1="900" y1="156" x2="900" y2="185" stroke="#94a3b8" stroke-width="2"/>
      <rect x="815" y="185" width="170" height="30" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="900" y="204" font-family="monospace" font-size="11" font-weight="700" fill="#475569" text-anchor="middle">State Fidelity</text>
      <line x1="900" y1="215" x2="900" y2="230" stroke="#94a3b8" stroke-width="2"/>
      <rect x="815" y="230" width="170" height="30" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="900" y="249" font-family="monospace" font-size="11" font-weight="700" fill="#475569" text-anchor="middle">Unitary Distance</text>
      <line x1="900" y1="260" x2="900" y2="275" stroke="#94a3b8" stroke-width="2"/>
      <rect x="815" y="275" width="170" height="30" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="900" y="294" font-family="monospace" font-size="11" font-weight="700" fill="#475569" text-anchor="middle">Shots Distribution</text>
    </svg>
    """

def svg_tree_inputs():
    return """
    <svg viewBox="0 0 960 380" class="w-full h-full max-h-[480px]" xmlns="http://www.w3.org/2000/svg">
      <rect x="360" y="20" width="240" height="46" rx="23" fill="#0f172a"/>
      <text x="480" y="48" font-family="system-ui, sans-serif" font-size="14" font-weight="900" fill="#ffffff" text-anchor="middle">ВХОДНЫЕ СОСТОЯНИЯ</text>

      <path d="M 420 66 C 420 120, 130 110, 130 150" fill="none" stroke="#475569" stroke-width="3"/>
      <path d="M 460 66 C 460 120, 360 110, 360 150" fill="none" stroke="#4f46e5" stroke-width="3"/>
      <path d="M 500 66 C 500 120, 600 110, 600 150" fill="none" stroke="#7c3aed" stroke-width="3"/>
      <path d="M 540 66 C 540 120, 830 110, 830 150" fill="none" stroke="#475569" stroke-width="3"/>

      <!-- NODE 1: |0...0⟩ -->
      <rect x="30" y="150" width="200" height="54" rx="14" fill="#f8fafc" stroke="#475569" stroke-width="2"/>
      <text x="130" y="177" font-family="monospace" font-size="16" font-weight="900" fill="#0f172a" text-anchor="middle">|00...0⟩</text>
      <text x="130" y="195" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#475569" text-anchor="middle">Фиксированный вакуум</text>
      <line x1="130" y1="204" x2="130" y2="235" stroke="#475569" stroke-width="2"/>
      <rect x="25" y="235" width="210" height="42" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="130" y="261" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#0f172a" text-anchor="middle">Синтез: Bell, GHZ, W</text>

      <!-- NODE 2: |ψ_in⟩ -->
      <rect x="260" y="150" width="200" height="54" rx="14" fill="#f8fafc" stroke="#4f46e5" stroke-width="2"/>
      <text x="360" y="177" font-family="monospace" font-size="16" font-weight="900" fill="#0f172a" text-anchor="middle">|ψ_in⟩</text>
      <text x="360" y="195" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#475569" text-anchor="middle">Произвольный вектор</text>
      <line x1="360" y1="204" x2="360" y2="235" stroke="#4f46e5" stroke-width="2"/>
      <rect x="255" y="235" width="210" height="42" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="360" y="261" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#0f172a" text-anchor="middle">Операторы: SWAP, QFT</text>

      <!-- NODE 3: |ψ(θ)⟩ -->
      <rect x="500" y="150" width="200" height="54" rx="14" fill="#f8fafc" stroke="#7c3aed" stroke-width="2"/>
      <text x="600" y="177" font-family="monospace" font-size="16" font-weight="900" fill="#475569" text-anchor="middle">|ψ(θ)⟩</text>
      <text x="600" y="195" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#475569" text-anchor="middle">Параметрический класс</text>
      <line x1="600" y1="204" x2="600" y2="235" stroke="#7c3aed" stroke-width="2"/>
      <rect x="495" y="235" width="210" height="42" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="600" y="261" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#475569" text-anchor="middle">Вариационные / VQE</text>

      <!-- NODE 4: |x⟩|0⟩_anc -->
      <rect x="730" y="150" width="200" height="54" rx="14" fill="#f8fafc" stroke="#475569" stroke-width="2"/>
      <text x="830" y="177" font-family="monospace" font-size="16" font-weight="900" fill="#0f172a" text-anchor="middle">|x⟩|0⟩ₐₙc</text>
      <text x="830" y="195" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#475569" text-anchor="middle">Регистр + Анциллы</text>
      <line x1="830" y1="204" x2="830" y2="235" stroke="#475569" stroke-width="2"/>
      <rect x="725" y="235" width="210" height="42" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="830" y="261" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#0f172a" text-anchor="middle">Оракулы + Uncomputation</text>
    </svg>
    """

def svg_tree_outputs():
    return """
    <svg viewBox="0 0 960 360" class="w-full h-full max-h-[480px]" xmlns="http://www.w3.org/2000/svg">
      <rect x="360" y="20" width="240" height="46" rx="23" fill="#0f172a"/>
      <text x="480" y="48" font-family="system-ui, sans-serif" font-size="14" font-weight="900" fill="#ffffff" text-anchor="middle">ФОРМАТЫ РЕШЕНИЯ</text>

      <path d="M 430 66 C 430 110, 160 110, 160 150" fill="none" stroke="#475569" stroke-width="3"/>
      <path d="M 480 66 L 480 150" fill="none" stroke="#4f46e5" stroke-width="3"/>
      <path d="M 530 66 C 530 110, 800 110, 800 150" fill="none" stroke="#475569" stroke-width="3"/>

      <!-- TYPE A -->
      <rect x="40" y="150" width="240" height="85" rx="14" fill="#f8fafc" stroke="#475569" stroke-width="2"/>
      <text x="160" y="180" font-family="system-ui, sans-serif" font-size="14" font-weight="900" fill="#0f172a" text-anchor="middle">ТИП A: СТАТИЧЕСКАЯ</text>
      <text x="160" y="202" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#475569" text-anchor="middle">100% сборка в GUI Composer</text>
      <text x="160" y="222" font-family="monospace" font-size="11" fill="#059669" text-anchor="middle">N = const • Drag & Drop</text>

      <!-- TYPE B -->
      <rect x="360" y="150" width="240" height="85" rx="14" fill="#f8fafc" stroke="#4f46e5" stroke-width="2"/>
      <text x="480" y="180" font-family="system-ui, sans-serif" font-size="14" font-weight="900" fill="#0f172a" text-anchor="middle">ТИП B: ПАРАМЕТРИЧЕСКАЯ</text>
      <text x="480" y="202" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#475569" text-anchor="middle">Генерация под размер входа</text>
      <text x="480" y="222" font-family="monospace" font-size="11" fill="#4f46e5" text-anchor="middle">solve(n, s, ...) → Circuit</text>

      <!-- TYPE C -->
      <rect x="680" y="150" width="240" height="85" rx="14" fill="#f8fafc" stroke="#475569" stroke-width="2"/>
      <text x="800" y="180" font-family="system-ui, sans-serif" font-size="14" font-weight="900" fill="#0f172a" text-anchor="middle">ТИП C: ДИНАМИЧЕСКАЯ</text>
      <text x="800" y="202" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#475569" text-anchor="middle">Обратная связь и измерения</text>
      <text x="800" y="222" font-family="monospace" font-size="11" fill="#dc2626" text-anchor="middle">Measure + c_if + Reset</text>
    </svg>
    """

def svg_tree_bases():
    return """
    <svg viewBox="0 0 980 340" class="w-full h-full max-h-[480px]" xmlns="http://www.w3.org/2000/svg">
      <rect x="380" y="20" width="220" height="46" rx="23" fill="#0f172a"/>
      <text x="490" y="48" font-family="system-ui, sans-serif" font-size="14" font-weight="900" fill="#ffffff" text-anchor="middle">НАБОРЫ ГЕЙТОВ</text>

      <path d="M 430 66 C 430 110, 100 110, 100 150" fill="none" stroke="#475569" stroke-width="2.5"/>
      <path d="M 460 66 C 460 110, 295 110, 295 150" fill="none" stroke="#475569" stroke-width="2.5"/>
      <path d="M 490 66 L 490 150" fill="none" stroke="#7c3aed" stroke-width="2.5"/>
      <path d="M 520 66 C 520 110, 685 110, 685 150" fill="none" stroke="#475569" stroke-width="2.5"/>
      <path d="M 550 66 C 550 110, 880 110, 880 150" fill="none" stroke="#475569" stroke-width="2.5"/>

      <!-- UNIVERSAL -->
      <rect x="15" y="150" width="170" height="85" rx="12" fill="#f8fafc" stroke="#475569" stroke-width="2"/>
      <text x="100" y="176" font-family="system-ui, sans-serif" font-size="13" font-weight="900" fill="#0f172a" text-anchor="middle">Universal</text>
      <text x="100" y="198" font-family="monospace" font-size="11" font-weight="800" fill="#1e1b4b" text-anchor="middle">{H, S, T, CX, Rz}</text>
      <text x="100" y="220" font-family="system-ui, sans-serif" font-size="10" font-weight="600" fill="#475569" text-anchor="middle">Clifford + T</text>

      <!-- REVERSIBLE -->
      <rect x="210" y="150" width="170" height="85" rx="12" fill="#f8fafc" stroke="#475569" stroke-width="2"/>
      <text x="295" y="176" font-family="system-ui, sans-serif" font-size="13" font-weight="900" fill="#0f172a" text-anchor="middle">Reversible</text>
      <text x="295" y="198" font-family="monospace" font-size="11" font-weight="800" fill="#064e3b" text-anchor="middle">{X, CX, CCX}</text>
      <text x="295" y="220" font-family="system-ui, sans-serif" font-size="10" font-weight="600" fill="#475569" text-anchor="middle">Булева логика</text>

      <!-- CLIFFORD -->
      <rect x="405" y="150" width="170" height="85" rx="12" fill="#f8fafc" stroke="#7c3aed" stroke-width="2"/>
      <text x="490" y="176" font-family="system-ui, sans-serif" font-size="13" font-weight="900" fill="#475569" text-anchor="middle">Clifford</text>
      <text x="490" y="198" font-family="monospace" font-size="11" font-weight="800" fill="#4c1d95" text-anchor="middle">{H, S, CX, CZ}</text>
      <text x="490" y="220" font-family="system-ui, sans-serif" font-size="10" font-weight="600" fill="#475569" text-anchor="middle">Стабилизаторы</text>

      <!-- IBM NATIVE -->
      <rect x="600" y="150" width="170" height="85" rx="12" fill="#f8fafc" stroke="#475569" stroke-width="2"/>
      <text x="685" y="176" font-family="system-ui, sans-serif" font-size="13" font-weight="900" fill="#0f172a" text-anchor="middle">IBM Native</text>
      <text x="685" y="198" font-family="monospace" font-size="11" font-weight="800" fill="#7f1d1d" text-anchor="middle">{CZ, Rz, √X, X}</text>
      <text x="685" y="220" font-family="system-ui, sans-serif" font-size="10" font-weight="600" fill="#475569" text-anchor="middle">Сверхпроводники</text>

      <!-- IONQ NATIVE -->
      <rect x="795" y="150" width="170" height="85" rx="12" fill="#f8fafc" stroke="#475569" stroke-width="2"/>
      <text x="880" y="176" font-family="system-ui, sans-serif" font-size="13" font-weight="900" fill="#0f172a" text-anchor="middle">IonQ Native</text>
      <text x="880" y="198" font-family="monospace" font-size="11" font-weight="800" fill="#78350f" text-anchor="middle">{MS, Rx, Ry}</text>
      <text x="880" y="220" font-family="system-ui, sans-serif" font-size="10" font-weight="600" fill="#475569" text-anchor="middle">Ионные ловушки</text>
    </svg>
    """

def svg_tree_topologies():
    return """
    <svg viewBox="0 0 960 360" class="w-full h-full max-h-[480px]" xmlns="http://www.w3.org/2000/svg">
      <rect x="360" y="20" width="240" height="46" rx="23" fill="#0f172a"/>
      <text x="480" y="48" font-family="system-ui, sans-serif" font-size="14" font-weight="900" fill="#ffffff" text-anchor="middle">СВЯЗНОСТЬ КУБИТОВ</text>

      <path d="M 420 66 C 420 110, 130 110, 130 150" fill="none" stroke="#475569" stroke-width="3"/>
      <path d="M 460 66 C 460 110, 360 110, 360 150" fill="none" stroke="#475569" stroke-width="3"/>
      <path d="M 500 66 C 500 110, 600 110, 600 150" fill="none" stroke="#7c3aed" stroke-width="3"/>
      <path d="M 540 66 C 540 110, 830 110, 830 150" fill="none" stroke="#475569" stroke-width="3"/>

      <!-- ALL-TO-ALL -->
      <rect x="30" y="150" width="200" height="100" rx="14" fill="#f8fafc" stroke="#475569" stroke-width="2"/>
      <text x="130" y="178" font-family="system-ui, sans-serif" font-size="13" font-weight="900" fill="#0f172a" text-anchor="middle">All-to-All (Kₙ)</text>
      <text x="130" y="200" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#475569" text-anchor="middle">Любая пара (qᵢ, qⱼ)</text>
      <!-- Mini graph -->
      <circle cx="100" cy="225" r="6" fill="#475569"/>
      <circle cx="160" cy="225" r="6" fill="#475569"/>
      <line x1="106" y1="225" x2="154" y2="225" stroke="#475569" stroke-width="2.5"/>

      <!-- LINEAR -->
      <rect x="260" y="150" width="200" height="100" rx="14" fill="#f8fafc" stroke="#475569" stroke-width="2"/>
      <text x="360" y="178" font-family="system-ui, sans-serif" font-size="13" font-weight="900" fill="#0f172a" text-anchor="middle">Линейная цепь</text>
      <text x="360" y="200" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#059669" text-anchor="middle">Только соседи |i - j| = 1</text>
      <!-- Mini graph -->
      <circle cx="310" cy="225" r="5" fill="#059669"/>
      <line x1="315" y1="225" x2="355" y2="225" stroke="#475569" stroke-width="2"/>
      <circle cx="360" cy="225" r="5" fill="#059669"/>
      <line x1="365" y1="225" x2="405" y2="225" stroke="#475569" stroke-width="2"/>
      <circle cx="410" cy="225" r="5" fill="#059669"/>

      <!-- STAR / TREE -->
      <rect x="500" y="150" width="200" height="100" rx="14" fill="#f8fafc" stroke="#7c3aed" stroke-width="2"/>
      <text x="600" y="178" font-family="system-ui, sans-serif" font-size="13" font-weight="900" fill="#475569" text-anchor="middle">Звезда / Дерево</text>
      <text x="600" y="200" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#475569" text-anchor="middle">Центр q₀ со всеми</text>
      <!-- Mini graph -->
      <circle cx="600" cy="220" r="6" fill="#475569"/>
      <line x1="570" y1="235" x2="595" y2="223" stroke="#7c3aed" stroke-width="2"/>
      <circle cx="570" cy="235" r="4" fill="#475569"/>
      <line x1="630" y1="235" x2="605" y2="223" stroke="#7c3aed" stroke-width="2"/>
      <circle cx="630" cy="235" r="4" fill="#475569"/>

      <!-- HEAVY-HEX -->
      <rect x="730" y="150" width="200" height="100" rx="14" fill="#f8fafc" stroke="#475569" stroke-width="2"/>
      <text x="830" y="178" font-family="system-ui, sans-serif" font-size="13" font-weight="900" fill="#0f172a" text-anchor="middle">Heavy-Hex (IBM)</text>
      <text x="830" y="200" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#dc2626" text-anchor="middle">Шестиугольная решетка</text>
      <text x="830" y="222" font-family="monospace" font-size="10" fill="#475569" text-anchor="middle">SWAP Overhead</text>
    </svg>
    """

def svg_tree_autojudge():
    return """
    <svg viewBox="0 0 960 360" class="w-full h-full max-h-[480px]" xmlns="http://www.w3.org/2000/svg">
      <rect x="360" y="20" width="240" height="46" rx="23" fill="#0f172a"/>
      <text x="480" y="48" font-family="system-ui, sans-serif" font-size="14" font-weight="900" fill="#ffffff" text-anchor="middle">АВТОСУДЬЯ QUANTUMARENA</text>

      <path d="M 430 66 C 430 110, 160 110, 160 150" fill="none" stroke="#475569" stroke-width="3"/>
      <path d="M 480 66 L 480 150" fill="none" stroke="#4f46e5" stroke-width="3"/>
      <path d="M 530 66 C 530 110, 800 110, 800 150" fill="none" stroke="#475569" stroke-width="3"/>

      <!-- STATE FIDELITY -->
      <rect x="50" y="150" width="220" height="95" rx="14" fill="#f8fafc" stroke="#475569" stroke-width="2"/>
      <text x="160" y="178" font-family="system-ui, sans-serif" font-size="13" font-weight="900" fill="#0f172a" text-anchor="middle">1. State Fidelity</text>
      <text x="160" y="202" font-family="monospace" font-size="12" font-weight="800" fill="#475569" text-anchor="middle">F = |⟨ψ|φ⟩|² ≥ 0.999</text>
      <text x="160" y="224" font-family="system-ui, sans-serif" font-size="10" font-weight="600" fill="#059669" text-anchor="middle">Для входов |00...0⟩</text>

      <!-- UNITARY DISTANCE -->
      <rect x="370" y="150" width="220" height="95" rx="14" fill="#f8fafc" stroke="#4f46e5" stroke-width="2"/>
      <text x="480" y="178" font-family="system-ui, sans-serif" font-size="13" font-weight="900" fill="#0f172a" text-anchor="middle">2. Unitary Distance</text>
      <text x="480" y="202" font-family="monospace" font-size="12" font-weight="800" fill="#475569" text-anchor="middle">||U_user - U_target||_F ≤ ε</text>
      <text x="480" y="224" font-family="system-ui, sans-serif" font-size="10" font-weight="600" fill="#4f46e5" text-anchor="middle">Для операторов любого |ψ⟩</text>

      <!-- SHOTS SAMPLING -->
      <rect x="690" y="150" width="220" height="95" rx="14" fill="#f8fafc" stroke="#475569" stroke-width="2"/>
      <text x="800" y="178" font-family="system-ui, sans-serif" font-size="13" font-weight="900" fill="#0f172a" text-anchor="middle">3. Shots Distribution</text>
      <text x="800" y="202" font-family="monospace" font-size="12" font-weight="800" fill="#475569" text-anchor="middle">χ²-тест / TVD тест</text>
      <text x="800" y="224" font-family="system-ui, sans-serif" font-size="10" font-weight="600" fill="#dc2626" text-anchor="middle">Для динамики и измерений</text>
    </svg>
    """

# ----------------------------------------------------------------------
# 2. HIGH-IMPACT QUANTUM CIRCUITS (Slides 8 - 25)
# ----------------------------------------------------------------------

def svg_circuit_bell_minus():
    """Slide 8: Bell |Phi-> (All static gates -> 100% neutral dark slate)"""
    return """
    <svg viewBox="0 0 880 240" class="w-full h-full max-h-[480px]" xmlns="http://www.w3.org/2000/svg">
      <text x="35" y="30" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#059669" letter-spacing="1">ВХОД</text>
      <text x="680" y="30" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#6366f1" letter-spacing="1">ВЫХОД</text>

      <!-- Wires -->
      <line x1="80" y1="80" x2="650" y2="80" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="80" y1="160" x2="650" y2="160" stroke="#94a3b8" stroke-width="2.5"/>

      <!-- Input Wire Labels -->
      <text x="35" y="85" font-family="monospace" font-size="16" font-weight="800" fill="#0f172a">|0⟩</text>
      <text x="35" y="165" font-family="monospace" font-size="16" font-weight="800" fill="#0f172a">|0⟩</text>

      <!-- Static X Gate on q0 (Neutral Slate) -->
      <rect x="180" y="55" width="50" height="50" rx="8" fill="#1e293b" stroke="#334155" stroke-width="2"/>
      <text x="205" y="86" font-family="monospace" font-size="20" font-weight="900" fill="#ffffff" text-anchor="middle">X</text>

      <!-- Static H Gate on q0 (Neutral Slate) -->
      <rect x="330" y="55" width="50" height="50" rx="8" fill="#1e293b" stroke="#334155" stroke-width="2"/>
      <text x="355" y="86" font-family="monospace" font-size="20" font-weight="900" fill="#ffffff" text-anchor="middle">H</text>

      <!-- Static CNOT (Neutral Slate) -->
      <line x1="500" y1="80" x2="500" y2="160" stroke="#475569" stroke-width="3"/>
      <circle cx="500" cy="80" r="7" fill="#475569"/>
      <circle cx="500" cy="160" r="18" fill="#ffffff" stroke="#475569" stroke-width="3"/>
      <line x1="482" y1="160" x2="518" y2="160" stroke="#475569" stroke-width="3"/>
      <line x1="500" y1="142" x2="500" y2="178" stroke="#475569" stroke-width="3"/>

      <!-- Output State -->
      <text x="680" y="125" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#0f172a">|Φ⁻⟩ = (|00⟩ - |11⟩)/√2</text>
    </svg>
    """

def svg_circuit_ghz_parametric():
    """Slide 9: GHZ State (H is static slate; CNOT cascade VARIES by parameter n -> colored violet!)"""
    return """
    <svg viewBox="0 0 920 280" class="w-full h-full max-h-[480px]" xmlns="http://www.w3.org/2000/svg">
      <text x="35" y="25" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#059669" letter-spacing="1">ВХОД</text>
      <text x="750" y="25" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#6366f1" letter-spacing="1">ВЫХОД</text>

      <!-- Wires -->
      <line x1="80" y1="60" x2="720" y2="60" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="80" y1="120" x2="720" y2="120" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="80" y1="175" x2="720" y2="175" stroke="#cbd5e1" stroke-dasharray="4 4" stroke-width="2"/>
      <line x1="80" y1="225" x2="720" y2="225" stroke="#94a3b8" stroke-width="2.5"/>

      <!-- Input Wire Labels -->
      <text x="35" y="65" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">q₀ |0⟩</text>
      <text x="35" y="125" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">q₁ |0⟩</text>
      <text x="45" y="178" font-family="monospace" font-size="15" font-weight="800" fill="#64748b">⋮</text>
      <text x="25" y="230" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">qₙ₋₁ |0⟩</text>

      <!-- Static H Gate (Neutral Slate) -->
      <rect x="150" y="38" width="46" height="44" rx="8" fill="#1e293b" stroke="#334155" stroke-width="2"/>
      <text x="173" y="66" font-family="monospace" font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle">H</text>

      <!-- VARYING BLOCK BY PARAMETER n: CNOT Cascade (Colored Violet) -->
      <rect x="235" y="30" width="460" height="215" rx="14" fill="#ede9fe" fill-opacity="0.45" stroke="#6366f1" stroke-width="2" stroke-dasharray="6 4"/>
      <text x="465" y="50" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#4338ca" text-anchor="middle">ВАРЬИРУЕТСЯ КОДОМ ПО РАЗМЕРУ n (КАСКАД CNOT)</text>

      <!-- CNOT q0 -> q1 -->
      <line x1="300" y1="60" x2="300" y2="120" stroke="#6366f1" stroke-width="2.5"/>
      <circle cx="300" cy="60" r="6" fill="#6366f1"/>
      <circle cx="300" cy="120" r="14" fill="#ffffff" stroke="#6366f1" stroke-width="2.5"/>
      <line x1="286" y1="120" x2="314" y2="120" stroke="#6366f1" stroke-width="2.5"/>
      <line x1="300" y1="106" x2="300" y2="134" stroke="#6366f1" stroke-width="2.5"/>

      <!-- CNOT q1 -> q2 (dots) -->
      <line x1="420" y1="120" x2="420" y2="175" stroke="#6366f1" stroke-width="2.5"/>
      <circle cx="420" cy="120" r="6" fill="#6366f1"/>
      <circle cx="420" cy="175" r="14" fill="#ffffff" stroke="#6366f1" stroke-width="2.5"/>

      <!-- Ellipsis in cascade -->
      <text x="505" y="145" font-family="monospace" font-size="22" font-weight="900" fill="#6366f1" text-anchor="middle">⋯⋯</text>

      <!-- CNOT q_{n-2} -> q_{n-1} -->
      <line x1="610" y1="175" x2="610" y2="225" stroke="#6366f1" stroke-width="2.5"/>
      <circle cx="610" cy="175" r="6" fill="#6366f1"/>
      <circle cx="610" cy="225" r="14" fill="#ffffff" stroke="#6366f1" stroke-width="2.5"/>
      <line x1="596" y1="225" x2="624" y2="225" stroke="#6366f1" stroke-width="2.5"/>
      <line x1="610" y1="211" x2="610" y2="239" stroke="#6366f1" stroke-width="2.5"/>

      <!-- Output State -->
      <text x="750" y="145" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#0f172a">|GHZₙ⟩</text>
    </svg>
    """

def svg_circuit_w_state():
    """Slide 10: W-State (Rotations Ry(theta) VARY BY INPUT ANGLE -> colored; CNOTs & X are static slate)"""
    return """
    <svg viewBox="0 0 920 270" class="w-full h-full max-h-[480px]" xmlns="http://www.w3.org/2000/svg">
      <text x="35" y="25" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#059669" letter-spacing="1">ВХОД</text>
      <text x="760" y="25" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#6366f1" letter-spacing="1">ВЫХОД</text>

      <!-- Wires -->
      <line x1="80" y1="60" x2="740" y2="60" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="80" y1="135" x2="740" y2="135" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="80" y1="210" x2="740" y2="210" stroke="#94a3b8" stroke-width="2.5"/>

      <!-- Input Wire Labels -->
      <text x="35" y="65" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">q₀ |0⟩</text>
      <text x="35" y="140" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">q₁ |0⟩</text>
      <text x="35" y="215" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">q₂ |0⟩</text>

      <!-- VARYING GATE: Ry(θ1) on q0 with formula (Colored Violet) -->
      <rect x="120" y="32" width="145" height="56" rx="8" fill="#8b5cf6" stroke="#6d28d9" stroke-width="2"/>
      <text x="192" y="55" font-family="monospace" font-size="15" font-weight="900" fill="#ffffff" text-anchor="middle">Ry(θ₁)</text>
      <text x="192" y="76" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#ede9fe" text-anchor="middle">θ₁ = 2·arccos(1/√3)</text>

      <!-- VARYING GATE: Controlled-Ry(θ2) from q0 to q1 (Colored Violet) -->
      <line x1="335" y1="60" x2="335" y2="135" stroke="#8b5cf6" stroke-width="2.5"/>
      <circle cx="335" cy="60" r="6" fill="#8b5cf6"/>
      <rect x="295" y="107" width="125" height="56" rx="8" fill="#8b5cf6" stroke="#6d28d9" stroke-width="2"/>
      <text x="357" y="130" font-family="monospace" font-size="14" font-weight="900" fill="#ffffff" text-anchor="middle">Ry(θ₂)</text>
      <text x="357" y="151" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#ede9fe" text-anchor="middle">θ₂ = π/2</text>

      <!-- Static CNOT q1 -> q2 (Neutral Slate) -->
      <line x1="475" y1="135" x2="475" y2="210" stroke="#475569" stroke-width="2.5"/>
      <circle cx="475" cy="135" r="6" fill="#475569"/>
      <circle cx="475" cy="210" r="15" fill="#ffffff" stroke="#475569" stroke-width="2.5"/>
      <line x1="460" y1="210" x2="490" y2="210" stroke="#475569" stroke-width="2.5"/>
      <line x1="475" y1="195" x2="475" y2="225" stroke="#475569" stroke-width="2.5"/>

      <!-- Static CNOT q0 -> q1 (Neutral Slate) -->
      <line x1="565" y1="60" x2="565" y2="135" stroke="#475569" stroke-width="2.5"/>
      <circle cx="565" cy="60" r="6" fill="#475569"/>
      <circle cx="565" cy="135" r="15" fill="#ffffff" stroke="#475569" stroke-width="2.5"/>
      <line x1="550" y1="135" x2="580" y2="135" stroke="#475569" stroke-width="2.5"/>
      <line x1="565" y1="120" x2="565" y2="150" stroke="#475569" stroke-width="2.5"/>

      <!-- Static X Gate on q0 (Neutral Slate) -->
      <rect x="635" y="38" width="46" height="44" rx="8" fill="#1e293b" stroke="#334155" stroke-width="2"/>
      <text x="658" y="66" font-family="monospace" font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle">X</text>

      <!-- Output State -->
      <text x="760" y="142" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#0f172a">|W₃⟩</text>
    </svg>
    """

def svg_circuit_cluster_state():
    """Slide 11: 1D Cluster State (H-layer is static slate; CZ chain VARIES by graph topology -> colored emerald)"""
    return """
    <svg viewBox="0 0 880 260" class="w-full h-full max-h-[480px]" xmlns="http://www.w3.org/2000/svg">
      <text x="35" y="25" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#059669" letter-spacing="1">ВХОД</text>
      <text x="730" y="25" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#6366f1" letter-spacing="1">ВЫХОД</text>

      <!-- Wires -->
      <line x1="80" y1="50" x2="710" y2="50" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="80" y1="110" x2="710" y2="110" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="80" y1="170" x2="710" y2="170" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="80" y1="225" x2="710" y2="225" stroke="#94a3b8" stroke-width="2.5"/>

      <!-- Input Wire Labels -->
      <text x="35" y="55" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">q₀ |0⟩</text>
      <text x="35" y="115" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">q₁ |0⟩</text>
      <text x="35" y="175" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">q₂ |0⟩</text>
      <text x="35" y="230" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">q₃ |0⟩</text>

      <!-- Static H Layer (Neutral Slate) -->
      <rect x="142" y="32" width="46" height="36" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
      <text x="165" y="56" font-family="monospace" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">H</text>
      <rect x="142" y="92" width="46" height="36" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
      <text x="165" y="116" font-family="monospace" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">H</text>
      <rect x="142" y="152" width="46" height="36" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
      <text x="165" y="176" font-family="monospace" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">H</text>
      <rect x="142" y="207" width="46" height="36" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
      <text x="165" y="231" font-family="monospace" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">H</text>

      <!-- VARYING BLOCK BY GRAPH EDGES E: CZ Chain (Colored Emerald) -->
      <line x1="300" y1="50" x2="300" y2="110" stroke="#059669" stroke-width="3"/>
      <circle cx="300" cy="50" r="7" fill="#059669"/>
      <circle cx="300" cy="110" r="7" fill="#059669"/>
      <text x="300" y="35" font-family="monospace" font-size="11" font-weight="900" fill="#059669" text-anchor="middle">CZ₀₁</text>

      <line x1="450" y1="110" x2="450" y2="170" stroke="#059669" stroke-width="3"/>
      <circle cx="450" cy="110" r="7" fill="#059669"/>
      <circle cx="450" cy="170" r="7" fill="#059669"/>
      <text x="450" y="95" font-family="monospace" font-size="11" font-weight="900" fill="#059669" text-anchor="middle">CZ₁₂</text>

      <line x1="600" y1="170" x2="600" y2="225" stroke="#059669" stroke-width="3"/>
      <circle cx="600" cy="170" r="7" fill="#059669"/>
      <circle cx="600" cy="225" r="7" fill="#059669"/>
      <text x="600" y="155" font-family="monospace" font-size="11" font-weight="900" fill="#059669" text-anchor="middle">CZ₂₃</text>

      <!-- Output State -->
      <text x="730" y="145" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#0f172a">|Cluster₄⟩</text>
    </svg>
    """

def svg_circuit_half_adder():
    """Slide 12: Reversible Half Adder (Static gates CCX & CNOT are neutral dark slate)"""
    return """
    <svg viewBox="0 0 880 250" class="w-full h-full max-h-[480px]" xmlns="http://www.w3.org/2000/svg">
      <text x="40" y="25" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#059669" letter-spacing="1">ВХОД</text>
      <text x="700" y="25" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#6366f1" letter-spacing="1">ВЫХОД</text>

      <!-- Wires -->
      <line x1="80" y1="60" x2="680" y2="60" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="80" y1="125" x2="680" y2="125" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="80" y1="195" x2="680" y2="195" stroke="#94a3b8" stroke-width="2.5"/>

      <!-- Input Wire Labels -->
      <text x="40" y="65" font-family="monospace" font-size="16" font-weight="800" fill="#0f172a">|a⟩</text>
      <text x="40" y="130" font-family="monospace" font-size="16" font-weight="800" fill="#0f172a">|b⟩</text>
      <text x="25" y="200" font-family="monospace" font-size="16" font-weight="800" fill="#0f172a">|0⟩ₐₙc</text>

      <!-- Static TOFFOLI / CCX (Neutral Slate) -->
      <line x1="280" y1="60" x2="280" y2="195" stroke="#475569" stroke-width="3"/>
      <circle cx="280" cy="60" r="7" fill="#475569"/>
      <circle cx="280" cy="125" r="7" fill="#475569"/>
      <circle cx="280" cy="195" r="18" fill="#ffffff" stroke="#475569" stroke-width="3"/>
      <line x1="262" y1="195" x2="298" y2="195" stroke="#475569" stroke-width="3"/>
      <line x1="280" y1="177" x2="280" y2="213" stroke="#475569" stroke-width="3"/>
      <text x="280" y="38" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#475569" text-anchor="middle">CCX (CARRY)</text>

      <!-- Static CNOT (Neutral Slate) -->
      <line x1="500" y1="60" x2="500" y2="125" stroke="#475569" stroke-width="3"/>
      <circle cx="500" cy="60" r="7" fill="#475569"/>
      <circle cx="500" cy="125" r="18" fill="#ffffff" stroke="#475569" stroke-width="3"/>
      <line x1="482" y1="125" x2="518" y2="125" stroke="#475569" stroke-width="3"/>
      <line x1="500" y1="107" x2="500" y2="143" stroke="#475569" stroke-width="3"/>
      <text x="500" y="38" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#475569" text-anchor="middle">CNOT (SUM)</text>

      <!-- Output States -->
      <text x="700" y="65" font-family="monospace" font-size="16" font-weight="800" fill="#0f172a">|a⟩</text>
      <text x="700" y="130" font-family="monospace" font-size="16" font-weight="800" fill="#0f172a">|a ⊕ b⟩</text>
      <text x="700" y="200" font-family="monospace" font-size="16" font-weight="800" fill="#0f172a">|a · b⟩</text>
    </svg>
    """

def svg_circuit_uncomputation():
    """Slide 13: Uncomputation Pipeline (Compute/Uncompute blocks slate; Clean ancilla output highlighted in Emerald)"""
    return """
    <svg viewBox="0 0 940 280" class="w-full h-full max-h-[480px]" xmlns="http://www.w3.org/2000/svg">
      <text x="35" y="25" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#059669" letter-spacing="1">ВХОД</text>
      <text x="760" y="25" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#6366f1" letter-spacing="1">ВЫХОД</text>

      <!-- Wires -->
      <line x1="80" y1="60" x2="740" y2="60" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="80" y1="130" x2="740" y2="130" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="80" y1="205" x2="740" y2="205" stroke="#94a3b8" stroke-width="2.5"/>

      <!-- Input Wire Labels -->
      <text x="25" y="65" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">|x⟩</text>
      <text x="15" y="135" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">|0⟩ₐₙc</text>
      <text x="25" y="210" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">|y⟩</text>

      <!-- BLOCK 1: COMPUTE U (Neutral Slate) -->
      <rect x="140" y="30" width="180" height="130" rx="12" fill="#1e293b" stroke="#334155" stroke-width="2"/>
      <text x="230" y="85" font-family="system-ui, sans-serif" font-size="14" font-weight="900" fill="#ffffff" text-anchor="middle">COMPUTE U</text>
      <text x="230" y="110" font-family="monospace" font-size="12" font-weight="700" fill="#94a3b8" text-anchor="middle">anc → |g(x)⟩</text>

      <!-- BLOCK 2: COPY CNOT (Neutral Slate) -->
      <line x1="450" y1="130" x2="450" y2="205" stroke="#475569" stroke-width="3"/>
      <circle cx="450" cy="130" r="7" fill="#475569"/>
      <circle cx="450" cy="205" r="18" fill="#ffffff" stroke="#475569" stroke-width="3"/>
      <line x1="432" y1="205" x2="468" y2="205" stroke="#475569" stroke-width="3"/>
      <line x1="450" y1="187" x2="450" y2="223" stroke="#475569" stroke-width="3"/>
      <text x="450" y="100" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#475569" text-anchor="middle">COPY CNOT</text>

      <!-- BLOCK 3: UNCOMPUTE U† (Neutral Slate) -->
      <rect x="560" y="30" width="180" height="130" rx="12" fill="#1e293b" stroke="#334155" stroke-width="2"/>
      <text x="650" y="85" font-family="system-ui, sans-serif" font-size="14" font-weight="900" fill="#ffffff" text-anchor="middle">UNCOMPUTE U†</text>
      <text x="650" y="110" font-family="monospace" font-size="12" font-weight="700" fill="#94a3b8" text-anchor="middle">anc → |0⟩</text>

      <!-- Ancilla Return Badge (Highlighted in Emerald) -->
      <rect x="760" y="112" width="105" height="36" rx="8" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
      <text x="812" y="135" font-family="monospace" font-size="13" font-weight="900" fill="#15803d" text-anchor="middle">|0⟩ (CLEAN)</text>

      <!-- Target Output -->
      <text x="760" y="210" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">|y ⊕ f(x)⟩</text>
    </svg>
    """

def svg_circuit_draper_adder():
    """Slide 14: Draper QFT Adder (QFT blocks slate; Controlled-R_k VARIES by parameter k -> colored violet)"""
    return """
    <svg viewBox="0 0 920 260" class="w-full h-full max-h-[480px]" xmlns="http://www.w3.org/2000/svg">
      <text x="35" y="25" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#059669" letter-spacing="1">ВХОД</text>
      <text x="790" y="25" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#6366f1" letter-spacing="1">ВЫХОД</text>

      <!-- Wires -->
      <line x1="80" y1="60" x2="770" y2="60" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="80" y1="130" x2="770" y2="130" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="80" y1="200" x2="770" y2="200" stroke="#94a3b8" stroke-width="2.5"/>

      <!-- Input Wire Labels -->
      <text x="25" y="65" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">|b₀⟩</text>
      <text x="25" y="135" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">|b₁⟩</text>
      <text x="25" y="205" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">|a⟩</text>

      <!-- QFT Block on b (Neutral Slate) -->
      <rect x="120" y="35" width="100" height="120" rx="10" fill="#1e293b" stroke="#334155" stroke-width="2"/>
      <text x="170" y="100" font-family="system-ui, sans-serif" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">QFT</text>

      <!-- VARYING BLOCK: Controlled Phase Rotations R_k (Colored Violet) -->
      <rect x="290" y="30" width="340" height="190" rx="12" fill="#ede9fe" fill-opacity="0.45" stroke="#6366f1" stroke-width="2" stroke-dasharray="6 4"/>
      <text x="460" y="50" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#4338ca" text-anchor="middle">ВАРЬИРУЕТСЯ ВРАЩЕНИЕ R_k = diag(1, e^{2πi/2^k})</text>

      <!-- Control from a to b0 -->
      <line x1="380" y1="60" x2="380" y2="200" stroke="#6366f1" stroke-width="2.5"/>
      <circle cx="380" cy="200" r="6" fill="#6366f1"/>
      <rect x="350" y="40" width="60" height="40" rx="6" fill="#8b5cf6"/>
      <text x="380" y="65" font-family="monospace" font-size="14" font-weight="900" fill="#ffffff" text-anchor="middle">R₁</text>

      <!-- Control from a to b1 -->
      <line x1="520" y1="130" x2="520" y2="200" stroke="#6366f1" stroke-width="2.5"/>
      <circle cx="520" cy="200" r="6" fill="#6366f1"/>
      <rect x="490" y="110" width="60" height="40" rx="6" fill="#8b5cf6"/>
      <text x="520" y="135" font-family="monospace" font-size="14" font-weight="900" fill="#ffffff" text-anchor="middle">R₂</text>

      <!-- QFT dagger block on b (Neutral Slate) -->
      <rect x="670" y="35" width="100" height="120" rx="10" fill="#1e293b" stroke="#334155" stroke-width="2"/>
      <text x="720" y="100" font-family="system-ui, sans-serif" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">QFT†</text>

      <!-- Output State -->
      <text x="790" y="100" font-family="monospace" font-size="16" font-weight="800" fill="#0f172a">|a + b⟩</text>
    </svg>
    """

def svg_circuit_phase_oracle():
    """Slide 15: Phase Oracle (Z gates VARY BY INPUT BITMASK s -> colored violet; other wires pass untouched)"""
    return """
    <svg viewBox="0 0 880 260" class="w-full h-full max-h-[480px]" xmlns="http://www.w3.org/2000/svg">
      <text x="35" y="25" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#059669" letter-spacing="1">ВХОД</text>
      <text x="630" y="25" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#6366f1" letter-spacing="1">ВЫХОД</text>

      <!-- Wires -->
      <line x1="80" y1="60" x2="600" y2="60" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="80" y1="120" x2="600" y2="120" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="80" y1="180" x2="600" y2="180" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="80" y1="230" x2="600" y2="230" stroke="#94a3b8" stroke-width="2.5"/>

      <!-- Input Wire Labels -->
      <text x="25" y="65" font-family="monospace" font-size="14" font-weight="800" fill="#0f172a">|x₀⟩ (s₀=1)</text>
      <text x="25" y="125" font-family="monospace" font-size="14" font-weight="800" fill="#64748b">|x₁⟩ (s₁=0)</text>
      <text x="25" y="185" font-family="monospace" font-size="14" font-weight="800" fill="#0f172a">|x₂⟩ (s₂=1)</text>
      <text x="25" y="235" font-family="monospace" font-size="14" font-weight="800" fill="#64748b">|x₃⟩ (s₃=0)</text>

      <!-- VARYING GATE: Z on q0 because s0=1 (Colored Violet) -->
      <rect x="280" y="38" width="56" height="44" rx="8" fill="#8b5cf6" stroke="#6d28d9" stroke-width="2"/>
      <text x="308" y="66" font-family="monospace" font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle">Z</text>
      <text x="308" y="30" font-family="monospace" font-size="11" font-weight="800" fill="#6d28d9" text-anchor="middle">Z^{s₀}</text>

      <!-- Neutral wire on q1 (no gate because s1=0) -->
      <rect x="270" y="110" width="76" height="20" rx="4" fill="#f1f5f9" stroke="#cbd5e1"/>
      <text x="308" y="124" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#94a3b8" text-anchor="middle">PASS (s₁=0)</text>

      <!-- VARYING GATE: Z on q2 because s2=1 (Colored Violet) -->
      <rect x="460" y="158" width="56" height="44" rx="8" fill="#8b5cf6" stroke="#6d28d9" stroke-width="2"/>
      <text x="488" y="186" font-family="monospace" font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle">Z</text>
      <text x="488" y="150" font-family="monospace" font-size="11" font-weight="800" fill="#6d28d9" text-anchor="middle">Z^{s₂}</text>

      <!-- Output Phase Formula -->
      <rect x="630" y="110" width="220" height="60" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      <text x="740" y="137" font-family="system-ui, sans-serif" font-size="14" font-weight="900" fill="#0f172a" text-anchor="middle">(-1)^{s · x} |x⟩</text>
      <text x="740" y="156" font-family="monospace" font-size="11" font-weight="700" fill="#64748b" text-anchor="middle">s = 1010₂</text>
    </svg>
    """

def svg_circuit_boolean_oracle():
    """Slide 16: Boolean Equality Oracle (X gates VARY BY BIT PATTERN a -> colored violet; MCX is static slate)"""
    return """
    <svg viewBox="0 0 900 270" class="w-full h-full max-h-[480px]" xmlns="http://www.w3.org/2000/svg">
      <text x="35" y="25" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#059669" letter-spacing="1">ВХОД</text>
      <text x="680" y="25" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#6366f1" letter-spacing="1">ВЫХОД</text>

      <!-- Wires -->
      <line x1="80" y1="50" x2="660" y2="50" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="80" y1="110" x2="660" y2="110" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="80" y1="170" x2="660" y2="170" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="80" y1="230" x2="660" y2="230" stroke="#94a3b8" stroke-width="2.5"/>

      <!-- Input Wire Labels -->
      <text x="25" y="55" font-family="monospace" font-size="14" font-weight="800" fill="#0f172a">|x₀⟩ (a₀=0)</text>
      <text x="25" y="115" font-family="monospace" font-size="14" font-weight="800" fill="#0f172a">|x₁⟩ (a₁=1)</text>
      <text x="25" y="175" font-family="monospace" font-size="14" font-weight="800" fill="#0f172a">|x₂⟩ (a₂=0)</text>
      <text x="35" y="235" font-family="monospace" font-size="14" font-weight="800" fill="#0f172a">|y⟩</text>

      <!-- VARYING GATES: Pre-X on q0 and q2 because bits a0=0, a2=0 (Colored Violet) -->
      <rect x="180" y="32" width="40" height="36" rx="6" fill="#8b5cf6" stroke="#6d28d9" stroke-width="1.5"/>
      <text x="200" y="55" font-family="monospace" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">X</text>
      <rect x="180" y="152" width="40" height="36" rx="6" fill="#8b5cf6" stroke="#6d28d9" stroke-width="1.5"/>
      <text x="200" y="175" font-family="monospace" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">X</text>

      <!-- Static Multi-Controlled X (MCX) (Neutral Slate) -->
      <line x1="380" y1="50" x2="380" y2="230" stroke="#475569" stroke-width="3"/>
      <circle cx="380" cy="50" r="7" fill="#475569"/>
      <circle cx="380" cy="110" r="7" fill="#475569"/>
      <circle cx="380" cy="170" r="7" fill="#475569"/>
      <circle cx="380" cy="230" r="18" fill="#ffffff" stroke="#475569" stroke-width="3"/>
      <line x1="362" y1="230" x2="398" y2="230" stroke="#475569" stroke-width="3"/>
      <line x1="380" y1="212" x2="380" y2="248" stroke="#475569" stroke-width="3"/>
      <text x="380" y="25" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#475569" text-anchor="middle">MCX</text>

      <!-- VARYING GATES: Post-X on q0 and q2 (uncompute bit pattern) (Colored Violet) -->
      <rect x="560" y="32" width="40" height="36" rx="6" fill="#8b5cf6" stroke="#6d28d9" stroke-width="1.5"/>
      <text x="580" y="55" font-family="monospace" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">X</text>
      <rect x="560" y="152" width="40" height="36" rx="6" fill="#8b5cf6" stroke="#6d28d9" stroke-width="1.5"/>
      <text x="580" y="175" font-family="monospace" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">X</text>

      <!-- Output State -->
      <text x="680" y="235" font-family="monospace" font-size="16" font-weight="800" fill="#0f172a">|y ⊕ [x == a]⟩</text>
    </svg>
    """

def svg_circuit_deutsch_jozsa():
    """Slide 17: Deutsch-Jozsa (H layers and meters slate; Oracle U_f VARIES BY FUNCTION -> colored violet)"""
    return """
    <svg viewBox="0 0 920 270" class="w-full h-full max-h-[480px]" xmlns="http://www.w3.org/2000/svg">
      <text x="35" y="25" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#059669" letter-spacing="1">ВХОД</text>
      <text x="730" y="25" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#6366f1" letter-spacing="1">ВЫХОД</text>

      <!-- Wires -->
      <line x1="80" y1="60" x2="710" y2="60" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="80" y1="120" x2="710" y2="120" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="80" y1="210" x2="710" y2="210" stroke="#94a3b8" stroke-width="2.5"/>

      <!-- Input Wire Labels -->
      <text x="25" y="65" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">|0⟩</text>
      <text x="25" y="125" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">|0⟩</text>
      <text x="25" y="215" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">|1⟩</text>

      <!-- Static H layer 1 (Neutral Slate) -->
      <rect x="110" y="38" width="40" height="44" rx="6" fill="#1e293b" stroke="#334155"/>
      <text x="130" y="66" font-family="monospace" font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle">H</text>
      <rect x="110" y="98" width="40" height="44" rx="6" fill="#1e293b" stroke="#334155"/>
      <text x="130" y="126" font-family="monospace" font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle">H</text>
      <rect x="110" y="188" width="40" height="44" rx="6" fill="#1e293b" stroke="#334155"/>
      <text x="130" y="216" font-family="monospace" font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle">H</text>

      <!-- VARYING BLOCK: Oracle U_f (Colored Violet) -->
      <rect x="230" y="35" width="220" height="200" rx="14" fill="#ede9fe" stroke="#6366f1" stroke-width="2.5"/>
      <text x="340" y="125" font-family="system-ui, sans-serif" font-size="22" font-weight="900" fill="#4338ca" text-anchor="middle">ORACLE U_f</text>
      <text x="340" y="155" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#6366f1" text-anchor="middle">ВАРЬИРУЕТСЯ ВХОДНОЙ ФУНКЦИЕЙ</text>

      <!-- Static H layer 2 on input register (Neutral Slate) -->
      <rect x="530" y="38" width="40" height="44" rx="6" fill="#1e293b" stroke="#334155"/>
      <text x="550" y="66" font-family="monospace" font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle">H</text>
      <rect x="530" y="98" width="40" height="44" rx="6" fill="#1e293b" stroke="#334155"/>
      <text x="550" y="126" font-family="monospace" font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle">H</text>

      <!-- Static Meters on q0, q1 (Neutral Slate) -->
      <rect x="630" y="38" width="48" height="44" rx="6" fill="#0f172a"/>
      <text x="654" y="66" font-family="system-ui, sans-serif" font-size="14" font-weight="900" fill="#ffffff" text-anchor="middle">📊 M</text>
      <rect x="630" y="98" width="48" height="44" rx="6" fill="#0f172a"/>
      <text x="654" y="126" font-family="system-ui, sans-serif" font-size="14" font-weight="900" fill="#ffffff" text-anchor="middle">📊 M</text>

      <!-- Output Decision Rule Box -->
      <rect x="720" y="45" width="180" height="95" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="810" y="75" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#0f172a" text-anchor="middle">|00...0⟩ ⇒ CONST</text>
      <text x="810" y="115" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#0f172a" text-anchor="middle">≠ |00...0⟩ ⇒ BALANCED</text>
    </svg>
    """

def svg_circuit_bernstein_vazirani():
    """Slide 18: Bernstein-Vazirani (H layers and meters slate; Oracle U_s VARIES BY SECRET s -> colored violet)"""
    return """
    <svg viewBox="0 0 920 270" class="w-full h-full max-h-[480px]" xmlns="http://www.w3.org/2000/svg">
      <text x="35" y="25" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#059669" letter-spacing="1">ВХОД</text>
      <text x="730" y="25" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#6366f1" letter-spacing="1">ВЫХОД</text>

      <!-- Wires -->
      <line x1="80" y1="55" x2="700" y2="55" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="80" y1="115" x2="700" y2="115" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="80" y1="175" x2="700" y2="175" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="80" y1="230" x2="700" y2="230" stroke="#94a3b8" stroke-width="2.5"/>

      <!-- Input Wire Labels -->
      <text x="25" y="60" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">|0⟩</text>
      <text x="25" y="120" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">|0⟩</text>
      <text x="25" y="180" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">|0⟩</text>
      <text x="25" y="235" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">|1⟩</text>

      <!-- Static H Layers (Neutral Slate) -->
      <rect x="110" y="35" width="36" height="38" rx="6" fill="#1e293b" stroke="#334155"/>
      <text x="128" y="59" font-family="monospace" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">H</text>
      <rect x="110" y="95" width="36" height="38" rx="6" fill="#1e293b" stroke="#334155"/>
      <text x="128" y="119" font-family="monospace" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">H</text>
      <rect x="110" y="155" width="36" height="38" rx="6" fill="#1e293b" stroke="#334155"/>
      <text x="128" y="179" font-family="monospace" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">H</text>
      <rect x="110" y="212" width="36" height="38" rx="6" fill="#1e293b" stroke="#334155"/>
      <text x="128" y="236" font-family="monospace" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">H</text>

      <!-- VARYING BLOCK: Oracle U_s (Colored Violet) -->
      <rect x="220" y="30" width="230" height="220" rx="14" fill="#ede9fe" stroke="#6366f1" stroke-width="2.5"/>
      <text x="335" y="130" font-family="system-ui, sans-serif" font-size="20" font-weight="900" fill="#4338ca" text-anchor="middle">ORACLE U_s</text>
      <text x="335" y="155" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#6366f1" text-anchor="middle">f(x) = s · x (mod 2)</text>

      <!-- Static Post-H layer (Neutral Slate) -->
      <rect x="520" y="35" width="36" height="38" rx="6" fill="#1e293b" stroke="#334155"/>
      <text x="538" y="59" font-family="monospace" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">H</text>
      <rect x="520" y="95" width="36" height="38" rx="6" fill="#1e293b" stroke="#334155"/>
      <text x="538" y="119" font-family="monospace" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">H</text>
      <rect x="520" y="155" width="36" height="38" rx="6" fill="#1e293b" stroke="#334155"/>
      <text x="538" y="179" font-family="monospace" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">H</text>

      <!-- Static Measurements (Neutral Slate) -->
      <rect x="620" y="35" width="46" height="38" rx="6" fill="#0f172a"/>
      <text x="643" y="59" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle">📊 M</text>
      <rect x="620" y="95" width="46" height="38" rx="6" fill="#0f172a"/>
      <text x="643" y="119" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle">📊 M</text>
      <rect x="620" y="155" width="46" height="38" rx="6" fill="#0f172a"/>
      <text x="643" y="179" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle">📊 M</text>

      <!-- Output Secret Key Display -->
      <rect x="720" y="70" width="180" height="85" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      <text x="810" y="105" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#0f172a" text-anchor="middle">ТОЧНЫЙ ИСХОД:</text>
      <text x="810" y="132" font-family="monospace" font-size="18" font-weight="900" fill="#0f172a" text-anchor="middle">|s₂ s₁ s₀⟩</text>
    </svg>
    """

def svg_circuit_grover_diffusion():
    """Slide 19: Grover Diffusion Operator (H & X are static slate; Multi-Controlled Z is the core phase flip -> colored violet)"""
    return """
    <svg viewBox="0 0 920 260" class="w-full h-full max-h-[480px]" xmlns="http://www.w3.org/2000/svg">
      <text x="35" y="25" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#059669" letter-spacing="1">ВХОД</text>
      <text x="770" y="25" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#6366f1" letter-spacing="1">ВЫХОД</text>

      <!-- Wires -->
      <line x1="80" y1="55" x2="750" y2="55" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="80" y1="120" x2="750" y2="120" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="80" y1="195" x2="750" y2="195" stroke="#94a3b8" stroke-width="2.5"/>

      <!-- Input Wire Labels -->
      <text x="35" y="60" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">q₀</text>
      <text x="35" y="125" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">q₁</text>
      <text x="35" y="200" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">q₂</text>

      <!-- Static H Layer 1 (Neutral Slate) -->
      <rect x="110" y="35" width="40" height="40" rx="6" fill="#1e293b" stroke="#334155"/>
      <text x="130" y="60" font-family="monospace" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">H</text>
      <rect x="110" y="100" width="40" height="40" rx="6" fill="#1e293b" stroke="#334155"/>
      <text x="130" y="125" font-family="monospace" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">H</text>
      <rect x="110" y="175" width="40" height="40" rx="6" fill="#1e293b" stroke="#334155"/>
      <text x="130" y="200" font-family="monospace" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">H</text>

      <!-- Static X Layer 1 (Neutral Slate) -->
      <rect x="220" y="35" width="40" height="40" rx="6" fill="#1e293b" stroke="#334155"/>
      <text x="240" y="60" font-family="monospace" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">X</text>
      <rect x="220" y="100" width="40" height="40" rx="6" fill="#1e293b" stroke="#334155"/>
      <text x="240" y="125" font-family="monospace" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">X</text>
      <rect x="220" y="175" width="40" height="40" rx="6" fill="#1e293b" stroke="#334155"/>
      <text x="240" y="200" font-family="monospace" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">X</text>

      <!-- VARYING / CORE OPERATOR: Multi-Controlled Z (MCZ) (Colored Violet) -->
      <line x1="430" y1="55" x2="430" y2="195" stroke="#6366f1" stroke-width="3"/>
      <circle cx="430" cy="55" r="7" fill="#6366f1"/>
      <circle cx="430" cy="120" r="7" fill="#6366f1"/>
      <circle cx="430" cy="195" r="7" fill="#6366f1"/>
      <text x="430" y="30" font-family="monospace" font-size="12" font-weight="900" fill="#6366f1" text-anchor="middle">MCZ</text>

      <!-- Static X Layer 2 (Neutral Slate) -->
      <rect x="570" y="35" width="40" height="40" rx="6" fill="#1e293b" stroke="#334155"/>
      <text x="590" y="60" font-family="monospace" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">X</text>
      <rect x="570" y="100" width="40" height="40" rx="6" fill="#1e293b" stroke="#334155"/>
      <text x="590" y="125" font-family="monospace" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">X</text>
      <rect x="570" y="175" width="40" height="40" rx="6" fill="#1e293b" stroke="#334155"/>
      <text x="590" y="200" font-family="monospace" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">X</text>

      <!-- Static H Layer 2 (Neutral Slate) -->
      <rect x="670" y="35" width="40" height="40" rx="6" fill="#1e293b" stroke="#334155"/>
      <text x="690" y="60" font-family="monospace" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">H</text>
      <rect x="670" y="100" width="40" height="40" rx="6" fill="#1e293b" stroke="#334155"/>
      <text x="690" y="125" font-family="monospace" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">H</text>
      <rect x="670" y="175" width="40" height="40" rx="6" fill="#1e293b" stroke="#334155"/>
      <text x="690" y="200" font-family="monospace" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">H</text>

      <!-- Output State -->
      <text x="770" y="130" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#0f172a">2|s⟩⟨s| - I</text>
    </svg>
    """

def svg_circuit_qft():
    """Slide 20: QFT (H and SWAP are static slate; Phase rotations R_k VARY BY PARAMETER k -> colored violet)"""
    return """
    <svg viewBox="0 0 940 270" class="w-full h-full max-h-[480px]" xmlns="http://www.w3.org/2000/svg">
      <text x="35" y="25" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#059669" letter-spacing="1">ВХОД</text>
      <text x="800" y="25" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#6366f1" letter-spacing="1">ВЫХОД</text>

      <!-- Wires -->
      <line x1="80" y1="50" x2="780" y2="50" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="80" y1="130" x2="780" y2="130" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="80" y1="210" x2="780" y2="210" stroke="#94a3b8" stroke-width="2.5"/>

      <!-- Input Wire Labels -->
      <text x="35" y="55" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">q₀</text>
      <text x="35" y="135" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">q₁</text>
      <text x="35" y="215" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">q₂</text>

      <!-- Static H on q0 (Neutral Slate) -->
      <rect x="120" y="28" width="44" height="44" rx="6" fill="#1e293b" stroke="#334155"/>
      <text x="142" y="56" font-family="monospace" font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle">H</text>

      <!-- VARYING GATE: Controlled R2 from q1 to q0 (Colored Violet) -->
      <line x1="230" y1="50" x2="230" y2="130" stroke="#6366f1" stroke-width="2.5"/>
      <circle cx="230" cy="130" r="6" fill="#6366f1"/>
      <rect x="205" y="28" width="50" height="44" rx="6" fill="#8b5cf6"/>
      <text x="230" y="55" font-family="monospace" font-size="13" font-weight="900" fill="#ffffff" text-anchor="middle">R₂(π/2)</text>

      <!-- VARYING GATE: Controlled R3 from q2 to q0 (Colored Violet) -->
      <line x1="330" y1="50" x2="330" y2="210" stroke="#6366f1" stroke-width="2.5"/>
      <circle cx="330" cy="210" r="6" fill="#6366f1"/>
      <rect x="305" y="28" width="50" height="44" rx="6" fill="#8b5cf6"/>
      <text x="330" y="55" font-family="monospace" font-size="13" font-weight="900" fill="#ffffff" text-anchor="middle">R₃(π/4)</text>

      <!-- Static H on q1 (Neutral Slate) -->
      <rect x="420" y="108" width="44" height="44" rx="6" fill="#1e293b" stroke="#334155"/>
      <text x="442" y="136" font-family="monospace" font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle">H</text>

      <!-- VARYING GATE: Controlled R2 from q2 to q1 (Colored Violet) -->
      <line x1="520" y1="130" x2="520" y2="210" stroke="#6366f1" stroke-width="2.5"/>
      <circle cx="520" cy="210" r="6" fill="#6366f1"/>
      <rect x="495" y="108" width="50" height="44" rx="6" fill="#8b5cf6"/>
      <text x="520" y="135" font-family="monospace" font-size="13" font-weight="900" fill="#ffffff" text-anchor="middle">R₂(π/2)</text>

      <!-- Static H on q2 (Neutral Slate) -->
      <rect x="610" y="188" width="44" height="44" rx="6" fill="#1e293b" stroke="#334155"/>
      <text x="632" y="216" font-family="monospace" font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle">H</text>

      <!-- Static SWAP Gate q0 <-> q2 (Neutral Slate) -->
      <line x1="720" y1="50" x2="720" y2="210" stroke="#475569" stroke-width="3"/>
      <text x="720" y="56" font-family="monospace" font-size="20" font-weight="900" fill="#475569" text-anchor="middle">✕</text>
      <text x="720" y="216" font-family="monospace" font-size="20" font-weight="900" fill="#475569" text-anchor="middle">✕</text>
      <text x="720" y="25" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#475569" text-anchor="middle">SWAP</text>

      <!-- Output State -->
      <text x="800" y="135" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#0f172a">QFT₃</text>
    </svg>
    """

def svg_circuit_qpe():
    """Slide 21: Quantum Phase Estimation (H & QFT† slate; Controlled U^(2^j) VARY BY POWERS -> colored violet)"""
    return """
    <svg viewBox="0 0 940 280" class="w-full h-full max-h-[480px]" xmlns="http://www.w3.org/2000/svg">
      <text x="35" y="25" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#059669" letter-spacing="1">ВХОД</text>
      <text x="815" y="25" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#6366f1" letter-spacing="1">ВЫХОД</text>

      <!-- Wires -->
      <line x1="80" y1="50" x2="790" y2="50" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="80" y1="110" x2="790" y2="110" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="80" y1="170" x2="790" y2="170" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="80" y1="230" x2="790" y2="230" stroke="#94a3b8" stroke-width="2.5"/>

      <!-- Input Wire Labels -->
      <text x="25" y="55" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">|0⟩</text>
      <text x="25" y="115" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">|0⟩</text>
      <text x="25" y="175" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">|0⟩</text>
      <text x="25" y="235" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">|ψ⟩</text>

      <!-- Static H Layers on counting register (Neutral Slate) -->
      <rect x="110" y="32" width="36" height="36" rx="6" fill="#1e293b" stroke="#334155"/>
      <text x="128" y="56" font-family="monospace" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">H</text>
      <rect x="110" y="92" width="36" height="36" rx="6" fill="#1e293b" stroke="#334155"/>
      <text x="128" y="116" font-family="monospace" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">H</text>
      <rect x="110" y="152" width="36" height="36" rx="6" fill="#1e293b" stroke="#334155"/>
      <text x="128" y="176" font-family="monospace" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">H</text>

      <!-- VARYING BLOCK: Controlled U^{2^j} (Colored Violet) -->
      <!-- C-U^1 from q2 to psi -->
      <line x1="240" y1="170" x2="240" y2="230" stroke="#6366f1" stroke-width="2.5"/>
      <circle cx="240" cy="170" r="6" fill="#6366f1"/>
      <rect x="215" y="210" width="50" height="40" rx="6" fill="#8b5cf6"/>
      <text x="240" y="235" font-family="monospace" font-size="13" font-weight="900" fill="#ffffff" text-anchor="middle">U¹</text>

      <!-- C-U^2 from q1 to psi -->
      <line x1="360" y1="110" x2="360" y2="230" stroke="#6366f1" stroke-width="2.5"/>
      <circle cx="360" cy="110" r="6" fill="#6366f1"/>
      <rect x="335" y="210" width="50" height="40" rx="6" fill="#8b5cf6"/>
      <text x="360" y="235" font-family="monospace" font-size="13" font-weight="900" fill="#ffffff" text-anchor="middle">U²</text>

      <!-- C-U^4 from q0 to psi -->
      <line x1="480" y1="50" x2="480" y2="230" stroke="#6366f1" stroke-width="2.5"/>
      <circle cx="480" cy="50" r="6" fill="#6366f1"/>
      <rect x="455" y="210" width="50" height="40" rx="6" fill="#8b5cf6"/>
      <text x="480" y="235" font-family="monospace" font-size="13" font-weight="900" fill="#ffffff" text-anchor="middle">U⁴</text>

      <!-- Static Inverse QFT Block (Neutral Slate) -->
      <rect x="570" y="30" width="120" height="160" rx="12" fill="#1e293b" stroke="#334155" stroke-width="2"/>
      <text x="630" y="115" font-family="system-ui, sans-serif" font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle">QFT†</text>

      <!-- Static Meters (Neutral Slate) -->
      <rect x="720" y="32" width="46" height="36" rx="6" fill="#0f172a"/>
      <text x="743" y="56" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle">📊 M</text>
      <rect x="720" y="92" width="46" height="36" rx="6" fill="#0f172a"/>
      <text x="743" y="116" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle">📊 M</text>
      <rect x="720" y="152" width="46" height="36" rx="6" fill="#0f172a"/>
      <text x="743" y="176" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle">📊 M</text>

      <!-- Output State -->
      <text x="815" y="115" font-family="monospace" font-size="16" font-weight="900" fill="#0f172a">|2ⁿ θ⟩</text>
    </svg>
    """

def svg_circuit_topology_linear():
    """Slide 22: Linear Topology: SWAP Routing (Forbidden link and SWAP overhead highlighted in Red/Rose)"""
    return """
    <svg viewBox="0 0 940 280" class="w-full h-full max-h-[480px]" xmlns="http://www.w3.org/2000/svg">
      <!-- HARDWARE COUPLING GRAPH (LEFT) -->
      <rect x="20" y="20" width="220" height="235" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      <text x="130" y="45" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#0f172a" text-anchor="middle">COUPLING MAP</text>

      <!-- Node 0 -->
      <circle cx="130" cy="80" r="14" fill="#1e293b"/>
      <text x="130" y="85" font-family="monospace" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle">q₀</text>

      <!-- Edge 0-1 (VALID) -->
      <line x1="130" y1="94" x2="130" y2="136" stroke="#475569" stroke-width="3"/>
      <text x="160" y="118" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#475569">✓ VALID</text>

      <!-- Node 1 -->
      <circle cx="130" cy="150" r="14" fill="#1e293b"/>
      <text x="130" y="155" font-family="monospace" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle">q₁</text>

      <!-- Edge 1-2 (VALID) -->
      <line x1="130" y1="164" x2="130" y2="206" stroke="#475569" stroke-width="3"/>
      <text x="160" y="188" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#475569">✓ VALID</text>

      <!-- Node 2 -->
      <circle cx="130" cy="220" r="14" fill="#1e293b"/>
      <text x="130" y="225" font-family="monospace" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle">q₂</text>

      <!-- Curve Edge 0-2 (FORBIDDEN HARDWARE LINK -> Red) -->
      <path d="M 116 80 C 60 80, 60 220, 116 220" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="4 3"/>
      <text x="55" y="155" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#dc2626" text-anchor="middle">✕ BAN</text>

      <!-- CIRCUIT DECOMPOSITION (RIGHT) -->
      <text x="280" y="35" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#059669" letter-spacing="1">ВХОД</text>
      <text x="800" y="35" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#6366f1" letter-spacing="1">ВЫХОД</text>

      <!-- Wires -->
      <line x1="270" y1="70" x2="780" y2="70" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="270" y1="140" x2="780" y2="140" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="270" y1="210" x2="780" y2="210" stroke="#94a3b8" stroke-width="2.5"/>

      <!-- Input Wire Labels -->
      <text x="280" y="65" font-family="monospace" font-size="14" font-weight="800" fill="#0f172a">q₀</text>
      <text x="280" y="135" font-family="monospace" font-size="14" font-weight="800" fill="#0f172a">q₁</text>
      <text x="280" y="205" font-family="monospace" font-size="14" font-weight="800" fill="#0f172a">q₂</text>

      <!-- Step 1: SWAP q0 <-> q1 (OVERHEAD GATE -> Highlighted Rose) -->
      <line x1="410" y1="70" x2="410" y2="140" stroke="#f43f5e" stroke-width="3"/>
      <text x="410" y="76" font-family="monospace" font-size="18" font-weight="900" fill="#f43f5e" text-anchor="middle">✕</text>
      <text x="410" y="146" font-family="monospace" font-size="18" font-weight="900" fill="#f43f5e" text-anchor="middle">✕</text>
      <text x="410" y="45" font-family="system-ui, sans-serif" font-size="10" font-weight="900" fill="#f43f5e" text-anchor="middle">1. SWAP(0,1)</text>

      <!-- Step 2: CNOT q1 -> q2 (Logical Operation -> Neutral Slate) -->
      <line x1="570" y1="140" x2="570" y2="210" stroke="#475569" stroke-width="3"/>
      <circle cx="570" cy="140" r="6" fill="#475569"/>
      <circle cx="570" cy="210" r="15" fill="#ffffff" stroke="#475569" stroke-width="3"/>
      <line x1="555" y1="210" x2="585" y2="210" stroke="#475569" stroke-width="3"/>
      <line x1="570" y1="195" x2="570" y2="225" stroke="#475569" stroke-width="3"/>
      <text x="570" y="45" font-family="system-ui, sans-serif" font-size="10" font-weight="900" fill="#475569" text-anchor="middle">2. CX(1,2)</text>

      <!-- Step 3: SWAP q0 <-> q1 back (OVERHEAD GATE -> Highlighted Rose) -->
      <line x1="710" y1="70" x2="710" y2="140" stroke="#f43f5e" stroke-width="3"/>
      <text x="710" y="76" font-family="monospace" font-size="18" font-weight="900" fill="#f43f5e" text-anchor="middle">✕</text>
      <text x="710" y="146" font-family="monospace" font-size="18" font-weight="900" fill="#f43f5e" text-anchor="middle">✕</text>
      <text x="710" y="45" font-family="system-ui, sans-serif" font-size="10" font-weight="900" fill="#f43f5e" text-anchor="middle">3. SWAP(0,1)</text>

      <!-- Total Cost Badge -->
      <rect x="800" y="115" width="115" height="50" rx="8" fill="#fee2e2" stroke="#dc2626" stroke-width="1.5"/>
      <text x="857" y="136" font-family="system-ui, sans-serif" font-size="10" font-weight="900" fill="#991b1b" text-anchor="middle">OVERHEAD:</text>
      <text x="857" y="154" font-family="monospace" font-size="12" font-weight="900" fill="#dc2626" text-anchor="middle">+6 CNOTs</text>
    </svg>
    """

def svg_circuit_topology_ibm():
    """Slide 23: IBM Heavy-Hex Routing"""
    return """
    <svg viewBox="0 0 940 280" class="w-full h-full max-h-[480px]" xmlns="http://www.w3.org/2000/svg">
      <!-- HEAVY HEX MESH GRAPHIC -->
      <rect x="30" y="25" width="380" height="230" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      <text x="220" y="52" font-family="system-ui, sans-serif" font-size="13" font-weight="900" fill="#0f172a" text-anchor="middle">ФИЗИЧЕСКИЙ ЧИП IBM EAGLE (HEAVY-HEX)</text>

      <!-- Hexagon vertices & edges -->
      <line x1="120" y1="100" x2="220" y2="80" stroke="#94a3b8" stroke-width="2"/>
      <line x1="220" y1="80" x2="320" y2="100" stroke="#94a3b8" stroke-width="2"/>
      <line x1="320" y1="100" x2="320" y2="180" stroke="#94a3b8" stroke-width="2"/>
      <line x1="320" y1="180" x2="220" y2="200" stroke="#94a3b8" stroke-width="2"/>
      <line x1="220" y1="200" x2="120" y2="180" stroke="#94a3b8" stroke-width="2"/>
      <line x1="120" y1="180" x2="120" y2="100" stroke="#94a3b8" stroke-width="2"/>

      <!-- Routed path highlighted in green -->
      <line x1="120" y1="100" x2="220" y2="80" stroke="#10b981" stroke-width="4"/>
      <line x1="220" y1="80" x2="320" y2="100" stroke="#10b981" stroke-width="4"/>

      <!-- Physical Nodes -->
      <circle cx="120" cy="100" r="10" fill="#2563eb"/>
      <text x="120" y="104" font-family="monospace" font-size="10" font-weight="900" fill="#ffffff" text-anchor="middle">Q₀</text>

      <circle cx="220" cy="80" r="10" fill="#10b981"/>
      <text x="220" y="84" font-family="monospace" font-size="10" font-weight="900" fill="#ffffff" text-anchor="middle">Q₁</text>

      <circle cx="320" cy="100" r="10" fill="#2563eb"/>
      <text x="320" y="104" font-family="monospace" font-size="10" font-weight="900" fill="#ffffff" text-anchor="middle">Q₂</text>

      <circle cx="320" cy="180" r="10" fill="#94a3b8"/>
      <circle cx="220" cy="200" r="10" fill="#94a3b8"/>
      <circle cx="120" cy="180" r="10" fill="#94a3b8"/>

      <text x="220" y="235" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#059669" text-anchor="middle">Маршрут CNOT(0, 2) через узел связи Q₁</text>

      <!-- RIGHT SIDE: NATIVE IBM DECOMPOSITION -->
      <rect x="440" y="25" width="470" height="230" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <text x="675" y="52" font-family="system-ui, sans-serif" font-size="13" font-weight="900" fill="#0f172a" text-anchor="middle">НАТИВНАЯ ТРАНСЛЯЦИЯ {CZ, √X, Rz}</text>

      <!-- Wires -->
      <line x1="470" y1="110" x2="880" y2="110" stroke="#94a3b8" stroke-width="2"/>
      <line x1="470" y1="180" x2="880" y2="180" stroke="#94a3b8" stroke-width="2"/>

      <text x="455" y="115" font-family="monospace" font-size="12" font-weight="800" fill="#0f172a">q₀</text>
      <text x="455" y="185" font-family="monospace" font-size="12" font-weight="800" fill="#0f172a">q₁</text>

      <!-- Rz - SX - Rz for H -->
      <rect x="490" y="93" width="34" height="34" rx="4" fill="#a855f7"/>
      <text x="507" y="115" font-family="monospace" font-size="10" font-weight="900" fill="#ffffff" text-anchor="middle">Rz</text>
      <rect x="530" y="93" width="34" height="34" rx="4" fill="#ec4899"/>
      <text x="547" y="115" font-family="monospace" font-size="10" font-weight="900" fill="#ffffff" text-anchor="middle">√X</text>
      <rect x="570" y="93" width="34" height="34" rx="4" fill="#a855f7"/>
      <text x="587" y="115" font-family="monospace" font-size="10" font-weight="900" fill="#ffffff" text-anchor="middle">Rz</text>

      <!-- CZ Gate -->
      <line x1="650" y1="110" x2="650" y2="180" stroke="#dc2626" stroke-width="2.5"/>
      <circle cx="650" cy="110" r="6" fill="#dc2626"/>
      <circle cx="650" cy="180" r="6" fill="#dc2626"/>
      <text x="650" y="85" font-family="monospace" font-size="11" font-weight="900" fill="#dc2626" text-anchor="middle">CZ</text>

      <!-- Rz - SX - Rz for Target -->
      <rect x="710" y="163" width="34" height="34" rx="4" fill="#a855f7"/>
      <text x="727" y="185" font-family="monospace" font-size="10" font-weight="900" fill="#ffffff" text-anchor="middle">Rz</text>
      <rect x="750" y="163" width="34" height="34" rx="4" fill="#ec4899"/>
      <text x="767" y="185" font-family="monospace" font-size="10" font-weight="900" fill="#ffffff" text-anchor="middle">√X</text>
      <rect x="790" y="163" width="34" height="34" rx="4" fill="#a855f7"/>
      <text x="807" y="185" font-family="monospace" font-size="10" font-weight="900" fill="#ffffff" text-anchor="middle">Rz</text>
    </svg>
    """

def svg_circuit_teleportation():
    """Slide 24: Quantum Teleportation (Bell prep & meas slate; Classical feedforward c_if VARIES BY MEASUREMENT -> colored amber)"""
    return """
    <svg viewBox="0 0 940 280" class="w-full h-full max-h-[480px]" xmlns="http://www.w3.org/2000/svg">
      <text x="35" y="25" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#059669" letter-spacing="1">ВХОД</text>
      <text x="780" y="25" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#6366f1" letter-spacing="1">ВЫХОД</text>

      <!-- Wires -->
      <line x1="80" y1="50" x2="760" y2="50" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="80" y1="110" x2="760" y2="110" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="80" y1="170" x2="760" y2="170" stroke="#94a3b8" stroke-width="2.5"/>

      <!-- Classical double lines -->
      <line x1="80" y1="225" x2="760" y2="225" stroke="#64748b" stroke-width="1.5"/>
      <line x1="80" y1="230" x2="760" y2="230" stroke="#64748b" stroke-width="1.5"/>

      <!-- Input Wire Labels -->
      <text x="25" y="55" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">|ψ⟩</text>
      <text x="25" y="115" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">|0⟩_A</text>
      <text x="25" y="175" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">|0⟩_B</text>
      <text x="35" y="232" font-family="monospace" font-size="14" font-weight="800" fill="#475569">c</text>

      <!-- Static Bell Pair on q1, q2 (Neutral Slate) -->
      <rect x="110" y="90" width="36" height="36" rx="6" fill="#1e293b" stroke="#334155"/>
      <text x="128" y="114" font-family="monospace" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">H</text>
      <line x1="190" y1="110" x2="190" y2="170" stroke="#475569" stroke-width="2.5"/>
      <circle cx="190" cy="110" r="6" fill="#475569"/>
      <circle cx="190" cy="170" r="14" fill="#ffffff" stroke="#475569" stroke-width="2.5"/>
      <text x="155" y="75" font-family="system-ui, sans-serif" font-size="10" font-weight="900" fill="#475569" text-anchor="middle">BELL PAIR</text>

      <!-- Static Bell Measurement on q0, q1 (Neutral Slate) -->
      <line x1="290" y1="50" x2="290" y2="110" stroke="#475569" stroke-width="2.5"/>
      <circle cx="290" cy="50" r="6" fill="#475569"/>
      <circle cx="290" cy="110" r="14" fill="#ffffff" stroke="#475569" stroke-width="2.5"/>
      <rect x="360" y="32" width="36" height="36" rx="6" fill="#1e293b" stroke="#334155"/>
      <text x="378" y="56" font-family="monospace" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">H</text>

      <!-- Static Mid-circuit Measurements (Neutral Slate) -->
      <rect x="440" y="32" width="46" height="36" rx="6" fill="#0f172a"/>
      <text x="463" y="56" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle">📊 M</text>
      <rect x="440" y="92" width="46" height="36" rx="6" fill="#0f172a"/>
      <text x="463" y="116" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle">📊 M</text>

      <!-- VARYING DYNAMIC FEEDFORWARD: Classical Feedforward lines & Conditional Gates (Colored Amber) -->
      <line x1="463" y1="68" x2="463" y2="225" stroke="#d97706" stroke-width="2" stroke-dasharray="3 3"/>
      <line x1="486" y1="128" x2="486" y2="225" stroke="#d97706" stroke-width="2" stroke-dasharray="3 3"/>

      <!-- Conditional Gate X on q2 (c_if bit1) (Colored Amber) -->
      <line x1="600" y1="225" x2="600" y2="190" stroke="#d97706" stroke-width="2" stroke-dasharray="3 3"/>
      <rect x="580" y="152" width="40" height="36" rx="6" fill="#d97706"/>
      <text x="600" y="176" font-family="monospace" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">X</text>
      <text x="600" y="142" font-family="monospace" font-size="9" font-weight="900" fill="#d97706" text-anchor="middle">c_if(m₁=1)</text>

      <!-- Conditional Gate Z on q2 (c_if bit0) (Colored Amber) -->
      <line x1="710" y1="225" x2="710" y2="190" stroke="#d97706" stroke-width="2" stroke-dasharray="3 3"/>
      <rect x="690" y="152" width="40" height="36" rx="6" fill="#d97706"/>
      <text x="710" y="176" font-family="monospace" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">Z</text>
      <text x="710" y="142" font-family="monospace" font-size="9" font-weight="900" fill="#d97706" text-anchor="middle">c_if(m₀=1)</text>

      <!-- Output on Bob's qubit -->
      <text x="780" y="176" font-family="system-ui, sans-serif" font-size="16" font-weight="900" fill="#0f172a">|ψ⟩_B</text>
    </svg>
    """

def svg_circuit_qec_bitflip():
    """Slide 25: Bit-Flip QEC (Encoding CNOTs slate; Injected Noise Red; Conditional Correction Amber/Emerald)"""
    return """
    <svg viewBox="0 0 940 280" class="w-full h-full max-h-[480px]" xmlns="http://www.w3.org/2000/svg">
      <text x="35" y="25" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#059669" letter-spacing="1">ВХОД</text>
      <text x="770" y="25" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#6366f1" letter-spacing="1">ВЫХОД</text>

      <!-- Wires -->
      <line x1="80" y1="50" x2="750" y2="50" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="80" y1="110" x2="750" y2="110" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="80" y1="170" x2="750" y2="170" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="80" y1="220" x2="750" y2="220" stroke="#94a3b8" stroke-width="2.5"/>

      <!-- Input Wire Labels -->
      <text x="25" y="55" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">|ψ⟩</text>
      <text x="25" y="115" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">|0⟩</text>
      <text x="25" y="175" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a">|0⟩</text>
      <text x="15" y="225" font-family="monospace" font-size="14" font-weight="800" fill="#0f172a">|0⟩ₐₙc</text>

      <!-- Static Encoding CNOTs (Neutral Slate) -->
      <line x1="140" y1="50" x2="140" y2="110" stroke="#475569" stroke-width="2.5"/>
      <circle cx="140" cy="50" r="6" fill="#475569"/>
      <circle cx="140" cy="110" r="14" fill="#ffffff" stroke="#475569" stroke-width="2.5"/>
      <line x1="190" y1="50" x2="190" y2="170" stroke="#475569" stroke-width="2.5"/>
      <circle cx="190" cy="50" r="6" fill="#475569"/>
      <circle cx="190" cy="170" r="14" fill="#ffffff" stroke="#475569" stroke-width="2.5"/>
      <text x="165" y="25" font-family="system-ui, sans-serif" font-size="10" font-weight="900" fill="#475569" text-anchor="middle">ENCODE</text>

      <!-- VARYING BLOCK: INJECTED NOISE (Colored Red) -->
      <rect x="260" y="35" width="70" height="150" rx="8" fill="#fef2f2" stroke="#dc2626" stroke-width="2" stroke-dasharray="4 3"/>
      <text x="295" y="115" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#dc2626" text-anchor="middle">NOISE X₁</text>

      <!-- Static Syndrome Extraction to Ancilla (Neutral Slate) -->
      <line x1="410" y1="50" x2="410" y2="220" stroke="#475569" stroke-width="2.5"/>
      <circle cx="410" cy="50" r="6" fill="#475569"/>
      <circle cx="410" cy="220" r="14" fill="#ffffff" stroke="#475569" stroke-width="2.5"/>
      <line x1="470" y1="110" x2="470" y2="220" stroke="#475569" stroke-width="2.5"/>
      <circle cx="470" cy="110" r="6" fill="#475569"/>
      <circle cx="470" cy="220" r="14" fill="#ffffff" stroke="#475569" stroke-width="2.5"/>

      <!-- Static Ancilla Measurement (Neutral Slate) -->
      <rect x="540" y="202" width="46" height="36" rx="6" fill="#0f172a"/>
      <text x="563" y="226" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle">📊 M</text>
      <text x="563" y="255" font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#475569" text-anchor="middle">SYNDROME</text>

      <!-- VARYING BLOCK: Dynamic Feedforward & Correction (Colored Emerald) -->
      <line x1="586" y1="220" x2="690" y2="110" stroke="#059669" stroke-width="2" stroke-dasharray="3 3"/>
      <rect x="670" y="92" width="40" height="36" rx="6" fill="#059669"/>
      <text x="690" y="116" font-family="monospace" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">X</text>
      <text x="690" y="80" font-family="monospace" font-size="9" font-weight="900" fill="#059669" text-anchor="middle">c_if(syn=1)</text>

      <!-- Final Fidelity Output -->
      <text x="770" y="115" font-family="system-ui, sans-serif" font-size="15" font-weight="900" fill="#0f172a">F = 1.0 (RESTORED)</text>
    </svg>
    """

# ----------------------------------------------------------------------
# 3. PLATFORM ARCHITECTURE & ROADMAP (Slides 26 - 28)
# ----------------------------------------------------------------------

def svg_platform_pipeline():
    """Slide 27: Platform Architecture (pure diagram, zero code)"""
    return """
    <svg viewBox="0 0 960 360" class="w-full h-full max-h-[480px]" xmlns="http://www.w3.org/2000/svg">
      <!-- 4 Stages in Flow -->
      <!-- STAGE 1: CLIENT WEB COMPOSER -->
      <rect x="30" y="100" width="200" height="150" rx="14" fill="#ffffff" stroke="#6366f1" stroke-width="2.5"/>
      <rect x="30" y="100" width="200" height="35" rx="14" fill="#6366f1"/>
      <text x="130" y="124" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle">1. КЛИЕНТ (COMPOSER)</text>
      <text x="130" y="165" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#1e293b" text-anchor="middle">Drag & Drop сетка</text>
      <text x="130" y="188" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#64748b" text-anchor="middle">3D Сфера Блоха</text>
      <text x="130" y="210" font-family="monospace" font-size="11" font-weight="700" fill="#6366f1" text-anchor="middle">JSON / OpenQASM 3</text>

      <!-- ARROW 1 -> 2 -->
      <path d="M 230 175 L 270 175" fill="none" stroke="#6366f1" stroke-width="3"/>
      <polygon points="270,170 280,175 270,180" fill="#6366f1"/>

      <!-- STAGE 2: IN-BROWSER WASM JUDGE -->
      <rect x="280" y="100" width="200" height="150" rx="14" fill="#ffffff" stroke="#059669" stroke-width="2.5"/>
      <rect x="280" y="100" width="200" height="35" rx="14" fill="#059669"/>
      <text x="380" y="124" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle">2. WASM СИМУЛЯТОР</text>
      <text x="380" y="165" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#1e293b" text-anchor="middle">Rust Statevector</text>
      <text x="380" y="188" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#64748b" text-anchor="middle">Мгновенный отклик 5ms</text>
      <text x="380" y="210" font-family="monospace" font-size="11" font-weight="700" fill="#059669" text-anchor="middle">Fidelity Auto-Check</text>

      <!-- ARROW 2 -> 3 -->
      <path d="M 480 175 L 520 175" fill="none" stroke="#059669" stroke-width="3"/>
      <polygon points="520,170 530,175 520,180" fill="#059669"/>

      <!-- STAGE 3: ISOLATED DOCKER / gVisor -->
      <rect x="530" y="100" width="200" height="150" rx="14" fill="#ffffff" stroke="#d97706" stroke-width="2.5"/>
      <rect x="530" y="100" width="200" height="35" rx="14" fill="#d97706"/>
      <text x="630" y="124" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle">3. SERVER AUTO-JUDGE</text>
      <text x="630" y="165" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#1e293b" text-anchor="middle">gVisor Песочница</text>
      <text x="630" y="188" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#64748b" text-anchor="middle">Qiskit Aer + Shots χ²</text>
      <text x="630" y="210" font-family="monospace" font-size="11" font-weight="700" fill="#d97706" text-anchor="middle">Anti-Cheat Audit</text>

      <!-- ARROW 3 -> 4 -->
      <path d="M 730 175 L 770 175" fill="none" stroke="#d97706" stroke-width="3"/>
      <polygon points="770,170 780,175 770,180" fill="#d97706"/>

      <!-- STAGE 4: LEADERBOARD & RATINGS -->
      <rect x="780" y="100" width="160" height="150" rx="14" fill="#ffffff" stroke="#dc2626" stroke-width="2.5"/>
      <rect x="780" y="100" width="160" height="35" rx="14" fill="#dc2626"/>
      <text x="860" y="124" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle">4. LEADERBOARD</text>
      <text x="860" y="165" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#1e293b" text-anchor="middle">Accepted (AC)</text>
      <text x="860" y="188" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#64748b" text-anchor="middle">Рейтинг Elo / Codeforces</text>
      <text x="860" y="210" font-family="monospace" font-size="11" font-weight="700" fill="#dc2626" text-anchor="middle">Score: 100/100</text>
    </svg>
    """

# ----------------------------------------------------------------------
# 4. SLIDE DATA DEFINITIONS (All 28 Slides)
# ----------------------------------------------------------------------

SLIDES_DATA = [
    # SLIDE 1: HERO
    {
        "id": 1,
        "category": "ВВЕДЕНИЕ",
        "badge": "КОНЦЕПТ",
        "title": "QuantumArena: Таксономия квантовых задач",
        "type": "hero",
        "formula": r"|\psi_{out}\rangle = U_{circuit} |\psi_{in}\rangle",
        "stats": [
            {"val": "56+", "label": "Разобранных задач", "color": "text-indigo-600"},
            {"val": "3", "label": "Формата (GUI / Код / Динамика)", "color": "text-emerald-600"},
            {"val": "4", "label": "Топологии связности", "color": "text-amber-600"},
            {"val": "100%", "label": "Автосудейство (AC / WA)", "color": "text-rose-600"}
        ]
    },
    # SLIDE 2: 5-AXIS TREE
    {
        "id": 2,
        "category": "ТАКСОНОМИЯ",
        "badge": "МЕТА-ДЕРЕВО",
        "title": "5 Измерений квантовой соревновательной задачи",
        "type": "tree",
        "formula": r"\text{Задача} = \langle \text{Парадигма}, |\psi_{in}\rangle, \text{Контракт}, \text{Топология}, \text{Судья} \rangle",
        "svg_func": svg_tree_5axis
    },
    # SLIDE 3: INPUTS TREE
    {
        "id": 3,
        "category": "ТАКСОНОМИЯ",
        "badge": "ВХОДЫ",
        "title": "Таксономия входных состояний кубитов",
        "type": "tree",
        "formula": r"|\psi_{in}\rangle \in \{ |0\dots0\rangle,\; |\psi_{in}\rangle,\; |\psi(\theta)\rangle,\; |x\rangle|0\rangle_{anc} \}",
        "svg_func": svg_tree_inputs
    },
    # SLIDE 4: OUTPUTS & CONTRACTS TREE
    {
        "id": 4,
        "category": "ТАКСОНОМИЯ",
        "badge": "КОНТРАКТЫ",
        "title": "Форматы решений: GUI vs Программный vs Динамический",
        "type": "tree",
        "formula": r"\text{Контракт} \in \{ \text{Тип A (GUI Static)},\; \text{Тип B (Код Parametric)},\; \text{Тип C (Динамика c\_if)} \}",
        "svg_func": svg_tree_outputs
    },
    # SLIDE 5: GATE SETS TREE
    {
        "id": 5,
        "category": "ТАКСОНОМИЯ",
        "badge": "БАЗИСЫ",
        "title": "Физические базисы и наборы квантовых вентилей",
        "type": "tree",
        "formula": r"\mathcal{G} \in \{ \text{Universal},\; \text{Reversible},\; \text{Clifford},\; \text{IBM Native},\; \text{IonQ Native} \}",
        "svg_func": svg_tree_bases
    },
    # SLIDE 6: TOPOLOGY TREE
    {
        "id": 6,
        "category": "ТАКСОНОМИЯ",
        "badge": "СВЯЗНОСТЬ",
        "title": "Топологии связности кубитов (Coupling Maps)",
        "type": "tree",
        "formula": r"G = (V, E), \quad CX(i, j) \iff (i, j) \in E",
        "svg_func": svg_tree_topologies
    },
    # SLIDE 7: AUTO-JUDGE TREE
    {
        "id": 7,
        "category": "ТАКСОНОМИЯ",
        "badge": "ВЕРИФИКАЦИЯ",
        "title": "Математические методы автосудейства",
        "type": "tree",
        "formula": r"F = |\langle \psi_{target} | \psi_{user} \rangle|^2 \ge 0.999 \quad \lor \quad \| U_{target} - U_{user} \|_F \le \varepsilon",
        "svg_func": svg_tree_autojudge
    },
    # SLIDE 8: BELL STATE
    {
        "id": 8,
        "category": "1. СИНТЕЗ СОСТОЯНИЙ",
        "badge": "T1.1 • ТИП A (GUI READY)",
        "diff": "Easy",
        "title": "Синтез антисимметричного состояния Белла |Φ⁻⟩",
        "type": "circuit",
        "formula": r"|00\rangle \longrightarrow |\Phi^-\rangle = \frac{|00\rangle - |11\rangle}{\sqrt{2}}",
        "input_state": r"|00\rangle",
        "output_state": r"|\Phi^-\rangle = \frac{|00\rangle - |11\rangle}{\sqrt{2}}",
        "badges": ["2 кубита", "Гейтов ≤ 3", "Глубина ≤ 2", "Базис: {X, H, CX}", "Топология: Линейная"],
        "svg_func": svg_circuit_bell_minus
    },
    # SLIDE 9: GHZ STATE
    {
        "id": 9,
        "category": "1. СИНТЕЗ СОСТОЯНИЙ",
        "badge": "T1.2 • ТИП B (ПАРАМЕТРИЧЕСКАЯ)",
        "diff": "Easy",
        "title": "Синтез состояния GHZ для n кубитов",
        "type": "circuit",
        "formula": r"|0^{\otimes n}\rangle \longrightarrow |GHZ_n\rangle = \frac{|0^{\otimes n}\rangle + |1^{\otimes n}\rangle}{\sqrt{2}}",
        "input_state": r"|0^{\otimes n}\rangle",
        "output_state": r"|GHZ_n\rangle = \frac{|0^{\otimes n}\rangle + |1^{\otimes n}\rangle}{\sqrt{2}}",
        "badges": ["n кубитов", "Гейтов: n", "Глубина: n", "Базис: {H, CX}", "Топология: Линейная цепь"],
        "svg_func": svg_circuit_ghz_parametric
    },
    # SLIDE 10: W-STATE
    {
        "id": 10,
        "category": "1. СИНТЕЗ СОСТОЯНИЙ",
        "badge": "T1.3 • ТИП B (УГЛЫ ROTATION)",
        "diff": "Medium",
        "title": "Синтез состояния W₃ с расчетными углами вращений",
        "type": "circuit",
        "formula": r"|000\rangle \longrightarrow |W_3\rangle = \frac{|100\rangle + |010\rangle + |001\rangle}{\sqrt{3}}, \quad \theta_1 = 2\arccos(1/\sqrt{3})",
        "input_state": r"|000\rangle",
        "output_state": r"|W_3\rangle = \frac{|100\rangle + |010\rangle + |001\rangle}{\sqrt{3}}",
        "badges": ["3 кубита", "Гейтов ≤ 5", "Базис: {Ry(θ), CX, X}", "Топология: Звезда / All-to-all"],
        "svg_func": svg_circuit_w_state
    },
    # SLIDE 11: CLUSTER STATE
    {
        "id": 11,
        "category": "1. СИНТЕЗ СОСТОЯНИЙ",
        "badge": "T1.4 • ТИП B (ГРАФОВЫЕ СОСТОЯНИЯ)",
        "diff": "Medium",
        "title": "1D Кластерное состояние (Линейный кластер)",
        "type": "circuit",
        "formula": r"|0^{\otimes n}\rangle \xrightarrow{H^{\otimes n}} |+\rangle^{\otimes n} \xrightarrow{\prod CZ_{i, i+1}} |Cluster_n\rangle",
        "input_state": r"|0^{\otimes 4}\rangle",
        "output_state": r"|Cluster_4\rangle = \prod_{i=0}^2 CZ_{i, i+1} |+\rangle^{\otimes 4}",
        "badges": ["n кубитов", "Глубина ≤ 3", "Базис: {H, CZ}", "Топология: Соседская цепь"],
        "svg_func": svg_circuit_cluster_state
    },
    # SLIDE 12: HALF ADDER
    {
        "id": 12,
        "category": "2. РЕВЕРСИВНАЯ ЛОГИКА",
        "badge": "T2.1 • ТИП A (GUI READY)",
        "diff": "Easy",
        "title": "Квантовый обратимый полусумматор (Half Adder)",
        "type": "circuit",
        "formula": r"|a\rangle |b\rangle |0\rangle_{anc} \longrightarrow |a\rangle |a \oplus b\rangle |a \cdot b\rangle",
        "input_state": r"|a\rangle |b\rangle |0\rangle_{anc}",
        "output_state": r"|a\rangle |a \oplus b\rangle |a \cdot b\rangle",
        "badges": ["3 кубита", "Гейтов: 2 (1 CCX, 1 CX)", "Базис: Reversible {CCX, CX}", "Топология: All-to-All"],
        "svg_func": svg_circuit_half_adder
    },
    # SLIDE 13: UNCOMPUTATION PIPELINE
    {
        "id": 13,
        "category": "2. РЕВЕРСИВНАЯ ЛОГИКА",
        "badge": "T2.2 • ПАРАДИГМА UNCOMPUTATION",
        "diff": "Medium",
        "title": "Паттерн Uncomputation: Очистка анцилл",
        "type": "circuit",
        "formula": r"|x\rangle |0\rangle_{anc} |y\rangle \xrightarrow{U} |x\rangle |g(x)\rangle |y\rangle \xrightarrow{CX} |x\rangle |g(x)\rangle |y \oplus f(x)\rangle \xrightarrow{U^\dagger} |x\rangle |0\rangle_{anc} |y \oplus f(x)\rangle",
        "input_state": r"|x\rangle |0\rangle_{anc} |y\rangle",
        "output_state": r"|x\rangle |0\rangle_{anc} |y \oplus f(x)\rangle \quad (\text{ancilla clean})",
        "badges": ["Очистка анцилл", "Гарантия унитарности", "Fidelity проверки: |0⟩_anc"],
        "svg_func": svg_circuit_uncomputation
    },
    # SLIDE 14: DRAPER ADDER
    {
        "id": 14,
        "category": "2. РЕВЕРСИВНАЯ ЛОГИКА",
        "badge": "T2.3 • АРИФМЕТИКА В QFT",
        "diff": "Hard",
        "title": "Сумматор Дрейпера (Draper QFT Adder)",
        "type": "circuit",
        "formula": r"|a\rangle |b\rangle \xrightarrow{I \otimes QFT} |a\rangle |\phi(b)\rangle \xrightarrow{R_k} |a\rangle |\phi(a+b)\rangle \xrightarrow{I \otimes QFT^\dagger} |a\rangle |a+b\rangle",
        "input_state": r"|a\rangle |b\rangle",
        "output_state": r"|a\rangle |a + b\rangle \quad (0 \text{ ancillas})",
        "badges": ["2n кубитов", "0 анцилл", "Базис: {QFT, Controlled-R_k}", "Топология: All-to-All"],
        "svg_func": svg_circuit_draper_adder
    },
    # SLIDE 15: PHASE ORACLE
    {
        "id": 15,
        "category": "3. ОРАКУЛЫ",
        "badge": "T3.1 • ФАЗОВЫЙ ОРАКУЛ",
        "diff": "Easy",
        "title": "Фазовый оракул для битовой маски s",
        "type": "circuit",
        "formula": r"|x\rangle \longrightarrow (-1)^{s \cdot x} |x\rangle, \quad U_s = \bigotimes_{i: s_i=1} Z_i",
        "input_state": r"|x\rangle, \quad s = 1010_2",
        "output_state": r"(-1)^{s \cdot x} |x\rangle",
        "badges": ["n кубитов", "0 анцилл", "Глубина: 1", "Базис: {Z}", "Топология: Не зависит"],
        "svg_func": svg_circuit_phase_oracle
    },
    # SLIDE 16: BOOLEAN EQUALITY ORACLE
    {
        "id": 16,
        "category": "3. ОРАКУЛЫ",
        "badge": "T3.2 • БУЛЕВ ОРАКУЛ",
        "diff": "Medium",
        "title": "Оракул проверки равенства |x == a⟩",
        "type": "circuit",
        "formula": r"|x\rangle |y\rangle \longrightarrow |x\rangle |y \oplus [x == a]\rangle, \quad [x == a] = \bigwedge_{i=0}^{n-1} (x_i \oplus \overline{a_i})",
        "input_state": r"|x\rangle |y\rangle, \quad a = 010_2",
        "output_state": r"|x\rangle |y \oplus [x == a]\rangle",
        "badges": ["n + 1 кубит", "Базис: {X, MCX}", "Uncomputation: Очистка X", "Топология: Star"],
        "svg_func": svg_circuit_boolean_oracle
    },
    # SLIDE 17: DEUTSCH-JOZSA
    {
        "id": 17,
        "category": "4. АЛГОРИТМЫ",
        "badge": "T4.1 • АЛГОРИТМ DJ",
        "diff": "Medium",
        "title": "Алгоритм Дойча-Йожи (1 запрос к оракулу)",
        "type": "circuit",
        "formula": r"|\psi_0\rangle = |0^{\otimes n}\rangle |1\rangle \xrightarrow{H^{\otimes (n+1)}} \xrightarrow{U_f} \xrightarrow{H^{\otimes n} \otimes I} \text{Измерение}",
        "input_state": r"|0^{\otimes n}\rangle |1\rangle",
        "output_state": r"|0\dots 0\rangle \iff f=\text{const}, \quad \neq |0\dots 0\rangle \iff f=\text{balanced}",
        "badges": ["n + 1 кубит", "1 запрос", "Детерминированный исход", "Автосудья: Shots 100%"],
        "svg_func": svg_circuit_deutsch_jozsa
    },
    # SLIDE 18: BERNSTEIN-VAZIRANI
    {
        "id": 18,
        "category": "4. АЛГОРИТМЫ",
        "badge": "T4.2 • АЛГОРИТМ BV",
        "diff": "Medium",
        "title": "Алгоритм Бернштейна-Вазирани (Поиск битовой строки)",
        "type": "circuit",
        "formula": r"f(x) = s \cdot x \pmod 2 \implies \text{Измерение дает } |s\rangle \text{ за 1 вызов оракула}",
        "input_state": r"|0^{\otimes n}\rangle |1\rangle",
        "output_state": r"|s\rangle \quad (\text{строка } s \text{ найдена точно за 1 запуск})",
        "badges": ["n + 1 кубит", "1 запрос vs n классических", "Базис: {H, U_f, Measure}"],
        "svg_func": svg_circuit_bernstein_vazirani
    },
    # SLIDE 19: GROVER DIFFUSION
    {
        "id": 19,
        "category": "4. АЛГОРИТМЫ",
        "badge": "T4.3 • ОПЕРАТОР ДИФФУЗИИ",
        "diff": "Hard",
        "title": "Оператор диффузии Гровера (Инверсия относительно среднего)",
        "type": "circuit",
        "formula": r"D = 2|s\rangle\langle s| - I = H^{\otimes n} (2|0\dots0\rangle\langle0\dots0| - I) H^{\otimes n}",
        "input_state": r"|\psi\rangle = \sum_x \alpha_x |x\rangle",
        "output_state": r"(2|s\rangle\langle s| - I)|\psi\rangle \quad (\text{инверсия амплитуды})",
        "badges": ["n кубитов", "Базис: {H, X, MCZ}", "Ускорение: O(√N)", "Топология: All-to-all"],
        "svg_func": svg_circuit_grover_diffusion
    },
    # SLIDE 20: QFT
    {
        "id": 20,
        "category": "4. АЛГОРИТМЫ",
        "badge": "T4.4 • ПРЕОБРАЗОВАНИЕ ФУРЬЕ",
        "diff": "Hard",
        "title": "Квантовое преобразование Фурье (QFT)",
        "type": "circuit",
        "formula": r"|j\rangle \longrightarrow \frac{1}{\sqrt{2^n}} \sum_{k=0}^{2^n-1} \omega^{j \cdot k} |k\rangle, \quad R_m = \text{diag}(1, e^{2\pi i / 2^m})",
        "input_state": r"|j\rangle = |j_1 j_2 \dots j_n\rangle",
        "output_state": r"\frac{1}{\sqrt{2^n}} \sum_{k=0}^{2^n-1} e^{2\pi i j k / 2^n} |k\rangle",
        "badges": ["n кубитов", "Гейтов: O(n²)", "Базис: {H, Controlled-R_m, SWAP}"],
        "svg_func": svg_circuit_qft
    },
    # SLIDE 21: QPE
    {
        "id": 21,
        "category": "4. АЛГОРИТМЫ",
        "badge": "T4.5 • ОЦЕНКА ФАЗЫ",
        "diff": "Hard",
        "title": "Оценка квантовой фазы (Quantum Phase Estimation)",
        "type": "circuit",
        "formula": r"U|\psi\rangle = e^{2\pi i \theta} |\psi\rangle \implies \text{Регистр считывает } |\widetilde{2^t \theta}\rangle",
        "input_state": r"|0^{\otimes t}\rangle |\psi\rangle",
        "output_state": r"|\widetilde{2^t \theta}\rangle |\psi\rangle \quad (\theta \text{ с точностью до } t \text{ бит})",
        "badges": ["t + m кубитов", "Базис: {H, C-U^{2^j}, QFT†}", "Ядро алгоритма Шора"],
        "svg_func": svg_circuit_qpe
    },
    # SLIDE 22: LINEAR TOPOLOGY
    {
        "id": 22,
        "category": "5. ТОПОЛОГИЯ И ЖЕЛЕЗО",
        "badge": "T5.1 • МАРШРУТИЗАЦИЯ В ЦЕПИ",
        "diff": "Medium",
        "title": "Маршрутизация CNOT через цепочку SWAP вентилей",
        "type": "circuit",
        "formula": r"(0, 2) \notin E \implies CX(0, 2) \equiv SWAP(0, 1) \cdot CX(1, 2) \cdot SWAP(0, 1)",
        "input_state": r"|q_0, q_1, q_2\rangle, \quad (0, 2) \notin E",
        "output_state": r"CX(0, 2) \text{ выполнен через SWAP-тракт}",
        "badges": ["3 кубита", "Топология: Линия q₀—q₁—q₂", "Накладные расходы: 2 SWAP (+6 CX)"],
        "svg_func": svg_circuit_topology_linear
    },
    # SLIDE 23: IBM HEAVY-HEX
    {
        "id": 23,
        "category": "5. ТОПОЛОГИЯ И ЖЕЛЕЗО",
        "badge": "T5.2 • IBM HEAVY-HEX",
        "diff": "Hard",
        "title": "Отображение в нативную архитектуру IBM {CZ, √X, Rz}",
        "type": "circuit",
        "formula": r"CX(i, j) \equiv (I \otimes R_z(\frac{\pi}{2}) \sqrt{X} R_z(\frac{\pi}{2})) \cdot CZ(i, j) \cdot (I \otimes R_z(\frac{\pi}{2}) \sqrt{X} R_z(\frac{\pi}{2}))",
        "input_state": r"\text{Логический вентиль } CX(q_0, q_2)",
        "output_state": r"\text{Нативная цепочка } \{CZ, \sqrt{X}, R_z\}",
        "badges": ["Eagle / Heron чип", "Нативный базис", "Сверхпроводниковые кубиты"],
        "svg_func": svg_circuit_topology_ibm
    },
    # SLIDE 24: TELEPORTATION
    {
        "id": 24,
        "category": "6. ДИНАМИКА И ОБРАТНАЯ СВЯЗЬ",
        "badge": "T6.1 • КВАНТОВАЯ ТЕЛЕПОРТАЦИЯ",
        "diff": "Medium",
        "title": "Квантовая телепортация с классической связью c_if",
        "type": "circuit",
        "formula": r"|\psi\rangle \otimes |\Phi^+\rangle \xrightarrow{\text{Bell Meas}} (m_0, m_1) \xrightarrow{Z^{m_0} X^{m_1}} |\psi\rangle_{target}",
        "input_state": r"|\psi\rangle \otimes |00\rangle",
        "output_state": r"|00\rangle \otimes |\psi\rangle \quad (\text{состояние перенесено})",
        "badges": ["3 кубита + 2 кл. бита", "Mid-circuit Measurement", "Условные вентили c_if"],
        "svg_func": svg_circuit_teleportation
    },
    # SLIDE 25: BIT-FLIP QEC
    {
        "id": 25,
        "category": "6. ДИНАМИКА И ОБРАТНАЯ СВЯЗЬ",
        "badge": "T6.2 • КОРРЕКЦИЯ ОШИБОК QEC",
        "diff": "Hard",
        "title": "3-кубитный код коррекции битовых ошибок (Bit-Flip QEC)",
        "type": "circuit",
        "formula": r"|\psi\rangle \to \alpha|000\rangle + \beta|111\rangle \xrightarrow{X_1} \text{Синдром } s=1 \xrightarrow{c\_if} X_1 \implies |\psi\rangle",
        "input_state": r"|\psi\rangle \otimes |00\rangle |0\rangle_{anc} \quad (\text{с шумом } X_1)",
        "output_state": r"|\psi\rangle \quad (\text{синдром считан, ошибка устранена, } F=1.0)",
        "badges": ["3 кубита данных + 1 анцилла", "Снятие синдрома Z₁Z₂", "Активная коррекция"],
        "svg_func": svg_circuit_qec_bitflip
    },
    # SLIDE 26: ARCHETYPE MATRIX
    {
        "id": 26,
        "category": "ИТОГИ КЛАССИФИКАЦИИ",
        "badge": "МАТРИЦА",
        "title": "Сводная матрица архетипов задач QuantumArena",
        "type": "matrix",
        "formula": r"\mathcal{T} = \{ \text{T1: Prep},\; \text{T2: Logic},\; \text{T3: Oracles},\; \text{T4: Algorithms},\; \text{T5: Hardware},\; \text{T6: Dynamic} \}"
    },
    # SLIDE 27: PLATFORM ARCHITECTURE
    {
        "id": 27,
        "category": "ИНЖЕНЕРНАЯ АРХИТЕКТУРА",
        "badge": "PIPELINE",
        "title": "Архитектура платформы: От GUI Composer до Автосудьи",
        "type": "pipeline",
        "formula": r"\text{User Drag\&Drop} \longrightarrow \text{Rust WASM (5ms)} \longrightarrow \text{gVisor Docker Aer} \longrightarrow \text{Leaderboard}",
        "svg_func": svg_platform_pipeline
    },
    # SLIDE 28: ROADMAP
    {
        "id": 28,
        "category": "ПЛАН РАЗВИТИЯ",
        "badge": "ROADMAP",
        "title": "Дорожная карта реализации QuantumArena",
        "type": "roadmap",
        "formula": r"\text{Q4 2026: Prototype} \longrightarrow \text{Q1 2027: MVP \& Grant} \longrightarrow \text{Q2 2027: 1st Olympiad}"
    }
]

# ----------------------------------------------------------------------
# 5. HTML SLIDE RENDERING (RADICALLY MINIMAL TEXT, ZERO CODE)
# ----------------------------------------------------------------------

def render_slide_content(s):
    stype = s.get("type", "circuit")
    sid = s["id"]
    cat = s.get("category", "")
    badge = s.get("badge", "")
    title = s.get("title", "")
    formula = s.get("formula", "")

    # Top Header Bar (common to all slides)
    diff_badge = ""
    if "diff" in s:
        d = s["diff"]
        col = "bg-emerald-100 text-emerald-800" if d == "Easy" else ("bg-amber-100 text-amber-800" if d == "Medium" else "bg-rose-100 text-rose-800")
        diff_badge = f'<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono {col}">{d}</span>'

    header_html = f"""
    <div class="flex items-center justify-between border-b border-slate-100 pb-2 px-1">
      <div class="flex items-center gap-2">
        <span class="text-xs font-black text-rose-700 tracking-wider uppercase">{cat}</span>
        <span class="text-slate-300">•</span>
        <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-slate-100 text-slate-700">{badge}</span>
        {diff_badge}
      </div>
      <div class="font-mono text-xs text-slate-400 font-bold">
        Слайд {sid:02d} / 28
      </div>
    </div>
    """

    # Title & 1-line Formula Section
    title_html = f"""
    <div class="space-y-1 text-center py-1">
      <h2 class="text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
      <div class="font-mono text-sm text-slate-700 bg-slate-50 py-1 px-4 rounded-lg inline-block border border-slate-200">
        $${formula}$$
      </div>
    </div>
    """

    # Body Content based on slide type
    if stype == "hero":
        stats = s.get("stats", [])
        stats_html = "".join([
            f"""
            <div class="p-6 bg-white border-2 border-slate-200/90 rounded-2xl shadow-sm text-center space-y-1">
              <div class="text-4xl font-black {st['color']} font-mono">{st['val']}</div>
              <div class="text-xs font-bold text-slate-600 uppercase tracking-wide">{st['label']}</div>
            </div>
            """ for st in stats
        ])
        body_html = f"""
        <div class="my-auto space-y-8">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats_html}
          </div>
          <div class="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl max-w-3xl mx-auto text-center font-sans text-sm text-indigo-950 font-semibold">
            Инженерная презентация концепта для синхронизации команды: визуальные деревья классификации, интерактивные схемы цепей без лишнего текста и кода.
          </div>
        </div>
        """

    elif stype == "tree":
        svg_content = s["svg_func"]()
        body_html = f"""
        <div class="flex-1 flex items-center justify-center p-1 bg-white border border-slate-200 rounded-2xl shadow-inner overflow-hidden my-auto">
          {svg_content}
        </div>
        """

    elif stype == "circuit":
        svg_content = s["svg_func"]()
        badges = s.get("badges", [])
        badges_html = "".join([
            f'<span class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">{b}</span>'
            for b in badges
        ])
        io_banner_html = ""
        if "input_state" in s and "output_state" in s:
            inp = s["input_state"]
            outp = s["output_state"]
            io_banner_html = f"""
            <div class="flex items-center justify-between max-w-4xl mx-auto w-full bg-slate-900 border border-slate-800 px-5 py-2.5 rounded-xl text-white shadow-sm my-1">
              <div class="flex items-center gap-3">
                <span class="px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">ВХОД</span>
                <span class="font-mono text-sm font-bold text-slate-100">${inp}$</span>
              </div>
              <div class="text-slate-500 text-xs font-bold font-mono tracking-widest hidden sm:block">────────►</div>
              <div class="flex items-center gap-3">
                <span class="px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">ВЫХОД</span>
                <span class="font-mono text-sm font-bold text-slate-100">${outp}$</span>
              </div>
            </div>
            """

        body_html = f"""
        <div class="flex flex-wrap items-center justify-center gap-2 my-0.5">
          {badges_html}
        </div>
        {io_banner_html}
        <div class="flex-1 flex items-center justify-center p-2 bg-white border-2 border-slate-200/90 rounded-2xl shadow-inner overflow-hidden my-auto min-h-[350px]">
          {svg_content}
        </div>
        """

    elif stype == "matrix":
        body_html = f"""
        <div class="my-auto overflow-x-auto rounded-xl border border-slate-200 shadow-sm max-w-5xl mx-auto w-full">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200 font-mono">
              <tr>
                <th class="p-3">Архетип</th>
                <th class="p-3">Интерфейс</th>
                <th class="p-3">Входное состояние</th>
                <th class="p-3">Базис гейтов</th>
                <th class="p-3">Топология</th>
                <th class="p-3">Автосудья</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white font-mono text-slate-800">
              <tr>
                <td class="p-3 font-bold font-sans text-slate-900">T1: State Prep (Bell, GHZ, W)</td>
                <td class="p-3"><span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">GUI Composer</span></td>
                <td class="p-3">|0...0⟩</td>
                <td class="p-3">{{H, X, CX, Ry(θ)}}</td>
                <td class="p-3">All / Linear</td>
                <td class="p-3 font-semibold text-emerald-700">Fidelity ≥ 0.999</td>
              </tr>
              <tr>
                <td class="p-3 font-bold font-sans text-slate-900">T2: Reversible Logic & Adders</td>
                <td class="p-3"><span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">GUI Composer</span></td>
                <td class="p-3">|a, b, c, 0⟩</td>
                <td class="p-3">{{X, CX, CCX}}</td>
                <td class="p-3">All-to-All</td>
                <td class="p-3 font-semibold text-indigo-700">Truth Table Check</td>
              </tr>
              <tr>
                <td class="p-3 font-bold font-sans text-slate-900">T3: Oracles & Uncomputation</td>
                <td class="p-3"><span class="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">Code Parametric</span></td>
                <td class="p-3">|x⟩|0⟩_anc|y⟩</td>
                <td class="p-3">{{X, CX, MCX}}</td>
                <td class="p-3">Star / Tree</td>
                <td class="p-3 font-semibold text-amber-700">Unitary + Ancilla |0⟩</td>
              </tr>
              <tr>
                <td class="p-3 font-bold font-sans text-slate-900">T4: Algorithms (QFT, Grover, BV)</td>
                <td class="p-3"><span class="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">Code Parametric</span></td>
                <td class="p-3">|ψ_in⟩ / |0...0⟩</td>
                <td class="p-3">{{H, R_k, SWAP, MCZ}}</td>
                <td class="p-3">All-to-All</td>
                <td class="p-3 font-semibold text-emerald-700">Operator Fidelity</td>
              </tr>
              <tr>
                <td class="p-3 font-bold font-sans text-slate-900">T5: Hardware & Coupling Map</td>
                <td class="p-3"><span class="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">GUI / Code</span></td>
                <td class="p-3">|q₀, q₁, ...⟩</td>
                <td class="p-3">{{CZ, Rz, √X}}</td>
                <td class="p-3 font-bold text-rose-600">Linear / Heavy-Hex</td>
                <td class="p-3 font-semibold text-rose-700">Topology Validator</td>
              </tr>
              <tr>
                <td class="p-3 font-bold font-sans text-slate-900">T6: Dynamic Circuits & QEC</td>
                <td class="p-3"><span class="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">Dynamic GUI</span></td>
                <td class="p-3">|ψ⟩ + Syndromes</td>
                <td class="p-3">{{Measure, c_if, Reset}}</td>
                <td class="p-3">Syndrome Grid</td>
                <td class="p-3 font-semibold text-purple-700">Shots Distribution (χ²)</td>
              </tr>
            </tbody>
          </table>
        </div>
        """

    elif stype == "pipeline":
        svg_content = s["svg_func"]()
        body_html = f"""
        <div class="flex-1 flex items-center justify-center p-2 bg-white border border-slate-200 rounded-2xl shadow-inner overflow-hidden my-auto">
          {svg_content}
        </div>
        """

    elif stype == "roadmap":
        body_html = f"""
        <div class="my-auto grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto w-full">
          <div class="bg-white border-2 border-slate-200 p-5 rounded-2xl space-y-2 shadow-sm">
            <div class="text-xs font-mono font-bold text-indigo-600 uppercase">Q4 2026 • Фаза 1</div>
            <h3 class="text-base font-black text-slate-900">Прототип & Спецификация</h3>
            <p class="text-xs text-slate-600">Web Composer, банк первых 20 задач, валидация гипотез.</p>
          </div>
          <div class="bg-white border-2 border-slate-200 p-5 rounded-2xl space-y-2 shadow-sm">
            <div class="text-xs font-mono font-bold text-emerald-600 uppercase">Q1 2027 • Фаза 2</div>
            <h3 class="text-base font-black text-slate-900">WASM Ядро & Автосудья</h3>
            <p class="text-xs text-slate-600">Rust симулятор в браузере, песочница gVisor, грант ФСИ «Старт-1».</p>
          </div>
          <div class="bg-white border-2 border-slate-200 p-5 rounded-2xl space-y-2 shadow-sm">
            <div class="text-xs font-mono font-bold text-amber-600 uppercase">Q2 2027 • Фаза 3</div>
            <h3 class="text-base font-black text-slate-900">Пилот в Вузах</h3>
            <p class="text-xs text-slate-600">Тестирование на студентах МФТИ, МГУ, ВШЭ; 50+ задач в базе.</p>
          </div>
          <div class="bg-white border-2 border-slate-200 p-5 rounded-2xl space-y-2 shadow-sm">
            <div class="text-xs font-mono font-bold text-rose-600 uppercase">Q3 2027 • Фаза 4</div>
            <h3 class="text-base font-black text-slate-900">1-й Чемпионат</h3>
            <p class="text-xs text-slate-600">Всероссийский контест по квантовому программированию.</p>
          </div>
        </div>
        """

    return f"""
    <div class="slide-content h-full flex flex-col justify-between p-6 w-full max-w-7xl mx-auto">
      {header_html}
      {title_html}
      {body_html}
    </div>
    """

# ----------------------------------------------------------------------
# 6. ASSEMBLE FULL HTML AND SLIDES.MD
# ----------------------------------------------------------------------

def generate_index_html(output_path):
    slides_html = ""
    drawer_html = ""

    for idx, s in enumerate(SLIDES_DATA):
        sid = s["id"]
        title = s.get("title", "")
        cat = s.get("category", "")
        content = render_slide_content(s)
        active_class = "active" if idx == 0 else ""

        slides_html += f"""
        <section class="slide {active_class}" id="slide-{sid}" data-slide-index="{idx}">
          {content}
        </section>
        """

        drawer_html += f"""
        <div onclick="goToSlide({idx})" class="p-3 bg-white border border-slate-200 hover:border-rose-500 hover:shadow-md transition rounded-xl cursor-pointer text-left space-y-1">
          <div class="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Слайд {sid:02d}</span>
            <span class="font-bold text-rose-600">{cat}</span>
          </div>
          <div class="text-xs font-black text-slate-900 truncate">{title}</div>
        </div>
        """

    html_template = f"""<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QuantumArena — Таксономия и Архитектура Задач</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- KaTeX for LaTeX formulas -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #0b0f19;
      color: #1e293b;
      margin: 0;
      padding: 0;
      overflow: hidden;
      height: 100vh;
      width: 100vw;
    }}
    .slide-deck {{
      position: relative;
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }}
    .slide {{
      position: absolute;
      width: 95vw;
      max-width: 1400px;
      height: 92vh;
      max-height: 860px;
      background: #ffffff;
      border-radius: 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45);
      opacity: 0;
      pointer-events: none;
      transform: scale(0.98);
      transition: opacity 0.25s ease-out, transform 0.25s ease-out;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }}
    .slide.active {{
      opacity: 1;
      pointer-events: auto;
      transform: scale(1);
      z-index: 10;
    }}
    /* Print mode */
    @media print {{
      body {{
        overflow: visible !important;
        background: transparent !important;
      }}
      .slide-deck {{
        display: block !important;
        height: auto !important;
      }}
      .slide {{
        position: relative !important;
        opacity: 1 !important;
        page-break-after: always !important;
        transform: none !important;
        width: 100% !important;
        height: 100vh !important;
        max-width: none !important;
        max-height: none !important;
        border-radius: 0 !important;
        box-shadow: none !important;
      }}
      #controls, #drawer, #progress-bar {{
        display: none !important;
      }}
    }}
  </style>
</head>
<body>

  <!-- Top Progress Bar -->
  <div id="progress-bar" class="fixed top-0 left-0 h-1.5 bg-rose-600 transition-all duration-300 z-50" style="width: 3.57%;"></div>

  <!-- Slide Deck Container -->
  <div class="slide-deck">
    {slides_html}
  </div>

  <!-- Bottom Navigation & Controls Bar -->
  <div id="controls" class="fixed bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-5 py-2.5 rounded-full border border-slate-700 shadow-2xl z-40 text-white">
    <button onclick="prevSlide()" class="p-1.5 hover:bg-slate-800 rounded-full transition" title="Предыдущий (←)">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
    </button>
    <div class="font-mono text-xs font-bold tracking-widest px-2" id="slide-indicator">
      01 / 28
    </div>
    <button onclick="nextSlide()" class="p-1.5 hover:bg-slate-800 rounded-full transition" title="Следующий (→ / Пробел)">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
    </button>
    <div class="h-4 w-px bg-slate-700 mx-1"></div>
    <button onclick="toggleDrawer()" class="p-1.5 hover:bg-slate-800 rounded-full transition text-xs font-mono font-bold flex items-center gap-1.5" title="Обзор всех слайдов (O)">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/></svg>
      <span>Слайды</span>
    </button>
    <button onclick="toggleFullscreen()" class="p-1.5 hover:bg-slate-800 rounded-full transition" title="Полный экран (F)">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
    </button>
  </div>

  <!-- Drawer Modal Overview -->
  <div id="drawer" class="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 hidden flex flex-col p-8">
    <div class="flex items-center justify-between pb-6 border-b border-slate-800 text-white">
      <div>
        <h2 class="text-2xl font-black">Обзор всех 28 слайдов презентации</h2>
        <p class="text-xs text-slate-400 font-mono">Кликните по карточке для перехода к слайду</p>
      </div>
      <button onclick="toggleDrawer()" class="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 py-6 overflow-y-auto">
      {drawer_html}
    </div>
  </div>

  <script>
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;
    const indicator = document.getElementById('slide-indicator');
    const progressBar = document.getElementById('progress-bar');
    const drawer = document.getElementById('drawer');

    // Parse URL parameter ?slide=N or hash #slide-N
    function initSlideFromUrl() {{
      const params = new URLSearchParams(window.location.search);
      const sParam = params.get('slide');
      if (sParam) {{
        const parsed = parseInt(sParam, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= totalSlides) {{
          currentSlide = parsed - 1;
        }}
      }} else if (window.location.hash) {{
        const m = window.location.hash.match(/slide-(\\d+)/);
        if (m) {{
          const parsed = parseInt(m[1], 10);
          if (!isNaN(parsed) && parsed >= 1 && parsed <= totalSlides) {{
            currentSlide = parsed - 1;
          }}
        }}
      }}
    }}

    function updateSlide() {{
      slides.forEach((slide, idx) => {{
        slide.classList.toggle('active', idx === currentSlide);
      }});
      const num = String(currentSlide + 1).padStart(2, '0');
      indicator.textContent = `${{num}} / ${{String(totalSlides).padStart(2, '0')}}`;
      const progress = ((currentSlide + 1) / totalSlides) * 100;
      progressBar.style.width = `${{progress}}%`;

      // Update URL search query
      const url = new URL(window.location);
      url.searchParams.set('slide', currentSlide + 1);
      window.history.replaceState({{}}, '', url);

      // KaTeX rendering
      if (window.renderMathInElement) {{
        renderMathInElement(slides[currentSlide], {{
          delimiters: [
            {{left: '$$', right: '$$', display: true}},
            {{left: '$', right: '$', display: false}}
          ],
          throwOnError: false
        }});
      }}
    }}

    function nextSlide() {{
      if (currentSlide < totalSlides - 1) {{
        currentSlide++;
        updateSlide();
      }}
    }}

    function prevSlide() {{
      if (currentSlide > 0) {{
        currentSlide--;
        updateSlide();
      }}
    }}

    function goToSlide(index) {{
      if (index >= 0 && index < totalSlides) {{
        currentSlide = index;
        updateSlide();
        if (!drawer.classList.contains('hidden')) {{
          toggleDrawer();
        }}
      }}
    }}

    function toggleDrawer() {{
      drawer.classList.toggle('hidden');
    }}

    function toggleFullscreen() {{
      if (!document.fullscreenElement) {{
        document.documentElement.requestFullscreen();
      }} else if (document.exitFullscreen) {{
        document.exitFullscreen();
      }}
    }}

    document.addEventListener('keydown', (e) => {{
      if (e.key === 'ArrowRight' || e.key === ' ') {{
        nextSlide();
      }} else if (e.key === 'ArrowLeft') {{
        prevSlide();
      }} else if (e.key === 'o' || e.key === 'O') {{
        toggleDrawer();
      }} else if (e.key === 'f' || e.key === 'F') {{
        toggleFullscreen();
      }} else if (e.key === 'Escape') {{
        if (!drawer.classList.contains('hidden')) toggleDrawer();
      }}
    }});

    // Initialize
    window.addEventListener('DOMContentLoaded', () => {{
      initSlideFromUrl();
      updateSlide();
      if (window.renderMathInElement) {{
        renderMathInElement(document.body, {{
          delimiters: [
            {{left: '$$', right: '$$', display: true}},
            {{left: '$', right: '$', display: false}}
          ],
          throwOnError: false
        }});
      }}
    }});
  </script>
</body>
</html>
"""

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html_template)
    print(f"Generated {output_path} with {len(SLIDES_DATA)} slides.")

def generate_slides_md(output_path):
    md_lines = [
        "---",
        "marp: true",
        "theme: default",
        "paginate: true",
        "size: 16:9",
        "style: |",
        "  section { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 18px; }",
        "  h1 { font-size: 28px; font-weight: 900; color: #0f172a; }",
        "  h2 { font-size: 22px; font-weight: 800; color: #1e293b; }",
        "---",
        ""
    ]

    for s in SLIDES_DATA:
        sid = s["id"]
        cat = s.get("category", "")
        badge = s.get("badge", "")
        title = s.get("title", "")
        formula = s.get("formula", "")
        diff = f" • **{s.get('diff')}**" if "diff" in s else ""

        md_lines.append(f"<!-- Slide {sid} -->")
        md_lines.append(f"### {cat} • {badge}{diff}")
        md_lines.append(f"# {title}")
        md_lines.append("")
        md_lines.append(f"$$\n{formula}\n$$")
        md_lines.append("")
        if "badges" in s:
            md_lines.append(" | ".join([f"`{b}`" for b in s["badges"]]))
            md_lines.append("")
        md_lines.append("---")
        md_lines.append("")

    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(md_lines))
    print(f"Generated {output_path}")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    html_out = os.path.join(base_dir, "index.html")
    md_out = os.path.join(base_dir, "slides.md")
    generate_index_html(html_out)
    generate_slides_md(md_out)
