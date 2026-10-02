/* 대원용 리허설 웹앱 — 계약: screens v0.4.2 / ui-copy v0.4.2 / design-tokens v0.4.0
   표시 문구는 contract/ui-copy.json 키로만 온다. 표지 문구만 계약에 없어 COVER 상수(역제안 대상)로 분리했다. */
const SHOW_COVER_ON_LAUNCH = true;           // 미정: 표지 노출 정책. 확정 시 값만 바꾼다.
const NS = "oratorio.v1.", SCHEMA = 1;
const COVER = { church: "SOMANG CHURCH", choir: "베다니 찬양대", kicker: "ORATORIO",
  title: ["성령이", "교회들에게", "하시는 말씀"], en: ["The Spirit Speaks", "to the Churches"],
  occasion: "창립 49주년 찬양예배", date: "2026. 10. 04", until: "초연까지", start: "연습 시작하기" }; // 역제안 대상
const TEX = { none: "cloud", S: "laid", A: "laid", T: "dak", B: "dak" };
const PARTS = ["S", "A", "T", "B"];
const STATUS_COLOR = { not_started: "--st-none", listening: "--st-listen", repeating: "--st-repeat", nearly_stable: "--st-nearly", ready: "--st-ready" };
let C = {}, DATA = { songs: [], premiereDate: "2026-10-04" };

/* ---- storage: schemaVersion 불일치 시 읽지 말고 초기화 ---- */
const store = {
  init() { try { if (localStorage.getItem(NS + "meta.schemaVersion") !== String(SCHEMA)) {
      Object.keys(localStorage).filter(k => k.startsWith("oratorio.")).forEach(k => localStorage.removeItem(k));
      localStorage.setItem(NS + "meta.schemaVersion", String(SCHEMA)); } } catch (e) {} },
  get(k, d) { try { const v = localStorage.getItem(NS + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(NS + k, JSON.stringify(v)); } catch (e) { toast(C.error.storageFull); } }
};
const S = { part: null, subpart: "all", filter: "all", screen: "cover", song: null, sound: {}, practice: {} };

/* ---- 문구 ---- */
const t = (path, vars) => { let v = path.split(".")[0] in C ? C : null; if (!v) return path;
  const [g, ...rest] = path.split("."); const o = C[g]; const key = rest.join(".");
  let s = o && (o[key] !== undefined ? o[key] : o[rest[0]]); if (typeof s !== "string") return path;
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars && vars[k] !== undefined ? vars[k] : "")); };
const partName = p => C.part[p];
const dday = () => { const [y, m, d] = DATA.premiereDate.split("-").map(Number);
  const now = new Date(), kst = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.round((Date.UTC(y, m - 1, d) - kst) / 86400000)); };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
let toastT; function toast(m) { const e = document.getElementById("toast"); e.textContent = m; e.classList.add("on");
  clearTimeout(toastT); toastT = setTimeout(() => e.classList.remove("on"), 2600); }

/* ---- 질감: 3개 형제 레이어, opacity만 교차 ---- */
function setTexture(name) { ["cloud", "laid", "dak"].forEach(n => document.getElementById("tex-" + n).dataset.on = (n === name ? "1" : "0")); }
function preloadTextures() { ["hanji3-cloud", "hanji2-laid", "hanji1-dak"].forEach(n => { const i = new Image(); i.src = `assets/${n}-2048.webp`; }); }

/* ---- 공통 조각 ---- */
const roleSlot = () => `<div class="top-right"><span class="chip-on">${esc(C.role.singer)}</span><button class="chip-off" data-act="conductor">${esc(C.role.conductor)}</button></div>`;
const statusDot = st => `<span class="dot" style="background:var(${STATUS_COLOR[st]})"></span>`;
const backLink = (label, to) => `<button class="btn" data-go="${to}" style="align-self:flex-start;min-height:var(--touch)">← ${esc(label)}</button>`;

/* ---- 화면 ---- */
const V = {
  cover() { return `<div class="col">
    <div style="padding-top:var(--lg)"><div class="eyebrow" style="letter-spacing:.34em">${esc(COVER.church)}</div>
      <div style="margin-top:var(--sm);font-size:var(--caption);letter-spacing:.24em">${esc(COVER.choir)}</div></div>
    <div><div class="eyebrow" style="letter-spacing:.3em;color:var(--gold-on-dark)">${COVER.kicker}</div>
      <h1 class="cover-title" style="margin-top:var(--lg)">${COVER.title.join("<br>")}</h1>
      <div class="cover-en" style="margin-top:var(--lg)">${COVER.en.join("<br>")}</div></div>
    <div style="width:100%"><div class="row" style="justify-content:space-between;border-top:1px solid var(--line-on-dark);padding:var(--lg) 0">
      <div style="text-align:left"><div class="eyebrow">${esc(COVER.occasion)}</div><div class="num" style="font-size:25px;font-weight:600">${COVER.date}</div></div>
      <div style="text-align:right"><div class="eyebrow">${esc(COVER.until)}</div><div class="cover-dday">${esc(t("home.dday", { days: dday() }))}</div></div></div>
      <button class="btn gold" data-go="${S.part ? "home" : "first_run_part_select"}">${esc(COVER.start)}</button>
      ${S.part ? `<p class="cap" style="text-align:center;color:var(--ink-on-dark-muted)">${esc(t("progress.subtitle", { partName: partName(S.part), count: DATA.songs.length }))}</p>` : ""}</div></div>`; },

  first_run_part_select() { const p = S.part;
    return `<div class="col">
    <div class="row" style="justify-content:space-between"><span class="eyebrow">${esc(C.part["label.myPart"])}</span><span class="num gold">${esc(t("firstRun.step", { current: 1, total: 3 }))}</span></div>
    <div style="margin-top:var(--xl)"><h1>${esc(C.firstRun.greeting)}</h1>
      <p class="muted" style="margin:var(--md) 0 0">${esc(C.firstRun.intro)}<br><span class="gold">${esc(C.firstRun.introSecondary)}</span></p></div>
    <div class="part-grid" style="margin-top:var(--xl)">${PARTS.map(k => `<button class="btn part-btn" data-part="${k}" aria-pressed="${p === k}" aria-label="${esc(t("firstRun.aria.partButton", { partName: partName(k) }))}"><span class="l">${k}</span><span>${esc(partName(k))}</span></button>`).join("")}</div>
    ${p ? `<div style="margin-top:var(--lg)"><div class="cap" style="margin-bottom:var(--sm)">${esc(C.part["label.subpart"])} · ${esc(C.part["hint.subpart"])}</div>
      <div class="sub-row">${["all", "1", "2"].map(s => `<button class="btn" data-sub="${s}" aria-pressed="${S.subpart === s}">${esc(t("part.subpart." + s, { part: partName(p) }))}</button>`).join("")}</div></div>` : ""}
    <div style="margin-top:var(--xl)">
      <div class="step"><span class="num gold">02</span><div><div class="t">${esc(C.firstRun["step2.title"])}</div><div class="d">${esc(C.firstRun["step2.desc"])}</div></div></div>
      <div class="step"><span class="num gold">03</span><div><div class="t">${esc(C.firstRun["step3.title"])}</div><div class="d">${esc(C.firstRun["step3.desc"])}</div></div></div></div>
    <div class="grow"></div>
    <button class="btn primary" id="next" style="width:100%;min-height:60px" ${p ? "" : "disabled"} data-go="home">${esc(p ? C.firstRun["button.next"] : C.firstRun["button.disabled"])}</button></div>`; },

  home() { const songs = DATA.songs, prog = store.get("progress.songs", {});
    const st = s => (prog[s.id] && prog[s.id].status) || s.status || "not_started";
    const ok = songs.filter(s => ["ready", "nearly_stable"].includes(st(s))).length;
    const focus = songs.filter(s => (prog[s.id] ? prog[s.id].needsFocus : s.needsFocus));
    const rec = songs[0], last = store.get("practice.lastPosition", null);
    const card = last ? `<div class="eyebrow">${esc(C.home["eyebrow.resume"])}</div><h2 style="margin-top:var(--sm)">${esc((songs.find(s => s.id === last.songId) || {}).title || "")}</h2>
        <button class="btn primary" data-go="practice" style="margin-top:var(--md);width:100%">${esc(C.home["button.resume"])}</button>`
      : rec ? `<div class="eyebrow">${esc(C.home["eyebrow.today"])}</div><h2 style="margin-top:var(--sm)">No.${rec.no} ${esc(rec.title)}</h2>
        <button class="btn primary" data-go="practice" style="margin-top:var(--md);width:100%">${esc(C.home["button.startNow"])}</button>`
      : `<p class="muted" style="margin:0">${esc(C.empty.noRecommendation)}</p>`;
    return `${roleSlot()}<div class="col" style="padding-top:var(--xxl)">
    <div class="row" style="justify-content:space-between"><div><div class="eyebrow">${esc(partName(S.part || "T"))}</div></div>
      <span class="num gold" style="font-size:25px;font-weight:600">${esc(t("home.dday", { days: dday() }))}</span></div>
    <div class="card" style="margin-top:var(--lg)">${card}</div>
    <div style="margin-top:var(--xl)"><div class="eyebrow">${esc(C.home["eyebrow.focus"])}</div>
      ${focus.length ? focus.map(s => `<button class="song-row" data-go="practice"><span class="num gold">${s.no}</span><span class="grow">${esc(s.title)}</span><span class="flag">${esc(C.flag.needs_focus.label)}</span></button>`).join("") : `<p class="muted" style="margin:var(--sm) 0 0">${esc(C.empty.noFocus)}</p>`}</div>
    <div class="card" style="margin-top:var(--xl)"><div class="eyebrow">${esc(C.home["eyebrow.readiness"])}</div>
      <p style="margin:var(--sm) 0 var(--md)">${esc(t("home.readiness.summary", { total: songs.length, count: ok }))}</p>
      <button class="btn" data-go="progress_all" style="width:100%">${esc(C.home["link.allSongs"])}</button></div>
    <p class="cap" style="margin-top:var(--lg)">${esc(C.home["note.part2"])}</p>
    <p class="cap">${esc(C.home["status.needDownload"])}</p></div>`; },

  progress_all() { const prog = store.get("progress.songs", {});
    const all = DATA.songs.map(s => ({ ...s, st: (prog[s.id] && prog[s.id].status) || s.status || "not_started", nf: prog[s.id] ? prog[s.id].needsFocus : s.needsFocus }));
    const f = S.filter, list = all.filter(s => f === "all" || (f === "focus" ? s.nf : s.st === "ready"));
    const cnt = { all: all.length, focus: all.filter(s => s.nf).length, ready: all.filter(s => s.st === "ready").length };
    return `${roleSlot()}<div class="col" style="padding-top:var(--xxl)">
    ${backLink(C.progress.back, "home")}
    <h1 style="margin-top:var(--lg)">${esc(C.progress.title)}</h1>
    <p class="muted" style="margin:var(--sm) 0 var(--lg)">${esc(t("progress.subtitle", { partName: partName(S.part || "T"), count: all.length }))}</p>
    <div class="tabs">${["all", "focus", "ready"].map(k => `<button class="btn" data-filter="${k}" aria-pressed="${f === k}">${esc(t("progress.filter." + k, { count: cnt[k] }))}</button>`).join("")}</div>
    <div style="margin-top:var(--lg)">${list.length ? list.map(s => `<button class="song-row" data-go="practice"><span class="num gold" style="min-width:34px">${s.no}</span>${statusDot(s.st)}<span class="grow">${esc(s.title)}<br><span class="cap">${esc(C.readiness[s.st].label)}</span></span>${s.nf ? `<span class="flag">${esc(C.flag.needs_focus.label)}</span>` : ""}</button>`).join("") : `<p class="muted">${esc(C.progress.empty)}</p>`}</div>
    <div class="hair" style="margin-top:var(--xl);padding-top:var(--md)"><span class="eyebrow">${esc(C.progress["part2.header"])}</span></div></div>`; },

  practice() { const sd = S.sound, pr = S.practice;
    const sw = (k, label, desc) => `<div class="sw"><div><div>${esc(C.practice[label])}</div><div class="cap">${esc(C.practice[desc])}</div></div><button class="btn" data-snd="${k}" aria-pressed="${!!sd[k]}">${sd[k] ? "켜짐" : "꺼짐"}</button></div>`;
    return `<div class="col" style="min-height:100vh">
    <div class="p-head">${backLink(C.progress.back, "home")}<span class="grow"></span><span class="num gold">${esc(t("practice.loop", { bars: 4 }))}</span></div>
    <div class="score" aria-label="${esc(C.practice["zoom.label"])}"><div><p style="margin:0">${esc(C.error.audioMissing)}</p></div></div>
    <div style="padding:var(--md) var(--gutter)"><div class="tabs">${["normal", "large", "fullPage"].map((k, i) => `<button class="btn" data-zoom="${["보통", "크게", "전체 페이지"][i]}" aria-pressed="${pr.scoreZoom === ["보통", "크게", "전체 페이지"][i]}">${esc(C.practice["zoom." + k])}</button>`).join("")}</div>
      <details class="fold"><summary>${esc(C.practice["sound.title"])}</summary><p class="cap">${esc(C.practice["sound.note"])}</p>
        ${sw("mineLouder", "sound.mineLouder", "sound.mineLouder.desc")}${sw("piano", "sound.piano", "sound.piano.desc")}${sw("click", "sound.click", "sound.click.desc")}</details>
      <details class="fold"><summary>${esc(C.practice["selfCheck.question"])}</summary><div class="tabs">${["hard", "almost", "ready"].map(k => `<button class="btn" data-check="${k}" aria-pressed="${pr.selfCheck === k}">${esc(C.practice["selfCheck." + k])}</button>`).join("")}</div></details></div>
    <div class="bar"><div class="row"><button class="btn" data-speed="1" aria-label="${esc(C.practice["speed.label"])}">${esc(C.practice["speed.label"])} ${esc(t("practice.speed.value", { rate: pr.speed }))}</button>
      <button class="btn primary" data-play="1" style="min-width:120px" aria-label="${esc(pr.playing ? C.practice["aria.pause"] : C.practice["aria.play"])}">${esc(pr.playing ? C.practice["aria.pause"] : C.practice["aria.play"])}</button>
      <button class="btn" data-loop="1" aria-pressed="${pr.loop}">${esc(t("practice.loop", { bars: 4 }))}</button></div></div></div>`; }
};
/* song_detail: 서사·구간 자료가 계약 data_keys 로 전달되지 않아 화면 미구현(자료 도착 후 구현). */

/* ---- 라우터·이벤트 ---- */
function go(id) {
  if (id === "song_detail") id = "progress_all";
  S.screen = id; store.set("meta.lastScreen", id);
  const el = document.getElementById("app");
  const dark = id === "cover";
  el.innerHTML = `<section class="screen on" id="s-${id === "cover" ? "cover" : id === "practice" ? "practice" : id}">${V[id]()}</section>`;
  document.body.style.background = dark ? "var(--navy-deep)" : "var(--paper-base)";
  document.querySelectorAll(".tex,.grain").forEach(e => e.style.visibility = dark ? "hidden" : "");
  setTexture(id === "first_run_part_select" ? TEX[S.part || "none"] : "none-visible");
  window.scrollTo(0, 0);
}
document.addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  if (b.dataset.part) { S.part = b.dataset.part; S.subpart = "all"; store.set("user.part", S.part); store.set("user.subpart", "all");
    const sc = window.scrollY; go("first_run_part_select"); window.scrollTo(0, sc); return; }
  if (b.dataset.sub) { S.subpart = b.dataset.sub; store.set("user.subpart", S.subpart); go("first_run_part_select"); return; }
  if (b.dataset.filter) { S.filter = b.dataset.filter; go("progress_all"); return; }
  if (b.dataset.act === "conductor") return toast(C.role.conductorPending);
  if (b.dataset.snd) { const k = b.dataset.snd; S.sound[k] = !S.sound[k]; store.set("sound." + k, S.sound[k]); return go("practice"); }
  if (b.dataset.zoom) { S.practice.scoreZoom = b.dataset.zoom; store.set("practice.scoreZoom", b.dataset.zoom); return go("practice"); }
  if (b.dataset.check) { S.practice.selfCheck = b.dataset.check; store.set("progress.selfCheck", b.dataset.check); toast(C.practice["selfCheck.saved"]); return go("practice"); }
  if (b.dataset.speed) { const r = ["1.0", "0.9", "0.8"]; S.practice.speed = r[(r.indexOf(S.practice.speed) + 1) % 3]; store.set("sound.speed", S.practice.speed); return go("practice"); }
  if (b.dataset.loop) { S.practice.loop = !S.practice.loop; store.set("practice.loop", S.practice.loop); return go("practice"); }
  if (b.dataset.play) { return toast(C.error.audioMissing); }
  if (b.dataset.go && !b.disabled) go(b.dataset.go);
});

(async function boot() {
  store.init();
  try { C = await (await fetch("contract/ui-copy.json")).json(); } catch (e) { document.body.textContent = "ui-copy.json"; return; }
  try { DATA = await (await fetch("data/songs.json")).json(); } catch (e) {}
  S.part = store.get("user.part", null); S.subpart = store.get("user.subpart", "all");
  S.sound = { mineLouder: store.get("sound.mineLouder", true), piano: store.get("sound.piano", true), click: store.get("sound.click", false) };
  S.practice = { loop: store.get("practice.loop", true), speed: store.get("sound.speed", "1.0"), scoreZoom: store.get("practice.scoreZoom", "크게"), selfCheck: store.get("progress.selfCheck", "none"), playing: false };
  document.getElementById("notice").textContent = C.orientation.landscapeNotice + " " + C.orientation.landscapeNoticeSub;
  preloadTextures();
  const q = new URLSearchParams(location.search).get("screen");
  go(q && V[q] ? q : SHOW_COVER_ON_LAUNCH ? "cover" : S.part ? "home" : "first_run_part_select");
})();
