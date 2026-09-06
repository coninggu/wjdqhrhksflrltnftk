// 메인 리스트 페이지: 주제 목록 렌더 + 실시간 검색 필터
(function () {
  const listEl = document.getElementById('topic-list');
  const emptyEl = document.getElementById('empty-state');
  const searchEl = document.getElementById('search');
  const countEl = document.getElementById('result-count');
  const statEl = document.getElementById('viewed-stat');
  const filterChip = document.getElementById('filter-unviewed-label');
  const filterInput = document.getElementById('filter-unviewed');
  const recentSection = document.getElementById('recent-section');
  const recentListEl = document.getElementById('recent-list');
  const clearBtn = document.getElementById('clear-viewed');
  const studyStatEl = document.getElementById('study-stat');
  const filterBookmark = document.getElementById('filter-bookmark');
  const filterUndone = document.getElementById('filter-undone');
  const todaySection = document.getElementById('today-section');
  const todayCard = document.getElementById('today-card');
  const todayRandom = document.getElementById('today-random');

  let topics = [];

  // 2026 정보관리기술사 정기 일정 (원서접수: 첫날 10:00 ~ 마지막날 18:00)
  const EXAM_SCHEDULE = [
    { round: 138, regOpen: '2026-01-06T10:00:00', regClose: '2026-01-09T18:00:00', written: '2026-02-07' },
    { round: 139, regOpen: '2026-04-13T10:00:00', regClose: '2026-04-16T18:00:00', written: '2026-05-16' },
    { round: 140, regOpen: '2026-07-13T10:00:00', regClose: '2026-07-16T18:00:00', written: '2026-08-22' }
  ];

  const WD = ['일', '월', '화', '수', '목', '금', '토'];
  const DAY = 86400000;
  const pad2 = (n) => ('0' + n).slice(-2);
  const fmtDate = (d) => (d.getMonth() + 1) + '.' + d.getDate() + '(' + WD[d.getDay()] + ')';
  const fmtDateTime = (d) => fmtDate(d) + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  const ddayNum = (ms) => Math.ceil(ms / DAY);
  function remStr(ms) {
    if (ms <= 0) return '00:00:00';
    const days = Math.floor(ms / DAY);
    const hh = Math.floor((ms % DAY) / 3600000);
    const mm = Math.floor((ms % 3600000) / 60000);
    const ss = Math.floor((ms % 60000) / 1000);
    return (days > 0 ? days + '일 ' : '') + pad2(hh) + ':' + pad2(mm) + ':' + pad2(ss);
  }
  function rowHtml(badge, badgeCls, label, sub, timer) {
    return '<span class="dday-badge ' + (badgeCls || '') + '">' + badge + '</span>' +
      '<span class="dday-text">' + label + (sub ? ' <em>' + sub + '</em>' : '') + '</span>' +
      (timer != null ? '<span class="dday-timer">' + timer + '</span>' : '');
  }

  function renderDday() {
    const banner = document.getElementById('dday-banner');
    if (!banner) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let next = null;
    for (const e of EXAM_SCHEDULE) {
      if (new Date(e.written + 'T00:00:00') >= today) { next = e; break; }
    }
    if (!next) {
      banner.innerHTML = '<div class="dday-inner"><span class="dday-text">다음 정기 필기시험 일정이 공개되면 표시됩니다</span></div>';
      banner.hidden = false;
      return;
    }
    const regOpen = new Date(next.regOpen);
    const regClose = new Date(next.regClose);
    const exam = new Date(next.written + 'T00:00:00');
    banner.innerHTML =
      '<div class="dday-inner">' +
        '<div class="dday-row" id="dday-reg"></div>' +
        '<div class="dday-row" id="dday-exam"></div>' +
      '</div>';
    banner.hidden = false;
    const regEl = document.getElementById('dday-reg');
    const examEl = document.getElementById('dday-exam');
    const short = (d) => (d.getMonth() + 1) + '.' + d.getDate();
    const regRange = short(regOpen) + '~' + short(regClose);

    function tick() {
      const t = Date.now();
      // 필기 원서접수
      if (t < regOpen.getTime()) {
        const ms = regOpen.getTime() - t;
        regEl.className = 'dday-row';
        regEl.innerHTML = rowHtml('D-' + ddayNum(ms), '', '제' + next.round + '회 <b>원서접수</b>', regRange, remStr(ms));
      } else if (t <= regClose.getTime()) {
        const ms = regClose.getTime() - t;
        regEl.className = 'dday-row';
        regEl.innerHTML = rowHtml('접수중', 'badge-live', '제' + next.round + '회 <b>원서접수</b> 마감', '~' + short(regClose) + ' 18:00', remStr(ms));
      } else {
        regEl.className = 'dday-row is-muted';
        regEl.innerHTML = rowHtml('마감', 'badge-muted', '제' + next.round + '회 <b>원서접수</b> 종료', regRange, null);
      }
      // 필기시험
      const ems = exam.getTime() - t;
      const examSub = short(exam) + '(' + WD[exam.getDay()] + ')';
      if (ems <= 0) {
        examEl.innerHTML = rowHtml('D-DAY', '', '제' + next.round + '회 <b>필기시험</b>', examSub, '00:00:00');
      } else {
        examEl.innerHTML = rowHtml('D-' + ddayNum(ems), '', '제' + next.round + '회 <b>필기시험</b>', examSub, remStr(ems));
      }
    }
    tick();
    setInterval(tick, 1000);
  }

  const escapeHtml = window.IMN.escapeHtml;
  const isViewed = window.IMN.isViewed;
  const isBookmarked = window.IMN.isBookmarked;
  const isDone = window.IMN.isDone;

  function cardHtml(t) {
    const tags = (t.tags || [])
      .map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`)
      .join('');
    const viewed = isViewed(t.id);
    const bookmarked = isBookmarked(t.id);
    const done = isDone(t.id);
    const badge = viewed ? '<span class="viewed-badge">✓ 읽음</span>' : '';
    const id = encodeURIComponent(t.id);
    const cls = ['topic-card', viewed ? 'is-viewed' : '', done ? 'is-done' : '', bookmarked ? 'is-bookmarked' : '']
      .filter(Boolean).join(' ');
    return `
      <li class="topic-item">
        <div class="card-actions">
          <button type="button" class="card-act act-bookmark${bookmarked ? ' is-on' : ''}" data-act="bookmark" data-id="${id}" aria-pressed="${bookmarked}" title="즐겨찾기" aria-label="즐겨찾기">★</button>
          <button type="button" class="card-act act-done${done ? ' is-on' : ''}" data-act="done" data-id="${id}" aria-pressed="${done}" title="학습완료" aria-label="학습완료">✓</button>
        </div>
        <a class="${cls}" href="topic.html?id=${id}">
          <div class="card-top">
            <span class="card-category">${escapeHtml(t.category || '기타')}</span>
            ${badge}
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
    } else if (filterBookmark && filterBookmark.checked) {
      countEl.textContent = `★ 즐겨찾기 ${items.length}개`;
    } else if (filterUndone && filterUndone.checked) {
      countEl.textContent = `학습 전 ${items.length}개`;
    } else if (filterInput && filterInput.checked) {
      countEl.textContent = `안 본 주제 ${items.length}개`;
    } else {
      countEl.textContent = `전체 ${items.length}개 주제`;
    }
  }

  // 열람 진행률·최근 본 주제·필터칩 노출을 현재 저장소 기준으로 갱신
  function refreshViewedUI() {
    if (!window.ViewedStore) return;
    const total = topics.length;
    const viewedCount = topics.reduce((n, t) => n + (isViewed(t.id) ? 1 : 0), 0);

    if (statEl) {
      if (viewedCount > 0 && total > 0) {
        const pct = Math.round((viewedCount / total) * 100);
        statEl.textContent = `열람 ${viewedCount}/${total} · ${pct}%`;
        statEl.hidden = false;
      } else {
        statEl.textContent = '';
        statEl.hidden = true;
      }
    }

    // 최근 본 주제 스트립 (메타가 있는 주제만, 최대 8개)
    if (recentSection && recentListEl) {
      const byId = new Map(topics.map((t) => [t.id, t]));
      const recent = window.ViewedStore.recentIds(8)
        .map((id) => byId.get(id))
        .filter(Boolean);
      if (recent.length) {
        recentListEl.innerHTML = recent.map((t) =>
          `<li><a class="recent-chip" href="topic.html?id=${encodeURIComponent(t.id)}">${escapeHtml(t.title)}</a></li>`
        ).join('');
        recentSection.hidden = false;
      } else {
        recentListEl.innerHTML = '';
        recentSection.hidden = true;
      }
    }

    // 볼 게 있어야 "안 본 주제만" 필터가 의미 있음
    if (filterChip) {
      const useful = viewedCount > 0 && viewedCount < total;
      filterChip.hidden = !useful;
      if (!useful && filterInput) filterInput.checked = false;
    }
  }

  // 학습 진도(완료 N/총·%) + 즐겨찾기 개수 표시, 필터칩 노출 제어
  function refreshStudyUI() {
    if (!window.StudyStore) return;
    const total = topics.length;
    const doneCount = topics.reduce((n, t) => n + (isDone(t.id) ? 1 : 0), 0);
    const bmCount = topics.reduce((n, t) => n + (isBookmarked(t.id) ? 1 : 0), 0);

    if (studyStatEl) {
      const parts = [];
      if (doneCount > 0 && total > 0) {
        parts.push(`학습완료 ${doneCount}/${total} · ${Math.round((doneCount / total) * 100)}%`);
      }
      if (bmCount > 0) parts.push(`★ ${bmCount}`);
      if (parts.length) {
        studyStatEl.textContent = parts.join('  ·  ');
        studyStatEl.hidden = false;
      } else {
        studyStatEl.textContent = '';
        studyStatEl.hidden = true;
      }
    }

    // 즐겨찾기가 하나도 없으면 즐겨찾기 필터는 숨긴다
    const bmLabel = document.getElementById('filter-bookmark-label');
    if (bmLabel) {
      const useful = bmCount > 0;
      bmLabel.hidden = !useful;
      if (!useful && filterBookmark) filterBookmark.checked = false;
    }
    // 완료한 게 하나도 없으면 "학습 전만" 필터는 의미 없음
    const undoneLabel = document.getElementById('filter-undone-label');
    if (undoneLabel) {
      const useful = doneCount > 0 && doneCount < total;
      undoneLabel.hidden = !useful;
      if (!useful && filterUndone) filterUndone.checked = false;
    }
  }

  // 검색 플레이스홀더 예시: 태그 풀에서 날짜 시드로 매일 3개 선정(자정에 자동 변경).
  // 크론이 주제를 추가하면 그 태그도 자동으로 후보에 포함된다.
  function dateSeed() {
    const d = new Date();
    const key = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    let h = 2166136261 >>> 0;
    for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function setSearchPlaceholder() {
    if (!searchEl || !topics.length) return;
    const CAD = /^\d+회$/;
    // 태그 빈도 집계(회차·과도한 길이 제외)
    const freq = {};
    topics.forEach((t) => (t.tags || []).forEach((tag) => {
      if (!CAD.test(tag) && tag.length <= 12) freq[tag] = (freq[tag] || 0) + 1;
    }));
    let tags = Object.keys(freq);
    if (tags.length < 3) return; // 후보 부족 시 정적 예시 유지
    // 빈도 desc·동률 사전순으로 정렬 → 캐시·주제 추가에 흔들리지 않는 안정적 순서.
    // 상위 빈출 태그만 후보로 써서 예시가 대표성 있고 하루 단위로만 회전하게 한다.
    tags.sort((a, b) => (freq[b] - freq[a]) || (a < b ? -1 : a > b ? 1 : 0));
    const pool = tags.slice(0, Math.min(24, tags.length));
    let s = dateSeed();
    const rand = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
    const a = pool.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    searchEl.setAttribute('placeholder', '주제·태그·카테고리 검색  (예: ' + a.slice(0, 3).join(', ') + ')');
  }

  // 오늘의 주제: 날짜를 시드로 해시 → 모두에게 하루 동안 같은 주제(자정에 자동 변경)
  function todayIndex(n) {
    const d = new Date();
    const key = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    let h = 0;
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    return h % n;
  }
  function gotoTopic(t) {
    if (t) window.location.href = 'topic.html?id=' + encodeURIComponent(t.id);
  }
  function renderToday() {
    if (!todaySection || !todayCard || !topics.length) return;
    const t = topics[todayIndex(topics.length)];
    todayCard.href = 'topic.html?id=' + encodeURIComponent(t.id);
    todayCard.innerHTML =
      '<span class="today-cat">' + escapeHtml(t.category || '기타') + '</span>' +
      '<span class="today-title">' + escapeHtml(t.title) + '</span>' +
      '<span class="today-summary">' + escapeHtml(t.summary || '') + '</span>';
    todaySection.hidden = false;
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
    const onlyUnviewed = !!(filterInput && filterInput.checked);
    const onlyBookmark = !!(filterBookmark && filterBookmark.checked);
    const onlyUndone = !!(filterUndone && filterUndone.checked);
    let items = topics;
    if (onlyBookmark) items = items.filter((t) => isBookmarked(t.id));
    if (onlyUndone) items = items.filter((t) => !isDone(t.id));
    if (onlyUnviewed) items = items.filter((t) => !isViewed(t.id));
    if (q) items = items.filter((t) => matches(t, q));
    render(items);
  }

  // 검색 입력 디바운스: 매 키 입력마다 전체 재렌더하지 않고 입력이 멎은 뒤 필터
  let searchTimer;
  searchEl.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(applyFilter, 150);
  });

  if (filterInput) {
    filterInput.addEventListener('change', applyFilter);
  }
  if (filterBookmark) {
    filterBookmark.addEventListener('change', applyFilter);
  }
  if (filterUndone) {
    filterUndone.addEventListener('change', applyFilter);
  }
  if (todayRandom) {
    todayRandom.addEventListener('click', () => {
      if (topics.length) gotoTopic(topics[Math.floor(Math.random() * topics.length)]);
    });
  }

  // 카드의 ★/✓ 버튼: 카드 이동(<a>) 밖의 버튼이므로 클릭이 이동을 막지 않는다.
  // 위임으로 처리하고, 상태 저장 후 해당 카드/통계만 즉시 갱신한다.
  listEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.card-act');
    if (!btn || !window.StudyStore) return;
    e.preventDefault();
    const id = decodeURIComponent(btn.getAttribute('data-id') || '');
    const act = btn.getAttribute('data-act');
    if (!id) return;
    let on;
    if (act === 'bookmark') on = window.StudyStore.toggleBookmark(id);
    else if (act === 'done') on = window.StudyStore.toggleDone(id);
    else return;

    btn.classList.toggle('is-on', on);
    btn.setAttribute('aria-pressed', String(on));
    const card = btn.closest('.topic-item').querySelector('.topic-card');
    if (card) card.classList.toggle(act === 'bookmark' ? 'is-bookmarked' : 'is-done', on);

    refreshStudyUI();
    // 필터가 걸려 있으면 목록 구성이 달라질 수 있으니 다시 적용
    const filtering = (filterBookmark && filterBookmark.checked) || (filterUndone && filterUndone.checked);
    if (filtering) applyFilter();
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (!window.ViewedStore) return;
      if (!window.confirm('열람 기록을 모두 지울까요? 이 브라우저에 저장된 기록만 삭제됩니다.')) return;
      window.ViewedStore.clear();
      refreshViewedUI();
      applyFilter();
    });
  }

  // 뒤로가기(bfcache 복원) 시에도 최신 열람 상태를 반영
  window.addEventListener('pageshow', () => {
    if (!topics.length) return;
    refreshViewedUI();
    refreshStudyUI();
    applyFilter();
  });

  renderDday();

  // 캐시 허용(no-cache 제거): 재방문·상세 이동 시 재다운로드 최소화
  fetch('data/topics.json')
    .then((res) => {
      if (!res.ok) throw new Error('topics.json 로드 실패 (' + res.status + ')');
      return res.json();
    })
    .then((data) => {
      // 최신 업데이트 순 정렬 (updated 내림차순, 없으면 뒤로)
      topics = data.slice().sort((a, b) => (b.updated || '').localeCompare(a.updated || ''));
      setSearchPlaceholder();
      renderToday();
      refreshViewedUI();
      refreshStudyUI();
      applyFilter();
    })
    .catch((err) => {
      listEl.hidden = true;
      emptyEl.hidden = false;
      emptyEl.textContent = '주제 목록을 불러오지 못했습니다: ' + err.message;
    });
})();
