/* =========================================================
 * 6학년 9단원 · What are you going to do? · 나의 계획 말하기 웹 앱
 * - 음성 출력: Web Speech API (SpeechSynthesis)
 * - 단어 클릭: 단어 발음 + 뜻 풍선(popup)
 * - 실제 사진: 위키백과 대표 사진 (못 불러오면 이모지)
 * - 활동 카드(초급 · 중급): 질문 5개 중 하나를 고르고 카드의 [선택] → 말풍선 대화와 연습하기에 바로 반영
 * - 연습하기: 나의 계획표 (My Plans) · 인쇄
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
  if (opts.extra) div.appendChild(opts.extra);
  return div;
}

const findAct = id => ACTIVITIES.find(a => a.id === id) || null;
const catLabel = key => (ACT_CATS.find(c => c.key === key) || {}).label || "";
function setBlank(el, en) {
  el.classList.toggle("filled", !!en);
  if (en) { el.innerHTML = ""; el.appendChild(buildWords(en)); }
  else el.textContent = "________";
}

/* ===========================================================
 * 내 계획 (질문 5개 × 할 일 1개) · 저장
 * =========================================================== */
let plans = {};          // { afternoon: { id: "kite", level: "basic" }, ... }
let myName = "";

try {
  const saved = JSON.parse(localStorage.getItem("plan_sets") || "null");
  if (saved) {
    if (saved.plans) {
      Object.keys(saved.plans).forEach(k => {
        const v = saved.plans[k];   // 예전 저장 형식("kite")도 읽어요
        plans[k] = typeof v === "string" ? { id: v, level: "basic" } : v;
      });
    }
    if (saved.name) myName = saved.name;
  }
} catch (e) {}

function persist() {
  try { localStorage.setItem("plan_sets", JSON.stringify({ plans, name: myName })); } catch (e) {}
}
const planOf = key => {
  const p = plans[key];
  const a = p && findAct(p.id);
  return a ? { act: a, level: p.level || "basic" } : null;
};
const doneCount = () => TIMES.filter(t => planOf(t.key)).length;
function updatePlanBadge() {
  document.getElementById("plan-count").textContent = `${doneCount()}/${TIMES.length}`;
}

/* 잠깐 떴다 사라지는 알림 */
let toastTimer = null;
function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add("hidden"), 2600);
}

/* ===========================================================
 * 🎨 활동 카드 (초급 · 중급 공통)
 * - 위: 질문 5개 중 하나를 고르면 말풍선 대화(질문 + 내 대답)가 바로 바뀜
 * - 아래: 카드의 [선택] → 고른 질문의 대답이 되고, 연습하기에도 그대로 담김
 * =========================================================== */
function createBoard(root, level) {
  let actCat = "all";
  let recOnly = false;   // ⭐ 지금 질문에 어울리는 활동만 보기
  let curTime = 0;       // 지금 고른 질문 (TIMES 인덱스)

  root.innerHTML = `
    <div class="plan-panel">
      <div class="pp-step">1️⃣ 질문을 골라요</div>
      <div class="q-tabs"></div>
      <div class="br-dialogue">
        <div class="br-line line-a">
          <span class="br-who">🙋 친구</span>
          <div class="br-bubble"><div class="br-sentence pp-q"></div><div class="br-ko pp-q-ko"></div></div>
          <button class="speak-btn small pp-speak-q" aria-label="질문 듣기">🔊</button>
        </div>
        <div class="br-line line-b pp-answer-row">
          <span class="br-who">🙆 나</span>
          <div class="br-bubble">
            <div class="br-sentence">I'm going to <span class="blank pp-act">________</span>.</div>
            <div class="br-ko pp-act-ko"></div>
          </div>
          <button class="speak-btn small pp-speak-a" aria-label="대답 듣기">🔊</button>
        </div>
      </div>
      <div class="dlg-status pp-status"></div>
      <div class="fill-actions">
        <button class="btn primary pp-listen" disabled>🔊 대화 듣기</button>
        <button class="btn ghost pp-next">다음 질문 ▶</button>
        <button class="btn ghost pp-go" disabled>🎤 연습하기로 가기</button>
      </div>
    </div>
    <div class="section-block">
      <h2>2️⃣ 할 일 고르기 · I'm going to ___. <span class="count act-count">0개</span></h2>
      <p class="hint">${level === "mid"
        ? "중급은 <b>누구와 · 어디서 · 무엇을 보러</b>를 붙여 조금 더 길게 말해요. (예: I'm going to fly a kite <b>on the hill</b>.)"
        : "카드를 보고 <b>I'm going to + 할 일.</b> 로 말해요."}
        <b>📘</b> 표시는 교과서 표현이에요. 카드의 <b>✅ 버튼</b>을 누르면 위 질문의 대답이 되고 <b>🎤 연습하기</b>에 바로 담겨요. 다시 누르면 빠져요. ⭐ = 지금 질문에 잘 어울리는 활동</p>
      <div class="cat-switch"></div>
      <div class="card-grid five act-grid"></div>
    </div>`;
  const $ = sel => root.querySelector(sel);
  const grid = $(".act-grid");

  function renderFilters() {
    const wrap = $(".cat-switch");
    wrap.innerHTML = "";
    [{ key: "all", label: "전체" }, { key: "book", label: "📘 교과서 표현" }, ...ACT_CATS].forEach(c => {
      const b = document.createElement("button");
      b.className = "cat-btn" + (actCat === c.key ? " active" : "");
      b.textContent = c.label;
      b.addEventListener("click", () => { actCat = c.key; synth.cancel(); hidePopup(); renderFilters(); renderCards(); });
      wrap.appendChild(b);
    });
    const rec = document.createElement("button");
    rec.className = "cat-btn rec-toggle" + (recOnly ? " active" : "");
    rec.textContent = `⭐ ${TIMES[curTime].short}에 어울리는 것만`;
    rec.addEventListener("click", () => { recOnly = !recOnly; renderFilters(); renderCards(); });
    wrap.appendChild(rec);
  }

  function renderPanel() {
    const t = TIMES[curTime];
    const p = planOf(t.key);
    const qTabs = $(".q-tabs");
    qTabs.innerHTML = "";
    TIMES.forEach((x, i) => {
      const xp = planOf(x.key);
      const b = document.createElement("button");
      b.className = "q-tab" + (i === curTime ? " active" : "") + (xp ? " done" : "");
      b.innerHTML = `<span class="q-num">Q${i + 1}</span><span class="q-emoji">${xp ? xp.act.emoji : x.emoji}</span>` +
        `<span class="q-when">${x.short}${xp ? " ✓" : ""}</span><span class="q-en">${x.en}</span>`;
      b.addEventListener("click", () => selectTime(i));
      qTabs.appendChild(b);
    });

    const q = $(".pp-q");
    q.innerHTML = ""; q.appendChild(buildWords(questionEn(t)));
    $(".pp-q-ko").textContent = questionKo(t);
    setBlank($(".pp-act"), p && phraseEn(p.act, p.level));
    $(".pp-act-ko").textContent = p ? answerKo(p.act, p.level) : "나는 ________ 거야.";
    $(".pp-answer-row").classList.toggle("empty", !p);

    const status = $(".pp-status");
    const n = doneCount();
    status.className = "dlg-status pp-status" + (p ? " ok" : "");
    if (!p) status.textContent = `👇 아래 카드에서 ${t.short}에 할 일을 골라 [선택]을 눌러요`;
    else if (n < TIMES.length) status.textContent = `✅ 연습하기에 담았어요! (${n}/${TIMES.length}) 다음 질문으로 가 볼까요?`;
    else status.textContent = `🎉 질문 5개 모두 완성! 🎤 연습하기에서 나의 계획표를 봐요.`;

    $(".pp-listen").disabled = !p;
    $(".pp-next").textContent = curTime < TIMES.length - 1 ? "다음 질문 ▶" : "처음 질문으로 ↺";
    $(".pp-go").disabled = n === 0;
    updatePlanBadge();
  }

  function selectTime(i) {
    curTime = i;
    synth.cancel();
    renderPanel();
    renderFilters();
    if (recOnly) renderCards(); else refreshCards();
    speak(questionEn(TIMES[i]));
  }

  function pickPlan(a) {
    const t = TIMES[curTime];
    const p = plans[t.key];
    if (p && p.id === a.id && p.level === level) {
      delete plans[t.key];
      toast(`${t.emoji} ${t.short} 대답을 뺐어요.`);
    } else {
      plans[t.key] = { id: a.id, level };
      toast(`${t.emoji} ${t.short} · ${answerEn(a, level)} → 🎤 연습하기에 담았어요!`);
      speak(`${questionEn(t)} ${answerEn(a, level)}`);
    }
    persist();
    renderPanel();
    refreshCards();
  }

  /* 사진을 다시 불러오지 않도록 버튼 · 표시만 바꿔요 */
  function refreshCards() {
    const t = TIMES[curTime];
    const p = plans[t.key];
    grid.querySelectorAll(".card").forEach(c => {
      const a = findAct(c.dataset.act);
      const on = !!p && p.id === a.id && p.level === level;
      c.classList.toggle("picked", on);
      const btn = c.querySelector(".pick-btn");
      btn.classList.toggle("on", on);
      btn.textContent = on ? `✓ ${t.short} 대답으로 선택됨` : `✅ ${t.short}에 할래요`;
      c.querySelector(".card-tag").textContent = (a.book ? "📘 교과서 · " : "") + catLabel(a.cat) + (a.when.includes(t.key) ? " · ⭐" : "");
    });
  }

  function renderCards() {
    grid.innerHTML = "";
    const t = TIMES[curTime];
    const list = ACTIVITIES.filter(a =>
      (actCat === "all" || (actCat === "book" ? a.book : a.cat === actCat)) && (!recOnly || a.when.includes(t.key)));
    list.forEach((a, i) => {
      const btn = document.createElement("button");
      btn.className = "pick-btn";
      btn.addEventListener("click", () => pickPlan(a));
      const card = makeCard(
        { en: answerEn(a, level), ko: answerKo(a, level), emoji: a.emoji, wiki: a.wiki, photo: a.photo },
        { tone: i % 6, tag: catLabel(a.cat), extra: btn }
      );
      card.dataset.act = a.id;
      if (a.book) card.classList.add("textbook");
      grid.appendChild(card);
    });
    $(".act-count").textContent = `${list.length}개`;
    refreshCards();
  }

  $(".pp-speak-q").addEventListener("click", () => speak(questionEn(TIMES[curTime])));
  $(".pp-speak-a").addEventListener("click", () => {
    const p = planOf(TIMES[curTime].key); if (p) speak(answerEn(p.act, p.level));
  });
  $(".pp-listen").addEventListener("click", () => {
    const t = TIMES[curTime], p = planOf(t.key);
    if (p) speak(`${questionEn(t)} ${answerEn(p.act, p.level)}`);
  });
  $(".pp-next").addEventListener("click", () => selectTime((curTime + 1) % TIMES.length));
  $(".pp-go").addEventListener("click", () => document.querySelector('.tab-btn[data-tab="practice"]').click());

  return {
    render() { renderPanel(); renderFilters(); renderCards(); },
    refresh() { renderPanel(); refreshCards(); },
  };
}

const boards = {
  basic: createBoard(document.getElementById("board-basic"), "basic"),
  mid: createBoard(document.getElementById("board-mid"), "mid"),
};

/* ===========================================================
 * 📝 나의 계획표 (연습하기 탭)
 * =========================================================== */
function renderPlanSummary() {
  const box = document.getElementById("plan-summary");
  box.innerHTML = "";
  const head = document.createElement("div");
  head.className = "plan-board-head";
  head.textContent = `📅 ${myName ? myName + "의" : "나의"} 계획표 · My Plans`;
  box.appendChild(head);
  TIMES.forEach((t, i) => {
    const p = planOf(t.key);
    const row = document.createElement("div");
    row.className = "plan-row tone-" + (i % 6) + (p ? "" : " empty");
    const when = document.createElement("div");
    when.className = "plan-when";
    when.innerHTML = `<span class="plan-when-emoji">${t.emoji}</span><span>${t.short}</span><span class="plan-when-en">${t.en}</span>`;
    const body = document.createElement("div");
    body.className = "plan-body";
    const qEl = document.createElement("div"); qEl.className = "plan-q"; qEl.appendChild(buildWords("Q. " + questionEn(t)));
    const aEl = document.createElement("div"); aEl.className = "plan-a";
    if (p) aEl.appendChild(buildWords("A. " + answerEn(p.act, p.level)));
    else aEl.textContent = "A. I'm going to ________.";
    const ko = document.createElement("div"); ko.className = "ko";
    ko.textContent = p ? answerKo(p.act, p.level) : "🎨 활동 카드에서 골라요";
    body.append(qEl, aEl, ko);
    let visual;
    if (p) visual = makeVisual(p.act, "plan-thumb");
    else { visual = document.createElement("div"); visual.className = "plan-emoji"; visual.textContent = "❔"; }
    const tools = document.createElement("div");
    tools.className = "plan-tools";
    const btn = document.createElement("button");
    btn.className = "speak-btn small"; btn.textContent = "🔊"; btn.disabled = !p;
    btn.setAttribute("aria-label", "듣기");
    btn.addEventListener("click", () => p && speak(`${questionEn(t)} ${answerEn(p.act, p.level)}`));
    tools.appendChild(btn);
    if (p) {
      const del = document.createElement("button");
      del.className = "premove"; del.textContent = "✕"; del.title = "계획 빼기";
      del.addEventListener("click", () => { delete plans[t.key]; persist(); updatePlanBadge(); renderPlanSummary(); });
      tools.appendChild(del);
    }
    row.append(when, body, visual, tools);
    box.appendChild(row);
  });
  const all = document.getElementById("plan-listen-all");
  all.disabled = doneCount() === 0;
}
document.getElementById("plan-listen-all").addEventListener("click", () => {
  const lines = TIMES.map(t => [t, planOf(t.key)]).filter(([, p]) => p)
    .map(([t, p]) => `${questionEn(t)} ${answerEn(p.act, p.level)}`);
  if (lines.length) speak(lines.join(" "));
});
const nameInput = document.getElementById("my-name");
nameInput.value = myName;
nameInput.addEventListener("input", () => { myName = nameInput.value.trim(); persist(); renderPlanSummary(); });
document.getElementById("print-plan").addEventListener("click", () => {
  document.body.classList.add("print-plan");
  window.print();
  setTimeout(() => document.body.classList.remove("print-plan"), 500);
});

/* ---------- 초기 렌더 ---------- */
function renderAll() {
  boards.basic.render();
  boards.mid.render();
  renderPlanSummary();
}
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
    const tab = btn.dataset.tab;
    if (tab === "practice") renderPlanSummary();
    else boards[tab].refresh();   // 다른 탭에서 고른 계획도 반영
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

/* ---------- 속도 조절 ---------- */
document.getElementById("rate").addEventListener("input", e => {
  speakRate = parseFloat(e.target.value);
});
