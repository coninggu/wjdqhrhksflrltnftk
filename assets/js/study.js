// 학습 상태 저장소 — 브라우저 localStorage에 "즐겨찾기(★)"와 "학습완료(✓)"를 기록.
// viewed.js와 동일한 방침: 저장 실패(프라이빗 모드·용량초과)는 조용히 무시해
// 기능이 없어도 사이트가 정상 동작하도록 한다(점진적 향상). 브라우저별로만 저장된다.
(function () {
  var BM_KEY = 'imn:bookmark:v1'; // 즐겨찾기
  var DN_KEY = 'imn:done:v1';     // 학습완료

  function getMap(key) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return {};
      var obj = JSON.parse(raw);
      return (obj && typeof obj === 'object') ? obj : {};
    } catch (e) {
      return {};
    }
  }

  function save(key, map) {
    try {
      localStorage.setItem(key, JSON.stringify(map));
      return true;
    } catch (e) {
      return false;
    }
  }

  // 슬러그 형태만 허용 (오염된 값 저장 방지)
  function validId(id) {
    return typeof id === 'string' && /^[a-z0-9][a-z0-9-]*$/i.test(id);
  }

  function has(key, id) {
    return Object.prototype.hasOwnProperty.call(getMap(key), id);
  }

  // 상태를 반대로 뒤집고, 뒤집은 결과(true=켜짐)를 돌려준다.
  function toggle(key, id) {
    if (!validId(id)) return false;
    var map = getMap(key);
    var on;
    if (Object.prototype.hasOwnProperty.call(map, id)) {
      delete map[id];
      on = false;
    } else {
      map[id] = Date.now();
      on = true;
    }
    save(key, map);
    return on;
  }

  function count(key) {
    return Object.keys(getMap(key)).length;
  }

  window.StudyStore = {
    isBookmarked: function (id) { return has(BM_KEY, id); },
    toggleBookmark: function (id) { return toggle(BM_KEY, id); },
    bookmarkCount: function () { return count(BM_KEY); },
    isDone: function (id) { return has(DN_KEY, id); },
    toggleDone: function (id) { return toggle(DN_KEY, id); },
    doneCount: function () { return count(DN_KEY); }
  };
})();
