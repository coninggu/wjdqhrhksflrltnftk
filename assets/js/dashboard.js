// 내 학습 현황 대시보드 — localStorage(viewed·study)와 topics.json으로 진도 집계. 백엔드 없음.
(function () {
  var root = document.getElementById('db-content');

  var escapeHtml = window.IMN.escapeHtml;
  var isViewed = window.IMN.isViewed;
  var isBookmarked = window.IMN.isBookmarked;
  var isDone = window.IMN.isDone;
  var tr = (window.I18N && window.I18N.t) ? window.I18N.t : function (k) { return k; };
  var catLabel = (window.I18N && window.I18N.category) ? window.I18N.category : function (c) { return c || '기타'; };
  var pct = function (n, d) { return d > 0 ? Math.round(n / d * 100) : 0; };

  function bar(p) {
    return '<div class="db-bar"><div class="db-bar-fill" style="width:' + p + '%"></div></div>';
  }
  function cardLink(t) {
    return '<li><a class="db-item" href="topic.html?id=' + encodeURIComponent(t.id) + '">' +
      '<span class="db-item-cat">' + escapeHtml(catLabel(t.category)) + '</span>' +
      '<span class="db-item-title">' + escapeHtml(t.title) + '</span></a></li>';
  }

  function render(topics) {
    var total = topics.length;
    var doneList = topics.filter(function (t) { return isDone(t.id); });
    var bmList = topics.filter(function (t) { return isBookmarked(t.id); });
    var viewedCount = topics.reduce(function (n, t) { return n + (isViewed(t.id) ? 1 : 0); }, 0);
    var doneCount = doneList.length;

    // 아무 기록도 없으면 안내
    if (doneCount === 0 && bmList.length === 0 && viewedCount === 0) {
      root.innerHTML =
        '<div class="db-empty">' +
          '<div class="db-empty-big">' + escapeHtml(tr('db.emptyBig')) + '</div>' +
          '<p>' + escapeHtml(tr('db.emptyDesc')) + '</p>' +
          '<div class="db-empty-cta"><a class="fc-entry" href="index.html">' + escapeHtml(tr('db.browse')) + '</a>' +
          '<a class="fc-entry" href="flashcards.html">' + escapeHtml(tr('db.flashcards')) + '</a></div>' +
        '</div>';
      return;
    }

    // 카테고리별 진도
    var byCat = {};
    topics.forEach(function (t) {
      var c = t.category || '기타';
      if (!byCat[c]) byCat[c] = { total: 0, done: 0 };
      byCat[c].total++;
      if (isDone(t.id)) byCat[c].done++;
    });
    var cats = Object.keys(byCat).sort(function (a, b) { return byCat[b].total - byCat[a].total; });

    // 이어서 학습: 최근 열람 중 아직 완료 안 한 주제
    var byId = {};
    topics.forEach(function (t) { byId[t.id] = t; });
    var cont = (window.ViewedStore ? window.ViewedStore.recentIds(60) : [])
      .map(function (id) { return byId[id]; })
      .filter(function (t) { return t && !isDone(t.id); })
      .slice(0, 6);

    var html = '';

    // ── 요약 통계 ──
    html += '<div class="db-stats">' +
      '<div class="db-stat"><div class="db-stat-num">' + doneCount + '<span>/' + total + '</span></div><div class="db-stat-label">' + escapeHtml(tr('db.statDone')) + '</div></div>' +
      '<div class="db-stat"><div class="db-stat-num db-accent-star">' + bmList.length + '</div><div class="db-stat-label">' + escapeHtml(tr('db.statBookmark')) + '</div></div>' +
      '<div class="db-stat"><div class="db-stat-num">' + viewedCount + '</div><div class="db-stat-label">' + escapeHtml(tr('db.statViewed')) + '</div></div>' +
    '</div>';

    // ── 전체 진도 ──
    html += '<section class="db-section"><div class="db-section-head"><h2>' + escapeHtml(tr('db.secProgress')) + '</h2>' +
      '<span class="db-pct">' + pct(doneCount, total) + '%</span></div>' + bar(pct(doneCount, total)) + '</section>';

    // ── 이어서 학습 ──
    if (cont.length) {
      html += '<section class="db-section"><div class="db-section-head"><h2>' + escapeHtml(tr('db.secContinue')) + '</h2></div>' +
        '<ul class="db-list">' + cont.map(cardLink).join('') + '</ul></section>';
    }

    // ── 카테고리별 진도 ──
    html += '<section class="db-section"><div class="db-section-head"><h2>' + escapeHtml(tr('db.secByCat')) + '</h2></div>' +
      '<ul class="db-cats">' +
      cats.map(function (c) {
        var d = byCat[c];
        return '<li class="db-cat">' +
          '<div class="db-cat-top"><span class="db-cat-name">' + escapeHtml(catLabel(c)) + '</span>' +
          '<span class="db-cat-num">' + d.done + '/' + d.total + '</span></div>' +
          bar(pct(d.done, d.total)) + '</li>';
      }).join('') +
      '</ul></section>';

    // ── 즐겨찾기 목록 ──
    if (bmList.length) {
      html += '<section class="db-section"><div class="db-section-head"><h2>' + escapeHtml(tr('db.secBookmark')) + '</h2>' +
        '<span class="db-pct">' + escapeHtml(tr('db.count', { n: bmList.length })) + '</span></div>' +
        '<ul class="db-list">' + bmList.map(cardLink).join('') + '</ul></section>';
    }

    root.innerHTML = html;
  }

  fetch('data/topics.json')
    .then(function (res) { if (!res.ok) throw new Error('로드 실패'); return res.json(); })
    .then(function (data) { render(Array.isArray(data) ? data : []); })
    .catch(function () { root.innerHTML = '<div class="db-empty">' + escapeHtml(tr('db.loadError')) + '</div>'; });
})();
