/* =========================================================
 * 6학년 9단원 · What are you going to do? · 나의 계획 말하기 웹 앱
 * - 음성 출력: Web Speech API (SpeechSynthesis)
 * - 단어 클릭: 단어 발음 + 뜻 풍선(popup)
 * - 실제 사진: 위키백과 대표 사진 (못 불러오면 이모지)
 * - 내 계획표: 질문 5개(오후·밤·내일·주말·겨울방학)마다 할 일 1개
 * - 연습: 친구 인터뷰 기록 + 줄마다 말하기 + 역할극(A/B) 채점
 * - 사진 퀴즈: 사진 보고 알맞은 I'm going to ___. 고르기
 * ========================================================= */

/* ---------- 음성 합성 (TTS) ---------- */
const synth = window.speechSynthesis;
let enVoice = null;
let speakRate = 0.85;

function pickVoice() {
  const voices = synth.getVoices();
  enVoice =
    voices.find(v => /en[-_]US/i.test(v.lang)) ||
    voices.find(v => /^en/i.test(v.lang)) ||
    null;
  const status = document.querySelector(".toolbar #voice-status");
  if (status) {
    status.textContent = enVoice ? `음성: ${enVoice.name}` : "영어 음성을 찾는 중...";
  }
}
pickVoice();
if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = pickVoice;

function speak(text, rate, onStart, onEnd) {
  if (!synth) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = rate || speakRate;
  u.pitch = 1.05;
  if (enVoice) u.voice = enVoice;
  if (onStart) u.onstart = onStart;
  if (onEnd) u.onend = onEnd;
  synth.speak(u);
}

/* ---------- 단어 뜻 풍선(popup) ---------- */
const popup = document.createElement("div");
popup.className = "word-popup hidden";
popup.innerHTML = `
  <div class="wp-word"></div>
  <div class="wp-meaning"></div>
  <button class="wp-listen">단어 다시 듣기</button>`;
document.body.appendChild(popup);

popup.querySelector(".wp-listen").addEventListener("click", e => {
  e.stopPropagation();
  if (popup.dataset.word) speak(popup.dataset.word, 0.8);
});

function wordKey(raw) { return raw.replace(/[.,!?]+$/, "").toLowerCase(); }

function showWordPopup(wordEl, rawWord) {
  const key = wordKey(rawWord);
  const plain = rawWord.replace(/[.,!?]+$/, "");
  const meaning = WORD_MEANINGS[key] || WORD_MEANINGS[plain] || "(뜻 정보 없음)";
  popup.dataset.word = plain;
  popup.querySelector(".wp-word").textContent = plain;
  popup.querySelector(".wp-meaning").textContent = meaning;

  popup.classList.remove("hidden");
  const r = wordEl.getBoundingClientRect();
  const pw = popup.offsetWidth;
  let left = r.left + r.width / 2 - pw / 2 + window.scrollX;
  left = Math.max(8, Math.min(left, window.innerWidth - pw - 8));
  popup.style.left = left + "px";
  popup.style.top = (r.bottom + 8 + window.scrollY) + "px";

  speak(plain, 0.8);
}

function hidePopup() { popup.classList.add("hidden"); }
document.addEventListener("click", e => {
  if (!popup.contains(e.target) && !e.target.classList.contains("word")) hidePopup();
});

/* ---------- 클릭 가능한 단어로 문장 만들기 ---------- */
function buildWords(sentence) {
  const frag = document.createDocumentFragment();
  sentence.split(/\s+/).forEach((w, i) => {
    if (i > 0) frag.appendChild(document.createTextNode(" "));
    const span = document.createElement("span");
    span.className = "word";
    span.textContent = w;
    span.addEventListener("click", e => {
      e.stopPropagation();
      showWordPopup(span, w);
    });
    frag.appendChild(span);
  });
  return frag;
}

/* ===========================================================
 * 📷 실제 사진 (위키백과 대표 사진)
 * - 한 번에 여러 문서의 사진 주소를 받아 와서 브라우저에 7일 동안 저장
 * - 인터넷이 안 되거나 사진이 없으면 이모지 그림이 그대로 보여요
 * =========================================================== */
const PHOTO_CACHE_KEY = "plan_photos_v1";
const PHOTO_CACHE_DAYS = 7;
let photoOn = true;
let photoMap = {};
try {
  photoOn = localStorage.getItem("plan_photo_on") !== "0";
  const c = JSON.parse(localStorage.getItem(PHOTO_CACHE_KEY) || "null");
  if (c && c.map && Date.now() - c.t < PHOTO_CACHE_DAYS * 864e5) photoMap = c.map;
} catch (e) {}

let photoPromise = null;
function fetchPhotos() {
  if (photoPromise) return photoPromise;
  const titles = [...new Set([...TIMES, ...ACTIVITIES].filter(x => x.wiki && !x.photo).map(x => x.wiki))];
  const need = titles.filter(t => !(t in photoMap));
  if (!need.length) return (photoPromise = Promise.resolve(photoMap));
  const chunks = [];
  for (let i = 0; i < need.length; i += 20) chunks.push(need.slice(i, i + 20));
  photoPromise = Promise.all(chunks.map(ch => {
    const url = "https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1" +
      "&prop=pageimages&piprop=thumbnail&pithumbsize=480&titles=" + encodeURIComponent(ch.join("|"));
    return fetch(url).then(r => r.json()).then(data => {
      const q = data.query || {};
      const back = {}; // 위키백과가 바꾼 제목 → 처음 요청한 제목
      ch.forEach(t => { back[t] = t; });
      (q.normalized || []).forEach(n => { back[n.to] = back[n.from] || n.from; });
      (q.redirects || []).forEach(r => { back[r.to] = back[r.from] || r.from; });
      Object.values(q.pages || {}).forEach(p => {
        const orig = back[p.title];
        if (orig) photoMap[orig] = p.thumbnail ? p.thumbnail.source : "";
      });
    }).catch(() => {});
  })).then(() => {
    try { localStorage.setItem(PHOTO_CACHE_KEY, JSON.stringify({ t: Date.now(), map: photoMap })); } catch (e) {}
    return photoMap;
  });
  return photoPromise;
}

/* 이모지 타일 위에 사진을 얹어요 (사진을 못 불러오면 이모지가 남음) */
function makeVisual(item, cls) {
  const box = document.createElement("div");
  box.className = "visual" + (cls ? " " + cls : "");
  const em = document.createElement("div");
  em.className = "emoji";
  em.textContent = item.emoji;
  box.appendChild(em);
  if (!photoOn) return box;
  const apply = src => {
    if (!src) return;
    const img = new Image();
    img.className = "photo";
    img.alt = item.en || "";
    img.decoding = "async";
    img.addEventListener("load", () => box.classList.add("has-photo"));
    img.addEventListener("error", () => img.remove());
    img.src = src;
    if (item.wiki && !item.photo) box.title = "사진: Wikipedia · " + item.wiki;
    box.appendChild(img);
  };
  if (item.photo) apply(item.photo);
  else if (item.wiki) fetchPhotos().then(m => apply(m[item.wiki]));
  return box;
}

/* ---------- 카드 만들기 ---------- */
function makeCard(item, opts) {
  opts = opts || {};
  const div = document.createElement("div");
  div.className = "card" + (opts.tone != null ? " tone-" + opts.tone : "");

  function speakSentence() {
    speak(item.en, null,
      () => div.classList.add("speaking"),
      () => div.classList.remove("speaking"));
  }

  const top = document.createElement("div");
  top.className = "card-top";
  const tag = document.createElement("span");
  tag.className = "card-tag";
  tag.textContent = opts.tag || "";
  const listenAll = document.createElement("button");
  listenAll.className = "listen-all";
  listenAll.textContent = "듣기 ▶";
  listenAll.addEventListener("click", e => { e.stopPropagation(); speakSentence(); });
  top.append(tag, listenAll);

  const visual = makeVisual(item, opts.noPhoto ? "no-photo" : "");
  visual.addEventListener("click", speakSentence);

  const box = document.createElement("div");
  box.className = "sentence-box";
  const txt = document.createElement("div");
  txt.className = "sentence-text";
  const en = document.createElement("div");
  en.className = "en";
  en.appendChild(buildWords(item.en));
  const ko = document.createElement("div");
  ko.className = "ko";
  ko.textContent = item.ko;
  txt.append(en, ko);
  const speakBtn = document.createElement("button");
  speakBtn.className = "speak-btn";
  speakBtn.setAttribute("aria-label", "문장 듣기");
  speakBtn.textContent = "🔊";
  speakBtn.addEventListener("click", e => { e.stopPropagation(); speakSentence(); });
  box.append(txt, speakBtn);

  div.append(top, visual, box);
  if (opts.badges) {
    const b = document.createElement("div");
    b.className = "card-badges";
    b.textContent = opts.badges;
    div.appendChild(b);
  }
  return div;
}

const findTime = key => TIMES.find(t => t.key === key) || null;
const findAct = id => ACTIVITIES.find(a => a.id === id) || null;
const catLabel = key => (ACT_CATS.find(c => c.key === key) || {}).label || "";
const whenBadges = a => "⏰ " + a.when.map(k => findTime(k).short).join(" · ");
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function makeChip(text, cls, isOn, onClick) {
  const c = document.createElement("button");
  c.className = "chip " + cls + (isOn ? " on" : "");
  c.textContent = text;
  c.addEventListener("click", onClick);
  return c;
}
function setBlank(id, en) {
  const el = document.getElementById(id);
  el.classList.toggle("filled", !!en);
  if (en) { el.innerHTML = ""; el.appendChild(buildWords(en)); }
  else el.textContent = "________";
}

/* 활동 칩을 종류별로 묶어서 그리기 (⭐ = 고른 때에 잘 어울리는 활동) */
function renderActChips(wrap, selectedId, timeKey, onPick) {
  wrap.innerHTML = "";
  ACT_CATS.forEach(cat => {
    const title = document.createElement("div");
    title.className = "chip-group-title";
    title.textContent = cat.label;
    const row = document.createElement("div");
    row.className = "chip-row wrap";
    ACTIVITIES.filter(a => a.cat === cat.key).forEach(a => {
      const rec = timeKey && a.when.includes(timeKey);
      const chip = makeChip(`${rec ? "⭐ " : ""}${a.emoji} ${a.en}`, "act", selectedId === a.id, () => onPick(a));
      if (timeKey && !rec) chip.classList.add("soft");
      row.appendChild(chip);
    });
    wrap.append(title, row);
  });
}

/* ===========================================================
 * ❓ 질문하기
 * =========================================================== */
function renderQuestions() {
  const grid = document.getElementById("question-grid");
  grid.innerHTML = "";
  TIMES.forEach((t, i) => {
    grid.appendChild(makeCard(
      { en: questionEn(t), ko: questionKo(t), emoji: t.emoji, wiki: t.wiki },
      { tone: i % 6, tag: `Q${i + 1} · ${t.short}`, badges: "💬 I'm going to ___." }
    ));
  });
}

/* ===========================================================
 * 🎨 활동 카드
 * =========================================================== */
let actLevel = "basic";
let actCat = "all";
let actTime = "all";

function renderActivityFilters() {
  const catWrap = document.getElementById("act-cat-switch");
  catWrap.innerHTML = "";
  [{ key: "all", label: "전체" }, ...ACT_CATS].forEach(c => {
    const b = document.createElement("button");
    b.className = "cat-btn" + (actCat === c.key ? " active" : "");
    b.textContent = c.label;
    b.addEventListener("click", () => { actCat = c.key; synth.cancel(); hidePopup(); renderActivityFilters(); renderActivities(); });
    catWrap.appendChild(b);
  });
  const timeWrap = document.getElementById("act-time-filter");
  timeWrap.innerHTML = "";
  timeWrap.appendChild(makeChip("🌈 언제든지", "with", actTime === "all", () => { actTime = "all"; renderActivityFilters(); renderActivities(); }));
  TIMES.forEach(t => {
    timeWrap.appendChild(makeChip(`${t.emoji} ${t.en}`, "with", actTime === t.key, () => {
      actTime = t.key; renderActivityFilters(); renderActivities();
    }));
  });
}

function renderActivities() {
  const grid = document.getElementById("activity-grid");
  grid.innerHTML = "";
  const list = ACTIVITIES.filter(a =>
    (actCat === "all" || a.cat === actCat) && (actTime === "all" || a.when.includes(actTime)));
  list.forEach((a, i) => {
    grid.appendChild(makeCard(
      { en: answerEn(a, actLevel), ko: answerKo(a, actLevel), emoji: a.emoji, wiki: a.wiki, photo: a.photo },
      { tone: i % 6, tag: catLabel(a.cat), badges: whenBadges(a) }
    ));
  });
  document.getElementById("activity-count").textContent = `${list.length}개`;
}

document.querySelectorAll(".level-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".level-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    actLevel = btn.dataset.level;
    synth.cancel();
    hidePopup();
    renderActivities();
  });
});

/* ===========================================================
 * 💬 대답하기 (빈칸 채우기 + 맞장구)
 * =========================================================== */
let ansTime = null, ansAct = null, ansReact = null, lastAnsSpoken = "";

function ansLines() {
  const t = findTime(ansTime), a = findAct(ansAct), r = REACTIONS[ansReact];
  const lines = [];
  if (t) lines.push(questionEn(t));
  if (a) lines.push(answerEn(a, "basic"));
  if (r) lines.push(r.en);
  return lines;
}

function renderAnswer(autoSpeak) {
  const t = findTime(ansTime), a = findAct(ansAct), r = REACTIONS[ansReact];
  const tRow = document.getElementById("ans-time-chips");
  tRow.innerHTML = "";
  TIMES.forEach(x => tRow.appendChild(makeChip(`${x.emoji} ${x.en}`, "with", ansTime === x.key, () => {
    ansTime = x.key; renderAnswer(true);
  })));
  renderActChips(document.getElementById("ans-act-chips"), ansAct, ansTime, x => { ansAct = x.id; renderAnswer(true); });
  const rRow = document.getElementById("ans-react-chips");
  rRow.innerHTML = "";
  REACTIONS.forEach((x, i) => rRow.appendChild(makeChip(`${x.emoji} ${x.en}`, "when", ansReact === i, () => {
    ansReact = i; renderAnswer(true);
  })));

  setBlank("ans-time", t && t.en);
  document.getElementById("ans-time-ko").textContent = `너는 ${t ? t.ko : "________"} 무엇을 할 거니?`;
  setBlank("ans-act", a && a.en);
  document.getElementById("ans-act-ko").textContent = `나는 ${a ? a.ko : "________"} 거야.`;
  const re = document.getElementById("ans-react");
  re.innerHTML = "";
  if (r) re.appendChild(buildWords(r.en));
  else re.innerHTML = '<span class="blank">________</span>';
  document.getElementById("ans-react-ko").textContent = r ? r.ko : "(맞장구)";

  const complete = !!(t && a && r);
  document.getElementById("ans-listen").disabled = !complete;
  if (complete && autoSpeak) {
    const en = ansLines().join(" ");
    if (en !== lastAnsSpoken) { lastAnsSpoken = en; speak(en); }
  }
}
document.getElementById("ans-speak-q").addEventListener("click", () => { const t = findTime(ansTime); if (t) speak(questionEn(t)); });
document.getElementById("ans-speak-a").addEventListener("click", () => { const a = findAct(ansAct); if (a) speak(answerEn(a, "basic")); });
document.getElementById("ans-speak-r").addEventListener("click", () => { const r = REACTIONS[ansReact]; if (r) speak(r.en); });
document.getElementById("ans-listen").addEventListener("click", () => speak(ansLines().join(" ")));
document.getElementById("ans-random").addEventListener("click", () => {
  const t = pick(TIMES);
  ansTime = t.key;
  ansAct = pick(ACTIVITIES.filter(a => a.when.includes(t.key))).id;
  ansReact = Math.floor(Math.random() * REACTIONS.length);
  renderAnswer(true);
});

function renderReactions() {
  const grid = document.getElementById("react-grid");
  grid.innerHTML = "";
  REACTIONS.forEach((r, i) => grid.appendChild(makeCard(r, { tone: i % 6 })));
}

/* ===========================================================
 * 🗓️ 내 계획표 (질문 5개 × 할 일 1개)
 * =========================================================== */
let plans = {};          // { afternoon: "kite", ... } (활동 id)
let planLevel = "basic";
let curPlan = 0;
let myName = "";
let stats = {};          // 문장별 정확도 기록
let interview = { name: "", answers: ["", "", "", "", ""], reacted: [false, false, false, false, false] };

try {
  const saved = JSON.parse(localStorage.getItem("plan_sets") || "null");
  if (saved) {
    if (saved.plans) plans = saved.plans;
    if (saved.level === "plus") planLevel = "plus";
    if (saved.name) myName = saved.name;
  }
  const iv = JSON.parse(localStorage.getItem("plan_interview") || "null");
  if (iv && Array.isArray(iv.answers)) interview = Object.assign(interview, iv);
  stats = JSON.parse(localStorage.getItem("plan_stats") || "{}") || {};
} catch (e) {}

function persist() {
  try {
    localStorage.setItem("plan_sets", JSON.stringify({ plans, level: planLevel, name: myName }));
    localStorage.setItem("plan_interview", JSON.stringify(interview));
    localStorage.setItem("plan_stats", JSON.stringify(stats));
  } catch (e) {}
}
const planAct = key => findAct(plans[key]);
const doneCount = () => TIMES.filter(t => planAct(t.key)).length;

function updatePlanBadge() {
  document.getElementById("plan-count").textContent = `${doneCount()}/${TIMES.length}`;
  const wrap = document.getElementById("plan-tabs");
  wrap.innerHTML = "";
  TIMES.forEach((t, i) => {
    const a = planAct(t.key);
    const b = document.createElement("button");
    b.className = "set-tab" + (i === curPlan ? " active" : "") + (a ? " done" : "");
    b.textContent = `${t.emoji} ${t.short}${a ? " " + a.emoji + " ✓" : ""}`;
    b.addEventListener("click", () => { curPlan = i; synth.cancel(); lastPlanSpoken = ""; renderPlan(); });
    wrap.appendChild(b);
  });
}

let lastPlanSpoken = "";
function renderPlan(autoSpeak) {
  const t = TIMES[curPlan];
  const a = planAct(t.key);
  updatePlanBadge();

  document.querySelectorAll("#plan-level .cat-btn").forEach(b => b.classList.toggle("active", b.dataset.level === planLevel));
  const q = document.getElementById("plan-q");
  q.innerHTML = ""; q.appendChild(buildWords(questionEn(t)));
  document.getElementById("plan-q-ko").textContent = questionKo(t);
  setBlank("plan-act", a && (planLevel === "plus" ? `${a.en} ${a.ext.en}` : a.en));
  document.getElementById("plan-act-ko").textContent = a ? answerKo(a, planLevel) : "나는 ________ 거야.";

  const ph = document.getElementById("plan-photo");
  ph.innerHTML = "";
  ph.appendChild(makeVisual(a || t));

  const status = document.getElementById("plan-status");
  status.className = "dlg-status" + (a ? " ok" : "");
  if (!a) status.textContent = `${t.emoji} ${t.short}에 무엇을 할 건가요? 아래에서 할 일을 골라요 👇 (⭐ 추천)`;
  else if (!a.when.includes(t.key)) {
    status.className = "dlg-status warn";
    status.textContent = `🤔 ${t.short}에 ${a.en}? 조금 바쁠 수도 있어요! 그래도 정말 할 거라면 OK 👍`;
  } else status.textContent = `✅ ${t.short} 계획 완성! ${doneCount() < TIMES.length ? "다음 칸도 만들어 보세요." : "5개 모두 완성! 📝 계획표를 보고 🎤 연습으로 가요."}`;

  renderActChips(document.getElementById("plan-acts"), plans[t.key], t.key, x => {
    plans[t.key] = x.id; persist(); renderPlan(true);
  });

  const listen = document.getElementById("plan-listen");
  listen.disabled = !a;
  renderPlanSummary();
  if (a && autoSpeak) {
    const en = `${questionEn(t)} ${answerEn(a, planLevel)}`;
    if (en !== lastPlanSpoken) { lastPlanSpoken = en; speak(en); }
  }
}

document.querySelectorAll("#plan-level .cat-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    planLevel = btn.dataset.level; lastPlanSpoken = ""; persist(); renderPlan(true);
  });
});
document.getElementById("plan-speak-q").addEventListener("click", () => speak(questionEn(TIMES[curPlan])));
document.getElementById("plan-speak-a").addEventListener("click", () => {
  const a = planAct(TIMES[curPlan].key); if (a) speak(answerEn(a, planLevel));
});
document.getElementById("plan-listen").addEventListener("click", () => {
  const t = TIMES[curPlan], a = planAct(t.key);
  if (a) speak(`${questionEn(t)} ${answerEn(a, planLevel)}`);
});
document.getElementById("plan-random").addEventListener("click", () => {
  const t = TIMES[curPlan];
  const used = new Set(Object.values(plans));
  const pool = ACTIVITIES.filter(a => a.when.includes(t.key) && !used.has(a.id));
  plans[t.key] = pick(pool.length ? pool : ACTIVITIES.filter(a => a.when.includes(t.key))).id;
  persist(); renderPlan(true);
});
document.getElementById("plan-clear").addEventListener("click", () => {
  delete plans[TIMES[curPlan].key];
  synth.cancel(); persist(); renderPlan();
});

/* 📝 나의 계획표 */
function renderPlanSummary() {
  const box = document.getElementById("plan-summary");
  box.innerHTML = "";
  const head = document.createElement("div");
  head.className = "plan-board-head";
  head.textContent = `📅 ${myName ? myName + "의" : "나의"} 계획표 · My Plans`;
  box.appendChild(head);
  TIMES.forEach((t, i) => {
    const a = planAct(t.key);
    const row = document.createElement("div");
    row.className = "plan-row tone-" + (i % 6) + (a ? "" : " empty");
    const when = document.createElement("div");
    when.className = "plan-when";
    when.innerHTML = `<span class="plan-when-emoji">${t.emoji}</span><span>${t.short}</span>`;
    const body = document.createElement("div");
    body.className = "plan-body";
    const qEl = document.createElement("div"); qEl.className = "plan-q"; qEl.appendChild(buildWords("Q. " + questionEn(t)));
    const aEl = document.createElement("div"); aEl.className = "plan-a";
    if (a) aEl.appendChild(buildWords("A. " + answerEn(a, planLevel)));
    else aEl.textContent = "A. I'm going to ________.";
    const ko = document.createElement("div"); ko.className = "ko"; ko.textContent = a ? answerKo(a, planLevel) : "아직 고르지 않았어요";
    body.append(qEl, aEl, ko);
    const emo = document.createElement("div"); emo.className = "plan-emoji"; emo.textContent = a ? a.emoji : "❔";
    const btn = document.createElement("button");
    btn.className = "speak-btn small"; btn.textContent = "🔊"; btn.disabled = !a;
    btn.setAttribute("aria-label", "듣기");
    btn.addEventListener("click", () => a && speak(`${questionEn(t)} ${answerEn(a, planLevel)}`));
    row.append(when, body, emo, btn);
    box.appendChild(row);
  });
}
const nameInput = document.getElementById("my-name");
nameInput.value = myName;
nameInput.addEventListener("input", () => { myName = nameInput.value.trim(); persist(); renderPlanSummary(); });
document.getElementById("print-plan").addEventListener("click", () => {
  document.body.classList.add("print-plan");
  window.print();
  setTimeout(() => document.body.classList.remove("print-plan"), 500);
});

/* ===========================================================
 * 🎙️ 음성 인식 (정확도 측정)
 * =========================================================== */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const srSupported = !!SR;
let rec = srSupported ? new SR() : null;
if (rec) { rec.lang = "en-US"; rec.interimResults = false; rec.maxAlternatives = 5; }
let recBusy = false;

function normalize(s) {
  return s.toLowerCase().replace(/[^a-z\s']/g, "").replace(/\s+/g, " ").trim();
}
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}
function wordsClose(a, b) {
  if (a === b) return true;
  if (a.length >= 4 && b.length >= 4 && (a.startsWith(b) || b.startsWith(a))) return true;
  return Math.abs(a.length - b.length) <= 1 && levenshtein(a, b) <= 1;
}
const STOPWORDS = new Set(["a", "an", "the", "to", "of", "on", "in", "at", "for", "by", "i", "i'm", "going", "my"]);
function scoreMatch(target, heard) {
  const t = normalize(target).split(" ").filter(Boolean);
  const h = normalize(heard).split(" ").filter(Boolean);
  let content = t.filter(w => !STOPWORDS.has(w));
  if (!content.length) content = t;
  let hit = 0;
  content.forEach(w => { if (h.some(x => wordsClose(x, w))) hit++; });
  let score = hit / content.length;
  if (score >= 0.5) score = Math.min(1, score + 0.12);
  return score;
}
function practiceAttempt(target, cb) {
  if (!rec || recBusy) { cb.onend && cb.onend(); return; }
  recBusy = true;
  let score = 0, heard = "", errCode = null;
  rec.onresult = e => {
    const alts = e.results[0];
    for (let i = 0; i < alts.length; i++) {
      const s = scoreMatch(target, alts[i].transcript);
      if (s > score) { score = s; heard = alts[i].transcript; }
    }
  };
  rec.onerror = ev => { errCode = ev.error; };
  rec.onend = () => {
    recBusy = false;
    if (errCode && score === 0) cb.onerror && cb.onerror(errCode);
    else cb.onresult && cb.onresult(Math.round(score * 100), heard);
    cb.onend && cb.onend();
  };
  try { rec.start(); } catch (e) { recBusy = false; cb.onend && cb.onend(); }
}

/* 말한 뒤 콜백 (음성이 없어도 넘어가도록 안전장치) */
function speakThen(text, cb) {
  let done = false;
  const finish = () => { if (!done) { done = true; cb(); } };
  const timer = setTimeout(finish, Math.min(9000, 1500 + text.length * 90));
  speak(text, null, null, () => { clearTimeout(timer); finish(); });
}

function statsText(en, last) {
  const s = stats[en] || { attempts: 0, best: 0 };
  return `정확도 <b class="acc">${last != null ? last + "%" : "--"}</b>` +
    ` · 최고 <b class="best">${s.best ? s.best + "%" : "--"}</b>` +
    ` · <b>${s.attempts}</b>회`;
}
function recordScore(en, score) {
  const s = stats[en] || { attempts: 0, best: 0 };
  s.attempts++; s.best = Math.max(s.best, score); stats[en] = s; persist();
}
function feedbackHtml(score, heard) {
  const h = `<span class="heard">내 발음: ${heard || "(못 들었어요)"}</span>`;
  if (score >= 75) return ["good", `⭐ 훌륭해요! ${score}% ${h}`];
  if (score >= 45) return ["good", `👍 좋아요! 한 번 더! ${score}% ${h}`];
  return ["bad", `🔁 다시 또박또박! ${score}% ${h}`];
}

/* 한 문장 연습 줄: [🔊] 문장/뜻 [🎙️ 말하기] 점수 → 피드백 */
function makeSpeakRow(en, ko, who) {
  const row = document.createElement("div");
  row.className = "prow" + (who ? " who-" + who.toLowerCase() : "");

  const speakBtn = document.createElement("button");
  speakBtn.className = "speak-btn small";
  speakBtn.setAttribute("aria-label", "듣기");
  speakBtn.textContent = "🔊";
  speakBtn.addEventListener("click", () => speak(en));

  const txt = document.createElement("div");
  txt.className = "prow-text";
  if (who) { const w = document.createElement("span"); w.className = "prow-who"; w.textContent = who; txt.appendChild(w); }
  const enEl = document.createElement("div"); enEl.className = "en"; enEl.appendChild(buildWords(en));
  const koEl = document.createElement("div"); koEl.className = "ko"; koEl.textContent = ko;
  txt.append(enEl, koEl);

  const mic = document.createElement("button");
  mic.className = "mic-btn";
  mic.innerHTML = '<span class="mic-ico">🎙️</span><span class="mic-txt">말하기</span>';
  const score = document.createElement("div");
  score.className = "pstats";
  score.innerHTML = statsText(en, null);
  const fb = document.createElement("div");
  fb.className = "mic-feedback";

  if (!srSupported) { mic.disabled = true; mic.title = "이 브라우저는 음성 인식을 지원하지 않아요 (Chrome 권장)"; }

  function attempt(after) {
    if (recBusy || !srSupported) { after && after(); return; }
    mic.classList.add("recording");
    row.classList.add("active");
    fb.className = "mic-feedback"; fb.textContent = "🔴 듣고 있어요... 또박또박 말해보세요!";
    practiceAttempt(en, {
      onresult: (s, heard) => {
        recordScore(en, s);
        score.innerHTML = statsText(en, s);
        const [cls, html] = feedbackHtml(s, heard);
        fb.className = "mic-feedback " + cls; fb.innerHTML = html;
      },
      onerror: err => {
        fb.className = "mic-feedback bad";
        fb.textContent = err === "not-allowed" ? "마이크 권한을 허용해 주세요." : "다시 시도해 주세요.";
      },
      onend: () => { mic.classList.remove("recording"); row.classList.remove("active"); after && after(); }
    });
  }
  mic.addEventListener("click", () => attempt());

  const main = document.createElement("div");
  main.className = "prow-main";
  main.append(speakBtn, txt, mic, score);
  row.append(main, fb);
  row._attempt = attempt;
  row._who = who;
  row._en = en;
  return row;
}

/* ===========================================================
 * 👫 친구 인터뷰
 * =========================================================== */
function renderInterview() {
  const nameEl = document.getElementById("friend-name");
  nameEl.value = interview.name || "";
  const list = document.getElementById("interview-list");
  list.innerHTML = "";
  TIMES.forEach((t, i) => {
    const row = document.createElement("div");
    row.className = "iv-row tone-" + (i % 6);
    const q = document.createElement("div");
    q.className = "iv-q";
    const sb = document.createElement("button");
    sb.className = "speak-btn small"; sb.textContent = "🔊"; sb.setAttribute("aria-label", "질문 듣기");
    sb.addEventListener("click", () => speak(questionEn(t)));
    const qt = document.createElement("div");
    qt.className = "iv-q-text";
    const qe = document.createElement("div"); qe.className = "en"; qe.appendChild(buildWords(`${t.emoji} ${questionEn(t)}`));
    qt.appendChild(qe);
    q.append(sb, qt);

    const a = document.createElement("div");
    a.className = "iv-a";
    const lab = document.createElement("span"); lab.className = "iv-pre"; lab.textContent = "I'm going to";
    const inp = document.createElement("input");
    inp.type = "text"; inp.maxLength = 60; inp.placeholder = "친구의 대답 (예: go camping)";
    inp.value = interview.answers[i] || "";
    inp.addEventListener("input", () => { interview.answers[i] = inp.value; persist(); });
    const chk = document.createElement("label");
    chk.className = "iv-react";
    const cb = document.createElement("input");
    cb.type = "checkbox"; cb.checked = !!interview.reacted[i];
    cb.addEventListener("change", () => { interview.reacted[i] = cb.checked; persist(); });
    chk.append(cb, document.createTextNode(" 😆 맞장구 했어요"));
    a.append(lab, inp, chk);
    row.append(q, a);
    list.appendChild(row);
  });
}
document.getElementById("friend-name").addEventListener("input", e => { interview.name = e.target.value; persist(); });
document.getElementById("interview-clear").addEventListener("click", () => {
  if (!confirm("지금 적은 인터뷰 내용을 지우고 새 친구를 인터뷰할까요?")) return;
  interview = { name: "", answers: ["", "", "", "", ""], reacted: [false, false, false, false, false] };
  persist(); renderInterview();
});

/* ===========================================================
 * 🎤 컴퓨터와 미리 연습하기 (계획별 대화: 줄마다 말하기 + 역할극)
 * =========================================================== */
function planLines(t, a, idx) {
  const r = REACTIONS[idx % REACTIONS.length];
  return [
    { who: "A", en: questionEn(t), ko: questionKo(t) },
    { who: "B", en: answerEn(a, planLevel), ko: answerKo(a, planLevel) },
    { who: "A", en: r.en, ko: r.ko },
  ];
}

function makePlanCard(t, a, idx) {
  const card = document.createElement("div");
  card.className = "pcard pcard-dialog";

  const top = document.createElement("div");
  top.className = "card-top";
  const left = document.createElement("div"); left.className = "ptag-left";
  const tag = document.createElement("span"); tag.className = "card-tag tag-combo"; tag.textContent = `${t.emoji} ${t.short}`;
  const title = document.createElement("span"); title.className = "pset-title"; title.textContent = `${a.emoji} ${a.en}`;
  left.append(tag, title);
  top.append(left);
  card.appendChild(top);

  const body = document.createElement("div");
  const rows = planLines(t, a, idx).map(l => makeSpeakRow(l.en, l.ko, l.who));
  rows.forEach(r => body.appendChild(r));
  const tools = document.createElement("div"); tools.className = "ptools";
  const roleNote = document.createElement("div"); roleNote.className = "role-note";
  card.append(body, tools, roleNote);

  let playing = false;
  const allBtn = document.createElement("button");
  allBtn.className = "btn small"; allBtn.textContent = "🔊 전체 듣기";
  allBtn.addEventListener("click", () => speak(rows.map(r => r._en).join(" ")));
  const roleA = document.createElement("button");
  roleA.className = "btn small primary"; roleA.textContent = "🎭 내가 A (질문하기)";
  const roleB = document.createElement("button");
  roleB.className = "btn small primary"; roleB.textContent = "🎭 내가 B (대답하기)";
  roleA.addEventListener("click", () => rolePlay("A", [roleA, roleB]));
  roleB.addEventListener("click", () => rolePlay("B", [roleA, roleB]));
  tools.append(allBtn, roleA, roleB);

  function rolePlay(me, btns) {
    if (playing || recBusy) return;
    if (!srSupported) { roleNote.textContent = "이 브라우저는 음성 인식을 지원하지 않아요 (Chrome 권장)"; return; }
    playing = true; btns.forEach(b => b.disabled = true);
    let i = 0;
    const step = () => {
      rows.forEach(r => r.classList.remove("turn"));
      if (i >= rows.length) {
        playing = false; btns.forEach(b => b.disabled = false);
        roleNote.textContent = "🎉 역할극 끝! 잘했어요. 역할을 바꿔서 한 번 더 해 볼까요?";
        return;
      }
      const r = rows[i]; i++;
      r.classList.add("turn");
      if (r._who === me) {
        roleNote.textContent = `🎙️ 내 차례! "${r._en}" 라고 말해보세요.`;
        r._attempt(() => setTimeout(step, 500));
      } else {
        roleNote.textContent = `👂 컴퓨터(${r._who})가 말해요. 잘 들어보세요.`;
        speakThen(r._en, () => setTimeout(step, 400));
      }
    };
    step();
  }
  return card;
}

function renderPractice() {
  renderInterview();
  const empty = document.getElementById("practice-empty");
  const list = document.getElementById("practice-list");
  list.innerHTML = "";
  const done = TIMES.map((t, i) => [t, planAct(t.key), i]).filter(([, a]) => a);
  if (!done.length) { empty.style.display = "block"; return; }
  empty.style.display = "none";
  done.forEach(([t, a, i]) => list.appendChild(makePlanCard(t, a, i)));
  if (done.length < TIMES.length) {
    const note = document.createElement("p");
    note.className = "practice-empty";
    note.innerHTML = `아직 <b>${TIMES.length - done.length}칸</b>이 비어 있어요. <b>🗓️ 내 계획표</b>에서 마저 만들어 보세요.`;
    list.appendChild(note);
  }
}

/* ===========================================================
 * 🧩 사진 퀴즈
 * =========================================================== */
let quiz = null;
let quizRight = 0, quizTotal = 0;

function newQuiz() {
  const prev = quiz && quiz.act.id;
  let a;
  do { a = pick(ACTIVITIES); } while (a.id === prev);
  const t = findTime(pick(a.when));
  const others = ACTIVITIES.filter(x => x.id !== a.id && x.cat !== a.cat);
  const wrong = [];
  while (wrong.length < 2) {
    const w = pick(others);
    if (!wrong.includes(w)) wrong.push(w);
  }
  const options = [a, ...wrong].sort(() => Math.random() - 0.5);
  quiz = { act: a, time: t, options, answered: false };
  renderQuiz();
}

function renderQuiz() {
  const { act, time, options } = quiz;
  const ph = document.getElementById("quiz-photo");
  ph.innerHTML = "";
  ph.appendChild(makeVisual(act));
  const qe = document.getElementById("quiz-q-en");
  qe.innerHTML = ""; qe.appendChild(buildWords(questionEn(time)));
  document.getElementById("quiz-q-ko").textContent = questionKo(time);
  const optWrap = document.getElementById("quiz-options");
  optWrap.innerHTML = "";
  options.forEach((o, i) => {
    const b = document.createElement("button");
    b.className = "quiz-opt";
    b.innerHTML = `<span class="quiz-num">${"①②③"[i]}</span>`;
    b.appendChild(document.createTextNode(answerEn(o, "basic")));
    b.addEventListener("click", () => answerQuiz(o, b));
    optWrap.appendChild(b);
  });
  document.getElementById("quiz-feedback").innerHTML = "";
  document.getElementById("quiz-score").textContent = `${quizRight} / ${quizTotal}`;
}

function answerQuiz(o, btn) {
  if (quiz.answered) return;
  const fb = document.getElementById("quiz-feedback");
  const ok = o.id === quiz.act.id;
  if (ok) {
    quiz.answered = true;
    if (!quiz.missed) quizRight++;
    quizTotal++;
    btn.classList.add("right");
    document.querySelectorAll(".quiz-opt").forEach(b => { b.disabled = true; });
    fb.innerHTML = `<div class="quiz-ok">🎉 정답! ${answerKo(o, "basic")}</div>`;
    fb.appendChild(makeSpeakRow(answerEn(o, "basic"), "🎙️ 따라 말해 볼까요?", null));
    speak(answerEn(o, "basic"));
  } else {
    quiz.missed = true;
    btn.classList.add("wrong");
    btn.disabled = true;
    fb.innerHTML = `<div class="quiz-no">🤔 다시 골라 볼까요? 사진을 잘 보세요!</div>`;
  }
  document.getElementById("quiz-score").textContent = `${quizRight} / ${quizTotal}`;
}
document.getElementById("quiz-speak").addEventListener("click", () => speak(questionEn(quiz.time)));
document.getElementById("quiz-next").addEventListener("click", () => {
  if (quiz && !quiz.answered) quizTotal++;
  newQuiz(); speak(questionEn(quiz.time));
});

/* ---------- 초기 렌더 ---------- */
function renderAll() {
  renderQuestions();
  renderActivityFilters();
  renderActivities();
  renderAnswer();
  renderReactions();
  renderPlan();
  if (document.getElementById("tab-practice").classList.contains("active")) renderPractice();
  if (quiz) renderQuiz();
}
newQuiz();
renderAll();

/* ---------- 사진 켜기/끄기 ---------- */
const photoBtn = document.getElementById("photo-toggle");
function updatePhotoBtn() { photoBtn.textContent = photoOn ? "📷 실제 사진 켜짐" : "😀 그림(이모지)으로 보기"; }
updatePhotoBtn();
photoBtn.addEventListener("click", () => {
  photoOn = !photoOn;
  try { localStorage.setItem("plan_photo_on", photoOn ? "1" : "0"); } catch (e) {}
  updatePhotoBtn();
  renderAll();
});

/* ---------- 탭 전환 ---------- */
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
    synth.cancel();
    hidePopup();
    if (btn.dataset.tab === "practice") renderPractice();
    if (btn.dataset.tab === "build") { lastPlanSpoken = ""; renderPlan(); }
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

/* ---------- 속도 조절 ---------- */
document.getElementById("rate").addEventListener("input", e => {
  speakRate = parseFloat(e.target.value);
});
