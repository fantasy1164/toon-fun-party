// 把台詞表輸出成 docs/voice-lines.csv，給語音合成批次產生用。
// 用法：node tools/export-lines.mjs
import { writeFileSync } from 'node:fs';
import { LINES } from '../js/data/lines.js';

const CHARS = ['dudu', 'kiki'];
const WHO = { yh: '妍卉', xz: '向澤', both: '妍卉、向澤' };
const rows = [['file', 'character', 'line_id', 'text']];
const files = [];
for (const [id, l] of Object.entries(LINES)) {
  for (const c of CHARS) {
    const t = typeof l === 'string' ? l : l[c];
    if (!t) continue;
    if (t.includes('{name}')) {
      for (const [w, name] of Object.entries(WHO)) {
        rows.push([`assets/voice/${c}/${id}.${w}.mp3`, c, id, t.replaceAll('{name}', name)]);
        files.push(`${c}/${id}.${w}`);
      }
    } else {
      rows.push([`assets/voice/${c}/${id}.mp3`, c, id, t]);
      files.push(`${c}/${id}`);
    }
  }
}
const csv = rows.map((r) => r.map((v) => `"${v.replaceAll('"', '""')}"`).join(',')).join('\n');
writeFileSync(new URL('../docs/voice-lines.csv', import.meta.url), '﻿' + csv + '\n');
console.log(`${rows.length - 1} lines -> docs/voice-lines.csv`);
