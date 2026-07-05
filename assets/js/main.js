// 메인 리스트 페이지: 주제 목록 렌더 + 실시간 검색 필터
(function () {
  const listEl = document.getElementById('topic-list');
  const emptyEl = document.getElementById('empty-state');
  const searchEl = document.getElementById('search');
  const countEl = document.getElementById('result-count');

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

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function cardHtml(t) {
    const tags = (t.tags || [])
      .map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`)
      .join('');
    return `
      <li>
        <a class="topic-card" href="topic.html?id=${encodeURIComponent(t.id)}">
          <div class="card-top">
            <span class="card-category">${escapeHtml(t.category || '기타')}</span>
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

  renderDday();

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
