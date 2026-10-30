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
 * - 음성 인식: Web Speech API (Chrome 권장)
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
function listenAndScore(target, done) {
  micBusy = true;
  synth.cancel();
  startRecorder().then(recorder => {
    let score = 0, heard = "", err = null, finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      (recorder ? recorder.stop() : Promise.resolve(null)).then(blob => {
        micBusy = false;
        done(Math.round(score * 100), heard, err, blob);
      });
    };
    if (!srSupported) { setTimeout(finish, 4000); return; }   // 음성 인식이 없으면 4초 동안 녹음만
    const rec = new SR();
    rec.lang = "en-US"; rec.interimResults = false; rec.maxAlternatives = 5;
    rec.onresult = e => {
      const alts = e.results[0];
      for (let i = 0; i < alts.length; i++) {
        const sc = scoreMatch(target, alts[i].transcript);
        if (sc > score) { score = sc; heard = alts[i].transcript; }
      }
    };
    rec.onerror = e => { err = e.error; };
    rec.onend = finish;
    try { rec.start(); } catch (e) { err = "start"; finish(); }
  });
}

function statsText(en, last) {
  const st = stats[en] || { attempts: 0, best: 0 };
  return `정확도 <b class="acc">${last != null ? last + "%" : "--"}</b>` +
    ` · 최고 <b class="best">${st.best ? st.best + "%" : "--"}</b>` +
    ` · <b>${st.attempts}</b>회`;
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
    listenAndScore(en, (score, heard, err, blob) => {
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
      const rec = stats[en] || { attempts: 0, best: 0 };
      rec.attempts++; rec.best = Math.max(rec.best, score); stats[en] = rec; saveStats();
      st.innerHTML = statsText(en, score);
      const h = `<span class="heard">내 발음: ${heard || "(못 들었어요)"}</span>`;
      fb.className = "mic-feedback " + (score >= 45 ? "good" : "bad");
      fb.innerHTML = (score >= 75 ? `⭐ 훌륭해요! ${score}% ` : score >= 45 ? `👍 좋아요! 한 번 더! ${score}% ` : `🔁 다시 또박또박! ${score}% `) + h;
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
