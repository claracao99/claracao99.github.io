// The About laptop's screen: scripts/desk.html at the MacBook Pro 16"'s
// default size (1728 × 1117 points, 2x), saved as assets/closeup/desk.jpg.
//
//   node scripts/desk.mjs

import { chromium } from '/Users/claracao/Projects-personal/phone-render/node_modules/playwright-core/index.mjs';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', 'public');
const png = path.join(root, 'assets', 'closeup', 'desk.png');
const jpg = path.join(root, 'assets', 'closeup', 'desk.jpg');

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1728, height: 1117 }, deviceScaleFactor: 2 });
await page.goto(pathToFileURL(path.join(here, 'desk.html')).href, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.screenshot({ path: png });
await browser.close();
execFileSync('magick', [png, '-quality', '90', jpg]);
fs.rmSync(png);
console.log('wrote', jpg);
