// 다국어(i18n) 엔진 — 순수 정적 사이트용. 사전은 이 파일에 내장(동기 로드, fetch 경합·CSP 이슈 없음).
// 페이지의 다른 스크립트보다 먼저 로드해 window.I18N.t()를 제공한다.
// 로케일 결정: URL ?lang= → localStorage(imn:lang) → navigator.language → 기본 ko.
(function () {
  var SUPPORTED = ['ko', 'en', 'ja'];
  var DEFAULT = 'ko';
  var KEY = 'imn:lang';

  var DICT = {
    ko: {
      'site.name': '정보관리기술사 학습 노트',
      'title.index': '정보관리기술사 학습 노트',
      'title.dashboard': '내 학습 현황 · 정보관리기술사 학습 노트',
      'title.flashcards': '플래시카드 · 정보관리기술사 학습 노트',
      'brand.html': '정보관리기술사 <b>학습 노트</b>',
      'tagline': '주제별 답안형 요약을 하나씩 쌓아가는 공부 아카이브',
      'desc.index': '정보관리기술사 시험 대비 주제별 답안형 요약 노트',
      'desc.dashboard': '정보관리기술사 학습 노트의 내 학습 진도·즐겨찾기·이어서 학습 대시보드',
      'desc.flashcards': '정보관리기술사 주제를 플래시카드와 4지선다 퀴즈로 암기·복습',
      'lang.label': '언어 선택',
      'theme.toDark': '다크 모드로 전환',
      'theme.toLight': '라이트 모드로 전환',
      'nav.dashboard': '📊 내 학습 현황',
      'nav.flashcards': '🃏 플래시카드 · 퀴즈',
      'nav.back': '← 목록으로',
      'search.aria': '주제 검색',
      'search.placeholder': '주제·태그·카테고리 검색  (예: {ex})',
      'filter.bookmark': '★ 즐겨찾기',
      'filter.undone': '학습 전만',
      'filter.unviewed': '안 본 주제만',
      'today.label': '🎯 오늘의 주제',
      'today.random': '🎲 랜덤 주제',
      'recent.title': '최근 본 주제',
      'recent.clear': '열람 기록 지우기',
      'empty.search': '검색 결과가 없습니다.',
      'feedback': '의견 보내기',
      'count.search': '검색 결과 {n}개',
      'count.bookmark': '★ 즐겨찾기 {n}개',
      'count.undone': '학습 전 {n}개',
      'count.unviewed': '안 본 주제 {n}개',
      'count.all': '전체 {n}개 주제',
      'stat.viewed': '열람 {n}/{total} · {pct}%',
      'stat.done': '학습완료 {n}/{total} · {pct}%',
      'stat.bookmark': '★ {n}',
      'confirm.clearViewed': '열람 기록을 모두 지울까요? 이 브라우저에 저장된 기록만 삭제됩니다.',
      'error.topicsLoad': '주제 목록을 불러오지 못했습니다: {msg}',
      'card.viewed': '✓ 읽음',
      'card.bookmark': '즐겨찾기',
      'card.done': '학습완료',
      'card.fallbackCat': '기타',
      // 상세
      'meta.updated': '최종 업데이트 · {date}',
      'nav.prev': '← 이전 주제',
      'nav.next': '다음 주제 →',
      'related.heading': '관련 주제',
      'loading': '불러오는 중…',
      'rt.dec': '글자 작게',
      'rt.reset': '기본 글자 크기',
      'rt.inc': '글자 크게',
      'rt.group': '글자 크기 조절',
      'topic.bookmark': '즐겨찾기',
      'topic.bookmarked': '즐겨찾기됨',
      'topic.done': '학습완료',
      'topic.doned': '학습완료됨',
      'toc.title': '목차',
      'toc.close': '목차 닫기',
      'read.pill': '{pct}% 읽음',
      'error.invalidId': '유효한 주제 id가 없습니다. 목록에서 주제를 선택해 주세요.',
      'error.notFound': '해당 주제 내용을 찾을 수 없습니다 ({status})',
      'error.chartJson': '차트 데이터(JSON) 형식 오류: {msg}',
      'notice.fallbackLang': '이 노트는 아직 번역되지 않아 한국어 원문을 표시합니다.',
      // D-day
      'dday.reg': '원서접수',
      'dday.exam': '필기시험',
      'dday.round': '제{round}회',
      'dday.regClose': '마감',
      'dday.regEnd': '종료',
      'dday.live': '접수중',
      'dday.closed': '마감',
      'dday.dday': 'D-DAY',
      'dday.none': '다음 정기 필기시험 일정이 공개되면 표시됩니다',
      // 대시보드
      'db.title': '내 학습 현황',
      'db.note': '이 기기(브라우저)에 저장된 기록입니다.',
      'db.emptyBig': '아직 학습 기록이 없어요',
      'db.emptyDesc': '주제를 열어 읽고, ★ 즐겨찾기·✓ 학습완료를 표시하면 여기에 진도가 쌓입니다.',
      'db.browse': '주제 둘러보기 →',
      'db.flashcards': '🃏 플래시카드',
      'db.statDone': '학습완료',
      'db.statBookmark': '★ 즐겨찾기',
      'db.statViewed': '열람',
      'db.secProgress': '전체 진도',
      'db.secContinue': '이어서 학습',
      'db.secByCat': '카테고리별 진도',
      'db.secBookmark': '★ 즐겨찾기',
      'db.count': '{n}개',
      'db.loadError': '주제를 불러오지 못했습니다.',
      // 플래시카드
      'fc.title': '플래시카드 & 퀴즈',
      'fc.modeFlash': '🃏 플래시카드',
      'fc.modeQuiz': '📝 퀴즈',
      'fc.category': '카테고리',
      'fc.scope': '범위',
      'fc.all': '전체',
      'fc.scopeBookmark': '★ 즐겨찾기',
      'fc.scopeUndone': '학습 전',
      'fc.restart': '다시 섞기 ↻',
      'fc.emptyPool': '해당 조건의 주제가 없습니다. 필터를 넓혀보세요.',
      'fc.doneBig': '완료! 🎉',
      'fc.doneSub': '{n}장 학습 · 알아요 {known} · 다시 {again}',
      'fc.restartBtn': '다시 시작',
      'fc.flashStatus': '플래시카드 {i} / {n}  ·  알아요 {known}',
      'fc.noSummary': '(요약 없음)',
      'fc.again': '다시 ↻',
      'fc.know': '알아요 ✓',
      'fc.reveal': '정답 보기',
      'fc.hint': '머릿속으로 설명해 본 뒤 확인하세요',
      'fc.openFull': '전체 내용 보기 →',
      'fc.quizLabel': '다음 설명에 해당하는 주제는?',
      'fc.quizStatus': '퀴즈 {i} / {n}  ·  점수 {score}',
      'fc.quizResult': '{score} / {n} 정답 ({pct}%)',
      'fc.newQuiz': '새 퀴즈',
      'fc.next': '다음 →',
      'fc.quizNeed4': '퀴즈는 최소 4개 주제가 필요합니다 (현재 {n}개). 조건을 넓혀주세요.',
      'fc.loadError': '주제를 불러오지 못했습니다.',
      // 카테고리
      'cat.보안·개인정보': '보안·개인정보',
      'cat.AI·데이터': 'AI·데이터',
      'cat.SW공학·관리': 'SW공학·관리',
      'cat.데이터베이스': '데이터베이스',
      'cat.인프라·클라우드': '인프라·클라우드',
      'cat.네트워크': '네트워크',
      'cat.경영·사업전략': '경영·사업전략',
      'cat.컴퓨팅·임베디드': '컴퓨팅·임베디드',
      'cat.프로젝트·조직관리': '프로젝트·조직관리',
      'cat.하드웨어·반도체': '하드웨어·반도체'
    },
    en: {
      'site.name': 'Information Management Engineer — Study Notes',
      'title.index': 'Information Management Engineer — Study Notes',
      'title.dashboard': 'My progress · IM Engineer Study Notes',
      'title.flashcards': 'Flashcards · IM Engineer Study Notes',
      'brand.html': 'IM Engineer <b>Study Notes</b>',
      'tagline': 'A study archive building up exam-style answer notes, one topic at a time',
      'desc.index': 'Essay-style study notes for the Korean Professional Engineer (Information Management) exam — 450+ IT topics from AI and cloud to security, databases and project management.',
      'desc.dashboard': 'Your study progress, bookmarks and topics to continue in IM Engineer Study Notes.',
      'desc.flashcards': 'Review IT exam topics with flashcards and 4-choice quizzes.',
      'lang.label': 'Select language',
      'theme.toDark': 'Switch to dark mode',
      'theme.toLight': 'Switch to light mode',
      'nav.dashboard': '📊 My progress',
      'nav.flashcards': '🃏 Flashcards · Quiz',
      'nav.back': '← Back to list',
      'search.aria': 'Search topics',
      'search.placeholder': 'Search topic, tag, category  (e.g. {ex})',
      'filter.bookmark': '★ Bookmarks',
      'filter.undone': 'Not studied',
      'filter.unviewed': 'Unread only',
      'today.label': "🎯 Today's topic",
      'today.random': '🎲 Random topic',
      'recent.title': 'Recently viewed',
      'recent.clear': 'Clear view history',
      'empty.search': 'No results found.',
      'feedback': 'Send feedback',
      'count.search': '{n} results',
      'count.bookmark': '★ {n} bookmarks',
      'count.undone': '{n} not studied',
      'count.unviewed': '{n} unread',
      'count.all': '{n} topics total',
      'stat.viewed': 'Viewed {n}/{total} · {pct}%',
      'stat.done': 'Completed {n}/{total} · {pct}%',
      'stat.bookmark': '★ {n}',
      'confirm.clearViewed': 'Clear all view history? Only records saved in this browser are deleted.',
      'error.topicsLoad': 'Failed to load topic list: {msg}',
      'card.viewed': '✓ Read',
      'card.bookmark': 'Bookmark',
      'card.done': 'Completed',
      'card.fallbackCat': 'Other',
      'meta.updated': 'Last updated · {date}',
      'nav.prev': '← Previous',
      'nav.next': 'Next →',
      'related.heading': 'Related topics',
      'loading': 'Loading…',
      'rt.dec': 'Smaller text',
      'rt.reset': 'Default text size',
      'rt.inc': 'Larger text',
      'rt.group': 'Adjust text size',
      'topic.bookmark': 'Bookmark',
      'topic.bookmarked': 'Bookmarked',
      'topic.done': 'Mark done',
      'topic.doned': 'Completed',
      'toc.title': 'Contents',
      'toc.close': 'Close contents',
      'read.pill': '{pct}% read',
      'error.invalidId': 'No valid topic id. Please choose a topic from the list.',
      'error.notFound': 'Topic content not found ({status})',
      'error.chartJson': 'Chart data (JSON) format error: {msg}',
      'notice.fallbackLang': 'This note is not translated yet — showing the Korean original.',
      'dday.reg': 'Registration',
      'dday.exam': 'Written exam',
      'dday.round': 'Round {round}',
      'dday.regClose': 'closes',
      'dday.regEnd': 'ended',
      'dday.live': 'Open now',
      'dday.closed': 'Closed',
      'dday.dday': 'D-DAY',
      'dday.none': 'The next scheduled written exam date will appear here when announced',
      'db.title': 'My progress',
      'db.note': 'Records saved on this device (browser).',
      'db.emptyBig': 'No study records yet',
      'db.emptyDesc': 'Open and read topics, mark ★ bookmark / ✓ completed, and your progress builds up here.',
      'db.browse': 'Browse topics →',
      'db.flashcards': '🃏 Flashcards',
      'db.statDone': 'Completed',
      'db.statBookmark': '★ Bookmarks',
      'db.statViewed': 'Viewed',
      'db.secProgress': 'Overall progress',
      'db.secContinue': 'Continue studying',
      'db.secByCat': 'Progress by category',
      'db.secBookmark': '★ Bookmarks',
      'db.count': '{n}',
      'db.loadError': 'Failed to load topics.',
      'fc.title': 'Flashcards & Quiz',
      'fc.modeFlash': '🃏 Flashcards',
      'fc.modeQuiz': '📝 Quiz',
      'fc.category': 'Category',
      'fc.scope': 'Scope',
      'fc.all': 'All',
      'fc.scopeBookmark': '★ Bookmarks',
      'fc.scopeUndone': 'Not studied',
      'fc.restart': 'Reshuffle ↻',
      'fc.emptyPool': 'No topics match this filter. Try widening it.',
      'fc.doneBig': 'Done! 🎉',
      'fc.doneSub': '{n} cards · Known {known} · Again {again}',
      'fc.restartBtn': 'Start over',
      'fc.flashStatus': 'Flashcard {i} / {n}  ·  Known {known}',
      'fc.noSummary': '(no summary)',
      'fc.again': 'Again ↻',
      'fc.know': 'Got it ✓',
      'fc.reveal': 'Show answer',
      'fc.hint': 'Explain it in your head first, then check',
      'fc.openFull': 'View full note →',
      'fc.quizLabel': 'Which topic does this describe?',
      'fc.quizStatus': 'Quiz {i} / {n}  ·  Score {score}',
      'fc.quizResult': '{score} / {n} correct ({pct}%)',
      'fc.newQuiz': 'New quiz',
      'fc.next': 'Next →',
      'fc.quizNeed4': 'Quiz needs at least 4 topics (currently {n}). Please widen the filter.',
      'fc.loadError': 'Failed to load topics.',
      'cat.보안·개인정보': 'Security & Privacy',
      'cat.AI·데이터': 'AI & Data',
      'cat.SW공학·관리': 'SW Engineering & Management',
      'cat.데이터베이스': 'Database',
      'cat.인프라·클라우드': 'Infrastructure & Cloud',
      'cat.네트워크': 'Networking',
      'cat.경영·사업전략': 'Management & Strategy',
      'cat.컴퓨팅·임베디드': 'Computing & Embedded',
      'cat.프로젝트·조직관리': 'Project & Org Management',
      'cat.하드웨어·반도체': 'Hardware & Semiconductor'
    },
    ja: {
      'site.name': '情報管理技術士 — 学習ノート',
      'title.index': '情報管理技術士 — 学習ノート',
      'title.dashboard': '学習状況 · 情報管理技術士 学習ノート',
      'title.flashcards': 'フラッシュカード · 情報管理技術士 学習ノート',
      'brand.html': '情報管理技術士 <b>学習ノート</b>',
      'tagline': 'テーマ別の論述式まとめを一つずつ積み上げる学習アーカイブ',
      'desc.index': '韓国の情報管理技術士試験に向けた論述式学習ノート。AI・クラウド・セキュリティ・データベース・プロジェクト管理など450以上のITテーマを収録。',
      'desc.dashboard': '情報管理技術士 学習ノートの学習進捗・お気に入り・続きから学習できるダッシュボード。',
      'desc.flashcards': 'ITテーマをフラッシュカードと4択クイズで暗記・復習。',
      'lang.label': '言語を選択',
      'theme.toDark': 'ダークモードに切替',
      'theme.toLight': 'ライトモードに切替',
      'nav.dashboard': '📊 学習状況',
      'nav.flashcards': '🃏 フラッシュカード · クイズ',
      'nav.back': '← 一覧へ',
      'search.aria': 'テーマを検索',
      'search.placeholder': 'テーマ・タグ・カテゴリを検索  (例: {ex})',
      'filter.bookmark': '★ お気に入り',
      'filter.undone': '未学習のみ',
      'filter.unviewed': '未読のみ',
      'today.label': '🎯 今日のテーマ',
      'today.random': '🎲 ランダム',
      'recent.title': '最近見たテーマ',
      'recent.clear': '閲覧履歴を消去',
      'empty.search': '検索結果がありません。',
      'feedback': 'ご意見を送る',
      'count.search': '検索結果 {n}件',
      'count.bookmark': '★ お気に入り {n}件',
      'count.undone': '未学習 {n}件',
      'count.unviewed': '未読 {n}件',
      'count.all': '全 {n}テーマ',
      'stat.viewed': '閲覧 {n}/{total} · {pct}%',
      'stat.done': '学習完了 {n}/{total} · {pct}%',
      'stat.bookmark': '★ {n}',
      'confirm.clearViewed': '閲覧履歴をすべて消去しますか？このブラウザに保存された記録のみ削除されます。',
      'error.topicsLoad': 'テーマ一覧を読み込めませんでした: {msg}',
      'card.viewed': '✓ 既読',
      'card.bookmark': 'お気に入り',
      'card.done': '学習完了',
      'card.fallbackCat': 'その他',
      'meta.updated': '最終更新 · {date}',
      'nav.prev': '← 前のテーマ',
      'nav.next': '次のテーマ →',
      'related.heading': '関連テーマ',
      'loading': '読み込み中…',
      'rt.dec': '文字を小さく',
      'rt.reset': '標準の文字サイズ',
      'rt.inc': '文字を大きく',
      'rt.group': '文字サイズ調整',
      'topic.bookmark': 'お気に入り',
      'topic.bookmarked': 'お気に入り済み',
      'topic.done': '学習完了',
      'topic.doned': '学習完了済み',
      'toc.title': '目次',
      'toc.close': '目次を閉じる',
      'read.pill': '{pct}% 読了',
      'error.invalidId': '有効なテーマIDがありません。一覧からテーマを選んでください。',
      'error.notFound': 'テーマの内容が見つかりません ({status})',
      'error.chartJson': 'チャートデータ(JSON)の形式エラー: {msg}',
      'notice.fallbackLang': 'このノートはまだ翻訳されていないため、韓国語の原文を表示します。',
      'dday.reg': '出願',
      'dday.exam': '筆記試験',
      'dday.round': '第{round}回',
      'dday.regClose': '締切',
      'dday.regEnd': '終了',
      'dday.live': '受付中',
      'dday.closed': '締切',
      'dday.dday': 'D-DAY',
      'dday.none': '次回の定期筆記試験日程が公開されると表示されます',
      'db.title': '学習状況',
      'db.note': 'この端末(ブラウザ)に保存された記録です。',
      'db.emptyBig': 'まだ学習記録がありません',
      'db.emptyDesc': 'テーマを開いて読み、★お気に入り・✓学習完了を付けると、ここに進捗が貯まります。',
      'db.browse': 'テーマを見る →',
      'db.flashcards': '🃏 フラッシュカード',
      'db.statDone': '学習完了',
      'db.statBookmark': '★ お気に入り',
      'db.statViewed': '閲覧',
      'db.secProgress': '全体の進捗',
      'db.secContinue': '続けて学習',
      'db.secByCat': 'カテゴリ別の進捗',
      'db.secBookmark': '★ お気に入り',
      'db.count': '{n}件',
      'db.loadError': 'テーマを読み込めませんでした。',
      'fc.title': 'フラッシュカード & クイズ',
      'fc.modeFlash': '🃏 フラッシュカード',
      'fc.modeQuiz': '📝 クイズ',
      'fc.category': 'カテゴリ',
      'fc.scope': '範囲',
      'fc.all': '全体',
      'fc.scopeBookmark': '★ お気に入り',
      'fc.scopeUndone': '未学習',
      'fc.restart': 'シャッフル ↻',
      'fc.emptyPool': '条件に合うテーマがありません。フィルタを広げてください。',
      'fc.doneBig': '完了！🎉',
      'fc.doneSub': '{n}枚学習 · 分かる {known} · もう一度 {again}',
      'fc.restartBtn': 'もう一度',
      'fc.flashStatus': 'フラッシュカード {i} / {n}  ·  分かる {known}',
      'fc.noSummary': '(要約なし)',
      'fc.again': 'もう一度 ↻',
      'fc.know': '分かる ✓',
      'fc.reveal': '答えを見る',
      'fc.hint': '頭の中で説明してから確認しましょう',
      'fc.openFull': '全文を見る →',
      'fc.quizLabel': '次の説明に当てはまるテーマは？',
      'fc.quizStatus': 'クイズ {i} / {n}  ·  スコア {score}',
      'fc.quizResult': '{score} / {n} 正解 ({pct}%)',
      'fc.newQuiz': '新しいクイズ',
      'fc.next': '次へ →',
      'fc.quizNeed4': 'クイズには最低4テーマ必要です(現在{n}件)。条件を広げてください。',
      'fc.loadError': 'テーマを読み込めませんでした。',
      'cat.보안·개인정보': 'セキュリティ・個人情報',
      'cat.AI·데이터': 'AI・データ',
      'cat.SW공학·관리': 'SW工学・管理',
      'cat.데이터베이스': 'データベース',
      'cat.인프라·클라우드': 'インフラ・クラウド',
      'cat.네트워크': 'ネットワーク',
      'cat.경영·사업전략': '経営・事業戦略',
      'cat.컴퓨팅·임베디드': 'コンピューティング・組込み',
      'cat.프로젝트·조직관리': 'プロジェクト・組織管理',
      'cat.하드웨어·반도체': 'ハードウェア・半導体'
    }
  };

  // SEO: 쿼리 없는 URL은 항상 한국어(기본)로 렌더링해 크롤러(구글봇은 en-US로 렌더링)가
  // 원문을 색인하게 한다. 브라우저 언어로 자동 전환하지 않고, 대신 번역본 안내 배너만 띄운다.
  var explicit = false;   // URL에 ?lang= 이 명시됐는가
  var suggest = null;     // 안내 배너로 권할 언어(브라우저 언어가 en/ja인 첫 방문자)
  function resolveLang() {
    var q;
    try {
      var p = new URLSearchParams(window.location.search).get('lang');
      if (p && SUPPORTED.indexOf(p) !== -1) q = p;
    } catch (e) {}
    if (q) { explicit = true; try { localStorage.setItem(KEY, q); } catch (e) {} return q; }
    try { var s = localStorage.getItem(KEY); if (s && SUPPORTED.indexOf(s) !== -1) return s; } catch (e) {}
    try {
      var nav = (navigator.language || '').slice(0, 2).toLowerCase();
      if (nav !== DEFAULT && SUPPORTED.indexOf(nav) !== -1) suggest = nav;
    } catch (e) {}
    return DEFAULT;
  }

  var lang = resolveLang();

  function interp(str, params) {
    if (!params) return str;
    return str.replace(/\{(\w+)\}/g, function (m, k) {
      return (params[k] != null) ? params[k] : m;
    });
  }
  function t(key, params) {
    var d = DICT[lang] || {};
    var v = (key in d) ? d[key] : (DICT[DEFAULT][key] != null ? DICT[DEFAULT][key] : key);
    return interp(v, params);
  }
  // 카테고리는 원문(한국어) 값을 키로 번역, 없으면 원문 유지
  function category(name) {
    if (!name) return t('card.fallbackCat');
    var key = 'cat.' + name;
    var d = DICT[lang] || {};
    return (key in d) ? d[key] : name;
  }

  // 정적 HTML 치환: [data-i18n]=텍스트, [data-i18n-html]=innerHTML,
  // [data-i18n-attr]="attr:key;attr2:key2"
  function apply(root) {
    root = root || document;
    [].forEach.call(root.querySelectorAll('[data-i18n]'), function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    [].forEach.call(root.querySelectorAll('[data-i18n-html]'), function (el) {
      el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });
    [].forEach.call(root.querySelectorAll('[data-i18n-attr]'), function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var kv = pair.split(':');
        if (kv.length === 2) el.setAttribute(kv[0].trim(), t(kv[1].trim()));
      });
    });
  }

  // 현재 경로에 lang 쿼리만 바꾼 URL
  function urlForLang(l) {
    try {
      var u = new URL(window.location.href);
      if (l === DEFAULT) u.searchParams.delete('lang');
      else u.searchParams.set('lang', l);
      return u.pathname + (u.search || '') + (u.hash || '');
    } catch (e) { return '?lang=' + l; }
  }

  // hreflang 대체 링크 주입(SEO): ko/en/ja + x-default(=ko)
  function injectHreflang() {
    try {
      var origin = window.location.origin;
      var head = document.head;
      SUPPORTED.forEach(function (l) {
        var link = document.createElement('link');
        link.setAttribute('rel', 'alternate');
        link.setAttribute('hreflang', l);
        link.setAttribute('href', origin + urlForLang(l));
        head.appendChild(link);
      });
      var xd = document.createElement('link');
      xd.setAttribute('rel', 'alternate');
      xd.setAttribute('hreflang', 'x-default');
      xd.setAttribute('href', origin + urlForLang(DEFAULT));
      head.appendChild(xd);
    } catch (e) {}
  }

  // 언어 스위처: 각 헤더의 .theme-toggle 앞에 삽입
  function injectSwitcher() {
    [].forEach.call(document.querySelectorAll('.theme-toggle'), function (toggle) {
      if (toggle.parentNode.querySelector('.lang-switch')) return;
      var box = document.createElement('div');
      box.className = 'lang-switch';
      box.setAttribute('role', 'group');
      box.setAttribute('aria-label', t('lang.label'));
      SUPPORTED.forEach(function (l) {
        var a = document.createElement('a');
        a.className = 'lang-opt' + (l === lang ? ' is-active' : '');
        a.setAttribute('href', urlForLang(l));
        a.setAttribute('hreflang', l);
        a.setAttribute('lang', l);
        if (l === lang) a.setAttribute('aria-current', 'true');
        a.textContent = l.toUpperCase();
        // 선택 시 localStorage에도 저장(쿼리 없는 재방문에도 유지)
        a.addEventListener('click', function () { try { localStorage.setItem(KEY, l); } catch (e) {} });
        box.appendChild(a);
      });
      toggle.parentNode.insertBefore(box, toggle);
    });
  }

  // 언어 명시 페이지(?lang=en/ja)는 canonical이 자기 자신을 가리키도록 lang을 붙인다
  // (안 그러면 검색엔진이 번역본을 한국어 URL로 통합해 버림). og:locale도 맞춘다.
  function localizeSeoTags() {
    var ogLocale = { ko: 'ko_KR', en: 'en_US', ja: 'ja_JP' }[lang];
    var og = document.querySelector('meta[property="og:locale"]');
    if (og && ogLocale) og.setAttribute('content', ogLocale);
    if (!explicit || lang === DEFAULT) return;
    var c = document.querySelector('link[rel="canonical"]');
    if (!c) return;
    try {
      var u = new URL(c.getAttribute('href'), window.location.href);
      u.searchParams.set('lang', lang);
      c.setAttribute('href', u.toString());
      var ou = document.querySelector('meta[property="og:url"]');
      if (ou) ou.setAttribute('content', u.toString());
    } catch (e) {}
  }

  // 첫 방문자의 브라우저 언어가 en/ja면 해당 언어로 "번역본 보기" 배너를 띄운다
  var SUGGEST = {
    en: { msg: 'This page is also available in English.', go: 'View in English', no: 'Keep Korean' },
    ja: { msg: 'このページは日本語でもご覧いただけます。', go: '日本語で見る', no: '韓国語のまま' }
  };
  function injectSuggestBanner() {
    if (!suggest || !SUGGEST[suggest] || !document.body) return;
    var s = SUGGEST[suggest];
    var bar = document.createElement('div');
    bar.className = 'lang-suggest';
    bar.setAttribute('lang', suggest);
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', s.msg);
    var msg = document.createElement('span');
    msg.textContent = s.msg;
    var go = document.createElement('a');
    go.className = 'lang-suggest-go';
    go.setAttribute('href', urlForLang(suggest));
    go.setAttribute('hreflang', suggest);
    go.textContent = s.go;
    go.addEventListener('click', function () { try { localStorage.setItem(KEY, suggest); } catch (e) {} });
    var no = document.createElement('button');
    no.type = 'button';
    no.className = 'lang-suggest-no';
    no.textContent = s.no;
    no.addEventListener('click', function () {
      try { localStorage.setItem(KEY, DEFAULT); } catch (e) {}
      bar.remove();
    });
    bar.appendChild(msg);
    bar.appendChild(go);
    bar.appendChild(no);
    document.body.insertBefore(bar, document.body.firstChild);
  }

  window.I18N = { lang: lang, explicit: explicit, t: t, category: category, apply: apply, supported: SUPPORTED, DEFAULT: DEFAULT };

  document.documentElement.setAttribute('lang', lang === 'ko' ? 'ko' : lang);

  function setMeta(sel, val) {
    var m = document.querySelector(sel);
    if (m && val) m.setAttribute('content', val);
  }

  function init() {
    apply(document);
    // 정적 페이지의 <title> 로케일화 (topic.js는 자체적으로 제목 설정하므로 제외)
    var titleKey = document.body && document.body.getAttribute('data-i18n-title');
    if (titleKey) document.title = t(titleKey);
    // 정적 페이지의 meta description·og 태그도 언어에 맞춘다(검색 결과 스니펫용)
    if (titleKey && lang !== DEFAULT) {
      var descKey = titleKey.replace(/^title\./, 'desc.');
      setMeta('meta[name="description"]', t(descKey));
      setMeta('meta[property="og:description"]', t(descKey));
      setMeta('meta[property="og:title"]', document.title);
      setMeta('meta[property="og:site_name"]', t('site.name'));
    }
    injectSwitcher();
    injectHreflang();
    localizeSeoTags();
    injectSuggestBanner();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
