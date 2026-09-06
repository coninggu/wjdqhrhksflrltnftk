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

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }
  var isBookmarked = function (id) { return !!(window.StudyStore && window.StudyStore.isBookmarked(id)); };
  var isDone = function (id) { return !!(window.StudyStore && window.StudyStore.isDone(id)); };

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
      stage.innerHTML = '<div class="fc-empty">해당 조건의 주제가 없습니다. 필터를 넓혀보세요.</div>';
      statusEl.textContent = ''; return;
    }
    if (fIdx >= fQueue.length) {
      stage.innerHTML = '<div class="fc-done"><div class="fc-done-big">완료! 🎉</div>' +
        '<p class="fc-done-sub">' + fQueue.length + '장 학습 · 알아요 ' + fKnown + ' · 다시 ' + fAgain + '</p>' +
        '<button type="button" class="fc-primary" id="fc-again">다시 시작</button></div>';
      document.getElementById('fc-again').onclick = startFlash;
      statusEl.textContent = ''; return;
    }
    var t = fQueue[fIdx];
    statusEl.textContent = '플래시카드 ' + (fIdx + 1) + ' / ' + fQueue.length + '  ·  알아요 ' + fKnown;
    var back = fRevealed
      ? '<div class="fc-a">' + escapeHtml(t.summary || '(요약 없음)') + '</div>' +
        '<div class="fc-grade">' +
          '<button type="button" class="fc-again-btn" data-act="again">다시 ↻</button>' +
          '<button type="button" class="fc-know-btn" data-act="know">알아요 ✓</button>' +
        '</div>' +
        '<a class="fc-open" href="topic.html?id=' + encodeURIComponent(t.id) + '">전체 내용 보기 →</a>'
      : '<button type="button" class="fc-reveal" data-act="reveal">정답 보기</button>' +
        '<p class="fc-hint">머릿속으로 설명해 본 뒤 확인하세요</p>';
    stage.innerHTML =
      '<div class="fc-card">' +
        '<span class="fc-cat">' + escapeHtml(t.category || '기타') + '</span>' +
        '<div class="fc-q">' + escapeHtml(t.title) + '</div>' +
        back +
      '</div>';
  }

  // ── 퀴즈 (4지선다: 설명 → 주제 맞히기) ──
  function startQuiz() {
    var p = pool();
    if (p.length < 4) {
      stage.innerHTML = '<div class="fc-empty">퀴즈는 최소 4개 주제가 필요합니다 (현재 ' + p.length + '개). 조건을 넓혀주세요.</div>';
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
      stage.innerHTML = '<div class="fc-done"><div class="fc-done-big">' + qScore + ' / ' + qList.length + ' 정답 (' + pct + '%)</div>' +
        '<button type="button" class="fc-primary" id="fc-again">새 퀴즈</button></div>';
      document.getElementById('fc-again').onclick = startQuiz;
      statusEl.textContent = ''; return;
    }
    var q = qList[qIdx];
    statusEl.textContent = '퀴즈 ' + (qIdx + 1) + ' / ' + qList.length + '  ·  점수 ' + qScore;
    stage.innerHTML =
      '<div class="fc-card fc-quiz">' +
        '<p class="fc-qlabel">다음 설명에 해당하는 주제는?</p>' +
        '<div class="fc-desc">' + escapeHtml(q.topic.summary || q.topic.title) + '</div>' +
        '<div class="fc-options">' +
          q.options.map(function (o) {
            return '<button type="button" class="fc-opt" data-id="' + encodeURIComponent(o.id) + '">' + escapeHtml(o.title) + '</button>';
          }).join('') +
        '</div>' +
        '<div class="fc-next-wrap" hidden>' +
          '<a class="fc-open" href="topic.html?id=' + encodeURIComponent(q.topic.id) + '">전체 내용 보기 →</a>' +
          '<button type="button" class="fc-primary" data-act="qnext">다음 →</button>' +
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
    statusEl.textContent = '퀴즈 ' + (qIdx + 1) + ' / ' + qList.length + '  ·  점수 ' + qScore;
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
      catSel.innerHTML = '<option value="">전체</option>' +
        cats.map(function (c) { return '<option value="' + escapeHtml(c) + '">' + escapeHtml(c) + '</option>'; }).join('');
      start();
    })
    .catch(function () {
      stage.innerHTML = '<div class="fc-empty">주제를 불러오지 못했습니다.</div>';
    });
})();
