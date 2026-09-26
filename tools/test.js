// اختبار آلي: لا أخطاء في الكونسول، الرد التجريبي يعمل، التطور يعمل + لقطات 390x844
const { chromium } = require('/workspace/pwtest/node_modules/playwright-core');
const URL = process.argv[2] || 'http://localhost:8931/';
const OUT = __dirname + '/../screenshots/';
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ar-SA' });
  const p = await ctx.newPage();
  const errors = [];
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  p.on('pageerror', (e) => errors.push(e.message));
  const ok = (c, msg) => { console.log((c ? 'PASS ' : 'FAIL ') + msg); if (!c) process.exitCode = 1; };
  await p.goto(URL); await p.waitForTimeout(900);
  await p.screenshot({ path: OUT + '01-onboarding-empty.png' });
  await p.fill('#nameInput', 'سارة');
  await p.click('.card[data-id="thaqib"]');
  await p.waitForTimeout(400);
  await p.screenshot({ path: OUT + '02-onboarding-selected.png' });
  await p.click('#startBtn');
  await p.waitForTimeout(1500);
  ok(await p.isVisible('#chat'), 'chat screen visible');
  await p.fill('#msgInput', 'السلام عليكم، كيف حالك؟');
  await p.click('#sendBtn');
  await p.waitForTimeout(250);
  ok(await p.$eval('#avatarHost .sm-avatar', (e) => e.classList.contains('thinking')), 'thinking animation');
  await p.waitForTimeout(1800);
  const bots = await p.$$eval('.msg.bot', (e) => e.map((x) => x.textContent));
  ok(bots.length >= 2 && bots[bots.length - 1].length > 5, 'demo reply: ' + bots[bots.length - 1]);
  await p.fill('#msgInput', 'أنا حزين قليلاً اليوم');
  await p.click('#sendBtn'); await p.waitForTimeout(2000);
  await p.screenshot({ path: OUT + '03-chat-thaqib.png' });
  const pts = await p.$eval('#bondVal', (e) => +e.textContent);
  ok(pts === 6, 'bond points after 2 chats = ' + pts);
  // poke
  await p.click('#avatarHost'); await p.waitForTimeout(200);
  ok(await p.$eval('#avatarHost .sm-avatar', (e) => e.classList.contains('mood-surprised')), 'poke reaction');
  // settings + evolution
  await p.click('#settingsBtn'); await p.waitForTimeout(500);
  await p.screenshot({ path: OUT + '04-settings.png' });
  await p.click('#testEvo'); await p.waitForTimeout(1300);
  await p.screenshot({ path: OUT + '05-evolving.png' });
  await p.waitForTimeout(1800);
  let stage = await p.$eval('#avatarHost .sm-avatar', (e) => e.dataset.stage);
  ok(stage === '1', 'evolved to stage 1 via test button');
  // real threshold evolution via chats
  await p.evaluate(() => SM.evo.add(98 - SM.evo.points()));
  await p.fill('#msgInput', 'شكراً لك'); await p.click('#sendBtn');
  await p.waitForTimeout(6500);
  stage = await p.$eval('#avatarHost .sm-avatar', (e) => e.dataset.stage);
  ok(stage === '2', 'threshold evolution to stage 2');
  await p.screenshot({ path: OUT + '06-thaqib-wise.png' });
  // other partners
  for (const id of ['ghusn', 'raad']) {
    await p.evaluate((id) => { const s = JSON.parse(localStorage.sm_settings); s.partner = id; localStorage.sm_settings = JSON.stringify(s); localStorage.removeItem('sm_history'); localStorage.removeItem('sm_bond'); }, id);
    await p.reload(); await p.waitForTimeout(1200);
    await p.fill('#msgInput', 'احكي لي نكتة'); await p.click('#sendBtn'); await p.waitForTimeout(2200);
    await p.screenshot({ path: OUT + `07-chat-${id}.png` });
    await p.click('#settingsBtn'); await p.click('#testEvo'); await p.waitForTimeout(3200);
    await p.click('#settingsBtn'); await p.click('#testEvo'); await p.waitForTimeout(3500);
    await p.screenshot({ path: OUT + `08-${id}-final.png` });
    ok(await p.$eval('#avatarHost .sm-avatar', (e) => e.dataset.stage) === '2', id + ' reaches stage 2');
  }
  // SW + manifest
  const sw = await p.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); return !!r; });
  ok(sw, 'service worker registered');
  ok(errors.length === 0, 'no console errors ' + JSON.stringify(errors));
  await b.close();
})();
