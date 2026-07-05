# 정보관리기술사 학습 노트

정보관리기술사 시험 대비용 **주제별 답안형 요약** 아카이브입니다.
순수 HTML/CSS/JS로 만든 정적 사이트이며 GitHub Pages로 배포됩니다.

🔗 **배포 주소**: https://coninggu.github.io/wjdqhrhksflrltnftk/

## 구성

- `index.html` — 메인(리스트) 페이지: 상단 검색 바 + 하단 주제 카드 목록
- `topic.html` — 주제 상세 페이지 (`?id=<주제id>`)
- `data/topics.json` — 주제 인덱스(메타데이터)
- `content/<id>.md` — 주제별 본문(마크다운)
- `assets/` — CSS / JS

## 주제 추가 방법

코드 수정 없이 **파일 2개만** 손보면 됩니다.

1. `content/<새-id>.md` 파일에 답안형 내용 작성 (마크다운, 표 지원)
2. `data/topics.json` 배열에 항목 1개 추가:

   ```json
   {
     "id": "새-id",
     "title": "주제 제목",
     "category": "카테고리",
     "tags": ["태그1", "태그2"],
     "summary": "한 줄 요약",
     "updated": "YYYY-MM-DD"
   }
   ```

> `id`는 영문 소문자·숫자·하이픈만 사용하세요. (`content/<id>.md`의 파일명과 일치해야 함)

## 로컬 실행

정적 파일이므로 서버로 열어야 `fetch`가 동작합니다.

```bash
python3 -m http.server 8000
# 또는
npx serve
```

브라우저에서 http://localhost:8000 접속.

## 현재 주제

- 터크만(Tuckman) 사다리 모델 — 팀 발달 및 단계별 특징
