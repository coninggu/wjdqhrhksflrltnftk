// 상세 페이지: ?id= 로 주제 메타 + 마크다운 본문 렌더
(function () {
  const metaEl = document.getElementById('topic-meta');
  const bodyEl = document.getElementById('markdown-body');

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function showError(msg) {
    bodyEl.innerHTML = `<div class="error-box">${escapeHtml(msg)}</div>`;
  }

  // 안전한 id: 슬러그 형태만 허용 (경로 조작 방지)
  const params = new URLSearchParams(window.location.search);
  const rawId = params.get('id') || '';
  const id = rawId.trim();

  if (!id || !/^[a-z0-9][a-z0-9-]*$/i.test(id)) {
    metaEl.innerHTML = '';
    showError('유효한 주제 id가 없습니다. 목록에서 주제를 선택해 주세요.');
    return;
  }

  var SITE_BASE = 'https://www.xn--zb0bow85w7idd5f0pc46q.com';
  var allTopics = [];      // topics.json 전체(관련 주제 계산용)
  var currentTopic = null; // 현재 주제 메타

  // GA4 page_view 수동 전송: topic.html은 send_page_view:false라, 실제 주제 제목이
  // 확정된 뒤 정확한 page_title·page_location(?id 포함)으로 1회만 전송한다.
  // → 주제마다 개별 집계되어 "어떤 주제가 유입·참여되는지" 볼 수 있다.
  var pvSent = false;
  function sendPageView() {
    if (pvSent) return;
    pvSent = true;
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href
      });
    }
  }

  // 회차 태그(예: "133회")는 주제 관련성 신호에서 제외 — 주제(subject) 태그만 사용
  var CADENCE = /^\d+회$/;
  function subjectTags(t) {
    return (t.tags || []).filter((x) => !CADENCE.test(x)).map((x) => String(x).toLowerCase());
  }

  // 본문 마크다운의 [[slug]] 위키링크 → 저자가 명시한 관련 주제(가장 강한 신호)
  function wikilinkIds(md) {
    var ids = new Set();
    var re = /\[\[([a-z0-9][a-z0-9-]*)\]\]/gi;
    var m;
    while ((m = re.exec(md || ''))) ids.add(m[1].toLowerCase());
    return ids;
  }

  // 관련도 점수: 명시 링크(+10) > 공유 주제태그(각 +3) > 같은 카테고리(+2)
  function computeRelated(current, topics, linkedIds) {
    if (!current || !Array.isArray(topics)) return [];
    var curTags = new Set(subjectTags(current));
    var scored = [];
    for (var i = 0; i < topics.length; i++) {
      var t = topics[i];
      if (!t || t.id === current.id) continue;
      var score = 0;
      if (linkedIds.has(String(t.id).toLowerCase())) score += 10;
      var shared = subjectTags(t).filter((x) => curTags.has(x)).length;
      score += shared * 3;
      if (t.category && current.category && t.category === current.category) score += 2;
      if (score > 0) scored.push({ t: t, score: score });
    }
    scored.sort((a, b) => (b.score - a.score) || ((b.t.updated || '').localeCompare(a.t.updated || '')));
    return scored.slice(0, 6).map((x) => x.t);
  }

  function renderRelated(md) {
    var sec = document.getElementById('related-section');
    var list = document.getElementById('related-list');
    if (!sec || !list) return;
    var rel = computeRelated(currentTopic, allTopics, wikilinkIds(md));
    if (!rel.length) { sec.hidden = true; return; }
    list.innerHTML = rel.map((t) =>
      '<li><a class="related-card" href="topic.html?id=' + encodeURIComponent(t.id) + '">' +
        '<span class="related-cat">' + escapeHtml(t.category || '기타') + '</span>' +
        '<span class="related-title">' + escapeHtml(t.title) + '</span>' +
      '</a></li>'
    ).join('');
    sec.hidden = false;
  }

  // 구조화 데이터(JSON-LD): Article + BreadcrumbList → 검색 리치 스니펫
  function addLd(obj) {
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(obj);
    document.head.appendChild(s);
  }
  function injectJsonLd(topic) {
    if (!topic) return;
    var url = SITE_BASE + '/topic.html?id=' + encodeURIComponent(topic.id || id);
    var article = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: topic.title || '',
      description: topic.summary || '',
      inLanguage: 'ko-KR',
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      author: { '@type': 'Organization', name: '정보관리기술사 학습 노트' },
      publisher: { '@type': 'Organization', name: '정보관리기술사 학습 노트' },
      url: url
    };
    if (topic.updated) { article.datePublished = topic.updated; article.dateModified = topic.updated; }
    addLd(article);
    addLd({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: SITE_BASE + '/' },
        { '@type': 'ListItem', position: 2, name: topic.title || '주제', item: url }
      ]
    });
  }

  // 주제별 SEO 메타 태그 갱신 (title/description/canonical/OG)
  function updateSeoMeta(topic) {
    var url = SITE_BASE + '/topic.html?id=' + encodeURIComponent(topic.id || id);
    var desc = topic.summary || '정보관리기술사 시험 대비 주제별 답안형 요약 노트';
    var set = function (elId, attr, value) {
      var el = document.getElementById(elId);
      if (el) el.setAttribute(attr, value);
    };
    set('meta-description', 'content', desc);
    set('meta-canonical', 'href', url);
    set('meta-og-title', 'content', topic.title || '정보관리기술사 학습 노트');
    set('meta-og-description', 'content', desc);
    set('meta-og-url', 'content', url);
  }

  // 상단 즐겨찾기(★)·학습완료(✓) 버튼: localStorage 상태를 반영하고 클릭 시 토글
  function setupStudyActions() {
    const bar = document.getElementById('topic-actions');
    if (!bar || !window.StudyStore) return;
    const btnBm = document.getElementById('btn-bookmark');
    const btnDn = document.getElementById('btn-done');

    const sync = () => {
      if (btnBm) {
        const on = window.StudyStore.isBookmarked(id);
        btnBm.classList.toggle('is-on', on);
        btnBm.setAttribute('aria-pressed', String(on));
        const lbl = btnBm.querySelector('.study-label');
        if (lbl) lbl.textContent = on ? '즐겨찾기됨' : '즐겨찾기';
      }
      if (btnDn) {
        const on = window.StudyStore.isDone(id);
        btnDn.classList.toggle('is-on', on);
        btnDn.setAttribute('aria-pressed', String(on));
        const lbl = btnDn.querySelector('.study-label');
        if (lbl) lbl.textContent = on ? '학습완료됨' : '학습완료';
      }
    };

    if (btnBm) btnBm.addEventListener('click', () => { window.StudyStore.toggleBookmark(id); sync(); });
    if (btnDn) btnDn.addEventListener('click', () => { window.StudyStore.toggleDone(id); sync(); });
    sync();
    bar.hidden = false;
  }

  // ── 읽기 편의: 글자 크기 조절(브라우저별 저장) ──
  var FS_KEY = 'imn:fontsize:v1';
  var FS_STEPS = [14, 15.5, 17, 18.5, 20];
  var FS_DEFAULT = 1;
  function getFsLevel() {
    try { var v = parseInt(localStorage.getItem(FS_KEY), 10); return (v >= 0 && v < FS_STEPS.length) ? v : FS_DEFAULT; }
    catch (e) { return FS_DEFAULT; }
  }
  function applyFs(level) {
    var b = document.getElementById('markdown-body');
    if (b) b.style.fontSize = FS_STEPS[level] + 'px';
  }
  function setupReadingTools() {
    var box = document.getElementById('reading-tools');
    var level = getFsLevel();
    applyFs(level);
    if (!box) return;
    box.addEventListener('click', function (e) {
      var btn = e.target.closest('.rt-btn');
      if (!btn) return;
      var act = btn.getAttribute('data-fs');
      if (act === 'inc') level = Math.min(FS_STEPS.length - 1, level + 1);
      else if (act === 'dec') level = Math.max(0, level - 1);
      else level = FS_DEFAULT;
      applyFs(level);
      try { localStorage.setItem(FS_KEY, String(level)); } catch (e2) {}
    });
  }

  // ── 본문 목차(TOC): 긴 답안글의 섹션 이동 + 스크롤 하이라이트 ──
  function buildToc() {
    var body = document.getElementById('markdown-body');
    var fab = document.getElementById('toc-fab');
    var panel = document.getElementById('toc-panel');
    var list = document.getElementById('toc-list');
    if (!body || !fab || !panel || !list) return;
    var heads = body.querySelectorAll('h2, h3');
    if (heads.length < 3) { fab.hidden = true; panel.hidden = true; return; } // 짧으면 생략
    var items = [];
    heads.forEach(function (h, i) {
      if (!h.id) h.id = 'sec-' + i;
      items.push('<li class="toc-' + h.tagName.toLowerCase() + '">' +
        '<a href="#' + h.id + '" data-target="' + h.id + '">' + escapeHtml(h.textContent) + '</a></li>');
    });
    list.innerHTML = items.join('');
    fab.hidden = false;

    function openPanel(open) { panel.hidden = !open; fab.setAttribute('aria-expanded', String(open)); }
    fab.addEventListener('click', function () { openPanel(panel.hidden); });
    document.getElementById('toc-close').addEventListener('click', function () { openPanel(false); });
    list.addEventListener('click', function (e) {
      var a = e.target.closest('a[data-target]');
      if (!a) return;
      e.preventDefault();
      var el = document.getElementById(a.getAttribute('data-target'));
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (window.innerWidth < 900) openPanel(false);
    });

    // 스크롤스파이
    var links = [].slice.call(list.querySelectorAll('a[data-target]'));
    var headArr = [].slice.call(heads);
    var ticking = false;
    function spy() {
      var y = window.scrollY + 130;
      var cur = headArr[0];
      for (var i = 0; i < headArr.length; i++) { if (headArr[i].offsetTop <= y) cur = headArr[i]; else break; }
      links.forEach(function (l) { l.classList.toggle('is-active', !!cur && l.getAttribute('data-target') === cur.id); });
      ticking = false;
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(spy); } }, { passive: true });
    setTimeout(spy, 700); // mermaid·chart 렌더로 위치 바뀐 뒤 재계산
    spy();
  }

  function renderMeta(topic) {
    if (!topic) return;
    document.title = `${topic.title} · 정보관리기술사 학습 노트`;
    updateSeoMeta(topic);
    const tags = (topic.tags || [])
      .map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`)
      .join('');
    metaEl.innerHTML = `
      <span class="card-category">${escapeHtml(topic.category || '기타')}</span>
      <div class="meta-tags">${tags}</div>
      ${topic.updated ? `<div class="meta-updated">최종 업데이트 · ${escapeHtml(topic.updated)}</div>` : ''}
    `;
  }

  // 상세 하단 이전/다음 주제 네비게이션 (목록과 동일한 정렬: updated 내림차순)
  function renderNav(list) {
    const navEl = document.getElementById('topic-nav');
    if (!navEl || !Array.isArray(list) || !list.length) return;
    const sorted = list.slice().sort((a, b) => (b.updated || '').localeCompare(a.updated || ''));
    const idx = sorted.findIndex((t) => t.id === id);
    if (idx === -1) return;
    const prev = sorted[idx - 1]; // 목록에서 한 칸 위(더 최신)
    const next = sorted[idx + 1]; // 목록에서 한 칸 아래(더 오래됨)
    const linkHtml = function (topic, dirLabel, cls) {
      if (!topic) return '<span class="nav-spacer"></span>';
      return '<a class="topic-nav-link ' + cls + '" href="topic.html?id=' +
        encodeURIComponent(topic.id) + '" rel="' + cls + '">' +
        '<span class="nav-dir">' + dirLabel + '</span>' +
        '<span class="nav-title">' + escapeHtml(topic.title) + '</span></a>';
    };
    navEl.innerHTML =
      linkHtml(prev, '← 이전 주제', 'prev') +
      linkHtml(next, '다음 주제 →', 'next');
  }

  function renderMarkdown(md) {
    if (window.marked && typeof window.marked.parse === 'function') {
      window.marked.setOptions({ gfm: true, breaks: false });
      var html = window.marked.parse(md);
      // XSS 방어: 파싱된 HTML을 DOMPurify로 정화한 뒤 삽입 (다층 방어)
      if (window.DOMPurify && typeof window.DOMPurify.sanitize === 'function') {
        html = window.DOMPurify.sanitize(html, {
          // mermaid/chart 코드블록 식별용 class(language-*) 유지
          ADD_ATTR: ['class'],
          FORBID_TAGS: ['style'],
          FORBID_ATTR: ['style']
        });
      }
      bodyEl.innerHTML = html;
    } else {
      // 폴백: 마크다운 파서 로드 실패 시 원문 표시
      bodyEl.innerHTML = `<pre>${escapeHtml(md)}</pre>`;
    }
    enhanceMermaid();
    enhanceCharts();
  }

  // ```mermaid 코드블록 → 다이어그램 렌더
  function enhanceMermaid() {
    const blocks = bodyEl.querySelectorAll('code.language-mermaid');
    if (!blocks.length) return;
    blocks.forEach((code) => {
      const pre = code.closest('pre') || code;
      const div = document.createElement('div');
      div.className = 'mermaid';
      div.textContent = code.textContent; // 엔티티 디코딩된 원문
      pre.replaceWith(div);
    });
    if (window.mermaid && typeof window.mermaid.run === 'function') {
      try {
        var attr = document.documentElement.getAttribute('data-theme');
        var dark = attr === 'dark' ||
          (!attr && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
        window.mermaid.initialize({ startOnLoad: false, securityLevel: 'loose', theme: dark ? 'dark' : 'default' });
        window.mermaid.run({ querySelector: '.mermaid' });
      } catch (e) { /* 렌더 실패 시 텍스트 유지 */ }
    }
  }

  // ```chart 코드블록(JSON) → Chart.js 캔버스 렌더
  function enhanceCharts() {
    const blocks = bodyEl.querySelectorAll('code.language-chart');
    if (!blocks.length) return;
    blocks.forEach((code) => {
      const pre = code.closest('pre') || code;
      let config;
      try {
        config = JSON.parse(code.textContent);
      } catch (e) {
        const err = document.createElement('div');
        err.className = 'error-box';
        err.textContent = '차트 데이터(JSON) 형식 오류: ' + e.message;
        pre.replaceWith(err);
        return;
      }
      const wrap = document.createElement('div');
      wrap.className = 'chart-wrap';
      const canvas = document.createElement('canvas');
      wrap.appendChild(canvas);
      pre.replaceWith(wrap);
      if (window.Chart) {
        config.options = Object.assign({ responsive: true, maintainAspectRatio: true }, config.options || {});
        try { new window.Chart(canvas, config); } catch (e) { /* 무시 */ }
      }
    });
  }

  // 상세 본문을 얼마나 읽어 내려갔는지(스크롤 진행률)를 상단 바 + 배지로 표시.
  // 기사(#topic-detail) 상단이 화면 상단에 닿는 지점부터, 기사 하단이 화면 하단에
  // 닿는 지점까지를 0~100%로 환산한다. 한 번만 설치하고 scroll/resize에 반응한다.
  let progressReady = false;
  function setupReadingProgress() {
    if (progressReady) return;
    progressReady = true;

    const bar = document.createElement('div');
    bar.className = 'read-progress';
    bar.setAttribute('aria-hidden', 'true');
    const fill = document.createElement('div');
    fill.className = 'read-progress-fill';
    bar.appendChild(fill);

    const pill = document.createElement('div');
    pill.className = 'read-pill';
    pill.setAttribute('aria-live', 'off');
    pill.textContent = '0% 읽음';

    document.body.appendChild(bar);
    document.body.appendChild(pill);

    function calc() {
      const art = document.getElementById('topic-detail');
      if (!art) return 0;
      const denom = art.offsetHeight - window.innerHeight;
      if (denom <= 0) return 100; // 본문이 한 화면에 다 들어오면 100%
      let p = (window.scrollY - art.offsetTop) / denom;
      if (p < 0) p = 0; else if (p > 1) p = 1;
      return Math.round(p * 100);
    }

    let ticking = false;
    function update() {
      const pct = calc();
      fill.style.width = pct + '%';
      pill.textContent = pct + '% 읽음';
      pill.classList.toggle('is-done', pct >= 100);
      ticking = false;
    }
    function onScroll() {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    // mermaid·chart가 비동기로 렌더되며 본문 높이가 바뀌므로 잠시 뒤 재계산
    setTimeout(update, 600);
    setTimeout(update, 1500);
  }

  // 학습 상태 버튼·글자 크기 도구는 id만 있으면 동작하므로 먼저 설치
  setupStudyActions();
  setupReadingTools();

  // 메타데이터 로드 후 본문 로드 (메타 실패해도 본문은 시도)
  // 캐시 허용(no-cache 제거): 목록↔상세 이동 시 topics.json 재다운로드 방지
  fetch('data/topics.json')
    .then((res) => (res.ok ? res.json() : []))
    .then((topics) => {
      allTopics = Array.isArray(topics) ? topics : [];
      currentTopic = allTopics.find((t) => t.id === id) || null;
      renderMeta(currentTopic);
      renderNav(allTopics);
      injectJsonLd(currentTopic);
    })
    .catch(() => { /* 메타 없이 진행 */ })
    .finally(() => {
      // 제목이 확정된 뒤(메타 성공 시 실제 주제 제목) page_view 1회 전송.
      // 메타 실패해도 폴백으로 최소 1회는 집계되도록 여기서 호출.
      sendPageView();
      fetch(`content/${id}.md`)
        .then((res) => {
          if (!res.ok) throw new Error('해당 주제 내용을 찾을 수 없습니다 (' + res.status + ')');
          return res.text();
        })
        .then((md) => {
          renderMarkdown(md);
          applyFs(getFsLevel()); // 렌더 후 저장된 글자 크기 재적용
          buildToc();            // 본문 헤딩으로 목차 생성
          // 본문이 정상 렌더된 주제만 열람 기록에 남긴다 (로드 실패는 제외)
          if (window.ViewedStore) window.ViewedStore.markViewed(id);
          setupReadingProgress();
          // 관련 주제 추천 (본문의 [[링크]] + 카테고리·태그 기반)
          renderRelated(md);
        })
        .catch((err) => showError(err.message));
    });
})();
