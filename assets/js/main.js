// 메인 리스트 페이지: 주제 목록 렌더 + 실시간 검색 필터
(function () {
  const listEl = document.getElementById('topic-list');
  const emptyEl = document.getElementById('empty-state');
  const searchEl = document.getElementById('search');
  const countEl = document.getElementById('result-count');

  let topics = [];

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function cardHtml(t) {
    const tags = (t.tags || [])
      .map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`)
      .join('');
    const updated = t.updated ? `<span class="card-updated">${escapeHtml(t.updated)}</span>` : '';
    return `
      <li>
        <a class="topic-card" href="topic.html?id=${encodeURIComponent(t.id)}">
          <div class="card-top">
            <span class="card-category">${escapeHtml(t.category || '기타')}</span>
            ${updated}
          </div>
          <h2>${escapeHtml(t.title)}</h2>
          <p class="card-summary">${escapeHtml(t.summary || '')}</p>
          <div class="card-tags">${tags}</div>
        </a>
      </li>`;
  }

  function render(items) {
    listEl.innerHTML = items.map(cardHtml).join('');
    const hasItems = items.length > 0;
    emptyEl.hidden = hasItems;
    listEl.hidden = !hasItems;
    if (searchEl.value.trim()) {
      countEl.textContent = `검색 결과 ${items.length}개`;
    } else {
      countEl.textContent = `전체 ${items.length}개 주제`;
    }
  }

  function matches(topic, query) {
    const haystack = [
      topic.title,
      topic.category,
      topic.summary,
      (topic.tags || []).join(' ')
    ].join(' ').toLowerCase();
    return query.split(/\s+/).every((word) => haystack.includes(word));
  }

  function applyFilter() {
    const q = searchEl.value.trim().toLowerCase();
    if (!q) {
      render(topics);
      return;
    }
    render(topics.filter((t) => matches(t, q)));
  }

  searchEl.addEventListener('input', applyFilter);

  fetch('data/topics.json', { cache: 'no-cache' })
    .then((res) => {
      if (!res.ok) throw new Error('topics.json 로드 실패 (' + res.status + ')');
      return res.json();
    })
    .then((data) => {
      // 최신 업데이트 순 정렬 (updated 내림차순, 없으면 뒤로)
      topics = data.slice().sort((a, b) => (b.updated || '').localeCompare(a.updated || ''));
      render(topics);
    })
    .catch((err) => {
      listEl.hidden = true;
      emptyEl.hidden = false;
      emptyEl.textContent = '주제 목록을 불러오지 못했습니다: ' + err.message;
    });
})();
