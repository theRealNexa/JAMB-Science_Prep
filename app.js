// ===================== DATA =====================
const ALL_QUESTIONS = [
  ...(typeof CHEMISTRY_QUESTIONS !== 'undefined' ? CHEMISTRY_QUESTIONS : []),
  ...(typeof MATHEMATICS_QUESTIONS !== 'undefined' ? MATHEMATICS_QUESTIONS : []),
  ...(typeof ENGLISH_QUESTIONS !== 'undefined' ? ENGLISH_QUESTIONS : []),
  ...(typeof BIOLOGY_QUESTIONS !== 'undefined' ? BIOLOGY_QUESTIONS : []),
];

// Tag each question with a stable id (index-based, stable as long as files aren't reordered)
ALL_QUESTIONS.forEach((q, i) => { q._id = i; });

const TOPICS = ["All", ...Array.from(new Set(ALL_QUESTIONS.map(q => q.topic)))];

const GLOSSARY_SUBJECTS = {
  "Biology": {
    terms: typeof BIOLOGY_GLOSSARY !== 'undefined' ? BIOLOGY_GLOSSARY : [],
    facts: typeof BIOLOGY_FACTS !== 'undefined' ? BIOLOGY_FACTS : []
  }
};

// ===================== STORAGE KEYS =====================
const K_HISTORY = "jamb-quiz-history-v2";
const K_STREAK = "jamb-streak-v1";
const K_BOOKMARKS = "jamb-bookmarks-v1";
const K_MISSED = "jamb-missed-v1";

// ===================== STORAGE HELPERS =====================
function load(key, fallback){
  try{ const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
  catch(e){ return fallback; }
}
function save(key, val){
  try{ localStorage.setItem(key, JSON.stringify(val)); return true; }
  catch(e){ return false; }
}

// ===================== STATE =====================
let activeTopic = "All";
let mode = "study"; // "study" | "timed"
let timedQCount = 20;
let timedMinutes = 15;

let sessionQuestions = [];   // the actual question objects for this run
let current = 0;
let answers = {};            // sessionIndex -> selected option index
let bookmarks = load(K_BOOKMARKS, []); // array of _id
let timerInterval = null;
let secondsRemaining = 0;
let quizActive = false;

// ===================== STREAK =====================
function todayStr(){ return new Date().toISOString().slice(0,10); }
function updateStreakOnActivity(){
  const s = load(K_STREAK, { count: 0, lastDate: null });
  const today = todayStr();
  if (s.lastDate === today) return s; // already counted today
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10);
  if (s.lastDate === yesterday) s.count += 1;
  else s.count = 1;
  s.lastDate = today;
  save(K_STREAK, s);
  return s;
}
function renderStreak(){
  const s = load(K_STREAK, { count: 0, lastDate: null });
  document.getElementById('streakBadge').textContent = `🔥 ${s.count} day streak`;
}

// ===================== SETUP HELPERS =====================
function getFilteredPool(){
  return activeTopic === "All" ? ALL_QUESTIONS : ALL_QUESTIONS.filter(q => q.topic === activeTopic);
}
function shuffle(arr){
  const a = [...arr];
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i+1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderTopicBar(){
  const bar = document.getElementById('topicBar');
  bar.innerHTML = '';
  TOPICS.forEach(t => {
    const chip = document.createElement('div');
    chip.className = 'chip' + (t === activeTopic ? ' active' : '');
    chip.textContent = t;
    chip.onclick = () => { activeTopic = t; renderTopicBar(); renderBookmarkList(); renderMissedList(); };
    bar.appendChild(chip);
  });
}

document.getElementById('modeStudy').onclick = () => setMode('study');
document.getElementById('modeTimed').onclick = () => setMode('timed');
function setMode(m){
  mode = m;
  document.getElementById('modeStudy').classList.toggle('active', m === 'study');
  document.getElementById('modeTimed').classList.toggle('active', m === 'timed');
  document.getElementById('timedConfig').classList.toggle('hidden', m !== 'timed');
  document.getElementById('startBtn').textContent = m === 'timed' ? 'Start Timed Set →' : 'Start Study Session →';
}

document.getElementById('qCountDown').onclick = () => { timedQCount = Math.max(5, timedQCount - 5); document.getElementById('qCountVal').textContent = timedQCount; };
document.getElementById('qCountUp').onclick = () => { timedQCount = Math.min(80, timedQCount + 5); document.getElementById('qCountVal').textContent = timedQCount; };
document.getElementById('timeLimitDown').onclick = () => { timedMinutes = Math.max(5, timedMinutes - 5); document.getElementById('timeLimitVal').textContent = timedMinutes; };
document.getElementById('timeLimitUp').onclick = () => { timedMinutes = Math.min(90, timedMinutes + 5); document.getElementById('timeLimitVal').textContent = timedMinutes; };

document.getElementById('startBtn').onclick = () => {
  const pool = getFilteredPool();
  if(pool.length === 0){ alert('No questions available for this topic yet.'); return; }

  if(mode === 'timed'){
    const n = Math.min(timedQCount, pool.length);
    sessionQuestions = shuffle(pool).slice(0, n);
    secondsRemaining = timedMinutes * 60;
  } else {
    sessionQuestions = pool;
  }

  current = 0;
  answers = {};
  quizActive = true;
  updateStreakOnActivity();
  renderStreak();

  document.getElementById('setupArea').classList.add('hidden');
  document.getElementById('resultsArea').classList.add('hidden');
  document.getElementById('quizArea').classList.remove('hidden');

  const timerEl = document.getElementById('timerDisplay');
  if(mode === 'timed'){
    timerEl.classList.remove('hidden');
    startTimer();
  } else {
    timerEl.classList.add('hidden');
    clearInterval(timerInterval);
  }

  renderQuestion();
};

// ===================== TIMER =====================
function startTimer(){
  clearInterval(timerInterval);
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    secondsRemaining--;
    updateTimerDisplay();
    if(secondsRemaining <= 0){
      clearInterval(timerInterval);
      finishQuiz();
    }
  }, 1000);
}
function updateTimerDisplay(){
  const m = Math.floor(secondsRemaining / 60);
  const s = secondsRemaining % 60;
  const el = document.getElementById('timerDisplay');
  el.textContent = `⏱ ${m}:${s.toString().padStart(2,'0')}`;
  el.classList.toggle('low', secondsRemaining <= 60);
}

// ===================== BOOKMARK =====================
function isBookmarked(qId){ return bookmarks.includes(qId); }
function toggleBookmark(qId){
  if(isBookmarked(qId)) bookmarks = bookmarks.filter(id => id !== qId);
  else bookmarks.push(qId);
  save(K_BOOKMARKS, bookmarks);
}
document.getElementById('bmkBtn').onclick = () => {
  const q = sessionQuestions[current];
  toggleBookmark(q._id);
  renderQuestion();
};

function renderBookmarkList(){
  const label = document.getElementById('bmkSectionLabel');
  const list = document.getElementById('bmkList');
  const bmkQuestions = ALL_QUESTIONS.filter(q => bookmarks.includes(q._id));
  list.innerHTML = '';
  if(bmkQuestions.length === 0){
    label.style.display = 'none';
    return;
  }
  label.style.display = 'block';
  bmkQuestions.forEach(q => {
    const card = document.createElement('div');
    card.className = 'review-card';
    card.style.background = 'var(--panel-2)';
    card.style.borderColor = 'var(--line)';
    card.innerHTML = `<div class="review-q">${q.q}</div><div class="review-line" style="color:var(--ink-mute);">${q.subject || ''} · ${q.topic}</div>`;
    list.appendChild(card);
  });
}

// ===================== MISSED QUESTIONS (timed mode only) =====================
function removeMissed(qId){
  const missed = load(K_MISSED, []);
  save(K_MISSED, missed.filter(m => m.qId !== qId));
  renderMissedList();
}
function clearAllMissed(){
  if(!confirm('Clear all saved missed questions?')) return;
  localStorage.removeItem(K_MISSED);
  renderMissedList();
}
document.getElementById('clearMissedBtn').onclick = clearAllMissed;

function renderMissedList(){
  const label = document.getElementById('missedSectionLabel');
  const list = document.getElementById('missedList');
  const clearBtn = document.getElementById('clearMissedBtn');
  const missed = load(K_MISSED, []);
  list.innerHTML = '';

  if(missed.length === 0){
    label.style.display = 'none';
    clearBtn.style.display = 'none';
    return;
  }
  label.style.display = 'block';
  clearBtn.style.display = 'inline-block';

  const letters = ['A','B','C','D'];
  missed.forEach(m => {
    const q = ALL_QUESTIONS.find(item => item._id === m.qId);
    if(!q) return; // question no longer exists in the bank
    const card = document.createElement('div');
    card.className = 'review-card';
    card.innerHTML = `
      <div class="review-q">${q.q}</div>
      <div class="review-line your">Your answer: ${m.yourAnswer}</div>
      <div class="review-line correct">Correct answer: ${letters[q.correct]}. ${q.options[q.correct]}</div>
      <button class="missed-delete-btn" data-qid="${m.qId}">Remove</button>
    `;
    list.appendChild(card);
  });

  // wire up individual delete buttons
  list.querySelectorAll('.missed-delete-btn').forEach(btn => {
    btn.onclick = () => removeMissed(Number(btn.dataset.qid));
  });
}

// ===================== QUESTION GRID =====================
function renderQGrid(){
  const grid = document.getElementById('qGrid');
  grid.innerHTML = '';
  sessionQuestions.forEach((q, i) => {
    const box = document.createElement('div');
    box.className = 'qbox';
    if(i === current) box.classList.add('current');
    else if(answers[i] !== undefined) box.classList.add('answered');
    box.textContent = i + 1;
    if(isBookmarked(q._id)){
      const dot = document.createElement('div');
      dot.className = 'bmk-dot';
      box.appendChild(dot);
    }
    box.onclick = () => { current = i; renderQuestion(); };
    grid.appendChild(box);
  });
}

// ===================== QUESTION RENDER =====================
function renderQuestion(){
  const q = sessionQuestions[current];
  document.getElementById('qnum').textContent = 'Q' + (current+1);
  document.getElementById('qtag').textContent = q.topic;
  document.getElementById('qtext').textContent = q.q;
  document.getElementById('progressLabel').textContent = `Question ${current+1} of ${sessionQuestions.length}`;
  document.getElementById('progressFill').style.width = `${(current / sessionQuestions.length) * 100}%`;

  const bmkBtn = document.getElementById('bmkBtn');
  bmkBtn.textContent = isBookmarked(q._id) ? '★' : '☆';
  bmkBtn.classList.toggle('on', isBookmarked(q._id));

  const optsDiv = document.getElementById('options');
  optsDiv.innerHTML = '';
  const letters = ['A','B','C','D'];
  const selected = answers[current];
  const revealAnswers = (mode === 'study' && selected !== undefined);

  q.options.forEach((opt, i) => {
    const div = document.createElement('div');
    div.className = 'opt';
    if(mode === 'study' && selected !== undefined){
      div.classList.add('disabled');
      if(i === q.correct) div.classList.add('correct');
      else if(i === selected) div.classList.add('wrong');
    } else if(mode === 'timed' && selected === i){
      div.classList.add('selected-untimed');
    }
    div.innerHTML = `<span class="letter">${letters[i]}</span><span>${opt}</span>`;
    div.onclick = () => {
      if(mode === 'study' && answers[current] !== undefined) return; // lock after reveal in study mode
      answers[current] = i;
      renderQuestion();
    };
    optsDiv.appendChild(div);
  });

  const explainDiv = document.getElementById('explain');
  if(revealAnswers){
    explainDiv.textContent = q.explain;
    explainDiv.classList.add('show');
  } else {
    explainDiv.classList.remove('show');
    explainDiv.textContent = '';
  }

  document.getElementById('prevBtn').disabled = current === 0;
  document.getElementById('nextBtn').textContent = current === sessionQuestions.length - 1 ? 'Finish →' : 'Next →';

  renderQGrid();
}

document.getElementById('prevBtn').onclick = () => { if(current > 0){ current--; renderQuestion(); } };
document.getElementById('nextBtn').onclick = () => {
  if(current < sessionQuestions.length - 1){ current++; renderQuestion(); }
  else finishQuiz();
};

// ===================== FINISH / RESULTS =====================
function finishQuiz(){
  clearInterval(timerInterval);
  quizActive = false;

  let correctCount = 0;
  const byTopic = {};
  const wrongList = [];

  sessionQuestions.forEach((q, i) => {
    byTopic[q.topic] = byTopic[q.topic] || { correct: 0, total: 0 };
    byTopic[q.topic].total++;
    const userAns = answers[i];
    if(userAns === q.correct){
      correctCount++;
      byTopic[q.topic].correct++;
    } else {
      wrongList.push({ q, userAns });
    }
  });

  document.getElementById('finalScore').textContent = `${correctCount}/${sessionQuestions.length}`;
  const pct = Math.round((correctCount / sessionQuestions.length) * 100);
  document.getElementById('finalLabel').textContent = `correct — ${pct}%${mode === 'timed' ? ' (timed set)' : ''}`;

  const breakdown = document.getElementById('breakdown');
  breakdown.innerHTML = '';
  Object.entries(byTopic).forEach(([topic, stats]) => {
    const row = document.createElement('div');
    row.className = 'brow';
    row.innerHTML = `<span>${topic}</span><span class="val">${stats.correct}/${stats.total}</span>`;
    breakdown.appendChild(row);
  });

  // Review section — only meaningful for timed mode (study mode already showed answers inline)
  const reviewSection = document.getElementById('reviewSection');
  const reviewList = document.getElementById('reviewList');
  reviewList.innerHTML = '';
  if(mode === 'timed' && wrongList.length > 0){
    reviewSection.classList.remove('hidden');
    const letters = ['A','B','C','D'];
    wrongList.forEach(({q, userAns}) => {
      const card = document.createElement('div');
      card.className = 'review-card';
      const yourAnsText = userAns !== undefined ? `${letters[userAns]}. ${q.options[userAns]}` : 'No answer';
      card.innerHTML = `
        <div class="review-q">${q.q}</div>
        <div class="review-line your">Your answer: ${yourAnsText}</div>
        <div class="review-line correct">Correct answer: ${letters[q.correct]}. ${q.options[q.correct]}</div>
      `;
      reviewList.appendChild(card);
    });
  } else {
    reviewSection.classList.add('hidden');
  }

  // Save missed questions from timed sets for later review
  if(mode === 'timed' && wrongList.length > 0){
    const missed = load(K_MISSED, []);
    const letters = ['A','B','C','D'];
    wrongList.forEach(({q, userAns}) => {
      // avoid duplicate entries for the same question — replace if it already exists
      const existingIdx = missed.findIndex(m => m.qId === q._id);
      const entry = {
        qId: q._id,
        date: new Date().toISOString(),
        yourAnswer: userAns !== undefined ? `${letters[userAns]}. ${q.options[userAns]}` : 'No answer'
      };
      if(existingIdx >= 0) missed[existingIdx] = entry;
      else missed.unshift(entry);
    });
    save(K_MISSED, missed.slice(0, 200));
  }

  // persist attempt
  const history = load(K_HISTORY, []);
  history.unshift({
    date: new Date().toISOString(),
    topic: activeTopic,
    mode: mode,
    score: correctCount,
    total: sessionQuestions.length
  });
  save(K_HISTORY, history.slice(0, 20));
  renderHistory();

  document.getElementById('quizArea').classList.add('hidden');
  document.getElementById('resultsArea').classList.remove('hidden');
}

function renderHistory(){
  const history = load(K_HISTORY, []);
  const section = document.getElementById('historySection');
  const list = document.getElementById('historyList');
  if(history.length === 0){ section.classList.add('hidden'); return; }
  section.classList.remove('hidden');
  list.innerHTML = '';
  history.forEach(h => {
    const row = document.createElement('div');
    row.className = 'history-row';
    const d = new Date(h.date);
    const modeTag = h.mode === 'timed' ? ' ⏱' : '';
    row.innerHTML = `<span>${d.toLocaleDateString()} &middot; ${h.topic}${modeTag}</span><span>${h.score}/${h.total}</span>`;
    list.appendChild(row);
  });
}

document.getElementById('retryBtn').onclick = () => {
  document.getElementById('resultsArea').classList.add('hidden');
  document.getElementById('setupArea').classList.remove('hidden');
  renderBookmarkList();
  renderMissedList();
};

document.getElementById('clearHistoryBtn').onclick = () => {
  localStorage.removeItem(K_HISTORY);
  renderHistory();
};

document.getElementById('resetBtn').onclick = () => {
  if(!confirm('Clear all saved progress, streak, and bookmarks? This cannot be undone.')) return;
  localStorage.removeItem(K_HISTORY);
  localStorage.removeItem(K_STREAK);
  localStorage.removeItem(K_BOOKMARKS);
  bookmarks = [];
  clearInterval(timerInterval);
  quizActive = false;
  activeTopic = "All";
  renderTopicBar();
  renderStreak();
  renderBookmarkList();
  renderMissedList();
  document.getElementById('quizArea').classList.add('hidden');
  document.getElementById('resultsArea').classList.add('hidden');
  document.getElementById('setupArea').classList.remove('hidden');
};

// ===================== MAIN TABS =====================
document.getElementById('tabPractice').onclick = () => switchMainTab('practice');
document.getElementById('tabGlossary').onclick = () => switchMainTab('glossary');
function switchMainTab(tab){
  document.getElementById('tabPractice').classList.toggle('active', tab === 'practice');
  document.getElementById('tabGlossary').classList.toggle('active', tab === 'glossary');
  document.getElementById('practiceTab').classList.toggle('hidden', tab !== 'practice');
  document.getElementById('glossaryTab').classList.toggle('hidden', tab !== 'glossary');
}

// ===================== GLOSSARY TAB =====================
let activeGlossarySubject = Object.keys(GLOSSARY_SUBJECTS)[0] || null;

function renderGlossarySubjectBar(){
  const bar = document.getElementById('glossarySubjectBar');
  bar.innerHTML = '';
  Object.keys(GLOSSARY_SUBJECTS).forEach(subj => {
    const chip = document.createElement('div');
    chip.className = 'chip' + (subj === activeGlossarySubject ? ' active' : '');
    chip.textContent = subj;
    chip.onclick = () => { activeGlossarySubject = subj; renderGlossaryContent(); renderGlossarySubjectBar(); };
    bar.appendChild(chip);
  });
}

function renderGlossaryContent(){
  const container = document.getElementById('glossaryContent');
  container.innerHTML = '';

  if(!activeGlossarySubject || Object.keys(GLOSSARY_SUBJECTS).length === 0){
    container.innerHTML = '<div class="glossary-empty">No reference material yet. More subjects coming soon.</div>';
    return;
  }

  const data = GLOSSARY_SUBJECTS[activeGlossarySubject];

  if(data.terms && data.terms.length){
    const label = document.createElement('div');
    label.className = 'section-label';
    label.style.marginTop = '0';
    label.textContent = 'Root words & prefixes';
    container.appendChild(label);

    data.terms.forEach(t => {
      const card = document.createElement('div');
      card.className = 'g-card';
      card.innerHTML = `
        <div class="g-term">${t.term}</div>
        <div class="g-meaning">${t.meaning}</div>
        <div class="g-example">e.g. ${t.example}</div>
        ${t.fact ? `<div class="g-fact">${t.fact}</div>` : ''}
      `;
      container.appendChild(card);
    });
  }

  if(data.facts && data.facts.length){
    const label = document.createElement('div');
    label.className = 'section-label';
    label.textContent = 'Quick facts';
    container.appendChild(label);

    data.facts.forEach(f => {
      const card = document.createElement('div');
      card.className = 'fact-card';
      card.innerHTML = `<div class="fact-text">${f.fact}</div><div class="fact-tag">${f.tag}</div>`;
      container.appendChild(card);
    });
  }
}

// ===================== INIT =====================
renderTopicBar();
renderStreak();
renderBookmarkList();
renderMissedList();
renderGlossarySubjectBar();
renderGlossaryContent();
setMode('study');
