// 열람 기록 저장소 — 브라우저 localStorage에 "내가 본 주제"를 기록.
// 목록/상세 양쪽에서 공유하며, 저장 실패(프라이빗 모드·용량초과)는 조용히 무시해
// 기능이 없어도 사이트가 정상 동작하도록 한다(점진적 향상).
(function () {
  var KEY = 'imn:viewed:v1';

  function getAll() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return {};
      var obj = JSON.parse(raw);
      return (obj && typeof obj === 'object') ? obj : {};
    } catch (e) {
      return {};
    }
  }

  function save(map) {
    try {
      localStorage.setItem(KEY, JSON.stringify(map));
      return true;
    } catch (e) {
      return false;
    }
  }

  // 슬러그 형태만 허용 (오염된 값 저장 방지)
  function validId(id) {
    return typeof id === 'string' && /^[a-z0-9][a-z0-9-]*$/i.test(id);
  }

  function markViewed(id) {
    if (!validId(id)) return;
    var map = getAll();
    map[id] = Date.now();
    save(map);
  }

  function isViewed(id) {
    return Object.prototype.hasOwnProperty.call(getAll(), id);
  }

  function count() {
    return Object.keys(getAll()).length;
  }

  // 최근 열람 순으로 정렬된 id 배열 (기본 최대 8개)
  function recentIds(n) {
    var map = getAll();
    return Object.keys(map)
      .sort(function (a, b) { return (map[b] || 0) - (map[a] || 0); })
      .slice(0, n || 8);
  }

  function clear() {
    try {
      localStorage.removeItem(KEY);
      return true;
    } catch (e) {
      return false;
    }
  }

  window.ViewedStore = {
    getAll: getAll,
    markViewed: markViewed,
    isViewed: isViewed,
    count: count,
    recentIds: recentIds,
    clear: clear
  };
})();
