// 關西七日帖・主程式（hash 路由的多頁網站）
(() => {
"use strict";
const CFG = window.KANSAI_CONFIG || {};
const KEY_GM = CFG.googleMapsApiKey || "";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const app = $("#app");

/* ================= storage (per device, per member) ================= */
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
};
let meId = LS.get("k7.me", null);
if (!MEMBERS.some(m => m.id === meId)) meId = null;
const member = id => MEMBERS.find(m => m.id === id);
const rec = id => { const r = LS.get("k7.rec." + id, {}) || {}; return { stamps: r.stamps || {}, best: r.best || {}, notes: r.notes || {} }; };
const saveRec = (id, r) => LS.set("k7.rec." + id, r);
const stampCount = id => MAP_IDS.filter(s => rec(id).stamps[s]).length;

/* ================= helpers ================= */
const fmtDT = t => { const d = new Date(t); return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };
const dayStops = d => d.items.filter(i => i.k === "stop");
const daySpots = d => [...new Set(dayStops(d).filter(i => SPOTS[i.spot].onMap).map(i => i.spot))];
const stopNo = (spotId) => (STOPS.find(s => s.spot === spotId) || {}).n;
const firstChar = id => esc((SPOTS[id].seal || SPOTS[id].short || "？")[0]);
const ph = (id, cls = "") => `<span class="ph ${cls}" data-ph="${id}" role="img" aria-label="${esc(SPOTS[id].name)}">${firstChar(id)}</span>`;
const crumbs = list => `<nav class="crumbs wrap" aria-label="目前位置">${list.map((c, i) => i === list.length - 1
  ? `<span aria-current="page">${esc(c[0])}</span>` : `<a href="${c[1]}">${esc(c[0])}</a><span class="sep" aria-hidden="true"></span>`).join("")}</nav>`;
function dayProgress(d, id) { const ids = daySpots(d); if (!id || !ids.length) return 0; const st = rec(id).stamps; return ids.filter(s => st[s]).length / ids.length; }

function stampSVG(id, cls = "", when) {
  const s = SPOTS[id], v = STOPS.find(x => x.spot === id);
  const chars = [...(s.seal || "印")];
  const fs = chars.length <= 1 ? 30 : chars.length === 2 ? 22 : 16;
  const step = fs * 1.05, y0 = 47 - (chars.length - 1) * step / 2 + fs * .36;
  const date = when ? (() => { const d = new Date(when); return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`; })() : `2027.${v ? v.day.date.replace("/", ".") : ""}`;
  return `<svg class="stamp ${cls}" viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="3"/>
    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="1"/>
    ${chars.map((c, i) => `<text x="50" y="${y0 + i * step}" text-anchor="middle" font-family="Noto Sans TC,sans-serif" font-weight="900" font-size="${fs}" fill="currentColor">${esc(c)}</text>`).join("")}
    <text x="50" y="84" text-anchor="middle" font-family="Barlow Condensed,sans-serif" font-weight="600" font-size="8" fill="currentColor" letter-spacing=".5">${date}</text>
  </svg>`;
}

/* ================= photos (Wikipedia page images, loaded in the browser) ================= */
const PHOTO = {};
const PKEY = "k7.photos.v1";
(() => { const c = LS.get(PKEY, null); if (c && Date.now() - c.t < 7 * 864e5) Object.assign(PHOTO, c.p); })();
async function loadPhotos() {
  if (Object.keys(PHOTO).length >= Object.keys(GEO).length - 2) return applyPhotos();
  const titles = [...new Set(Object.values(SPOTS).flatMap(s => s.wiki || []))];
  const url = "https://ja.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&prop=pageimages&piprop=thumbnail%7Cname&pithumbsize=800&titles=" + encodeURIComponent(titles.join("|"));
  try {
    const j = await (await fetch(url)).json(), q = j.query || {};
    const alias = {}; (q.normalized || []).concat(q.redirects || []).forEach(r => alias[r.from] = r.to);
    const res = t => { let k = t, n = 0; while (alias[k] && n++ < 4) k = alias[k]; return k; };
    const byTitle = {}; Object.values(q.pages || {}).forEach(p => { if (p.thumbnail) byTitle[p.title] = { src: p.thumbnail.source, file: p.pageimage, title: p.title }; });
    Object.entries(SPOTS).forEach(([id, s]) => { for (const t of s.wiki || []) { const hit = byTitle[res(t)]; if (hit) { PHOTO[id] = hit; break; } } });
    LS.set(PKEY, { t: Date.now(), p: PHOTO });
  } catch (e) { console.warn("photo load failed", e); }
  applyPhotos();
}
function applyPhotos(root = document) {
  $$("[data-ph]", root).forEach(el => { const p = PHOTO[el.dataset.ph]; if (p && !el.dataset.ok) { el.style.backgroundImage = `url("${p.src.replace(/"/g, "%22")}")`; el.textContent = ""; el.dataset.ok = 1; } });
  $$("[data-credit]", root).forEach(el => { const p = PHOTO[el.dataset.credit]; if (p) { el.hidden = false; el.innerHTML = `照片：<a href="https://ja.wikipedia.org/wiki/File:${encodeURIComponent(p.file || "")}" target="_blank" rel="noopener">維基百科「${esc(p.title)}」</a>`; } });
}

/* ================= Google Maps links & live times ================= */
const MODES = [["transit", "大眾運輸"], ["driving", "開車"], ["walking", "步行"]];
const routeURL = (a, b, mode) => `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(SPOTS[a].q)}&destination=${encodeURIComponent(SPOTS[b].q)}&travelmode=${mode}`;
const placeURL = id => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SPOTS[id].q)}`;
const embedURL = (id, z = 15) => { const s = SPOTS[id]; return `https://maps.google.com/maps?q=${encodeURIComponent(s.q)}&ll=${s.lat},${s.lng}&z=${z}&hl=zh-TW&output=embed`; };
function legHTML(day, mv) {
  const i = day.items.indexOf(mv), prev = day.items[i - 1], next = day.items[i + 1];
  const mode = mv.mode === "car" ? "driving" : "transit", label = mv.mode === "car" ? "車程" : "大眾運輸";
  const ok = prev && next && prev.spot !== next.spot && SPOTS[prev.spot].onMap && SPOTS[next.spot].onMap;
  if (!ok) return `<span class="leg"><span>${label}　${esc(mv.dur)}</span></span>`;
  return `<a class="leg" href="${routeURL(prev.spot, next.spot, mode)}" target="_blank" rel="noopener" title="在 Google Maps 查 ${esc(SPOTS[prev.spot].short)} → ${esc(SPOTS[next.spot].short)}">
    <span class="lt">${label}　${esc(mv.dur)}</span><span class="gm">Google Maps 路線 ↗</span>
    ${KEY_GM ? `<span class="live" data-from="${prev.spot}" data-to="${next.spot}">即時查詢中…</span>` : ""}</a>`;
}
const LIVE = new Map();
const VEH = { SUBWAY: "地鐵", HEAVY_RAIL: "JR／鐵路", COMMUTER_TRAIN: "電車", HIGH_SPEED_TRAIN: "新幹線", LONG_DISTANCE_TRAIN: "鐵路", RAIL: "鐵路", METRO_RAIL: "地鐵", MONORAIL: "單軌", TRAM: "路面電車", LIGHT_RAIL: "輕軌", BUS: "公車", INTERCITY_BUS: "巴士", TROLLEYBUS: "公車", FUNICULAR: "纜車", GONDOLA_LIFT: "空中纜車", CABLE_CAR: "纜車", FERRY: "渡輪" };
const fmtMin = s => { const m = Math.round(parseInt(s, 10) / 60); return m >= 60 ? `${Math.floor(m / 60)} 小時 ${m % 60} 分` : `${m} 分`; };
async function liveRoute(from, to, mode) {
  const k = `${from}>${to}>${mode}`, c = LIVE.get(k);
  if (c && Date.now() - c.t < 5 * 60e3) return c.v;
  const a = SPOTS[from], b = SPOTS[to];
  const body = { origin: { location: { latLng: { latitude: a.lat, longitude: a.lng } } }, destination: { location: { latLng: { latitude: b.lat, longitude: b.lng } } },
    travelMode: mode === "transit" ? "TRANSIT" : "DRIVE", languageCode: "zh-TW", regionCode: "JP" };
  if (mode === "driving") body.routingPreference = "TRAFFIC_AWARE";
  const mask = mode === "transit"
    ? "routes.duration,routes.legs.steps.travelMode,routes.legs.steps.transitDetails.transitLine.nameShort,routes.legs.steps.transitDetails.transitLine.name,routes.legs.steps.transitDetails.transitLine.vehicle.type,routes.legs.steps.transitDetails.stopDetails.departureTime"
    : "routes.duration,routes.distanceMeters";
  let v = null;
  try {
    const r = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", { method: "POST", headers: { "Content-Type": "application/json", "X-Goog-Api-Key": KEY_GM, "X-Goog-FieldMask": mask }, body: JSON.stringify(body) });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error?.message || r.status);
    const rt = j.routes?.[0];
    if (rt) {
      v = { dur: fmtMin(rt.duration) };
      if (mode === "transit") {
        const steps = (rt.legs?.[0]?.steps || []).filter(st => st.travelMode === "TRANSIT" && st.transitDetails);
        v.lines = steps.map(st => { const L = st.transitDetails.transitLine || {}; return L.nameShort || L.name || VEH[L.vehicle?.type] || "大眾運輸"; }).filter((x, i, arr) => x !== arr[i - 1]);
        const dep = steps[0]?.transitDetails?.stopDetails?.departureTime;
        if (dep) v.dep = new Date(dep).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Tokyo" });
        if (!steps.length) v.lines = ["步行即可"];
      } else if (rt.distanceMeters) v.km = (rt.distanceMeters / 1000).toFixed(1);
    }
  } catch (e) { console.warn("Routes API", e); v = { err: String(e.message || e) }; }
  LIVE.set(k, { t: Date.now(), v });
  return v;
}
async function fillLive(root) {
  if (!KEY_GM) return;
  for (const el of $$(".live:not([data-done])", root)) {
    el.dataset.done = "1";
    const [tr, dr] = await Promise.all([liveRoute(el.dataset.from, el.dataset.to, "transit"), liveRoute(el.dataset.from, el.dataset.to, "driving")]);
    if (!el.isConnected) continue;
    const err = (tr && tr.err) || (dr && dr.err);
    if (err && !(tr && tr.dur) && !(dr && dr.dur)) { el.className = "live off"; el.textContent = "即時資料讀取失敗：" + (/API key|not enabled|PERMISSION|referer/i.test(err) ? "金鑰沒開 Routes API，或網址限制不符" : err); continue; }
    const parts = [];
    if (tr && tr.dur) parts.push(`<b>大眾運輸 ${tr.dur}</b>${tr.lines?.length ? `（${tr.lines.map(esc).join(" → ")}）` : ""}${tr.dep ? `　下一班 ${tr.dep}` : ""}`);
    if (dr && dr.dur) parts.push(`<b>開車 ${dr.dur}</b>${dr.km ? `・${dr.km} km` : ""}`);
    el.innerHTML = `<i>現在出發</i>${parts.join("<br>") || "查不到路線"}`;
  }
}

/* ================= views ================= */
let post = [];

function home() {
  const me = member(meId);
  const daysHTML = DAYS.map(d => {
    const n = daySpots(d).length, p = dayProgress(d, meId);
    return `<a class="daysign" href="#/day/${d.d}">
      <span class="top">${ART.shield(d.d)}<span class="d">${d.date}<br>週${d.wd}</span></span>
      <b>${esc(d.city)}</b><small>${n ? `${n} 個打卡點` : "待安排"}</small>
      ${me ? `<span class="prog" aria-label="完成 ${Math.round(p * 100)}%"><i style="width:${p * 100}%"></i></span>` : ""}</a>`;
  }).join("");
  return `
  <section class="hero wrap"><div class="frame">${ART.hero()}</div></section>
  <section class="wrap statement">
    <p>2027 年 2 月，<b>六個人</b>、<b>七天</b>、<span class="nw">三座城市</span>。<br>用交通工程的眼光，把關西走一遍。</p>
    <a class="start" href="${me ? "#/me" : "#/trip"}" data-needme="#/trip">${me ? `繼續 ${esc(me.name)} 的旅程` : "選角色出發"} →</a>
    <p class="sub">KOBE · KYOTO · OSAKA　2027.02.20 — 02.26</p>
  </section>
  <section class="section"><div class="wrap">
    <p class="eyebrow">Route overview</p>
    <h2 class="h2"><span class="cjk">七日路線</span></h2>
    <p class="lead">從神戶海上機場進、神戶機場出。中間搭新幹線往返京都，最後一天留給大阪。</p>
    <div class="days7">${daysHTML}</div>
  </div></section>
  <section class="asphalt section"><div class="wrap">
    <p class="eyebrow">By the numbers</p>
    <h2 class="h2"><span class="cjk">這趟的運量</span></h2>
    <div class="stats">
      <div class="stat"><b>31</b><span>停留點</span></div>
      <div class="stat"><b>3,602</b><span>公里總移動距離</span></div>
      <div class="stat"><b>22</b><span>枚印章可以集</span></div>
      <div class="stat"><b>JX</b><span>星宇 1834 去・1835 回</span></div>
    </div>
  </div></section>
  <section class="section"><div class="wrap">
    <p class="eyebrow">Crew</p>
    <h2 class="h2"><span class="cjk">六位成員</span></h2>
    <p class="lead">每個人選一個交通工具當角色，打卡、筆記、遊戲分數都記在自己的角色底下。</p>
    <div class="crew">${MEMBERS.map(m => `<a href="#/member/${m.id}">${ART.avatar(m, 110)}<b>${esc(m.name)}</b><small>${esc(m.role)}</small></a>`).join("")}</div>
  </div></section>`;
}

function trip() {
  return crumbs([["首頁", "#/"], ["行程"]]) + `
  <section class="wrap pagehead"><p class="eyebrow">Itinerary</p><h1 class="h1"><span class="cjk">七日行程</span></h1>
  <p class="lead">點任何一天看當天時刻表；點景點看介紹、打卡、寫筆記。</p></section>
  <section class="wrap"><div class="triplist">${DAYS.map(d => {
    const stops = dayStops(d);
    return `<article class="triprow">
      <a class="daysign" href="#/day/${d.d}"><span class="top">${ART.shield(d.d)}<span class="d">${d.date}<br>週${d.wd}</span></span><b>${esc(d.city)}</b><small>出發 ${d.go}</small></a>
      <div class="tstops">${stops.length ? stops.map(s => `<a href="#/stop/${s.n}" class="tstop ${meId && rec(meId).stamps[s.spot] ? "done" : ""}">${ph(s.spot)}<span><small>${s.t}</small>${esc(SPOTS[s.spot].short)}</span></a>`).join("")
        : `<p class="dim">這天在 Funliday 上還沒有排景點。</p>`}</div>
    </article>`; }).join("")}</div></section>`;
}

function day(n) {
  const d = DAYS[(+n || 1) - 1] || DAYS[0];
  const my = meId ? rec(meId).stamps : {};
  const ids = daySpots(d), got = ids.filter(s => my[s]).length;
  const dirIds = dayStops(d).filter(i => SPOTS[i.spot].onMap).map(i => i.spot).filter((v, i, a) => v !== a[i - 1]);
  const focus = (dayStops(d).find(i => SPOTS[i.spot].onMap && i.spot !== "hotel") || {}).spot || (d.d === 6 ? "osaka" : "ukb");
  const prev = DAYS[d.d - 2], next = DAYS[d.d];
  const games = ids.filter(id => SPOTS[id].game);
  return crumbs([["首頁", "#/"], ["行程", "#/trip"], [`第 ${d.d} 日`]]) + `
  <section class="wrap pagehead">
    <div class="bigsign">${ART.shield(d.d)}<div><h1>第 ${d.d} 日　${esc(d.city)}</h1><p>2027.${d.date.replace("/", ".")}（${d.wd}）　出發 ${d.go}　${ids.length} 個打卡點</p></div></div>
    <div class="dnav">${prev ? `<a class="btn sm" href="#/day/${prev.d}">← 第 ${prev.d} 日</a>` : "<span></span>"}${next ? `<a class="btn sm" href="#/day/${next.d}">第 ${next.d} 日 →</a>` : ""}</div>
  </section>
  <section class="wrap daygrid">
    <div>${d.items.length ? `<ol class="tl">${d.items.map(it => it.k === "stop"
      ? `<li class="stop ${my[it.spot] ? "done" : ""}"><span class="t">${it.t}</span><span class="road"><i></i></span>
          <a class="card" href="#/stop/${it.n}">${ph(it.spot)}<span><b>${esc(SPOTS[it.spot].name)}${my[it.spot] ? `<span class="badge">已打卡</span>` : ""}</b><small>#${it.n}・停留 ${esc(it.stay)}</small>${it.note ? `<small class="flt">✈ ${esc(it.note)}</small>` : ""}</span></a></li>`
      : `<li class="move"><span class="t">${it.t}</span><span class="road"></span>${legHTML(d, it)}</li>`).join("")}</ol>`
      : `<div class="panel"><p>第 6 天在 Funliday 上還沒有排行程。前一天上午抵達新大阪，隔天從神戶機場回台灣，可以排大阪市區或環球影城。</p></div>`}</div>
    <aside class="side">
      ${meId ? `<div class="panel"><h3>我的進度</h3><p class="big">${got}<span class="dim" style="font-size:20px"> / ${ids.length}</span></p><div class="meter"><i style="width:${ids.length ? got / ids.length * 100 : 0}%"></i></div></div>`
        : `<div class="panel"><h3>打卡</h3><p style="margin:0 0 10px">選一個角色，就能在每個景點蓋印、寫筆記。</p><button class="btn go" data-pick>選角色</button></div>`}
      <div class="panel"><h3>地圖</h3><iframe class="gframe" title="Google 地圖" loading="lazy" src="${embedURL(focus, 13)}"></iframe>
        ${dirIds.length > 1 ? `<p style="margin:10px 0 0"><a class="btn blue sm" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/${dirIds.map(id => SPOTS[id].lat + "," + SPOTS[id].lng).join("/")}">整天路線 Google Maps ↗</a></p>` : ""}</div>
      ${games.length ? `<div class="panel"><h3>這天的小遊戲</h3>${games.map(id => `<a class="btn sm" href="#/game/${SPOTS[id].game}">${esc(GAMES[SPOTS[id].game].name)}</a>`).join(" ")}</div>` : ""}
    </aside>
  </section>`;
}

function stop(n) {
  const st = STOPS[(+n || 1) - 1] || STOPS[0], id = st.spot, s = SPOTS[id], d = st.day;
  const my = meId ? rec(meId) : null, when = my && my.stamps[id];
  const nx = STOPS[st.n], pv = STOPS[st.n - 2];
  const legOK = nx && nx.spot !== id && s.onMap && SPOTS[nx.spot].onMap;
  const visits = STOPS.filter(x => x.spot === id);
  const here = MEMBERS.filter(m => rec(m.id).stamps[id]);
  post.push(() => { const t = $("#note"); if (t) { let tm; t.addEventListener("input", () => { clearTimeout(tm); tm = setTimeout(() => { const r = rec(meId); const v = t.value.trim(); if (v) r.notes[id] = t.value; else delete r.notes[id]; saveRec(meId, r); $("#saved").textContent = "已儲存"; }, 400); }); } });
  return crumbs([["首頁", "#/"], ["行程", "#/trip"], [`第 ${d.d} 日`, `#/day/${d.d}`], [s.short]]) + `
  <article class="wrap spot">
    <div class="spotgrid">
      <div>
        <figure class="photo" style="margin:0">${ph(id)}<figcaption data-credit="${id}" hidden></figcaption></figure>
        ${s.onMap ? `<iframe class="gframe" style="margin-top:14px;aspect-ratio:16/9" title="${esc(s.name)} 的 Google 地圖" loading="lazy" src="${embedURL(id)}"></iframe>` : ""}
      </div>
      <div>
        <p class="meta"><span class="n">#${st.n}</span>　第 ${d.d} 日　2027.${d.date.replace("/", ".")}（${d.wd}）${st.t}　停留 ${esc(st.stay)}</p>
        <h1>${esc(s.name)}</h1>
        <p class="addr">${esc(s.addr)}</p>
        ${st.note ? `<p class="flight">✈ ${esc(st.note)}</p>` : ""}
        <div class="stack" style="margin-top:14px">
          ${s.onMap ? `<a class="btn sm" href="${placeURL(id)}" target="_blank" rel="noopener">在 Google Maps 開啟 ↗</a>` : ""}
          ${s.game ? `<a class="btn sm go" href="#/game/${s.game}">小遊戲：${esc(GAMES[s.game].name)}</a>` : ""}
        </div>
        ${s.onMap ? `<div class="stampzone">
          ${when ? stampSVG(id, "", when) + `<p><b>${esc(member(meId).name)}</b> 已於 ${fmtDT(when)} 打卡。</p>`
            : stampSVG(id, "off") + `<p>${meId ? "到了這裡就按下去，印章會記在你的角色底下。" : "先選一個角色，才能把印章記在自己名下。"}</p><button class="btn go" data-stamp="${id}">${meId ? "到站打卡・蓋印" : "選角色並打卡"}</button>`}
        </div>` : ""}
        <div class="tip">${ART.warn}<div><b>交通豆知識</b><p>${esc(s.tip)}</p></div></div>
        ${legOK ? `<div class="nextleg"><p class="eyebrow" style="margin:18px 0 0">Next · 往下一站</p><b>${esc(SPOTS[nx.spot].name)}</b>
          <div class="modes">${MODES.map(([m, l], k) => `<a class="${(st.n <= 8 ? m === "driving" : k === 0) ? "pri" : ""}" href="${routeURL(id, nx.spot, m)}" target="_blank" rel="noopener">${l}</a>`).join("")}</div>
          ${KEY_GM ? `<span class="live" data-from="${id}" data-to="${nx.spot}">即時查詢中…</span>` : `<small class="dim">點了會開 Google Maps，顯示現在出發的即時時間、班次和轉乘。</small>`}</div>` : ""}
        ${meId && s.onMap ? `<div style="margin-top:22px"><p class="eyebrow" style="margin-bottom:6px">My note · 我的筆記 <span id="saved" class="dim" style="letter-spacing:0;text-transform:none"></span></p>
          <textarea id="note" class="note" placeholder="吃了什麼、拍了什麼、下次要注意什麼…">${esc(my.notes[id] || "")}</textarea></div>` : ""}
        ${visits.length > 1 ? `<p class="dim" style="font-size:14px;margin-top:14px">這趟會經過 ${visits.length} 次：${visits.map(x => `<a href="#/stop/${x.n}">第 ${x.day.d} 日 ${x.t}</a>`).join("、")}</p>` : ""}
        ${here.length ? `<div style="margin-top:16px"><p class="eyebrow" style="margin-bottom:6px">Checked in · 這台裝置上打過卡的成員</p><div class="whohere">${here.map(m => `<span>${ART.avatar(m, 24)}${esc(m.name)}</span>`).join("")}</div></div>` : ""}
      </div>
    </div>
    <nav class="stopnav" aria-label="前後站">
      ${pv ? `<a href="#/stop/${pv.n}"><small>← 前一站 #${pv.n}</small><b>${esc(SPOTS[pv.spot].name)}</b></a>` : "<span></span>"}
      ${nx ? `<a class="nx" href="#/stop/${nx.n}"><small>下一站 #${nx.n} →</small><b>${esc(SPOTS[nx.spot].name)}</b></a>` : ""}
    </nav>
  </article>`;
}

function mapView() {
  post.push(() => KEY_GM ? initGoogle($("#gmap")) : focusEmbed("ukb"));
  return crumbs([["首頁", "#/"], ["地圖"]]) + `
  <section class="wrap pagehead"><p class="eyebrow">Map</p><h1 class="h1"><span class="cjk">全部景點</span></h1>
  <p class="lead">${KEY_GM ? "點地圖上的照片圖釘，或右邊的景點。" : "點右邊的景點，地圖會跳過去。"}有紅框的是你打過卡的地方。</p></section>
  <section class="wrap mapgrid">
    <div><div class="gmap" id="gmap">${KEY_GM ? "" : `<iframe title="Google 地圖" loading="lazy"></iframe>`}</div>
      <div class="panel" id="mapinfo" style="margin-top:12px" hidden></div></div>
    <div class="mlist">${DAYS.map(d => { const ids = daySpots(d); if (!ids.length) return ""; return `<div><h3>${ART.shield(d.d)} 第 ${d.d} 日　${esc(d.city)}</h3>
      <div class="chips">${ids.map(id => `<button class="chip ${meId && rec(meId).stamps[id] ? "done" : ""}" data-focus="${id}">${ph(id)}${esc(SPOTS[id].short)}</button>`).join("")}</div></div>`; }).join("")}</div>
  </section>`;
}
let gmap = null;
function focusEmbed(id) {
  const f = $("#gmap iframe"); if (f) f.src = embedURL(id);
  if (gmap) { gmap.panTo({ lat: SPOTS[id].lat, lng: SPOTS[id].lng }); if (gmap.getZoom() < 14) gmap.setZoom(15); }
  $$(".chip").forEach(c => c.classList.toggle("on", c.dataset.focus === id));
  const info = $("#mapinfo"); if (!info) return;
  const n = stopNo(id), s = SPOTS[id];
  info.hidden = false;
  info.innerHTML = `<div class="stack">${ph(id, "")}<div style="flex:1;min-width:10em"><b>${esc(s.name)}</b><br><small class="dim">${esc(s.addr)}</small></div>${n ? `<a class="btn sm" href="#/stop/${n}">看景點 →</a>` : ""}</div>`;
  const p = $(".ph", info); if (p) { p.style.cssText = "width:56px;height:56px;border-radius:4px"; }
  applyPhotos(info);
}
async function initGoogle(el) {
  if (!window.google?.maps?.importLibrary) {
    ((g) => { var h, a, k, p = "The Google Maps JavaScript API", c = "google", l = "importLibrary", q = "__ib__", m = document, b = window; b = b[c] || (b[c] = {}); var d = b.maps || (b.maps = {}), r = new Set, e = new URLSearchParams, u = () => h || (h = new Promise(async (f, n) => { await (a = m.createElement("script")); e.set("libraries", [...r] + ""); for (k in g) e.set(k.replace(/[A-Z]/g, t => "_" + t[0].toLowerCase()), g[k]); e.set("callback", c + ".maps." + q); a.src = `https://maps.${c}apis.com/maps/api/js?` + e; d[q] = f; a.onerror = () => h = n(Error(p + " could not load.")); a.nonce = m.querySelector("script[nonce]")?.nonce || ""; m.head.append(a) })); d[l] ? console.warn(p + " only loads once.") : d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n)) })({ key: KEY_GM, v: "weekly", language: "zh-TW", region: "JP" });
  }
  try {
    const { Map, Polyline } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    if (!el.isConnected) return;
    gmap = new Map(el, { center: { lat: 34.8, lng: 135.4 }, zoom: 9, mapId: CFG.mapId || "DEMO_MAP_ID", streetViewControl: false, mapTypeControl: false });
    const order = STOPS.map(s => s.spot).filter(id => SPOTS[id].onMap);
    new Polyline({ map: gmap, path: order.map(id => ({ lat: SPOTS[id].lat, lng: SPOTS[id].lng })), strokeColor: "#1f5aa6", strokeOpacity: .6, strokeWeight: 3 });
    const my = meId ? rec(meId).stamps : {};
    Object.entries(SPOTS).filter(([, s]) => s.onMap).forEach(([id, s]) => {
      const div = document.createElement("div"); div.className = "pin" + (my[id] ? " done" : "");
      div.innerHTML = `${ph(id)}<span class="l">${esc(s.short)}</span>`;
      const m = new AdvancedMarkerElement({ map: gmap, position: { lat: s.lat, lng: s.lng }, content: div, title: s.name, gmpClickable: true });
      m.addListener("click", () => focusEmbed(id));
    });
    applyPhotos(el);
  } catch (e) { console.warn(e); gmap = null; el.innerHTML = `<iframe title="Google 地圖" loading="lazy"></iframe>`; focusEmbed("ukb"); }
}

function members() {
  return crumbs([["首頁", "#/"], ["成員"]]) + `
  <section class="wrap pagehead"><p class="eyebrow">Crew</p><h1 class="h1"><span class="cjk">六位成員</span></h1>
  <p class="lead">每個人用自己的手機選角色。打卡和筆記存在各自的手機裡，所以這頁的數字只算這台裝置上的紀錄。</p></section>
  <section class="wrap"><div class="cards6">${MEMBERS.map(m => `<a class="mcard" href="#/member/${m.id}">${m.id === meId ? `<span class="me">你</span>` : ""}
    ${ART.avatar(m, 96)}<div><b>${esc(m.name)}</b><span class="role" style="color:${m.color}">${esc(m.role)}</span><p>${esc(m.note)}</p>
    <div class="meter"><i style="width:${stampCount(m.id) / MAP_IDS.length * 100}%"></i></div><small class="dim">印章 ${stampCount(m.id)} / ${MAP_IDS.length}</small></div></a>`).join("")}</div></section>`;
}

function memberView(id, asMe = false) {
  const m = member(id); if (!m) return members();
  const r = rec(id), n = stampCount(id), daysDone = DAYS.filter(d => daySpots(d).length && dayProgress(d, id) === 1).length;
  const notes = Object.entries(r.notes).filter(([, v]) => v && v.trim());
  const score = Object.values(r.best).reduce((a, b) => a + (b || 0), 0);
  const isMe = id === meId;
  return crumbs(asMe ? [["首頁", "#/"], ["我的紀錄"]] : [["首頁", "#/"], ["成員", "#/members"], [m.name]]) + `
  <section class="wrap profile">
    ${ART.avatar(m, 200)}
    <div><p class="eyebrow" style="color:${m.color}">${esc(m.role)}</p><h1 class="h1" style="margin-top:0"><span class="cjk">${esc(m.name)}</span></h1>
      <p class="lead">${esc(m.note)}</p>
      <div class="stack" style="margin-top:16px">${isMe ? `<span class="btn sm go" style="pointer-events:none">這是你</span><button class="btn sm" data-pick>換角色</button>`
        : `<button class="btn sm" data-become="${id}">切換成這個角色</button>`}</div></div>
  </section>
  <section class="wrap">
    <div class="kpis">
      <div class="kpi"><b>${n}<small style="font-size:18px" class="dim"> / ${MAP_IDS.length}</small></b><span>印章</span></div>
      <div class="kpi"><b>${daysDone}<small style="font-size:18px" class="dim"> / 6</small></b><span>完成的天數</span></div>
      <div class="kpi"><b>${notes.length}</b><span>篇筆記</span></div>
      <div class="kpi"><b>${score}</b><span>小遊戲最高分合計</span></div>
    </div>
    <div class="meter"><i style="width:${n / MAP_IDS.length * 100}%"></i></div>
    ${n === MAP_IDS.length ? `<p class="lead" style="margin-top:14px"><b>22 枚全部集滿。</b>關西路網，全線通車。</p>` : ""}
  </section>
  <section class="wrap section tight"><h2 class="h2"><span class="cjk">印章帳</span></h2>
    <div class="book">${MAP_IDS.map(sid => `<a href="#/stop/${stopNo(sid)}">${stampSVG(sid, r.stamps[sid] ? "" : "off", r.stamps[sid])}<small>${esc(SPOTS[sid].short)}${r.stamps[sid] ? `<br>${fmtDT(r.stamps[sid])}` : ""}</small></a>`).join("")}</div>
  </section>
  <section class="wrap section tight"><h2 class="h2"><span class="cjk">筆記</span></h2>
    ${notes.length ? `<div class="notes">${notes.map(([sid, v]) => `<a href="#/stop/${stopNo(sid)}"><b>${esc(SPOTS[sid].name)}</b><p>${esc(v)}</p></a>`).join("")}</div>`
      : `<p class="dim">還沒有筆記。${isMe ? "到景點頁面就能寫。" : ""}</p>`}
  </section>
  <section class="wrap section tight"><h2 class="h2"><span class="cjk">小遊戲紀錄</span></h2>
    <div class="kpis">${Object.entries(GAMES).map(([k, g]) => `<a class="kpi" href="#/game/${k}" style="text-decoration:none;color:inherit"><b>${r.best[k] || 0}</b><span>${esc(g.name)}</span></a>`).join("")}</div>
  </section>`;
}

function meView() {
  if (meId) return memberView(meId, true);
  return crumbs([["首頁", "#/"], ["我的紀錄"]]) + `<section class="wrap pagehead"><p class="eyebrow">My record</p><h1 class="h1"><span class="cjk">先選你的角色</span></h1>
    <p class="lead">選好之後，打卡、筆記、遊戲分數都會記在這個角色底下。</p><p><button class="btn go" data-pick>選角色</button></p></section>`;
}

function gamesView() {
  const r = meId ? rec(meId) : { best: {} };
  return crumbs([["首頁", "#/"], ["小遊戲"]]) + `
  <section class="wrap pagehead"><p class="eyebrow">Mini games</p><h1 class="h1"><span class="cjk">三個小遊戲</span></h1>
  <p class="lead">分數記在你的角色底下。${meId ? "" : "先選角色，分數才會留下來。"}</p></section>
  <section class="wrap"><div class="gcards">${Object.entries(GAMES).map(([k, g]) => `<a class="gcard" href="#/game/${k}">${ART.games[k]}<div><b>${esc(g.name)}</b><p>${esc(g.desc)}</p><span class="hs">最高分 ${r.best[k] || 0}</span></div></a>`).join("")}</div></section>`;
}

function gameView(k) {
  const g = GAMES[k]; if (!g) return gamesView();
  post.push(() => { if (k === "A") starGame($("#gcv")); else if (k === "B") toriiGame($("#gcv")); else memoryGame(); });
  return crumbs([["首頁", "#/"], ["小遊戲", "#/games"], [g.name]]) + `
  <section class="wrap pagehead" style="padding-bottom:10px"><h1 class="h1" style="font-size:clamp(30px,5vw,48px)"><span class="cjk">${esc(g.name)}</span></h1><p class="lead">${esc(g.desc)}</p></section>
  <section class="wrap"><div class="gstage">
    <div class="ghud"><span id="gS">得分 0</span><span id="gT"></span></div>
    ${k === "C" ? `<div class="order" id="order"></div><div class="mem" id="mem"></div>` : `<canvas class="gcv" id="gcv" width="300" height="400"></canvas>`}
    <div class="res" id="gres"></div>
  </div></section>`;
}

/* ================= router ================= */
const ROUTES = { "": home, trip, day, stop, map: mapView, members, member: a => memberView(a), me: meView, games: gamesView, game: gameView };
const TITLES = { "": "", trip: "行程", day: "第 {a} 日", stop: "景點", map: "地圖", members: "成員", member: "成員", me: "我的紀錄", games: "小遊戲", game: "小遊戲" };
let first = true;
function render() {
  stopGame(); gmap = null; post = [];
  const h = location.hash.replace(/^#\/?/, ""), [p, a] = h.split("/");
  const view = ROUTES[p] || home;
  app.innerHTML = view(a);
  const st = p === "stop" ? STOPS[(+a || 1) - 1] : null;
  const t = st ? SPOTS[st.spot].short : p === "member" && member(a) ? member(a).name : (TITLES[p] || "").replace("{a}", a || "");
  document.title = t ? `${t}｜關西七日帖` : "關西七日帖";
  const top = p === "day" || p === "stop" ? "trip" : p === "member" ? "members" : p === "game" ? "games" : p;
  $$("[data-nav]").forEach(el => el.dataset.nav === top ? el.setAttribute("aria-current", "page") : el.removeAttribute("aria-current"));
  $("#drawer").hidden = true; $("#menuBtn").setAttribute("aria-expanded", "false");
  if (!first) { window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" }); app.focus({ preventScroll: true }); }
  first = false;
  post.forEach(f => f()); post = [];
  applyPhotos(app); fillLive(app);
}
window.addEventListener("hashchange", render);

/* ================= character picker ================= */
const modal = $("#modal");
let afterPick = null, lastFocus = null;
function openPicker(cb) {
  afterPick = cb || null; lastFocus = document.activeElement;
  modal.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="pkT"><button class="x" data-close aria-label="關閉">×</button>
    <p class="eyebrow">Choose your vehicle</p><h2 class="h2" id="pkT"><span class="cjk">選擇你的角色</span></h2>
    <p class="dim" style="margin:0">紀錄存在這支手機。換手機要重新選同一個角色，之前的紀錄不會跟過去。</p>
    <div class="pick">${MEMBERS.map(m => `<button data-become="${m.id}" aria-pressed="${m.id === meId}">${ART.avatar(m, 84)}<b>${esc(m.name)}</b><small>${esc(m.role)}</small></button>`).join("")}</div></div>`;
  modal.hidden = false;
  $("[data-become]", modal).focus();
}
function closeModal() { modal.hidden = true; modal.innerHTML = ""; lastFocus?.focus?.(); }
function become(id) {
  meId = id; LS.set("k7.me", id); updateWho();
  const cb = afterPick; afterPick = null;
  if (!modal.hidden) closeModal();
  toast(`你現在是 ${member(id).name}（${member(id).role}）`);
  if (cb) cb(); else render();
}
modal.addEventListener("click", e => {
  if (e.target === modal || e.target.closest("[data-close]")) return closeModal();
  const b = e.target.closest("[data-become]"); if (b) become(b.dataset.become);
});
document.addEventListener("keydown", e => { if (e.key === "Escape" && !modal.hidden) closeModal(); });
function updateWho() {
  const w = $("#who"), m = member(meId);
  w.className = "who" + (m ? "" : " empty");
  w.innerHTML = m ? `${ART.avatar(m, 30)}<span>${esc(m.name)}</span>` : "選角色";
  w.setAttribute("aria-label", m ? `目前角色：${m.name}，點一下換角色` : "選擇角色");
}
$("#who").addEventListener("click", () => openPicker());
$("#menuBtn").addEventListener("click", () => { const d = $("#drawer"); d.hidden = !d.hidden; $("#menuBtn").setAttribute("aria-expanded", String(!d.hidden)); });

/* ================= page actions ================= */
app.addEventListener("click", e => {
  const need = e.target.closest("[data-needme]");
  if (need && !meId) { e.preventDefault(); return openPicker(() => { location.hash = need.dataset.needme; render(); }); }
  if (e.target.closest("[data-pick]")) return openPicker();
  const bc = e.target.closest("[data-become]"); if (bc) return become(bc.dataset.become);
  const sb = e.target.closest("[data-stamp]");
  if (sb) { const id = sb.dataset.stamp; return meId ? doStamp(id) : openPicker(() => doStamp(id)); }
  const fc = e.target.closest("[data-focus]"); if (fc) return focusEmbed(fc.dataset.focus);
});
function doStamp(id) {
  const r = rec(meId); r.stamps[id] = Date.now(); saveRec(meId, r);
  render();
  const s = $(".stampzone .stamp"); if (s && !reduced) s.classList.add("new");
  tone(880, .12); setTimeout(() => tone(1320, .2), 90);
  const n = stampCount(meId);
  toast(n === MAP_IDS.length ? "22 枚印章全部集滿！" : `蓋印完成　${n} / ${MAP_IDS.length}`);
}

/* ================= toast & sound ================= */
let tt;
function toast(m, ms = 2600) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(tt); tt = setTimeout(() => t.hidden = true, ms); }
let ac = null;
function tone(f = 660, d = .25, v = .05) {
  try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
    o.type = "sine"; o.frequency.value = f; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t + d); } catch (e) {}
}

/* ================= games ================= */
let game = null;
function stopGame() { if (game) { game.stop(); game = null; } }
function rng(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }
const pal = () => ({ card: "#f6f5f2", ink: "#1d1f22", ink2: "#5f636a", rule: "#cbc8c1", shu: "#d23a2c", ai: "#1f9a5b", go: "#1f9a5b" });
function endGame(k, score) {
  const r = $("#gres"); let line = `得分 ${score}`;
  if (meId) {
    const R = rec(meId), prev = R.best[k] || 0;
    if (score > prev) { R.best[k] = score; saveRec(meId, R); line = `新紀錄！${score} 分（${member(meId).name}）`; tone(1320, .4); }
    else line = `得分 ${score}　${member(meId).name} 的最高分 ${prev}`;
  } else line += `　選角色後分數才會保存`;
  if (r) r.innerHTML = `<p class="meta" style="margin-bottom:10px">${esc(line)}</p><div class="stack" style="justify-content:center">
    <a class="btn go" href="#/game/${k}" data-replay>再玩一次</a>${meId ? "" : `<button class="btn" data-pick>選角色</button>`}<a class="btn" href="#/stop/${stopNo(GAMES[k].spot)}">回到景點</a></div>`;
}
app.addEventListener("click", e => { if (e.target.closest("[data-replay]")) { e.preventDefault(); render(); } });

function starGame(c) {
  const x = c.getContext("2d"), r = rng(Date.now() % 99991 + 1);
  let bx = 150, items = [], score = 0, left = 30, last = performance.now(), spawn = 0, run = true, keys = {};
  const move = e => { const b = c.getBoundingClientRect(); bx = Math.max(24, Math.min(276, (e.clientX - b.left) / b.width * 300)); };
  c.addEventListener("pointermove", move); c.addEventListener("pointerdown", move);
  const kd = e => { keys[e.key] = e.type === "keydown"; }; addEventListener("keydown", kd); addEventListener("keyup", kd);
  const star = (cx, cy, R, col) => { x.fillStyle = col; x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? R * .45 : R; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.fill(); };
  function loop(now) {
    if (!run) return;
    const dt = Math.min(.05, (now - last) / 1000); last = now; left -= dt; spawn -= dt;
    if (keys.ArrowLeft || keys.a) bx -= 240 * dt; if (keys.ArrowRight || keys.d) bx += 240 * dt; bx = Math.max(24, Math.min(276, bx));
    if (spawn <= 0) { spawn = .5 - (30 - left) * .008; const t = r(); items.push({ x: 16 + r() * 268, y: -10, v: 80 + r() * 70 + (30 - left) * 2.4, k: t > .86 ? "big" : t > .68 ? "cloud" : "star" }); }
    items.forEach(it => it.y += it.v * dt);
    items = items.filter(it => {
      if (it.y > 344 && it.y < 368 && Math.abs(it.x - bx) < 30) { score = Math.max(0, score + (it.k === "big" ? 3 : it.k === "cloud" ? -2 : 1)); tone(it.k === "cloud" ? 220 : it.k === "big" ? 1568 : 1175, .2, .04); return false; }
      return it.y < 410;
    });
    x.fillStyle = "#151a2e"; x.fillRect(0, 0, 300, 400);
    x.fillStyle = "#24304a"; x.beginPath(); x.moveTo(0, 400); for (let i = 0; i <= 300; i += 10) x.lineTo(i, 372 + Math.sin(i / 30) * 8); x.lineTo(300, 400); x.fill();
    for (let i = 0; i < 60; i++) { x.fillStyle = i % 3 ? "#f2c230" : "#f6f5f2"; x.fillRect((i * 53) % 300, 384 + (i * 7) % 14, 1.5, 1.5); }
    items.forEach(it => {
      if (it.k === "cloud") { x.fillStyle = "#56607e"; x.beginPath(); x.ellipse(it.x, it.y, 18, 7, 0, 0, 7); x.fill(); }
      else star(it.x, it.y, it.k === "big" ? 11 : 7, it.k === "big" ? "#e8452f" : "#f2c230");
    });
    x.strokeStyle = "#f6f5f2"; x.lineWidth = 3; x.beginPath(); x.moveTo(bx - 28, 348); x.quadraticCurveTo(bx, 372, bx + 28, 348); x.stroke();
    $("#gS").textContent = "得分 " + score; $("#gT").textContent = Math.ceil(Math.max(0, left)) + " 秒";
    if (left <= 0) { cleanup(); endGame("A", score); return; }
    requestAnimationFrame(loop);
  }
  function cleanup() { run = false; removeEventListener("keydown", kd); removeEventListener("keyup", kd); }
  game = { stop: cleanup }; requestAnimationFrame(loop);
}

function toriiGame(c) {
  const x = c.getContext("2d"), r = rng(Date.now() % 99991 + 1), C = pal();
  let gate = 0, score = 0, cur = 0, dir = 1, last = performance.now(), run = true, flash = 0, ok = false, center = .5, width = .3, speed = .7;
  const next = () => { center = .2 + r() * .6; width = Math.max(.08, .3 - gate * .024); speed = .7 + gate * .12; }; next();
  function hit() {
    if (!run || flash > 0) return;
    const off = Math.abs(cur - center); ok = off < width / 2;
    if (ok) { score += off < width / 6 ? 150 : 100; tone(1175, .25, .05); } else tone(196, .3, .06);
    flash = .45; gate++;
    if (gate >= 10) setTimeout(() => { cleanup(); endGame("B", score); }, 450); else next();
  }
  c.addEventListener("pointerdown", hit);
  const kd = e => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); hit(); } }; addEventListener("keydown", kd);
  function torii(cx, base, w, h, col, a) {
    x.globalAlpha = a; x.fillStyle = col; const t = Math.max(2, w * .07);
    x.fillRect(cx - w / 2 - t * 1.4, base - h, w + t * 2.8, t * 1.2); x.fillRect(cx - w / 2, base - h + t * 2.4, w, t * .7);
    x.fillRect(cx - w / 2 + t, base - h, t, h); x.fillRect(cx + w / 2 - 2 * t, base - h, t, h); x.globalAlpha = 1;
  }
  function loop(now) {
    if (!run) return;
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (flash > 0) flash -= dt; else { cur += dir * speed * dt; if (cur > 1) { cur = 1; dir = -1; } if (cur < 0) { cur = 0; dir = 1; } }
    x.fillStyle = C.card; x.fillRect(0, 0, 300, 400);
    for (let i = 6; i >= 0; i--) { const s = 1 + i * .5; torii(150, 200 + 110 / s, 200 / s, 230 / s, C.shu, Math.max(.15, 1 - i * .14)); }
    x.fillStyle = C.ink; x.font = "700 16px 'Barlow Condensed',sans-serif"; x.textAlign = "center";
    x.fillText(`${Math.min(gate + 1, 10)} / 10`, 150, 30);
    const bx0 = 30, bw = 240, by = 345;
    x.fillStyle = "#2a2c2f"; x.fillRect(bx0, by, bw, 8);
    x.fillStyle = C.go; x.fillRect(bx0 + (center - width / 2) * bw, by - 4, width * bw, 16);
    x.fillStyle = C.card; x.fillRect(bx0 + (center - width / 6) * bw, by + 2, width / 3 * bw, 4);
    x.fillStyle = flash > 0 ? (ok ? C.go : C.shu) : "#f2c230"; x.fillRect(bx0 + cur * bw - 2, by - 12, 4, 32);
    if (flash > 0) { x.fillStyle = ok ? C.go : C.shu; x.font = "900 24px 'Noto Sans TC',sans-serif"; x.fillText(ok ? "綠燈通過" : "紅燈", 150, by - 22); }
    $("#gS").textContent = "得分 " + score;
    requestAnimationFrame(loop);
  }
  function cleanup() { run = false; removeEventListener("keydown", kd); }
  game = { stop: cleanup }; requestAnimationFrame(loop);
}

const FOODS = [["串", "田樂串"], ["玉", "玉子燒"], ["蛸", "章魚串"], ["団", "糰子"], ["漬", "京漬物"], ["豆", "豆乳甜甜圈"], ["天", "天婦羅"], ["茶", "抹茶"], ["結", "飯糰"], ["鯖", "鯖壽司"], ["芋", "烤地瓜"], ["酒", "甘酒"]];
function memoryGame() {
  const r = rng(Date.now() % 99991 + 1), sizes = [3, 3, 4, 4, 5];
  let round = 0, score = 0, list = [], picked = 0, phase = "show", tm = null, alive = true;
  game = { stop() { alive = false; clearTimeout(tm); } };
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = r() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  function newRound() {
    if (!alive) return;
    if (round >= sizes.length) { $("#mem").innerHTML = ""; $("#order").textContent = "採買完成"; return endGame("C", score); }
    const pool = shuffle(FOODS.slice()); list = pool.slice(0, sizes[round]); picked = 0; phase = "show";
    $("#gT").textContent = `第 ${round + 1} / 5 回`;
    $("#order").innerHTML = "清單　" + list.map(f => `<b>${f[1]}</b>`).join("・");
    $("#mem").innerHTML = shuffle(pool.slice(0, 9)).map(f => `<button disabled data-f="${f[1]}"><b>${f[0]}</b><span>${f[1]}</span></button>`).join("");
    tm = setTimeout(() => { if (!alive) return; phase = "pick"; $("#order").textContent = `清單收起來了，挑出 ${list.length} 樣`; $$("#mem button").forEach(b => b.disabled = false); }, 1500 + sizes[round] * 650);
  }
  $("#mem").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b || phase !== "pick" || b.disabled) return;
    b.disabled = true;
    if (list.some(f => f[1] === b.dataset.f)) {
      b.classList.add("ok"); score += 10; picked++; tone(1046, .2, .04);
      if (picked === list.length) { score += 20; phase = "done"; $("#order").textContent = "全部買齊　+20"; round++; tm = setTimeout(newRound, 900); }
    } else { b.classList.add("bad"); tone(196, .3, .06); phase = "done"; $("#order").textContent = "買錯了。清單是：" + list.map(f => f[1]).join("・"); round++; tm = setTimeout(newRound, 1700); }
    $("#gS").textContent = "得分 " + score;
  });
  newRound();
}

/* ================= boot ================= */
updateWho();
render();
loadPhotos();
})();
