// 공통 유틸 — 여러 페이지 스크립트가 공유(중복 제거). window.IMN로 노출.
// viewed.js·study.js 이후, 페이지별 스크립트 이전에 로드한다.
(function () {
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // 저장소 헬퍼: 스토어가 없어도(로드 실패·프라이빗 모드) 안전하게 false 반환
  function isViewed(id) { return !!(window.ViewedStore && window.ViewedStore.isViewed(id)); }
  function isBookmarked(id) { return !!(window.StudyStore && window.StudyStore.isBookmarked(id)); }
  function isDone(id) { return !!(window.StudyStore && window.StudyStore.isDone(id)); }

  // Fisher–Yates 셔플(제자리)
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  window.IMN = {
    escapeHtml: escapeHtml,
    isViewed: isViewed,
    isBookmarked: isBookmarked,
    isDone: isDone,
    shuffle: shuffle
  };
})();
