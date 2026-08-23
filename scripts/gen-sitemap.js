#!/usr/bin/env node
/**
 * sitemap.xml 생성기
 * data/topics.json을 읽어 홈(index) + 모든 주제(topic.html?id=...) URL을 담은
 * sitemap.xml을 저장소 루트에 생성한다.
 *
 * 사용:  node scripts/gen-sitemap.js
 * (주제를 추가/수정한 뒤 실행하면 sitemap이 최신화된다.)
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BASE = 'https://www.xn--zb0bow85w7idd5f0pc46q.com'; // www.정보관리기술사.com (punycode)

const topics = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/topics.json'), 'utf8'));

// 가장 최근 updated 날짜(홈 lastmod용). 없으면 오늘.
const dates = topics.map(t => t.updated).filter(Boolean).sort();
const latest = dates.length ? dates[dates.length - 1] : new Date().toISOString().slice(0, 10);

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const urls = [];
// 홈
urls.push({ loc: `${BASE}/`, lastmod: latest, changefreq: 'weekly', priority: '1.0' });
// 주제 상세
for (const t of topics) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(t.id)) {
    console.error('WARN invalid id, skipped:', t.id);
    continue;
  }
  urls.push({
    loc: `${BASE}/topic.html?id=${t.id}`,
    lastmod: t.updated || latest,
    changefreq: 'monthly',
    priority: '0.8',
  });
}

const body = urls.map(u => `  <url>
    <loc>${esc(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
console.log(`sitemap.xml 생성 완료: URL ${urls.length}개 (홈 1 + 주제 ${urls.length - 1})`);
