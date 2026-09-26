// 플래시카드 & 퀴즈 — topics.json의 제목↔요약으로 암기·복습.
// 백엔드 없음. 범위 필터는 study.js(즐겨찾기)·done 상태를 재사용.
(function () {
  var stage = document.getElementById('fc-stage');
  var statusEl = document.getElementById('fc-status');
  var catSel = document.getElementById('fc-category');
  var scopeSel = document.getElementById('fc-scope');
  var restartBtn = document.getElementById('fc-restart');
  var modeBtns = [].slice.call(document.querySelectorAll('.fc-mode'));

  var topics = [];
  var mode = 'flash';

  // 플래시카드 상태
  var fQueue = [], fIdx = 0, fKnown = 0, fAgain = 0, fRevealed = false;
  // 퀴즈 상태
  var qList = [], qIdx = 0, qScore = 0, qAnswered = false;

  var escapeHtml = window.IMN.escapeHtml;
  var shuffle = window.IMN.shuffle;
  var isBookmarked = window.IMN.isBookmarked;
  var isDone = window.IMN.isDone;
  var tr = (window.I18N && window.I18N.t) ? window.I18N.t : function (k) { return k; };
  var catLabel = (window.I18N && window.I18N.category) ? window.I18N.category : function (c) { return c || '기타'; };

  function pool() {
    var cat = catSel.value, scope = scopeSel.value;
    return topics.filter(function (t) {
      if (cat && t.category !== cat) return false;
      if (scope === 'bookmark' && !isBookmarked(t.id)) return false;
      if (scope === 'undone' && isDone(t.id)) return false;
      return true;
    });
  }

  function start() { if (mode === 'flash') startFlash(); else startQuiz(); }

  // ── 플래시카드 ──
  function startFlash() {
    fQueue = shuffle(pool().slice()); fIdx = 0; fKnown = 0; fAgain = 0; fRevealed = false;
    renderFlash();
  }
  function renderFlash() {
    if (!fQueue.length) {
      stage.innerHTML = '<div class="fc-empty">' + escapeHtml(tr('fc.emptyPool')) + '</div>';
      statusEl.textContent = ''; return;
    }
    if (fIdx >= fQueue.length) {
      stage.innerHTML = '<div class="fc-done"><div class="fc-done-big">' + escapeHtml(tr('fc.doneBig')) + '</div>' +
        '<p class="fc-done-sub">' + escapeHtml(tr('fc.doneSub', { n: fQueue.length, known: fKnown, again: fAgain })) + '</p>' +
        '<button type="button" class="fc-primary" id="fc-again">' + escapeHtml(tr('fc.restartBtn')) + '</button></div>';
      document.getElementById('fc-again').onclick = startFlash;
      statusEl.textContent = ''; return;
    }
    var t = fQueue[fIdx];
    statusEl.textContent = tr('fc.flashStatus', { i: fIdx + 1, n: fQueue.length, known: fKnown });
    var back = fRevealed
      ? '<div class="fc-a">' + escapeHtml(t.summary || tr('fc.noSummary')) + '</div>' +
        '<div class="fc-grade">' +
          '<button type="button" class="fc-again-btn" data-act="again">' + escapeHtml(tr('fc.again')) + '</button>' +
          '<button type="button" class="fc-know-btn" data-act="know">' + escapeHtml(tr('fc.know')) + '</button>' +
        '</div>' +
        '<a class="fc-open" href="topic.html?id=' + encodeURIComponent(t.id) + '">' + escapeHtml(tr('fc.openFull')) + '</a>'
      : '<button type="button" class="fc-reveal" data-act="reveal">' + escapeHtml(tr('fc.reveal')) + '</button>' +
        '<p class="fc-hint">' + escapeHtml(tr('fc.hint')) + '</p>';
    stage.innerHTML =
      '<div class="fc-card">' +
        '<span class="fc-cat">' + escapeHtml(catLabel(t.category)) + '</span>' +
        '<div class="fc-q">' + escapeHtml(t.title) + '</div>' +
        back +
      '</div>';
  }

  // ── 퀴즈 (4지선다: 설명 → 주제 맞히기) ──
  function startQuiz() {
    var p = pool();
    if (p.length < 4) {
      stage.innerHTML = '<div class="fc-empty">' + escapeHtml(tr('fc.quizNeed4', { n: p.length })) + '</div>';
      statusEl.textContent = ''; qList = []; return;
    }
    var picked = shuffle(p.slice()).slice(0, Math.min(10, p.length));
    qList = picked.map(function (t) {
      var distract = shuffle(topics.filter(function (x) { return x.id !== t.id; }).slice()).slice(0, 3);
      return { topic: t, options: shuffle([t].concat(distract)), answerId: t.id };
    });
    qIdx = 0; qScore = 0; qAnswered = false;
    renderQuiz();
  }
  function renderQuiz() {
    if (!qList.length) return;
    if (qIdx >= qList.length) {
      var pct = Math.round(qScore / qList.length * 100);
      stage.innerHTML = '<div class="fc-done"><div class="fc-done-big">' + escapeHtml(tr('fc.quizResult', { score: qScore, n: qList.length, pct: pct })) + '</div>' +
        '<button type="button" class="fc-primary" id="fc-again">' + escapeHtml(tr('fc.newQuiz')) + '</button></div>';
      document.getElementById('fc-again').onclick = startQuiz;
      statusEl.textContent = ''; return;
    }
    var q = qList[qIdx];
    statusEl.textContent = tr('fc.quizStatus', { i: qIdx + 1, n: qList.length, score: qScore });
    stage.innerHTML =
      '<div class="fc-card fc-quiz">' +
        '<p class="fc-qlabel">' + escapeHtml(tr('fc.quizLabel')) + '</p>' +
        '<div class="fc-desc">' + escapeHtml(q.topic.summary || q.topic.title) + '</div>' +
        '<div class="fc-options">' +
          q.options.map(function (o) {
            return '<button type="button" class="fc-opt" data-id="' + encodeURIComponent(o.id) + '">' + escapeHtml(o.title) + '</button>';
          }).join('') +
        '</div>' +
        '<div class="fc-next-wrap" hidden>' +
          '<a class="fc-open" href="topic.html?id=' + encodeURIComponent(q.topic.id) + '">' + escapeHtml(tr('fc.openFull')) + '</a>' +
          '<button type="button" class="fc-primary" data-act="qnext">' + escapeHtml(tr('fc.next')) + '</button>' +
        '</div>' +
      '</div>';
    qAnswered = false;
  }
  function gradeQuiz(btn) {
    qAnswered = true;
    var q = qList[qIdx];
    var chosen = decodeURIComponent(btn.getAttribute('data-id'));
    if (chosen === q.answerId) qScore++;
    [].forEach.call(stage.querySelectorAll('.fc-opt'), function (el) {
      var id = decodeURIComponent(el.getAttribute('data-id'));
      el.disabled = true;
      if (id === q.answerId) el.classList.add('is-correct');
      else if (el === btn) el.classList.add('is-wrong');
    });
    var nw = stage.querySelector('.fc-next-wrap');
    if (nw) nw.hidden = false;
    statusEl.textContent = tr('fc.quizStatus', { i: qIdx + 1, n: qList.length, score: qScore });
  }

  // ── 이벤트 ──
  stage.addEventListener('click', function (e) {
    var btn = e.target.closest('button, a');
    if (!btn) return;
    var act = btn.getAttribute('data-act');
    if (act === 'reveal') { fRevealed = true; renderFlash(); return; }
    if (act === 'know') { fKnown++; fIdx++; fRevealed = false; renderFlash(); return; }
    if (act === 'again') {
      fAgain++;
      var cur = fQueue.splice(fIdx, 1)[0]; fQueue.push(cur); // 뒤로 재배치
      fRevealed = false; renderFlash(); return;
    }
    if (btn.classList && btn.classList.contains('fc-opt')) { if (!qAnswered) gradeQuiz(btn); return; }
    if (act === 'qnext') { qIdx++; renderQuiz(); return; }
  });

  modeBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      mode = b.getAttribute('data-mode');
      modeBtns.forEach(function (x) { x.classList.toggle('is-active', x === b); });
      start();
    });
  });
  catSel.addEventListener('change', start);
  scopeSel.addEventListener('change', start);
  restartBtn.addEventListener('click', start);

  // ── 로드 ──
  fetch('data/topics.json')
    .then(function (res) { if (!res.ok) throw new Error('로드 실패'); return res.json(); })
    .then(function (data) {
      topics = Array.isArray(data) ? data : [];
      var cats = Array.from(new Set(topics.map(function (t) { return t.category; }).filter(Boolean))).sort();
      catSel.innerHTML = '<option value="">' + escapeHtml(tr('fc.all')) + '</option>' +
        cats.map(function (c) { return '<option value="' + escapeHtml(c) + '">' + escapeHtml(catLabel(c)) + '</option>'; }).join('');
      start();
    })
    .catch(function () {
      stage.innerHTML = '<div class="fc-empty">' + escapeHtml(tr('fc.loadError')) + '</div>';
    });
})();
