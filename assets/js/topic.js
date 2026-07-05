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

  function renderMeta(topic) {
    if (!topic) return;
    document.title = `${topic.title} · 정보관리기술사 학습 노트`;
    const tags = (topic.tags || [])
      .map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`)
      .join('');
    metaEl.innerHTML = `
      <span class="card-category">${escapeHtml(topic.category || '기타')}</span>
      <div class="meta-tags">${tags}</div>
      ${topic.updated ? `<div class="meta-updated">최종 업데이트 · ${escapeHtml(topic.updated)}</div>` : ''}
    `;
  }

  function renderMarkdown(md) {
    if (window.marked && typeof window.marked.parse === 'function') {
      window.marked.setOptions({ gfm: true, breaks: false });
      bodyEl.innerHTML = window.marked.parse(md);
    } else {
      // 폴백: 마크다운 파서 로드 실패 시 원문 표시
      bodyEl.innerHTML = `<pre>${escapeHtml(md)}</pre>`;
    }
  }

  // 메타데이터 로드 후 본문 로드 (메타 실패해도 본문은 시도)
  fetch('data/topics.json', { cache: 'no-cache' })
    .then((res) => (res.ok ? res.json() : []))
    .then((topics) => {
      const topic = Array.isArray(topics) ? topics.find((t) => t.id === id) : null;
      renderMeta(topic);
    })
    .catch(() => { /* 메타 없이 진행 */ })
    .finally(() => {
      fetch(`content/${id}.md`, { cache: 'no-cache' })
        .then((res) => {
          if (!res.ok) throw new Error('해당 주제 내용을 찾을 수 없습니다 (' + res.status + ')');
          return res.text();
        })
        .then(renderMarkdown)
        .catch((err) => showError(err.message));
    });
})();
