#!/usr/bin/env node
/**
 * 번역 동기화 점검기
 * data/topics.json(한국어 원본)과 번역본(content/<lang>/<id>.md + data/i18n/topics.<lang>.json)을
 * 비교해 번역이 없거나(missing) 원본보다 오래된(stale) 주제를 찾는다.
 *
 * - stale 판정: 번역 메타의 sourceUpdated가 원본 topics.json의 updated와 다르면 stale.
 *   (원본을 보강하면 updated가 바뀌므로, 번역을 다시 해야 함을 알 수 있다)
 * - structure: 코드펜스 수·mermaid 수·[[위키링크]]가 원본과 다르면 번역 누락/깨짐 의심.
 *
 * 사용:
 *   node scripts/i18n-status.js            # 요약 출력 (문제 있으면 exit 1)
 *   node scripts/i18n-status.js --ids      # 번역이 필요한 id만 한 줄에 하나씩 출력
 *   node scripts/i18n-status.js --stamp <id...>  # 번역 완료 표시(sourceUpdated = 원본 updated)
 *   node scripts/i18n-status.js --stamp --all    # 모든 번역본에 완료 표시(초기화용)
 *
 * 번역 절차: 원본을 번역해 content/<lang>/<id>.md와 topics.<lang>.json의 title·summary를 쓰고,
 * 모든 언어를 마친 뒤 --stamp <id>를 실행한다. 그 다음 gen-sitemap.js를 실행한다.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const LANGS = ['en', 'ja'];

const topics = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/topics.json'), 'utf8'));
const metaPath = l => path.join(ROOT, 'data/i18n', `topics.${l}.json`);
const meta = {};
for (const l of LANGS) {
  meta[l] = fs.existsSync(metaPath(l)) ? JSON.parse(fs.readFileSync(metaPath(l), 'utf8')) : {};
}

function shape(md) {
  return {
    fences: (md.match(/^```/gm) || []).length,
    mermaid: (md.match(/^```mermaid/gm) || []).length,
    links: (md.match(/\[\[[a-z0-9][a-z0-9-]*\]\]/gi) || []).sort().join(','),
  };
}

function check(t, l) {
  const md = path.join(ROOT, 'content', l, t.id + '.md');
  const m = meta[l][t.id];
  if (!fs.existsSync(md) || !m || !m.title) return 'missing';
  if (m.sourceUpdated !== t.updated) return 'stale';
  const a = shape(fs.readFileSync(path.join(ROOT, 'content', t.id + '.md'), 'utf8'));
  const b = shape(fs.readFileSync(md, 'utf8'));
  if (a.fences !== b.fences || a.mermaid !== b.mermaid || a.links !== b.links) return 'structure';
  return 'ok';
}

const args = process.argv.slice(2);

if (args[0] === '--stamp') {
  const all = args.includes('--all');
  const ids = all ? topics.map(t => t.id) : args.slice(1);
  const byId = new Map(topics.map(t => [t.id, t]));
  let n = 0;
  for (const id of ids) {
    const t = byId.get(id);
    if (!t) { console.error('unknown id:', id); process.exitCode = 1; continue; }
    for (const l of LANGS) {
      const m = meta[l][id];
      if (!m || !fs.existsSync(path.join(ROOT, 'content', l, id + '.md'))) {
        if (!all) { console.error(`번역 없음, 건너뜀: ${l}/${id}`); process.exitCode = 1; }
        continue;
      }
      m.sourceUpdated = t.updated;
      n++;
    }
  }
  for (const l of LANGS) fs.writeFileSync(metaPath(l), JSON.stringify(meta[l], null, 1));
  console.log(`완료 표시: ${n}건`);
  process.exit();
}

const todo = new Set();
const report = {};
for (const l of LANGS) {
  report[l] = { ok: 0, missing: [], stale: [], structure: [] };
  for (const t of topics) {
    const s = check(t, l);
    if (s === 'ok') report[l].ok++;
    else { report[l][s].push(t.id); todo.add(t.id); }
  }
}

if (args.includes('--ids')) {
  for (const id of todo) console.log(id);
} else {
  console.log(`주제 ${topics.length}개`);
  for (const l of LANGS) {
    const r = report[l];
    console.log(`[${l}] ok ${r.ok} · missing ${r.missing.length} · stale ${r.stale.length} · structure ${r.structure.length}`);
    for (const k of ['missing', 'stale', 'structure']) {
      if (r[k].length) console.log(`  ${k}: ${r[k].join(' ')}`);
    }
  }
}
if (todo.size) process.exitCode = 1;
