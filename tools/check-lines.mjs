// 檢查台詞表有沒有重複的台詞代號（11/17）。
// js/data/lines.js 分好幾段 Object.assign(LINES, {...})，同一個代號寫在兩段時，後面那段會整個蓋掉前面的，
// 前面那個角色的台詞就不見了（遊戲裡會沒有聲音）。曾經發生過：f_milk、s_hello、tr_hello。
// 用法：node tools/check-lines.mjs
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'js', 'data', 'lines.js'), 'utf8');
const seen = new Map();
const dups = [];
// 只看 LINES 本身和 Object.assign(LINES, {...}) 裡最外層的代號（角色共用台詞的 const 表不算）
const blocks = [...src.matchAll(/(?:export const LINES = \{|Object\.assign\(LINES, \{)([\s\S]*?)\n\}\);?/g)];
blocks.forEach((b, bi) => {
  for (const m of b[1].matchAll(/^\s{2}([a-z][a-z0-9_]*)\s*:\s*\{/gm)) {
    const k = m[1];
    if (seen.has(k) && seen.get(k) !== bi) dups.push(k);
    seen.set(k, bi);
  }
  for (const m of b[1].matchAll(/[,{]\s([a-z][a-z0-9_]*): \{ \w+:/g)) {
    const k = m[1];
    if (seen.has(k) && seen.get(k) !== bi) dups.push(k);
    if (!seen.has(k)) seen.set(k, bi);
  }
});
if (dups.length) {
  console.log(`有重複的台詞代號（後面的會蓋掉前面的）：${[...new Set(dups)].join('、')}`);
  process.exit(1);
}
console.log(`沒有重複（共 ${seen.size} 個代號）`);
