// يولّد الأيقونات ولوحات الشخصيات (PNG) عبر Chrome بدون واجهة
const { chromium } = require('/workspace/pwtest/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const p = await b.newPage();
  const logo = fs.readFileSync(ROOT + '/icons/logo.svg', 'utf8');
  for (const [n, s, pad] of [['icon-192', 192, 0], ['icon-512', 512, 0], ['icon-maskable-512', 512, 60]]) {
    await p.setViewportSize({ width: s, height: s });
    await p.setContent(`<body style="margin:0;background:#070B24;display:grid;place-items:center;height:100vh">${logo.replace('<svg ', `<svg width="${s - pad * 2}" height="${s - pad * 2}" `)}</body>`);
    await p.screenshot({ path: `${ROOT}/icons/${n}.png` });
  }
  await p.setViewportSize({ width: 1200, height: 1000 });
  await p.goto('http://localhost:8931/tools/sheet.html');
  await p.waitForTimeout(800);
  for (const id of ['sheet-thaqib', 'sheet-ghusn', 'sheet-raad', 'sheet-all', 'logo', 'device']) {
    const el = await p.$('#' + id);
    await el.screenshot({ path: `${ROOT}/docs/mockups/${id}.png` });
  }
  await b.close();
  console.log('done');
})();
