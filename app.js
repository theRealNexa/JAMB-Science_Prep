// ===================== DATA =====================
// NOTE: keep this array in the ORIGINAL order (Chemistry, Mathematics, English, Biology).
// Question ids (_id) are index-based, so reordering would break saved bookmarks / missed questions.
// To add a subject: add the questions/<subject>.js file, add a <script> tag in index.html,
// then add ONE entry here. dept is 'general' (everyone) or a key from DEPARTMENTS.
const DEPARTMENTS = {
  science: "Science",
  art: "Art",
  commercial: "Commercial"
};

const SUBJECTS = [
  { name: "Chemistry",   dept: "science", data: typeof CHEMISTRY_QUESTIONS   !== 'undefined' ? CHEMISTRY_QUESTIONS   : [] },
  { name: "Mathematics", dept: "general", data: typeof MATHEMATICS_QUESTIONS !== 'undefined' ? MATHEMATICS_QUESTIONS : [] },
  { name: "English",     dept: "general", data: typeof ENGLISH_QUESTIONS     !== 'undefined' ? ENGLISH_QUESTIONS     : [] },
  { name: "Biology",     dept: "science", data: typeof BIOLOGY_QUESTIONS     !== 'undefined' ? BIOLOGY_QUESTIONS     : [] },
];

const ALL_QUESTIONS = [];
SUBJECTS.forEach(s => s.data.forEach(q => { q.subject = s.name; ALL_QUESTIONS.push(q); }));
ALL_QUESTIONS.forEach((q, i) => { q._id = i; });

// topics per subject (derived from the questions)
SUBJECTS.forEach(s => {
  s.topics = Array.from(new Set(ALL_QUESTIONS.filter(q => q.subject === s.name).map(q => q.topic)));
});

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
const K_USERNAME = "jamb-username-v1";
const K_DEPT = "jamb-dept-v1";

// ===================== STORAGE HELPERS =====================
function load(key, fallback){
  try{ const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
  catch(e){ return fallback; }
}
function save(key, val){
  try{ localStorage.setItem(key, JSON.stringify(val)); return true; }
  catch(e){ return false; }
}

// ===================== USER IDENTITY =====================
function getUsername(){ return localStorage.getItem(K_USERNAME); }
function getDept(){
  const d = localStorage.getItem(K_DEPT);
  return d && DEPARTMENTS[d] ? d : null;
}

// Subjects this user can see: general ones always, plus their department's.
// General subjects are listed first.
function visibleSubjects(){
  const dept = getDept();
  const list = SUBJECTS.filter(s => s.dept === 'general' || s.dept === dept);
  return [
    ...list.filter(s => s.dept === 'general'),
    ...list.filter(s => s.dept !== 'general')
  ];
}
function isVisibleSubject(name){ return visibleSubjects().some(s => s.name === name); }

// ===================== FIRESTORE SYNC =====================
// Fire-and-forget: never blocks the quiz UI, and failures are silent
// (e.g. offline) since localStorage remains the source of truth locally.
let firestoreReady = false;
let db = null;

function initFirestore(){
  try{
    if(typeof firebase === 'undefined' || !window.FIREBASE_CONFIG) return;
    firebase.initializeApp(window.FIREBASE_CONFIG);
    db = firebase.firestore();
    firestoreReady = true;
  }catch(e){
    firestoreReady = false;
  }
}

function syncToCloud(collection, data){
  if(!firestoreReady || !db) return;
  try{
    db.collection(collection).add({
      ...data,
      userName: getUsername() || "Unknown",
      department: getDept() || "Unknown",
      syncedAt: new Date().toISOString()
    }).catch(() => { /* silent fail — offline or blocked, localStorage still has it */ });
  }catch(e){ /* silent fail */ }
}

// ===================== STATE =====================
let mode = "study"; // "study" | "timed"
let timedQCount = 20;
let timedMinutes = 15;

// Subject/topic selection.
// selection[subjectName] = { all: boolean, topics: Set<string> }
// Rule: a subject is either "All" or a specific set of topics — never both.
let selection = {};

let sessionQuestions = [];   // the actual question objects for this run
let sessionLabel = "";       // human label of what was selected (for history)
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
  syncToCloud('streaks', { count: s.count, lastDate: s.lastDate });
  return s;
}
function renderStreak(){
  const s = load(K_STREAK, { count: 0, lastDate: null });
  document.getElementById('streakBadge').textContent = `🔥 ${s.count} day streak`;
}

// ===================== PROFILE UI (welcome + modal) =====================
function renderProfileHeader(){
  const name = getUsername();
  const dept = getDept();
  document.getElementById('welcome').textContent = name ? `Welcome ${name}` : '';
  const badge = document.getElementById('deptBadge');
  badge.textContent = dept ? `${DEPARTMENTS[dept]} · change` : 'Set department';
  const subjectNames = visibleSubjects().map(s => s.name).join(' · ');
  document.getElementById('eyebrow').textContent = subjectNames || 'JAMB Prep';
}

let pickedDept = null;
function renderDeptOptions(){
  const box = document.getElementById('deptOptions');
  box.innerHTML = '';
  Object.entries(DEPARTMENTS).forEach(([key, label]) => {
    const chip = document.createElement('div');
    chip.className = 'chip' + (key === pickedDept ? ' active' : '');
    chip.textContent = label;
    chip.onclick = () => { pickedDept = key; renderDeptOptions(); };
    box.appendChild(chip);
  });
}

function showProfileModal(isEdit){
  const input = document.getElementById('nameInput');
  input.value = getUsername() || '';
  pickedDept = getDept();
  renderDeptOptions();
  document.getElementById('profileErr').textContent = '';
  document.getElementById('profileCancel').classList.toggle('hidden', !isEdit);
  document.getElementById('profileModal').classList.remove('hidden');
  setTimeout(() => input.focus(), 50);
}
function hideProfileModal(){
  document.getElementById('profileModal').classList.add('hidden');
}

document.getElementById('profileCancel').onclick = hideProfileModal;
document.getElementById('deptBadge').onclick = () => showProfileModal(true);
document.getElementById('profileSave').onclick = () => {
  const name = document.getElementById('nameInput').value.trim().slice(0, 40);
  const err = document.getElementById('profileErr');
  if(!name){ err.textContent = 'Enter your name.'; return; }
  if(!pickedDept){ err.textContent = 'Pick your department.'; return; }

  const deptChanged = getDept() !== pickedDept;
  localStorage.setItem(K_USERNAME, name);
  localStorage.setItem(K_DEPT, pickedDept);
  if(deptChanged) syncToCloud('profiles', { event: 'department-set', department: pickedDept });

  // drop any selected subjects the new department can't see
  Object.keys(selection).forEach(n => { if(!isVisibleSubject(n)) delete selection[n]; });

  hideProfileModal();
  renderAll();
};

// ===================== SUBJECT / TOPIC SELECTION =====================
function toggleSubject(name){
  if(selection[name]) delete selection[name];
  else selection[name] = { all: true, topics: new Set() };
  renderSelector();
}

function pickAll(name){
  const sel = selection[name];
  if(!sel) return;
  sel.all = true;
  sel.topics.clear();
  renderSelector();
}

function toggleTopic(name, topic){
  const sel = selection[name];
  if(!sel) return;
  const subj = SUBJECTS.find(s => s.name === name);

  if(sel.all){
    // leaving "All" — start a specific list with just this topic
    sel.all = false;
    sel.topics = new Set([topic]);
  } else if(sel.topics.has(topic)){
    sel.topics.delete(topic);
    if(sel.topics.size === 0){ sel.all = true; } // nothing left -> back to All
  } else {
    sel.topics.add(topic);
    if(sel.topics.size === subj.topics.length){ // every topic picked == All
      sel.all = true;
      sel.topics.clear();
    }
  }
  renderSelector();
}

function renderSelector(){
  const bar = document.getElementById('subjectBar');
  const panels = document.getElementById('topicPanels');
  bar.innerHTML = '';
  panels.innerHTML = '';

  const subjects = visibleSubjects();
  subjects.forEach(s => {
    const chip = document.createElement('div');
    chip.className = 'chip' + (selection[s.name] ? ' active' : '');
    chip.textContent = s.name;
    chip.onclick = () => toggleSubject(s.name);
    bar.appendChild(chip);
  });

  subjects.forEach(s => {
    const sel = selection[s.name];
    if(!sel) return;
    const panel = document.createElement('div');
    panel.className = 'topic-panel';
    const label = document.createElement('div');
    label.className = 'panel-label';
    label.textContent = s.name;
    panel.appendChild(label);

    const row = document.createElement('div');
    row.className = 'topic-bar';
    row.style.marginBottom = '0';

    const allChip = document.createElement('div');
    allChip.className = 'chip small' + (sel.all ? ' active' : '');
    allChip.textContent = 'All';
    allChip.onclick = () => pickAll(s.name);
    row.appendChild(allChip);

    s.topics.forEach(t => {
      const c = document.createElement('div');
      c.className = 'chip small' + (!sel.all && sel.topics.has(t) ? ' active' : '');
      c.textContent = t;
      c.onclick = () => toggleTopic(s.name, t);
      row.appendChild(c);
    });

    panel.appendChild(row);
    panels.appendChild(panel);
  });

  updateStartButton();
}

// Returns [{ subject, questions }] for the current selection
function getSelectedGroups(){
  const groups = [];
  visibleSubjects().forEach(s => {
    const sel = selection[s.name];
    if(!sel) return;
    const qs = ALL_QUESTIONS.filter(q =>
      q.subject === s.name && (sel.all || sel.topics.has(q.topic))
    );
    if(qs.length) groups.push({ subject: s.name, questions: qs });
  });
  return groups;
}

function getSelectionLabel(){
  const parts = [];
  visibleSubjects().forEach(s => {
    const sel = selection[s.name];
    if(!sel) return;
    parts.push(sel.all ? s.name : `${s.name}: ${Array.from(sel.topics).join(', ')}`);
  });
  return parts.join(' · ');
}

function shuffle(arr){
  const a = [...arr];
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i+1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Equal share per subject; leftovers (small banks) are filled randomly from what remains
function pickBalanced(groups, n){
  const k = groups.length;
  const pools = groups.map(g => shuffle(g.questions));
  const base = Math.floor(n / k);
  const extra = n % k;
  const quotas = pools.map(() => base);
  shuffle(pools.map((_, i) => i)).slice(0, extra).forEach(i => quotas[i]++);

  const picked = [];
  const rest = [];
  pools.forEach((arr, i) => {
    picked.push(...arr.slice(0, quotas[i]));
    rest.push(...arr.slice(quotas[i]));
  });
  if(picked.length < n) picked.push(...shuffle(rest).slice(0, n - picked.length));
  return shuffle(picked);
}

// ===================== SETUP HELPERS =====================
document.getElementById('modeStudy').onclick = () => setMode('study');
document.getElementById('modeTimed').onclick = () => setMode('timed');
function setMode(m){
  mode = m;
  document.getElementById('modeStudy').classList.toggle('active', m === 'study');
  document.getElementById('modeTimed').classList.toggle('active', m === 'timed');
  document.getElementById('timedConfig').classList.toggle('hidden', m !== 'timed');
  updateStartButton();
}
function updateStartButton(){
  const btn = document.getElementById('startBtn');
  const hasSelection = Object.keys(selection).length > 0;
  btn.textContent = !hasSelection
    ? 'Pick a subject to begin'
    : (mode === 'timed' ? 'Start Timed Set →' : 'Start Study Session →');
  btn.style.opacity = hasSelection ? '1' : '0.55';
}

document.getElementById('qCountDown').onclick = () => { timedQCount = Math.max(5, timedQCount - 5); document.getElementById('qCountVal').textContent = timedQCount; };
document.getElementById('qCountUp').onclick = () => { timedQCount = Math.min(80, timedQCount + 5); document.getElementById('qCountVal').textContent = timedQCount; };
document.getElementById('timeLimitDown').onclick = () => { timedMinutes = Math.max(5, timedMinutes - 5); document.getElementById('timeLimitVal').textContent = timedMinutes; };
document.getElementById('timeLimitUp').onclick = () => { timedMinutes = Math.min(90, timedMinutes + 5); document.getElementById('timeLimitVal').textContent = timedMinutes; };

document.getElementById('startBtn').onclick = () => {
  const groups = getSelectedGroups();
  if(groups.length === 0){ alert('Pick at least one subject (with questions) first.'); return; }
  const total = groups.reduce((n, g) => n + g.questions.length, 0);

  if(mode === 'timed'){
    const n = Math.min(timedQCount, total);
    sessionQuestions = pickBalanced(groups, n);
    secondsRemaining = timedMinutes * 60;
  } else {
    sessionQuestions = groups.flatMap(g => g.questions);
  }
  sessionLabel = getSelectionLabel();

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
  const wasBookmarked = isBookmarked(qId);
  if(wasBookmarked) bookmarks = bookmarks.filter(id => id !== qId);
  else bookmarks.push(qId);
  save(K_BOOKMARKS, bookmarks);

  // sync current bookmark state for this question to cloud
  const q = ALL_QUESTIONS.find(item => item._id === qId);
  if(q){
    syncToCloud('bookmarks', {
      questionId: qId,
      questionText: q.q,
      subject: q.subject || '',
      topic: q.topic,
      action: wasBookmarked ? 'removed' : 'added'
    });
  }
}
document.getElementById('bmkBtn').onclick = () => {
  const q = sessionQuestions[current];
  toggleBookmark(q._id);
  renderQuestion();
};

function renderBookmarkList(){
  const label = document.getElementById('bmkSectionLabel');
  const list = document.getElementById('bmkList');
  const bmkQuestions = ALL_QUESTIONS.filter(q => bookmarks.includes(q._id) && isVisibleSubject(q.subject));
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

  const visibleMissed = missed.filter(m => {
    const q = ALL_QUESTIONS.find(item => item._id === m.qId);
    return q && isVisibleSubject(q.subject);
  });

  if(visibleMissed.length === 0){
    label.style.display = 'none';
    clearBtn.style.display = 'none';
    return;
  }
  label.style.display = 'block';
  clearBtn.style.display = 'inline-block';

  const letters = ['A','B','C','D'];
  visibleMissed.forEach(m => {
    const q = ALL_QUESTIONS.find(item => item._id === m.qId);
    const card = document.createElement('div');
    card.className = 'review-card';
    card.innerHTML = `
      <div class="review-q">${q.q}</div>
      <div class="review-line" style="color:var(--ink-mute);">${q.subject} · ${q.topic}</div>
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
  document.getElementById('qtag').textContent = `${q.subject} · ${q.topic}`;
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
    const key = `${q.subject} · ${q.topic}`;
    byTopic[key] = byTopic[key] || { correct: 0, total: 0 };
    byTopic[key].total++;
    const userAns = answers[i];
    if(userAns === q.correct){
      correctCount++;
      byTopic[key].correct++;
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
      const yourAnswer = userAns !== undefined ? `${letters[userAns]}. ${q.options[userAns]}` : 'No answer';
      const entry = {
        qId: q._id,
        date: new Date().toISOString(),
        yourAnswer: yourAnswer
      };
      if(existingIdx >= 0) missed[existingIdx] = entry;
      else missed.unshift(entry);

      syncToCloud('missed', {
        questionId: q._id,
        questionText: q.q,
        subject: q.subject || '',
        topic: q.topic,
        yourAnswer: yourAnswer,
        correctAnswer: `${letters[q.correct]}. ${q.options[q.correct]}`
      });
    });
    save(K_MISSED, missed.slice(0, 200));
  }

  // persist attempt
  const history = load(K_HISTORY, []);
  const attemptRecord = {
    date: new Date().toISOString(),
    topic: sessionLabel,
    mode: mode,
    score: correctCount,
    total: sessionQuestions.length
  };
  history.unshift(attemptRecord);
  syncToCloud('attempts', attemptRecord);
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
    row.innerHTML = `<span style="padding-right:10px;">${d.toLocaleDateString()} &middot; ${h.topic}${modeTag}</span><span style="white-space:nowrap;">${h.score}/${h.total}</span>`;
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
  selection = {};
  renderSelector();
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
let activeGlossarySubject = null;

function visibleGlossarySubjects(){
  return Object.keys(GLOSSARY_SUBJECTS).filter(isVisibleSubject);
}

function renderGlossarySubjectBar(){
  const bar = document.getElementById('glossarySubjectBar');
  bar.innerHTML = '';
  const subjects = visibleGlossarySubjects();
  if(!subjects.includes(activeGlossarySubject)) activeGlossarySubject = subjects[0] || null;
  subjects.forEach(subj => {
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

  if(!activeGlossarySubject){
    container.innerHTML = '<div class="glossary-empty">No reference material yet for your subjects. More coming soon.</div>';
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
function renderAll(){
  renderProfileHeader();
  renderSelector();
  renderStreak();
  renderBookmarkList();
  renderMissedList();
  renderGlossarySubjectBar();
  renderGlossaryContent();
  setMode(mode);
}

initFirestore();
renderAll();
// First visit (or an older user with a name but no department yet): ask before anything else
if(!getUsername() || !getDept()) showProfileModal(false);