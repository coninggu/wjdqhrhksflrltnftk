// 다크/라이트 테마 토글 — 선택은 브라우저별 저장. 명시 선택이 없으면 시스템 설정을 따른다.
// FOUC 방지를 위해 각 페이지 <head>의 인라인 스크립트가 저장값을 먼저 적용하고,
// 이 파일은 토글 버튼 처리와 아이콘 동기화만 담당한다.
(function () {
  var KEY = 'imn:theme';
  var root = document.documentElement;

  function systemDark() {
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }
  function effective() {
    var t = root.getAttribute('data-theme');
    if (t === 'dark' || t === 'light') return t;
    return systemDark() ? 'dark' : 'light';
  }
  function updateBtns() {
    var eff = effective();
    [].forEach.call(document.querySelectorAll('.theme-toggle'), function (b) {
      b.textContent = eff === 'dark' ? '☀️' : '🌙';
      b.setAttribute('aria-label', eff === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환');
      b.setAttribute('aria-pressed', String(eff === 'dark'));
    });
  }
  function toggle() {
    var next = effective() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem(KEY, next); } catch (e) {}
    updateBtns();
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('.theme-toggle')) toggle();
  });
  updateBtns();

  // 명시 선택이 없을 때 시스템 테마가 바뀌면 아이콘 동기화
  if (window.matchMedia) {
    try {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateBtns);
    } catch (e) { /* 구형 브라우저 무시 */ }
  }
})();
