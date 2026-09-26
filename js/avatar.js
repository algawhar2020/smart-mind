/* العقل الذكي — رسم الشخصيات بصيغة SVG متحركة (تصاميم أصلية) */
window.SM = window.SM || {};
(function () {
  let uid = 0;
  const BEAK = '#FFD34D';

  function defs(id, c) {
    return `<defs>
      <radialGradient id="b${id}" cx="40%" cy="35%" r="75%">
        <stop offset="0" stop-color="#ffffff" stop-opacity=".9"/>
        <stop offset=".18" stop-color="${c.color}"/>
        <stop offset="1" stop-color="${c.color2}"/>
      </radialGradient>
      <linearGradient id="p${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${c.color}" stop-opacity=".95"/>
        <stop offset="1" stop-color="${c.color2}" stop-opacity=".35"/>
      </linearGradient>
      <filter id="g${id}" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3.2" result="bl"/>
        <feMerge><feMergeNode in="bl"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>`;
  }

  // عين عامة: مفتوحة + مغلقة سعيدة + ذهول
  function eye(cx, cy, r, c, circuit) {
    const pupil = r * 0.48;
    let ring = '';
    if (circuit) {
      ring = `<circle cx="${cx}" cy="${cy}" r="${r * 0.78}" fill="none" stroke="${c.color}" stroke-width="1.6" stroke-dasharray="4 3" class="sm-spin" style="transform-origin:${cx}px ${cy}px"/>`;
    }
    return `<g class="sm-eye" style="transform-origin:${cx}px ${cy}px">
      <g class="eo">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="#0B1030" stroke="#fff" stroke-width="2.4"/>
        ${ring}
        <g class="pupil"><circle cx="${cx}" cy="${cy}" r="${pupil}" fill="${c.color}" filter="url(#gF)"/>
        <circle cx="${cx - pupil * 0.35}" cy="${cy - pupil * 0.4}" r="${pupil * 0.35}" fill="#fff"/></g>
      </g>
      <path class="eh" d="M${cx - r * 0.8} ${cy + 2} Q${cx} ${cy - r * 0.9} ${cx + r * 0.8} ${cy + 2}" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
    </g>`;
  }

  function mouth(cx, cy, w, color) {
    return `<g class="sm-mouth" style="transform-origin:${cx}px ${cy}px">
      <path class="ms" d="M${cx - w} ${cy} Q${cx} ${cy + w * 0.9} ${cx + w} ${cy}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
      <ellipse class="mt" cx="${cx}" cy="${cy + 2}" rx="${w * 0.6}" ry="${w * 0.55}" fill="#0B1030" stroke="${color}" stroke-width="2"/>
      <path class="msad" d="M${cx - w * 0.8} ${cy + 5} Q${cx} ${cy - w * 0.4} ${cx + w * 0.8} ${cy + 5}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
    </g>`;
  }

  function cheeks(x1, x2, y, color) {
    return `<g class="sm-cheek"><ellipse cx="${x1}" cy="${y}" rx="7" ry="4" fill="${color}" opacity=".45"/><ellipse cx="${x2}" cy="${y}" rx="7" ry="4" fill="${color}" opacity=".45"/></g>`;
  }

  function beak(cx, cy, s) {
    return `<g class="sm-mouth sm-beak" style="transform-origin:${cx}px ${cy}px"><path d="M${cx - s} ${cy} L${cx + s} ${cy} L${cx} ${cy + s * 1.5}Z" fill="${BEAK}" stroke="#fff" stroke-width="1.2"/><path class="mt" d="M${cx - s * .7} ${cy + s * .9} L${cx + s * .7} ${cy + s * .9} L${cx} ${cy + s * 2}Z" fill="${BEAK}" opacity=".9"/></g>`;
  }

  function sparks(c, n, rad, cx, cy) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + 0.4, x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad;
      s += `<path class="sm-spark" style="animation-delay:${(i * 0.37).toFixed(2)}s" d="M${x} ${y - 7} L${x - 3} ${y} L${x + 1} ${y} L${x - 2} ${y + 7} L${x + 4} ${y - 2} L${x} ${y - 2}Z" fill="#fff" stroke="${c.color}" stroke-width="1.2"/>`;
    }
    return s;
  }

  function particles(c, n) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const x = 30 + ((i * 53) % 140), y = 150 - ((i * 37) % 90);
      s += `<circle class="sm-mote" style="animation-delay:${(i * 0.6).toFixed(1)}s" cx="${x}" cy="${y}" r="${1.5 + (i % 3)}" fill="${c.color}"/>`;
    }
    return s;
  }

  /* ========== ثاقب ========== */
  function thaqib(c, st, id) {
    const B = `url(#b${id})`, P = `url(#p${id})`;
    const circuitLines = (cx, cy, dir) => `<path d="M${cx + dir * 14} ${cy + 10} l${dir * 10} 8 h${dir * 10}" stroke="#fff" stroke-opacity=".7" stroke-width="1.5" fill="none"/><circle cx="${cx + dir * 34}" cy="${cy + 18}" r="2.2" fill="#fff"/>`;
    if (st === 0) {
      return `<ellipse cx="100" cy="182" rx="40" ry="6" fill="${c.color}" opacity=".18" class="sm-shadow"/>
      <g class="sm-body">
        <path d="M92 58 Q100 40 108 58" fill="${c.color}" stroke="#fff" stroke-width="1.5"/>
        <circle cx="100" cy="112" r="58" fill="${B}" stroke="#fff" stroke-opacity=".6" stroke-width="2" filter="url(#g${id})"/>
        <path d="M60 140 Q100 170 140 140" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2" stroke-dasharray="3 5"/>
        ${circuitLines(78, 104, -1)}${circuitLines(122, 104, 1)}
        ${eye(78, 104, 17, c, true)}${eye(122, 104, 17, c, true)}
        ${beak(100, 124, 7)}
        ${cheeks(68, 132, 130, '#ff7bd5')}
        <path d="M86 168 v10 M80 178 h12 M114 168 v10 M108 178 h12" stroke="${BEAK}" stroke-width="3" stroke-linecap="round"/>
      </g>`;
    }
    const big = st === 2;
    const k = big ? 1.12 : 1;
    const rings = big ? `<g class="sm-orbit" style="transform-origin:100px 108px">
        <ellipse cx="100" cy="108" rx="92" ry="26" fill="none" stroke="${c.color}" stroke-width="2" stroke-dasharray="10 6" opacity=".85"/>
        <circle cx="8" cy="108" r="4" fill="#fff"/><rect x="186" y="104" width="8" height="8" fill="${c.color}"/></g>
        <g class="sm-orbit2" style="transform-origin:100px 108px">
        <ellipse cx="100" cy="108" rx="80" ry="40" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.4" stroke-dasharray="2 5" transform="rotate(-25 100 108)"/>
        <text x="30" y="60" fill="${c.color}" font-size="9" font-family="monospace">1011</text><text x="150" y="165" fill="${c.color}" font-size="9" font-family="monospace">0110</text></g>` : '';
    const wing = (dir) => {
      const x = 100 + dir * 48 * k;
      return `<g class="sm-wing sm-wing${dir > 0 ? 'r' : 'l'}" style="transform-origin:${100 + dir * 40 * k}px 100px">
        <path d="M${100 + dir * 40 * k} 88 L${x + dir * 26} 104 L${x + dir * 20} 150 L${100 + dir * 36 * k} 150Z" fill="${P}" stroke="#fff" stroke-width="1.5" stroke-opacity=".8"/>
        <path d="M${100 + dir * 42 * k} 108 H${x + dir * 22} M${100 + dir * 40 * k} 124 H${x + dir * 21} M${100 + dir * 38 * k} 140 H${x + dir * 20}" stroke="#fff" stroke-opacity=".55" stroke-width="1.2"/></g>`;
    };
    return `<ellipse cx="100" cy="186" rx="${46 * k}" ry="6" fill="${c.color}" opacity=".18" class="sm-shadow"/>
      ${big ? rings : ''}
      <g class="sm-body">
        ${wing(-1)}${wing(1)}
        <path d="M${100 - 36 * k} ${62 - (k - 1) * 40} L${100 - 44 * k} ${34 - (k - 1) * 50} L${100 - 18 * k} ${52 - (k - 1) * 40}Z M${100 + 36 * k} ${62 - (k - 1) * 40} L${100 + 44 * k} ${34 - (k - 1) * 50} L${100 + 18 * k} ${52 - (k - 1) * 40}Z" fill="${c.color}" stroke="#fff" stroke-width="1.5"/>
        <ellipse cx="100" cy="${112 - (k - 1) * 20}" rx="${46 * k}" ry="${62 * k}" fill="${B}" stroke="#fff" stroke-opacity=".6" stroke-width="2" filter="url(#g${id})"/>
        <path d="M84 140 l8 6 l8 -6 l8 6 l8 -6 M84 154 l8 6 l8 -6 l8 6 l8 -6" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.6"/>
        ${big ? `<path d="M100 164 l8 4.5 v9 l-8 4.5 l-8 -4.5 v-9Z" fill="#0B1030" stroke="#fff" stroke-width="1.5"/><circle cx="100" cy="173" r="3" fill="${c.color}" class="sm-pulse"/>` : ''}
        ${big ? `<path d="M66 80 L92 88 M134 80 L108 88" stroke="#fff" stroke-width="3" stroke-linecap="round" class="sm-brow"/>` : ''}
        ${circuitLines(80, 100, -1)}${circuitLines(120, 100, 1)}
        ${eye(80, 100, 18, c, true)}${eye(120, 100, 18, c, true)}
        ${beak(100, 118, 7)}
        <path d="M86 172 v10 M80 182 h12 M114 172 v10 M108 182 h12" stroke="${BEAK}" stroke-width="3" stroke-linecap="round"/>
      </g>`;
  }

  /* ========== غصن ========== */
  function leaf(x, y, len, ang, c, cls = '') {
    return `<g transform="translate(${x} ${y}) rotate(${ang})" class="${cls}"><path d="M0 0 Q${len * 0.5} ${-len * 0.45} ${len} 0 Q${len * 0.5} ${len * 0.45} 0 0Z" fill="url(#lf)" stroke="#fff" stroke-width="1.2" stroke-opacity=".8"/><path d="M2 0 H${len * 0.85}" stroke="#fff" stroke-opacity=".6" stroke-width="1"/></g>`;
  }
  function ghusn(c, st, id) {
    const B = `url(#b${id})`;
    const lf = `<defs><linearGradient id="lf" x1="0" x2="1"><stop offset="0" stop-color="${c.color}"/><stop offset="1" stop-color="${c.color2}"/></linearGradient></defs>`;
    if (st === 0) {
      return lf + `<ellipse cx="100" cy="182" rx="34" ry="6" fill="${c.color}" opacity=".18" class="sm-shadow"/>
      ${particles(c, 7)}
      <g class="sm-body">
        <path d="M100 76 Q98 60 100 48" stroke="${c.color}" stroke-width="3" fill="none"/>
        <g class="sm-sprout" style="transform-origin:100px 50px">${leaf(100, 50, 26, -150, c)}${leaf(100, 50, 30, -30, c)}</g>
        <path d="M100 70 C148 70 150 170 100 172 C50 170 52 70 100 70Z" fill="${B}" stroke="#fff" stroke-opacity=".6" stroke-width="2" filter="url(#g${id})"/>
        <path d="M80 94 Q76 130 90 158" stroke="#fff" stroke-opacity=".35" stroke-width="3" fill="none"/>
        ${eye(86, 122, 12, c)}${eye(114, 122, 12, c)}
        ${mouth(100, 142, 7, '#fff')}
        ${cheeks(76, 124, 140, '#ffe14d')}
      </g>`;
    }
    const big = st === 2, k = big ? 1.15 : 1;
    const vines = big ? `<g class="sm-vines" fill="none" stroke="${c.color}" stroke-width="2.5" stroke-linecap="round" filter="url(#g${id})">
        <path d="M20 180 C40 120 10 90 40 50 C55 30 70 40 62 55"/><path d="M180 180 C160 120 190 90 160 50 C145 30 130 40 138 55"/>
      </g>${leaf(40, 50, 14, -60, c)}${leaf(160, 50, 14, -120, c)}${leaf(24, 120, 14, 200, c)}${leaf(178, 120, 14, -20, c)}` : '';
    return lf + `<ellipse cx="100" cy="186" rx="${44 * k}" ry="6" fill="${c.color}" opacity=".18" class="sm-shadow"/>
      ${vines}${particles(c, big ? 9 : 5)}
      <g class="sm-body">
        <g class="sm-tail" style="transform-origin:130px 160px"><path d="M125 160 Q165 170 170 140" stroke="${c.color2}" stroke-width="${10 * k}" fill="none" stroke-linecap="round"/>${leaf(168, 142, 22 * k, -70, c)}</g>
        <g class="sm-wing sm-wingl" style="transform-origin:72px 120px">${leaf(72, 120, 44 * k, -150, c)}${leaf(72, 126, 34 * k, -175, c)}</g>
        <g class="sm-wing sm-wingr" style="transform-origin:128px 120px">${leaf(128, 120, 44 * k, -30, c)}${leaf(128, 126, 34 * k, -5, c)}</g>
        <ellipse cx="100" cy="146" rx="${34 * k}" ry="${32 * k}" fill="${B}" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>
        <ellipse cx="100" cy="152" rx="${20 * k}" ry="${20 * k}" fill="#eaffd9" opacity=".35"/>
        <path d="M84 176 v8 M116 176 v8" stroke="${c.color2}" stroke-width="8" stroke-linecap="round"/>
        <g class="sm-horns">${leaf(80, 64, 26 * k, -110, c)}${leaf(120, 64, 26 * k, -70, c)}${big ? leaf(100, 56, 22, -90, c) : ''}</g>
        <ellipse cx="100" cy="94" rx="${44 * k}" ry="${36 * k}" fill="${B}" stroke="#fff" stroke-opacity=".6" stroke-width="2" filter="url(#g${id})"/>
        <ellipse cx="100" cy="108" rx="18" ry="11" fill="#eaffd9" opacity=".4"/>
        <circle cx="94" cy="106" r="1.8" fill="#0B1030"/><circle cx="106" cy="106" r="1.8" fill="#0B1030"/>
        ${eye(82, 90, 13, c)}${eye(118, 90, 13, c)}
        ${mouth(100, 114, 8, '#fff')}
        ${cheeks(68, 132, 104, '#ffe14d')}
      </g>`;
  }

  /* ========== رعد ========== */
  function mane(cx, cy, r1, r2, n, c, id) {
    let d = '';
    for (let i = 0; i <= n * 2; i++) {
      const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? r1 : r2;
      d += (i ? 'L' : 'M') + (cx + Math.cos(a) * r).toFixed(1) + ' ' + (cy + Math.sin(a) * r).toFixed(1) + ' ';
    }
    return `<path class="sm-mane" style="transform-origin:${cx}px ${cy}px" d="${d}Z" fill="url(#p${id})" stroke="#fff" stroke-width="1.5" stroke-linejoin="round" filter="url(#g${id})"/>`;
  }
  function raad(c, st, id) {
    const B = `url(#b${id})`;
    const ears = (y, s) => `<path d="M${100 - 40 * s} ${y + 14} L${100 - 44 * s} ${y - 26 * s} L${100 - 14 * s} ${y}Z M${100 + 40 * s} ${y + 14} L${100 + 44 * s} ${y - 26 * s} L${100 + 14 * s} ${y}Z" fill="${c.color}" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/><path d="M${100 - 36 * s} ${y + 6} L${100 - 38 * s} ${y - 14 * s} L${100 - 22 * s} ${y}Z M${100 + 36 * s} ${y + 6} L${100 + 38 * s} ${y - 14 * s} L${100 + 22 * s} ${y}Z" fill="#ff9ef0" opacity=".7"/>`;
    const whisk = (y) => `<path d="M64 ${y} H44 M64 ${y + 6} L46 ${y + 12} M136 ${y} H156 M136 ${y + 6} L154 ${y + 12}" stroke="#fff" stroke-opacity=".7" stroke-width="1.5"/>`;
    const nose = (y) => `<path d="M94 ${y} H106 L100 ${y + 6}Z" fill="#ff9ef0" stroke="#fff" stroke-width="1"/>`;
    if (st === 0) {
      return `<ellipse cx="100" cy="182" rx="38" ry="6" fill="${c.color}" opacity=".18" class="sm-shadow"/>
      ${sparks(c, 6, 76, 100, 112)}
      <g class="sm-body">
        <g class="sm-tail" style="transform-origin:130px 160px"><path d="M130 160 Q170 150 160 118 L168 122" stroke="${c.color}" stroke-width="7" fill="none" stroke-linecap="round"/></g>
        <ellipse cx="100" cy="156" rx="34" ry="24" fill="${B}" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>
        <path d="M84 176 v6 M116 176 v6" stroke="${c.color2}" stroke-width="9" stroke-linecap="round"/>
        ${ears(80, 1)}
        <circle cx="100" cy="106" r="46" fill="${B}" stroke="#fff" stroke-opacity=".6" stroke-width="2" filter="url(#g${id})"/>
        <path d="M100 64 l-5 10 h7 l-5 10" stroke="#fff" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
        ${eye(82, 104, 13, c)}${eye(118, 104, 13, c)}
        ${nose(118)}${mouth(100, 128, 7, '#fff')}${whisk(120)}
      </g>`;
    }
    const big = st === 2, k = big ? 1.1 : 1;
    const armor = big ? `<path d="M76 70 L100 60 L124 70 L118 82 L100 76 L82 82Z" fill="#1a0f3a" stroke="${c.color}" stroke-width="2"/>
      <path d="M100 62 l-4 8 h6 l-4 8" stroke="#fff" stroke-width="2" fill="none" class="sm-pulse"/>
      <path d="M58 112 L66 128 L58 140 M142 112 L134 128 L142 140" stroke="${c.color}" stroke-width="4" fill="none" stroke-linejoin="round"/>` : '';
    const body = big
      ? `<path d="M56 150 Q100 120 144 150 L150 186 H50Z" fill="#1a0f3a" stroke="${c.color}" stroke-width="2.5"/><path d="M100 138 l10 8 v14 l-10 8 l-10 -8 v-14Z" fill="${c.color}" stroke="#fff" stroke-width="1.5" class="sm-pulse"/><path d="M60 158 L80 150 M140 158 L120 150" stroke="#fff" stroke-opacity=".6" stroke-width="2"/>`
      : `<ellipse cx="100" cy="158" rx="38" ry="26" fill="${B}" stroke="#fff" stroke-opacity=".5" stroke-width="2"/><path d="M82 180 v6 M118 180 v6" stroke="${c.color2}" stroke-width="10" stroke-linecap="round"/>`;
    return `<ellipse cx="100" cy="188" rx="${48 * k}" ry="6" fill="${c.color}" opacity=".18" class="sm-shadow"/>
      ${sparks(c, big ? 8 : 5, big ? 88 : 80, 100, 104)}
      <g class="sm-body">
        <g class="sm-tail" style="transform-origin:130px 160px"><path d="M134 164 Q178 160 168 120" stroke="${c.color}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M168 122 l-8 -6 l10 -2 l-6 -10" stroke="#fff" stroke-width="2.5" fill="none"/></g>
        ${body}
        ${mane(100, 102, big ? 58 : 50, big ? 82 : 66, big ? 14 : 10, c, id)}
        ${ears(70, 0.9)}
        <circle cx="100" cy="104" r="${42 * k}" fill="${B}" stroke="#fff" stroke-opacity=".6" stroke-width="2"/>
        ${armor}
        ${big ? `<path d="M68 90 L92 98 M132 90 L108 98" stroke="#fff" stroke-width="3.5" stroke-linecap="round" class="sm-brow"/>` : ''}
        ${eye(82, 104, 12, c)}${eye(118, 104, 12, c)}
        ${nose(118)}${mouth(100, 130, 8, '#fff')}${whisk(122)}
      </g>`;
  }

  const DRAW = { thaqib, ghusn, raad };

  SM.avatarSVG = function (charId, stage, opts = {}) {
    const c = SM.CHARACTERS[charId];
    const id = 'a' + (++uid);
    const inner = DRAW[charId](c, stage, id).replace(/url\(#gF\)/g, `url(#g${id})`);
    return `<svg class="sm-avatar ${opts.static ? 'static' : ''}" data-char="${charId}" data-stage="${stage}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${c.stages[stage]}">
      ${defs(id, c)}${inner}
      <g class="sm-fx"><text class="fx-think" x="150" y="40" font-size="26" fill="#fff">…</text>
      <text class="fx-love" x="146" y="48" font-size="22">💗</text><text class="fx-zz" x="150" y="40" font-size="20" fill="#fff">!</text></g>
    </svg>`;
  };
})();
