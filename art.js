// 關西七日帖・插畫（全部是內嵌 SVG，不需要外部圖檔）
const ART = (() => {
  const C = { ink: "#2a2c2f", sky: "#dfe3e6", cloud: "#ffffff", far: "#c3ccd3", mid: "#a9b8c3", sea: "#8eb3d1", city: "#8d9aa5",
    white: "#f6f5f2", blue: "#1f5aa6", green: "#17714a", red: "#d23a2c", yellow: "#f2c230", grey: "#6f7a83" };

  const cloud = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${C.cloud}">
    <circle cx="0" cy="0" r="18"/><circle cx="22" cy="-10" r="24"/><circle cx="50" cy="-2" r="20"/><rect x="-18" y="0" width="88" height="18" rx="9"/></g>`;

  function hero() {
    let windows = "", hangers = "", piers = "", zebra = "", bldg = "";
    for (let x = 16; x <= 400; x += 16) windows += `<rect x="${x}" y="391" width="9" height="6" rx="1.5"/>`;
    for (let x = 92; x < 296; x += 12) { const t = (x - 80) / 220, y = 205 + Math.sin(t * Math.PI) * 150; hangers += `<line x1="${x}" y1="${y.toFixed(1)}" x2="${x}" y2="380"/>`; }
    for (let x = 30; x < 1200; x += 90) piers += `<rect x="${x}" y="420" width="12" height="24"/>`;
    for (let x = 612; x < 732; x += 24) zebra += `<rect x="${x}" y="446" width="13" height="74"/>`;
    const bh = [46, 70, 38, 88, 56, 64, 30, 76, 50, 92, 40, 60, 72, 44, 58, 36, 80, 48];
    bh.forEach((h, i) => { const x = 560 + i * 34; if (x > 1180) return; bldg += `<rect x="${x}" y="${370 - h}" width="28" height="${h}"/>`; });
    return `<svg class="hero-art" viewBox="0 0 1200 520" preserveAspectRatio="xMidYMax slice" role="img" aria-label="插畫：明石海峽大橋、神戶港塔、京都塔、鳥居與新幹線，前景是道路、斑馬線和號誌">
  <rect width="1200" height="520" fill="${C.sky}"/>
  <g class="clouds">${cloud(140, 90)}${cloud(520, 60, .8)}${cloud(880, 120, 1.1)}${cloud(1080, 56, .7)}</g>
  <path d="M0 330 L120 270 L230 300 L360 240 L480 290 L600 250 L720 300 L860 230 L980 280 L1100 245 L1200 280 V520 H0Z" fill="${C.far}"/>
  <path d="M0 360 Q150 300 300 340 T600 330 T900 345 T1200 330 V520 H0Z" fill="${C.mid}"/>
  <rect x="0" y="352" width="440" height="70" fill="${C.sea}"/>
  <g stroke="#fff" stroke-opacity=".6" stroke-width="2" fill="none"><path d="M30 372h40M140 392h50M260 368h36M330 400h44"/></g>
  <g fill="${C.city}">${bldg}</g>
  <g fill="#fff" opacity=".55">${bh.map((h, i) => { const x = 566 + i * 34; return x > 1180 ? "" : `<rect x="${x}" y="${378 - h}" width="5" height="5"/><rect x="${x + 10}" y="${390 - h}" width="5" height="5"/>`; }).join("")}</g>
  <!-- Kobe Port Tower --><g transform="translate(120 0)">
  <path d="M505 222 L537 222 L528 300 L542 372 L500 372 L514 300Z" fill="${C.red}"/>
  <g stroke="#fff" stroke-width="1.6" opacity=".8"><path d="M509 244h24M512 268h18M513 322h16M508 346h26"/></g>
  <rect x="503" y="214" width="36" height="8" rx="2" fill="${C.ink}"/></g>
  <!-- Kyoto Tower --><g transform="translate(-230 0)">
  <rect x="1012" y="250" width="18" height="122" fill="${C.white}" stroke="${C.ink}" stroke-width="2"/>
  <path d="M1000 250 h42 l-6 -18 h-30z" fill="${C.white}" stroke="${C.ink}" stroke-width="2"/>
  <rect x="1004" y="236" width="34" height="5" fill="${C.red}"/>
  <path d="M1021 232 v-24" stroke="${C.ink}" stroke-width="3"/></g>
  <!-- torii -->
  <g fill="${C.red}"><path d="M830 292 Q870 300 910 292 L912 300 Q870 308 828 300Z"/><rect x="836" y="310" width="68" height="6"/><rect x="842" y="300" width="8" height="72"/><rect x="890" y="300" width="8" height="72"/></g>
  <!-- Akashi Kaikyo Bridge -->
  <g stroke="${C.ink}" fill="none">
    <path d="M-40 330 Q20 300 80 205 Q190 395 300 205 Q360 300 420 330" stroke-width="3"/>
    <g stroke-width="1.2">${hangers}</g>
    <rect x="74" y="196" width="12" height="190" fill="${C.ink}"/><rect x="294" y="196" width="12" height="190" fill="${C.ink}"/>
    <path d="M70 230h20M290 230h20M70 280h20M290 280h20" stroke="#dfe3e6" stroke-width="2"/>
    <rect x="-10" y="378" width="460" height="9" fill="${C.ink}"/>
  </g>
  <!-- guide sign -->
  <rect x="471" y="300" width="7" height="120" fill="${C.grey}"/>
  <g transform="translate(372 236)">
    <rect width="206" height="88" rx="8" fill="${C.blue}"/><rect x="4" y="4" width="198" height="80" rx="5" fill="none" stroke="#fff" stroke-width="2.5"/>
    <text x="22" y="38" font-family="Noto Sans TC, sans-serif" font-weight="700" font-size="22" fill="#fff">京都</text>
    <text x="22" y="56" font-family="Barlow, sans-serif" font-weight="600" font-size="12" fill="#fff">Kyoto</text>
    <path d="M92 52 V28 M84 36 L92 26 L100 36" stroke="#fff" stroke-width="4" fill="none" stroke-linejoin="round"/>
    <text x="118" y="38" font-family="Noto Sans TC, sans-serif" font-weight="700" font-size="22" fill="#fff">大阪</text>
    <text x="118" y="56" font-family="Barlow, sans-serif" font-weight="600" font-size="12" fill="#fff">Osaka</text>
    <path d="M118 70 H180 M172 63 L182 70 L172 77" stroke="#fff" stroke-width="4" fill="none" stroke-linejoin="round"/>
    <text x="22" y="76" font-family="Barlow Condensed, sans-serif" font-weight="700" font-size="14" fill="#fff">ROUTE 7</text>
  </g>
  <!-- viaduct + shinkansen -->
  <rect x="0" y="410" width="1200" height="10" fill="${C.grey}"/>
  <g fill="${C.grey}">${piers}</g>
  <g class="train">
    <path d="M0 410 L0 392 Q0 386 8 386 L420 386 Q470 386 520 404 L520 410 Z" fill="${C.white}" stroke="${C.ink}" stroke-width="2"/>
    <rect x="2" y="400" width="506" height="4" fill="${C.blue}"/>
    <g fill="${C.ink}">${windows}<path d="M440 389 Q470 390 488 397 L452 397Z"/></g>
    <path d="M130 386v24M260 386v24M390 386v24" stroke="${C.ink}" stroke-width="1.4"/>
    <g stroke="${C.ink}" stroke-width="2" stroke-linecap="round" opacity=".5"><path d="M-40 392h-30M-30 400h-50M-44 406h-24"/></g>
  </g>
  <!-- road -->
  <rect x="0" y="440" width="1200" height="6" fill="#c9c6bf"/>
  <rect x="0" y="446" width="1200" height="74" fill="${C.ink}"/>
  <g fill="#f6f5f2">${zebra}</g>
  <g fill="#f6f5f2"><rect x="0" y="463" width="600" height="0"/></g>
  <path d="M0 482 H600 M744 482 H1200" stroke="${C.yellow}" stroke-width="4"/>
  <path d="M0 464 H600 M744 464 H1200 M0 500 H600 M744 500 H1200" stroke="#f6f5f2" stroke-width="3" stroke-dasharray="28 22"/>
  <!-- signal (Japanese horizontal: green / yellow / red) -->
  <rect x="1104" y="250" width="9" height="196" fill="#3a3d41"/>
  <rect x="980" y="258" width="130" height="6" fill="#3a3d41"/>
  <g transform="translate(944 244)">
    <rect width="112" height="38" rx="8" fill="${C.ink}"/>
    <circle class="sig g" cx="20" cy="19" r="11" fill="#1fbf6b"/><circle class="sig y" cx="56" cy="19" r="11" fill="#574f2c"/><circle class="sig r" cx="92" cy="19" r="11" fill="#57302c"/>
  </g>
</svg>`;
  }

  // ---- six vehicle avatars (viewBox 120×120) ----
  const V = {
    shinkansen: `<path d="M8 86 V66 Q8 60 14 60 H66 Q96 60 112 80 V86 Z" fill="#f6f5f2" stroke="#2a2c2f" stroke-width="3"/><rect x="10" y="76" width="98" height="5" fill="#1f5aa6"/><g fill="#2a2c2f"><rect x="16" y="65" width="9" height="7" rx="2"/><rect x="30" y="65" width="9" height="7" rx="2"/><rect x="44" y="65" width="9" height="7" rx="2"/><path d="M76 64 Q92 65 102 74 H80Z"/></g><circle cx="26" cy="90" r="5" fill="#2a2c2f"/><circle cx="88" cy="90" r="5" fill="#2a2c2f"/>`,
    tram: `<path d="M50 40 L60 26 L70 40" stroke="#2a2c2f" stroke-width="3" fill="none"/><path d="M40 26h40" stroke="#2a2c2f" stroke-width="3"/><rect x="22" y="40" width="76" height="48" rx="8" fill="#e9e2c8" stroke="#2a2c2f" stroke-width="3"/><rect x="22" y="70" width="76" height="18" fill="#17714a"/><rect x="22" y="40" width="76" height="48" rx="8" fill="none" stroke="#2a2c2f" stroke-width="3"/><g fill="#2a2c2f"><rect x="30" y="48" width="16" height="14" rx="2"/><rect x="52" y="48" width="16" height="14" rx="2"/><rect x="74" y="48" width="16" height="14" rx="2"/></g><circle cx="38" cy="92" r="5" fill="#2a2c2f"/><circle cx="82" cy="92" r="5" fill="#2a2c2f"/>`,
    ropeway: `<path d="M4 26 L116 18" stroke="#2a2c2f" stroke-width="3"/><circle cx="60" cy="22" r="5" fill="#2a2c2f"/><path d="M60 24 V42" stroke="#2a2c2f" stroke-width="3"/><path d="M30 44 h60 l6 42 q0 6 -6 6 h-60 q-6 0 -6 -6z" fill="#d23a2c" stroke="#2a2c2f" stroke-width="3"/><rect x="32" y="52" width="56" height="20" rx="3" fill="#f6f5f2" stroke="#2a2c2f" stroke-width="2"/><path d="M60 52v20" stroke="#2a2c2f" stroke-width="2"/>`,
    taxi: `<rect x="50" y="34" width="20" height="9" rx="2" fill="#f2c230" stroke="#2a2c2f" stroke-width="2.5"/><path d="M20 70 L32 46 Q34 42 40 42 H80 Q86 42 88 46 L100 70 Z" fill="#26324d" stroke="#2a2c2f" stroke-width="3"/><path d="M38 66 L44 50 H76 L82 66Z" fill="#bcd3e6"/><path d="M60 50v16" stroke="#26324d" stroke-width="3"/><rect x="14" y="68" width="92" height="20" rx="6" fill="#26324d" stroke="#2a2c2f" stroke-width="3"/><circle cx="24" cy="78" r="4" fill="#f2c230"/><circle cx="96" cy="78" r="4" fill="#f2c230"/><circle cx="36" cy="90" r="7" fill="#2a2c2f"/><circle cx="84" cy="90" r="7" fill="#2a2c2f"/>`,
    bus: `<rect x="14" y="36" width="92" height="50" rx="8" fill="#f2c230" stroke="#2a2c2f" stroke-width="3"/><rect x="14" y="70" width="92" height="8" fill="#2a2c2f" opacity=".85"/><g fill="#f6f5f2" stroke="#2a2c2f" stroke-width="2"><rect x="22" y="44" width="18" height="18" rx="2"/><rect x="44" y="44" width="18" height="18" rx="2"/><rect x="66" y="44" width="18" height="18" rx="2"/><rect x="88" y="44" width="12" height="28" rx="2"/></g><circle cx="34" cy="90" r="7" fill="#2a2c2f"/><circle cx="86" cy="90" r="7" fill="#2a2c2f"/>`,
    plane: `<path d="M12 64 Q12 56 22 56 H92 Q110 56 112 64 Q110 72 92 72 H22 Q12 72 12 64Z" fill="#f6f5f2" stroke="#2a2c2f" stroke-width="3"/><path d="M52 58 L70 26 H80 L74 58Z" fill="#6b4fa0" stroke="#2a2c2f" stroke-width="2.5"/><path d="M52 70 L70 100 H80 L74 70Z" fill="#6b4fa0" stroke="#2a2c2f" stroke-width="2.5"/><path d="M14 58 L8 40 H18 L28 56" fill="#6b4fa0" stroke="#2a2c2f" stroke-width="2.5"/><g fill="#2a2c2f"><circle cx="36" cy="62" r="2.4"/><circle cx="44" cy="62" r="2.4"/><circle cx="86" cy="62" r="2.4"/><path d="M98 60 Q106 61 108 64 H98Z"/></g>`,
  };
  function avatar(m, size = 96, extra = "") {
    return `<svg class="ava ${extra}" width="${size}" height="${size}" viewBox="0 0 120 120" role="img" aria-label="${m.name}的角色：${m.role}">
      <circle cx="60" cy="60" r="58" fill="${m.color}"/><circle cx="60" cy="60" r="50" fill="#f6f5f2"/>
      <path d="M10 100 H110" stroke="#2a2c2f" stroke-width="3"/><path d="M14 106 H34 M48 106 H72 M86 106 H106" stroke="#2a2c2f" stroke-width="2" opacity=".35"/>
      <clipPath id="cp-${m.id}-${size}"><circle cx="60" cy="60" r="50"/></clipPath>
      <g clip-path="url(#cp-${m.id}-${size})">${V[m.vehicle] || ""}</g>
    </svg>`;
  }

  // route shield used for day numbers
  const shield = (n, cls = "") => `<svg class="shield ${cls}" viewBox="0 0 40 44" aria-hidden="true"><path d="M4 4h32v22c0 8-7 13-16 16C11 39 4 34 4 26Z" fill="#1f5aa6" stroke="#fff" stroke-width="2.4"/><text x="20" y="30" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-weight="800" font-size="22" fill="#fff">${n}</text></svg>`;

  // warning-sign diamond for "交通豆知識"
  const warn = `<svg class="warn" viewBox="0 0 40 40" aria-hidden="true"><rect x="6" y="6" width="28" height="28" rx="3" transform="rotate(45 20 20)" fill="#f2c230" stroke="#2a2c2f" stroke-width="2.5"/><text x="20" y="27" text-anchor="middle" font-family="Barlow Condensed" font-weight="800" font-size="20" fill="#2a2c2f">!</text></svg>`;

  // game card art
  const games = {
    A: `<svg viewBox="0 0 160 100" aria-hidden="true"><rect width="160" height="100" fill="#151a2e"/><path d="M0 100 L0 80 Q40 66 80 78 T160 74 V100Z" fill="#24304a"/><g fill="#f2c230"><path d="M40 30l3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1z"/><path d="M110 18l2 5 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1z"/><circle cx="80" cy="50" r="2"/><circle cx="130" cy="46" r="2"/></g><path d="M66 82 Q80 94 94 82" stroke="#f6f5f2" stroke-width="3" fill="none"/></svg>`,
    B: `<svg viewBox="0 0 160 100" aria-hidden="true"><rect width="160" height="100" fill="#f6f5f2"/><g fill="#d23a2c">${[0, 1, 2, 3].map(i => { const s = 1 - i * .2, w = 80 * s, x = 80 - w / 2, y = 18 + i * 8; return `<g opacity="${1 - i * .2}"><rect x="${x - 6 * s}" y="${y}" width="${w + 12 * s}" height="${6 * s}"/><rect x="${x + 4 * s}" y="${y}" width="${6 * s}" height="${70 * s}"/><rect x="${x + w - 10 * s}" y="${y}" width="${6 * s}" height="${70 * s}"/></g>`; }).join("")}</g><rect x="20" y="86" width="120" height="6" fill="#c9c6bf"/><rect x="62" y="84" width="36" height="10" fill="#1fbf6b"/></svg>`,
    C: `<svg viewBox="0 0 160 100" aria-hidden="true"><rect width="160" height="100" fill="#e9e7e2"/><path d="M0 28 H160 V36 H0Z" fill="#2a2c2f"/><g fill="#d23a2c"><path d="M10 36h20l-4 10h-12z"/><path d="M50 36h20l-4 10h-12z"/><path d="M90 36h20l-4 10h-12z"/><path d="M130 36h20l-4 10h-12z"/></g><g font-family="Noto Sans TC" font-weight="900" font-size="22" fill="#2a2c2f"><text x="18" y="82">串</text><text x="62" y="82">玉</text><text x="106" y="82">茶</text></g></svg>`,
  };

  return { hero, avatar, shield, warn, games };
})();
