// Человекочитаемая запись состояния: (|00⟩ + |11⟩) / √2.

export const ket = (idx, n) => '|' + idx.toString(2).padStart(n, '0') + '⟩';

const PHASES = [
  [0, ''], [Math.PI, '−'], [Math.PI / 2, 'i'], [-Math.PI / 2, '−i'],
  [Math.PI / 4, 'e^{iπ/4}'], [-Math.PI / 4, 'e^{−iπ/4}'], [3 * Math.PI / 4, 'e^{3iπ/4}'], [-3 * Math.PI / 4, 'e^{−3iπ/4}'],
];

function phaseSymbol(phi) {
  for (const [v, s] of PHASES) {
    let d = Math.abs(phi - v) % (2 * Math.PI);
    if (d > Math.PI) d = 2 * Math.PI - d;
    if (d < 1e-6) return s;
  }
  return null;
}

const isInt = (x) => Math.abs(x - Math.round(x)) < 1e-7;

// Красивая запись положительной величины m (амплитуда).
export function niceMag(m) {
  if (Math.abs(m - 1) < 1e-7) return '1';
  const m2 = m * m;
  for (let k = 2; k <= 64; k++) {
    if (Math.abs(m2 * k - 1) < 1e-7) {
      const r = Math.sqrt(k);
      return isInt(r) ? `1/${Math.round(r)}` : `1/√${k}`;
    }
  }
  for (let q = 2; q <= 16; q++) {
    const p = m2 * q;
    if (isInt(p) && Math.round(p) < q) {
      const pp = Math.round(p), rp = Math.sqrt(pp), rq = Math.sqrt(q);
      if (isInt(rp) && isInt(rq)) return `${Math.round(rp)}/${Math.round(rq)}`;
      if (isInt(rq)) return `√${pp}/${Math.round(rq)}`;
      if (isInt(rp) && Math.round(rp) === 1) return `1/√${q}`;
      return `√(${pp}/${q})`;
    }
  }
  return m.toFixed(2).replace('.', ',');
}

export function formatState(st, { maxTerms = 8, eps = 1e-9 } = {}) {
  const n = st.n, terms = [];
  for (let i = 0; i < st.dim; i++) {
    const p = st.prob(i);
    if (p > eps) terms.push({ idx: i, m: Math.sqrt(p), phi: Math.atan2(st.im[i], st.re[i]) });
  }
  if (!terms.length) return { text: '0', terms: [] };
  const g = terms[0].phi;                       // убираем глобальную фазу
  terms.forEach((t) => { t.phi = ((t.phi - g + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; });

  const K = terms.length;
  const equal = terms.every((t) => Math.abs(t.m - terms[0].m) < 1e-6);
  const shown = K > maxTerms ? [...terms.slice(0, maxTerms - 2), null, terms[K - 1]] : terms;
  const out = [];

  const sym = (t) => phaseSymbol(t.phi);
  const phaseText = (t) => sym(t) ?? `e^{${(t.phi / Math.PI).toFixed(2).replace('.', ',')}iπ}`;

  if (equal) {
    const body = shown.map((t, i) => {
      if (!t) return '…';
      const s = sym(t);
      let sign = '+', pre = '';
      if (s === null) { pre = phaseText(t) + '·'; }
      else if (s === '−') sign = '−';
      else if (s === '−i') { sign = '−'; pre = 'i·'; }
      else if (s === 'i') pre = 'i·';
      else if (s !== '') pre = s + '·';
      const k = ket(t.idx, n);
      if (i === 0) return (sign === '−' ? '−' : '') + pre + k;
      return `${sign} ${pre}${k}`;
    }).join(' ');
    if (K === 1) { out.push(ket(terms[0].idx, n)); }
    else {
      const r = Math.sqrt(K);
      const den = isInt(r) ? String(Math.round(r)) : `√${K}`;
      out.push(`(${body}) / ${den}`);
    }
  } else {
    const parts = shown.map((t, i) => {
      if (!t) return '…';
      const s = sym(t);
      let sign = '+', pre = '';
      if (s === '−') sign = '−';
      else if (s === '−i') { sign = '−'; pre = 'i·'; }
      else if (s === 'i') pre = 'i·';
      else if (s !== '' && s !== null) pre = s + '·';
      else if (s === null) pre = phaseText(t) + '·';
      const mag = niceMag(t.m);
      const coef = mag === '1' ? '' : (mag.includes('/') || mag.includes('√') ? `(${mag})·` : mag + '·');
      const body = pre + coef + ket(t.idx, n);
      return i === 0 ? (sign === '−' ? '−' : '') + body : `${sign} ${body}`;
    });
    out.push(parts.join(' '));
  }
  return { text: out.join(' '), terms };
}

// Строка вероятностей для таблицы: все исходы с ненулевой вероятностью или первые 2^k.
export function probRows(st, { hideZero = false, limit = 16 } = {}) {
  const rows = [];
  for (let i = 0; i < st.dim; i++) rows.push({ idx: i, p: st.prob(i), label: ket(i, st.n) });
  const nz = rows.filter((r) => r.p > 1e-9);
  const hiddenZero = rows.length - nz.length;
  if (hideZero || rows.length > limit) return { rows: nz.slice(0, limit), hiddenZero, total: rows.length };
  return { rows, hiddenZero: 0, total: rows.length };
}

export const pct = (p, digits = 0) => {
  const v = p * 100;
  const s = digits === 0 ? Math.round(v).toString() : v.toFixed(digits).replace('.', ',');
  return s + ' %';
};
