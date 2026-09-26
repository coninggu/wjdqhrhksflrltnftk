#!/usr/bin/env node
/**
 * sitemap.xml 생성기 (다국어)
 * data/topics.json을 읽어 홈·플래시카드·모든 주제의 ko/en/ja URL을 담은 sitemap.xml을
 * 저장소 루트에 생성한다. 각 URL에는 hreflang 대체 링크(xhtml:link)를 붙인다.
 *
 * - ko: 쿼리 없는 URL(기본·x-default) / en·ja: ?lang=en|ja
 * - 주제 번역본은 content/<lang>/<id>.md가 있을 때만 포함(없으면 한국어 폴백이라 중복 색인 방지)
 *
 * 사용:  node scripts/gen-sitemap.js
 * (주제를 추가/수정하거나 번역을 추가한 뒤 실행하면 sitemap이 최신화된다.)
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BASE = 'https://www.xn--zb0bow85w7idd5f0pc46q.com'; // www.정보관리기술사.com (punycode)
const LANGS = ['ko', 'en', 'ja'];
const DEFAULT = 'ko';

const topics = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/topics.json'), 'utf8'));

// 가장 최근 updated 날짜(홈 lastmod용). 없으면 오늘.
const dates = topics.map(t => t.updated).filter(Boolean).sort();
const latest = dates.length ? dates[dates.length - 1] : new Date().toISOString().slice(0, 10);

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// 경로 + 기존 쿼리에 lang을 붙인 절대 URL (ko는 lang 없음)
function withLang(pathAndQuery, lang) {
  if (lang === DEFAULT) return BASE + pathAndQuery;
  const sep = pathAndQuery.includes('?') ? '&' : '?';
  return BASE + pathAndQuery + sep + 'lang=' + lang;
}

const pages = [];
pages.push({ path: '/', langs: LANGS, lastmod: latest, changefreq: 'weekly', priority: '1.0' });
pages.push({ path: '/flashcards.html', langs: LANGS, lastmod: latest, changefreq: 'weekly', priority: '0.6' });
for (const t of topics) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(t.id)) {
    console.error('WARN invalid id, skipped:', t.id);
    continue;
  }
  const langs = LANGS.filter(l => l === DEFAULT || fs.existsSync(path.join(ROOT, 'content', l, t.id + '.md')));
  pages.push({ path: `/topic.html?id=${t.id}`, langs, lastmod: t.updated || latest, changefreq: 'monthly', priority: '0.8' });
}

const entries = [];
for (const p of pages) {
  const alts = p.langs.map(l => `    <xhtml:link rel="alternate" hreflang="${l}" href="${esc(withLang(p.path, l))}"/>`)
    .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(withLang(p.path, DEFAULT))}"/>`)
    .join('\n');
  for (const l of p.langs) {
    entries.push(`  <url>
    <loc>${esc(withLang(p.path, l))}</loc>
${alts}
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${l === DEFAULT ? p.priority : (Number(p.priority) - 0.1).toFixed(1)}</priority>
  </url>`);
  }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
const perLang = LANGS.map(l => `${l} ${pages.filter(p => p.langs.includes(l)).length}`).join(', ');
console.log(`sitemap.xml 생성 완료: URL ${entries.length}개 (${perLang})`);
