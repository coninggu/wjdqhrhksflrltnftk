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
        window.mermaid.initialize({ startOnLoad: false, securityLevel: 'loose', theme: 'default' });
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

  // 메타데이터 로드 후 본문 로드 (메타 실패해도 본문은 시도)
  // 캐시 허용(no-cache 제거): 목록↔상세 이동 시 topics.json 재다운로드 방지
  fetch('data/topics.json')
    .then((res) => (res.ok ? res.json() : []))
    .then((topics) => {
      const topic = Array.isArray(topics) ? topics.find((t) => t.id === id) : null;
      renderMeta(topic);
      renderNav(topics);
    })
    .catch(() => { /* 메타 없이 진행 */ })
    .finally(() => {
      fetch(`content/${id}.md`)
        .then((res) => {
          if (!res.ok) throw new Error('해당 주제 내용을 찾을 수 없습니다 (' + res.status + ')');
          return res.text();
        })
        .then((md) => {
          renderMarkdown(md);
          // 본문이 정상 렌더된 주제만 열람 기록에 남긴다 (로드 실패는 제외)
          if (window.ViewedStore) window.ViewedStore.markViewed(id);
        })
        .catch((err) => showError(err.message));
    });
})();
