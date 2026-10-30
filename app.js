/* =========================================================
 * 6학년 9단원 · What are you going to do? · 나의 계획 말하기 웹 앱
 * - 음성 출력: Web Speech API (SpeechSynthesis)
 * - 단어 클릭: 단어 발음 + 뜻 풍선(popup)
 * - 그림: Canva로 만든 활동 그림 images/활동id.png (없으면 이모지)
 * - 활동 카드(초급 · 중급): 질문 5개 중 하나를 고르고 카드의 [선택] → 말풍선 대화와 연습하기에 바로 반영
 * - 연습하기: 나의 계획표 (My Plans) · 🎙️ 말하기(정확도 측정 + 녹음해서 다시 듣기) · 인쇄
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
 * 🖼️ 그림 (Canva로 만든 그림: images/활동id.png)
 * - 그림 파일이 없거나 못 불러오면 이모지 그림이 그대로 보여요
 * =========================================================== */
const imgSrc = item => item.photo || (item.id ? `images/${item.id}.png` : "");

function makeVisual(item, cls) {
  const box = document.createElement("div");
  box.className = "visual" + (cls ? " " + cls : "");
  const em = document.createElement("div");
  em.className = "emoji";
  em.textContent = item.emoji;
  box.appendChild(em);
  const src = imgSrc(item);
  if (!src) return box;
  const img = new Image();
  img.className = "photo";
  img.alt = item.en || "";
  img.decoding = "async";
  img.addEventListener("load", () => box.classList.add("has-photo"));
  img.addEventListener("error", () => img.remove());
  img.src = src;
  box.appendChild(img);
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

try {
  const saved = JSON.parse(localStorage.getItem("plan_sets") || "null");
  if (saved) {
    if (saved.plans) {
      Object.keys(saved.plans).forEach(k => {
        const v = saved.plans[k];   // 예전 저장 형식("kite")도 읽어요
        plans[k] = typeof v === "string" ? { id: v, level: "basic" } : v;
      });
    }
  }
} catch (e) {}

function persist() {
  try { localStorage.setItem("plan_sets", JSON.stringify({ plans })); } catch (e) {}
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
        { id: a.id, en: answerEn(a, level), ko: answerKo(a, level), emoji: a.emoji, photo: a.photo },
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
 * 🎙️ 말하기 연습 (음성 인식으로 정확도 측정 + 내 목소리 녹음)
 * - 음성 인식: Web Speech API (Chrome 권장) + 순서 맞춤·부분 점수·단어별 색깔 피드백
 * - 녹음: MediaRecorder → ▶ 내 목소리로 다시 듣기 (새로고침하면 녹음은 사라져요)
 * =========================================================== */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const srSupported = !!SR;
const recSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
let stats = {};          // 문장별 { attempts, best }
try { stats = JSON.parse(localStorage.getItem("plan_stats") || "{}") || {}; } catch (e) {}
function saveStats() { try { localStorage.setItem("plan_stats", JSON.stringify(stats)); } catch (e) {} }
const voiceClips = {};   // 문장 → 내 목소리 녹음 주소
let micBusy = false;

/* ---------- 정교한 발음 채점 ----------
 * 1) 줄임말 펼치기(I'm → i am)·숫자/동음어 정리 후 단어로 나눔
 * 2) 목표 문장과 들린 말을 "순서대로" 맞춰 봄 (동적 계획법 정렬)
 * 3) 단어마다 부분 점수: 같음 1 · 철자 한 글자 차이 0.85 · 소리가 비슷함 0.7 · 비슷한 편 0.5
 *    (한국 학생이 헷갈리는 r/l · f/p · v/b · th/s 는 비슷한 소리로 봐 줌)
 * 4) 가중치: 핵심 단어 1 (going 포함) · 작은 단어(a, the, to …) 0.3 · 지명(Jeju 등) 0.6
 * 5) 덧붙인 말이 많으면 조금 감점 (최대 10%)
 */
const CONTRACTIONS = { "i'm": "i am", "i'll": "i will", "let's": "let us", "you're": "you are", "it's": "it is",
  "don't": "do not", "can't": "can not", "what's": "what is" };
const SAME_SOUND = { too: "to", two: "to", four: "for", "2": "to", "4": "for", uh: "a", ah: "a", an: "a" };
const FUNCTION_WORDS = new Set(["a", "an", "the", "to", "of", "on", "in", "at", "for", "by", "my", "i", "am", "with", "and"]);

function tokenize(text) {
  const words = text.toLowerCase().replace(/[’`]/g, "'")
    .replace(/[^a-z0-9\s']/g, " ").split(/\s+/).filter(Boolean)
    .flatMap(w => (CONTRACTIONS[w] || w).split(" "))
    .map(w => SAME_SOUND[w] || w.replace(/'/g, ""));
  // "p c" 처럼 한 글자씩 들린 말은 붙여요 (a, i 는 그대로)
  const out = [];
  words.forEach(w => {
    const last = out[out.length - 1];
    if (/^[b-hj-z]$/.test(w) && last && /^[b-hj-z]+$/.test(last) && last.length < 4) out[out.length - 1] = last + w;
    else out.push(w);
  });
  return out;
}
/* 목표 문장 단어 + 가중치 (원래 대문자인 지명은 0.6) */
function targetWords(sentence) {
  const out = [];
  sentence.split(/\s+/).forEach((orig, gi) => {
    const isProper = gi > 0 && /^[A-Z][a-z]/.test(orig);
    tokenize(orig).forEach(w => out.push({
      w, group: gi, disp: orig.replace(/[.,!?]+$/, ""),
      weight: isProper ? 0.6 : FUNCTION_WORDS.has(w) ? 0.3 : 1,
    }));
  });
  return out;
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
/* 소리 열쇠: 비슷하게 들리는 자음 철자를 한 가지로 모아요 (모음은 그대로 → kite ≠ cat) */
function soundKey(w) {
  const k = w.replace(/ph/g, "f").replace(/th/g, "s").replace(/ck/g, "k").replace(/c(?=[eiy])/g, "s").replace(/c/g, "k")
    .replace(/q/g, "k").replace(/x/g, "ks").replace(/z/g, "s").replace(/v/g, "b").replace(/f/g, "p")
    .replace(/r/g, "l").replace(/wh/g, "w").replace(/gh/g, "");
  return k.replace(/(.)\1+/g, "$1");
}
function wordSim(t, h) {
  if (t === h) return 1;
  const dist = levenshtein(t, h), len = Math.max(t.length, h.length);
  if (dist === 1 && len >= 3) return 0.85;
  if (soundKey(t) === soundKey(h)) return 0.7;
  if (len >= 4 && 1 - dist / len >= 0.6) return 0.5;
  return 0;
}
/* 순서대로 맞춰 보고 점수(0~100)와 단어별 결과를 돌려줘요 */
function scoreDetailed(sentence, heardText) {
  const T = targetWords(sentence), H = tokenize(heardText);
  const n = T.length, m = H.length;
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++)
      dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1] + wordSim(T[i - 1].w, H[j - 1]) * T[i - 1].weight);
  const sims = Array(n).fill(0);
  let used = 0;
  for (let i = n, j = m; i > 0 && j > 0;) {
    const sim = wordSim(T[i - 1].w, H[j - 1]);
    if (sim > 0 && Math.abs(dp[i][j] - (dp[i - 1][j - 1] + sim * T[i - 1].weight)) < 1e-9) { sims[i - 1] = sim; used++; i--; j--; }
    else if (dp[i - 1][j] >= dp[i][j - 1]) i--;
    else j--;
  }
  const totalW = T.reduce((a, x) => a + x.weight, 0);
  const extra = Math.max(0, m - used);
  const raw = totalW ? dp[n][m] / totalW : 0;
  const score = Math.max(0, Math.round((raw - Math.min(0.1, extra * 0.03)) * 100));
  // 원래 문장 단어 단위로 묶어요 (I'm = i + am → 둘 중 낮은 점수)
  const words = [];
  T.forEach((x, i) => {
    const last = words[words.length - 1];
    if (last && last.group === x.group) last.sim = Math.min(last.sim, sims[i]);
    else words.push({ w: x.disp, key: x.w, group: x.group, sim: sims[i] });
  });
  return { score, words };
}

/* 마이크 녹음 시작 → stop() 하면 녹음 파일(Blob)을 돌려줘요 */
function startRecorder() {
  if (!recSupported) return Promise.resolve(null);
  return navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    const chunks = [];
    const mr = new MediaRecorder(stream);
    mr.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    const done = new Promise(res => {
      mr.onstop = () => {
        stream.getTracks().forEach(tr => tr.stop());
        res(chunks.length ? new Blob(chunks, { type: mr.mimeType || "audio/webm" }) : null);
      };
    });
    mr.start();
    return { stop() { if (mr.state !== "inactive") mr.stop(); return done; } };
  }).catch(() => null);
}

/* 한 번 말하기: 녹음 + 음성 인식 → done(점수, 들린 말, 오류, 녹음) */
function listenAndScore(target, done, onInterim) {
  micBusy = true;
  synth.cancel();
  startRecorder().then(recorder => {
    let best = { score: 0, words: [] }, heard = "", err = null, finished = false;
    const finals = [];   // 확정된 결과마다 후보 문장들
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(limit);
      // 후보 문장(최대 5개) 중 가장 잘 맞는 것으로 채점
      const cands = finals.length === 1 ? finals[0]
        : finals.length ? [finals.map(f => f[0]).join(" ")] : [];
      cands.forEach(c => { const r = scoreDetailed(target, c); if (r.score > best.score || !heard) { best = r; heard = c; } });
      (recorder ? recorder.stop() : Promise.resolve(null)).then(blob => {
        micBusy = false;
        done(best.score, heard, err, blob, best.words);
      });
    };
    let rec = null;
    // 너무 오래 말하지 않으면 끝내요 (음성 인식이 없으면 4초 동안 녹음만)
    const limit = setTimeout(() => { if (rec) { try { rec.stop(); } catch (e) { finish(); } } else finish(); }, srSupported ? 9000 : 4000);
    if (!srSupported) return;
    rec = new SR();
    rec.lang = "en-US"; rec.interimResults = true; rec.maxAlternatives = 5; rec.continuous = false;
    rec.onresult = e => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finals.push(Array.from(r, alt => alt.transcript));
        else interim += r[0].transcript;
      }
      if (onInterim) onInterim(finals.map(f => f[0]).join(" ") + " " + interim);
    };
    rec.onerror = e => { err = e.error; };
    rec.onend = finish;
    try { rec.start(); } catch (e) { err = "start"; finish(); }
  });
}

/* 문장별 기록: { attempts: 횟수, best: 최고, total: 정확도 합계 } → 평균 = total / attempts */
const statOf = en => {
  const st = stats[en] || { attempts: 0, best: 0, total: 0 };
  if (st.total == null) st.total = st.best * st.attempts;   // 예전 기록(합계 없음)은 최고 점수로 대신해요
  return st;
};
const avgOf = st => st.attempts ? Math.round(st.total / st.attempts) : null;

function statsText(en, last) {
  const st = statOf(en), avg = avgOf(st);
  return `이번 <b class="acc">${last != null ? last + "%" : "--"}</b>` +
    ` · 평균 <b class="avg">${avg != null ? avg + "%" : "--"}</b>` +
    ` · 최고 <b class="best">${st.best ? st.best + "%" : "--"}</b>` +
    ` · <b>${st.attempts}</b>회`;
}

/* 🎙️ 연습 기록 요약: 지금 계획표 문장들의 총 연습 횟수 · 평균 정확도 · 연습한 문장 수 */
function renderPracticeSummary() {
  const box = document.getElementById("practice-summary");
  if (!box) return;
  const sentences = TIMES.map(t => planOf(t.key)).filter(Boolean).map(p => answerEn(p.act, p.level));
  let attempts = 0, total = 0, done = 0;
  sentences.forEach(en => {
    const st = statOf(en);
    attempts += st.attempts; total += st.total;
    if (st.attempts) done++;
  });
  const avg = attempts ? Math.round(total / attempts) : null;
  box.innerHTML =
    `<div class="ps-item"><span class="ps-label">🎙️ 총 연습</span><b class="ps-val">${attempts}회</b></div>` +
    `<div class="ps-item"><span class="ps-label">📊 평균 정확도</span><b class="ps-val">${avg != null ? avg + "%" : "--"}</b></div>` +
    `<div class="ps-item"><span class="ps-label">✅ 연습한 문장</span><b class="ps-val">${done} / ${sentences.length}</b></div>`;
  document.getElementById("stats-reset").disabled = attempts === 0;
}
document.getElementById("stats-reset").addEventListener("click", () => {
  if (!confirm("연습 기록(횟수 · 평균 · 최고 정확도)을 모두 지울까요?")) return;
  stats = {}; saveStats(); renderPlanSummary();
});

/* 채점 결과 보여 주기: 점수 + 단어별 색깔(초록 맞음 · 노랑 비슷함 · 빨강 놓침) + 다시 연습할 단어 */
function showFeedback(fb, score, heard, words) {
  fb.innerHTML = "";
  fb.className = "mic-feedback " + (score >= 60 ? "good" : "bad");
  const head = document.createElement("div");
  head.className = "fb-head";
  head.textContent = score >= 85 ? `⭐ 훌륭해요! ${score}%` : score >= 60 ? `👍 좋아요! 한 번 더! ${score}%` : `🔁 다시 또박또박! ${score}%`;
  const line = document.createElement("div");
  line.className = "fb-words";
  words.forEach(x => {
    const sp = document.createElement("span");
    sp.className = "fw " + (x.sim >= 0.95 ? "ok" : x.sim >= 0.5 ? "close" : "miss");
    sp.textContent = x.w;
    line.appendChild(sp);
  });
  const missed = [...new Set(words.filter(x => x.sim < 0.95 && !FUNCTION_WORDS.has(x.key)).map(x => x.w))];
  fb.append(head, line);
  if (missed.length) {
    const tip = document.createElement("div");
    tip.className = "fb-tip";
    tip.append("🔁 다시 들어 볼 단어: ");
    missed.forEach(w => {
      const b = document.createElement("button");
      b.className = "fb-word-btn"; b.textContent = "🔊 " + w;
      b.addEventListener("click", () => speak(w, 0.75));
      tip.appendChild(b);
    });
    fb.appendChild(tip);
  }
  const h = document.createElement("div");
  h.className = "heard";
  h.textContent = "컴퓨터가 들은 말: " + (heard || "(못 들었어요)");
  fb.appendChild(h);
}

/* 계획표 한 줄의 말하기 도구: [🎙️ 말하기] [▶ 내 목소리] 정확도 · 최고 · 횟수 */
function makeMicTools(en) {
  const wrap = document.createElement("div");
  wrap.className = "plan-mic";
  const mic = document.createElement("button");
  mic.className = "mic-btn";
  mic.innerHTML = '<span class="mic-ico">🎙️</span><span class="mic-txt">말하기</span>';
  const play = document.createElement("button");
  play.className = "btn small play-btn";
  play.textContent = "▶ 내 목소리";
  play.disabled = !voiceClips[en];
  play.addEventListener("click", () => { synth.cancel(); new Audio(voiceClips[en]).play(); });
  const st = document.createElement("div");
  st.className = "pstats";
  st.innerHTML = statsText(en, null);
  const fb = document.createElement("div");
  fb.className = "mic-feedback";
  if (!srSupported && !recSupported) {
    mic.disabled = true;
    mic.title = "이 브라우저는 마이크 기능을 지원하지 않아요 (Chrome 권장)";
  }
  mic.addEventListener("click", () => {
    if (micBusy) return;
    mic.classList.add("recording");
    fb.className = "mic-feedback";
    fb.textContent = srSupported ? "🔴 듣고 있어요... 또박또박 말해 보세요!" : "🔴 녹음 중이에요 (4초)...";
    listenAndScore(en, (score, heard, err, blob, words) => {
      mic.classList.remove("recording");
      if (blob) {
        if (voiceClips[en]) URL.revokeObjectURL(voiceClips[en]);
        voiceClips[en] = URL.createObjectURL(blob);
        play.disabled = false;
      }
      if (!srSupported) {
        fb.className = "mic-feedback good";
        fb.textContent = blob ? "🎧 녹음 완료! ▶ 내 목소리로 들어 보세요. (정확도는 Chrome에서 볼 수 있어요)" : "마이크 권한을 허용해 주세요.";
        return;
      }
      if (err && score === 0) {
        fb.className = "mic-feedback bad";
        fb.textContent = err === "not-allowed" ? "마이크 권한을 허용해 주세요."
          : err === "no-speech" ? "소리가 안 들렸어요. 다시 말해 보세요." : "다시 시도해 주세요.";
        return;
      }
      const rec = statOf(en);
      rec.attempts++; rec.total += score; rec.best = Math.max(rec.best, score); stats[en] = rec; saveStats();
      renderPracticeSummary();
      st.innerHTML = statsText(en, score);
      showFeedback(fb, score, heard, words);
    }, live => {
      fb.className = "mic-feedback";
      fb.textContent = "🔴 듣고 있어요... 👂 " + live.trim();
    });
  });
  wrap.append(mic, play, st, fb);
  return wrap;
}

/* ===========================================================
 * 📝 나의 계획표 (연습하기 탭)
 * =========================================================== */
function renderPlanSummary() {
  const box = document.getElementById("plan-summary");
  box.innerHTML = "";
  const head = document.createElement("div");
  head.className = "plan-board-head";
  head.textContent = "📅 나의 계획표 · My Plans";
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
    if (p) body.appendChild(makeMicTools(answerEn(p.act, p.level)));
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
  renderPracticeSummary();
}
document.getElementById("plan-listen-all").addEventListener("click", () => {
  const lines = TIMES.map(t => [t, planOf(t.key)]).filter(([, p]) => p)
    .map(([t, p]) => `${questionEn(t)} ${answerEn(p.act, p.level)}`);
  if (lines.length) speak(lines.join(" "));
});
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
