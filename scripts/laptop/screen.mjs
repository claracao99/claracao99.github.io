// What the laptop's screen shows: a page captured at the MacBook Pro 16"'s
// default size (1728 × 1117 points, 2x), saved as inputs/screen.jpg (the desk pages' wallpaper).
//
//   node scripts/screen.mjs https://claracao.work/
//
// Runs the installed Chrome through the phone-render tool's playwright-core.

import { chromium } from '/Users/claracao/Projects-personal/phone-render/node_modules/playwright-core/index.mjs';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const url = process.argv[2] || 'https://claracao.work/';
const inputs = path.join(path.dirname(fileURLToPath(import.meta.url)), 'inputs');
const png = path.join(inputs, 'screen.png');
const jpg = path.join(inputs, 'screen.jpg');

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1728, height: 1117 }, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500); // let intro motion settle
await page.screenshot({ path: png });
await browser.close();
execFileSync('magick', [png, '-quality', '90', jpg]);
fs.rmSync(png);
console.log('wrote', jpg);
