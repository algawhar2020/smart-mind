/* العقل الذكي — منطق التطبيق */
(function () {
  const $ = (s) => document.querySelector(s);
  const C = SM.CHARACTERS;
  const SKEY = 'sm_settings', HKEY = 'sm_history';
  const MOODS = { happy: 'سعيد', sad: 'متعاطف', love: 'محب', excited: 'متحمس', curious: 'فضولي', surprised: 'مندهش', calm: 'هادئ', thinking: 'يفكر…' };

  SM.settings = Object.assign({ name: '', partner: '', voice: true, geminiKey: '', geminiModel: SM.GEMINI_MODELS[0] }, safeJSON(localStorage.getItem(SKEY)));
  let history = safeJSON(localStorage.getItem(HKEY)) || [];
  let avatarEl = null, moodTimer = null, busy = false, rec = null, typingTimer = null;

  function safeJSON(s) { try { return JSON.parse(s); } catch (_) { return null; } }
  const saveSettings = () => localStorage.setItem(SKEY, JSON.stringify(SM.settings));
  const saveHistory = () => localStorage.setItem(HKEY, JSON.stringify(history.slice(-60)));

  function toast(t, ms = 2600) { const el = $('#toast'); el.textContent = t; el.classList.remove('hidden'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.add('hidden'), ms); }

  function applyTheme(id) {
    const c = C[id]; if (!c) return;
    const r = document.documentElement.style;
    r.setProperty('--accent', c.color); r.setProperty('--accent2', c.color2); r.setProperty('--glow', c.glow);
    document.querySelector('meta[name=theme-color]').content = '#070B24';
  }

  function renderCards(host, selected, onPick) {
    host.innerHTML = SM.ORDER.map((id) => {
      const c = C[id];
      return `<div class="card ${id === selected ? 'sel' : ''}" data-id="${id}" role="button" tabindex="0" style="--c:${c.color};--cg:${c.glow}">
        ${SM.avatarSVG(id, 0)}<b style="color:${c.color}">${c.stages[1]}</b><small>${c.kind}<br>${c.trait}</small></div>`;
    }).join('');
    host.querySelectorAll('.card').forEach((el) => {
      const pick = () => { host.querySelectorAll('.card').forEach((x) => x.classList.toggle('sel', x === el)); onPick(el.dataset.id); };
      el.addEventListener('click', pick);
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') pick(); });
    });
  }

  /* ===== Onboarding ===== */
  let pending = '';
  function initOnboard() {
    const nameI = $('#nameInput'), btn = $('#startBtn');
    nameI.value = SM.settings.name || '';
    const check = () => { btn.disabled = !(nameI.value.trim() && pending); };
    renderCards($('#cards'), pending, (id) => { pending = id; applyTheme(id); check(); });
    nameI.addEventListener('input', check);
    btn.addEventListener('click', () => {
      SM.settings.name = nameI.value.trim(); SM.settings.partner = pending; saveSettings();
      SM.evo.reset(); history = []; saveHistory();
      startChat(true);
    });
  }

  /* ===== Avatar ===== */
  function mountAvatar() {
    $('#avatarHost').innerHTML = SM.avatarSVG(SM.settings.partner, SM.evo.stage());
    avatarEl = $('#avatarHost .sm-avatar');
  }
  function setState(cls, on) { avatarEl && avatarEl.classList.toggle(cls, on); }
  function setMood(m, ms = 4200) {
    if (!avatarEl) return;
    Object.keys(MOODS).forEach((k) => avatarEl.classList.remove('mood-' + k));
    if (m && m !== 'calm') avatarEl.classList.add('mood-' + m);
    $('#moodTxt').textContent = MOODS[m] || MOODS.calm;
    clearTimeout(moodTimer);
    if (m !== 'calm') moodTimer = setTimeout(() => setMood('calm'), ms);
  }

  function updateHUD() {
    const c = C[SM.settings.partner], ev = SM.evo.get(), p = SM.evo.progress();
    $('#bondVal').textContent = ev.points;
    $('#streakVal').textContent = '🔥 ' + Math.max(1, ev.streak);
    $('#evoVal').textContent = SM.evo.nextAt() === null ? 'MAX' : Math.round(p * 100) + '%';
    $('#evoBar').style.width = p * 100 + '%';
    $('#hexProg').style.strokeDasharray = `${Math.max(0.5, p * 100)} 100`;
    $('#stageName').textContent = c.stages[ev.stage];
    $('#stageName').style.color = c.color;
  }

  function evolveAnim() {
    return new Promise((res) => {
      const rabit = $('#rabit');
      const c = C[SM.settings.partner];
      const from = c.stages[SM.evo.stage()];
      rabit.classList.remove('evolving'); void rabit.offsetWidth; rabit.classList.add('evolving');
      SM.voice.stop();
      setTimeout(() => { SM.evo.evolve(); mountAvatar(); updateHUD(); setMood('excited'); }, 1150);
      setTimeout(() => {
        rabit.classList.remove('evolving');
        const to = c.stages[SM.evo.stage()];
        addMsg('sys', `🧬 تطوّر! ${from} ← أصبح الآن «${to}»`);
        const line = { thaqib: `لقد تطورت يا ${SM.settings.name}. أرى الآن أبعد وأعمق. شكراً لثقتك.`, ghusn: `واااو! لقد كبرت! 🌿🐉 شكراً يا ${SM.settings.name}، أنت سقيتني بالكلمات!`, raad: `زئيييير! ⚡🦁 أشعر بقوة هائلة! سأحميك أكثر يا ${SM.settings.name}!` }[c.id];
        botSay(line, 'evo');
        res();
      }, 2700);
    });
  }

  /* ===== Chat ===== */
  function addMsg(role, text, meta) {
    const d = document.createElement('div');
    d.className = 'msg ' + role;
    d.textContent = text;
    if (meta) { const s = document.createElement('span'); s.className = 'src'; s.textContent = meta; d.appendChild(s); }
    $('#messages').appendChild(d);
    $('#messages').scrollTop = 1e9;
    return d;
  }

  function botSay(text, source) {
    addMsg('bot', text, source === 'gemini' ? 'Gemini ✦' : '');
    history.push({ role: 'bot', text }); saveHistory();
    setMood(SM.detectEmotion(text), 5000);
    const spoke = SM.voice.speak(text, SM.settings.partner, { onstart: () => setState('talking', true), onend: () => setState('talking', false) });
    if (!spoke) { setState('talking', true); setTimeout(() => setState('talking', false), Math.min(4000, 600 + text.length * 45)); }
  }

  async function send(text) {
    text = text.trim(); if (!text || busy) return;
    busy = true;
    addMsg('user', text);
    history.push({ role: 'user', text }); saveHistory();
    setState('typing-watch', false);
    setState('thinking', true); $('#moodTxt').textContent = MOODS.thinking;
    const t = addMsg('bot', ''); t.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
    let r;
    try { r = await SM.ai.reply(SM.settings.partner, history, SM.settings.name); }
    catch (e) { r = { text: SM.ai.demoReply(SM.settings.partner, text, SM.settings.name), source: 'demo' }; }
    t.remove(); setState('thinking', false);
    if (r.error) addMsg('sys', 'تعذّر الاتصال بـ Gemini، تم استخدام الدماغ التجريبي.');
    botSay(r.text, r.source);
    const evolve = SM.evo.chat(); updateHUD();
    busy = false;
    if (evolve) setTimeout(evolveAnim, 1800);
  }

  function startChat(fresh) {
    $('#onboard').classList.add('hidden'); $('#chat').classList.remove('hidden');
    applyTheme(SM.settings.partner);
    const dv = SM.evo.dailyVisit();
    mountAvatar(); updateHUD(); setMood('calm');
    $('#messages').innerHTML = '';
    history.slice(-20).forEach((m) => addMsg(m.role === 'user' ? 'user' : 'bot', m.text));
    const c = C[SM.settings.partner];
    if (fresh || !history.length) {
      addMsg('sys', `تم ربط «رابط» مع ${c.stages[SM.evo.stage()]} ✓`);
      setTimeout(() => botSay(c.greeting.replace('{name}', SM.settings.name), 'demo'), 500);
    } else if (dv.bonus) {
      addMsg('sys', `زيارة يومية! +${dv.bonus} نقاط رابطة 🔥`);
      if (dv.evolve) setTimeout(evolveAnim, 1200);
    }
    $('#voiceToggle').textContent = SM.settings.voice ? '🔊' : '🔇';
  }

  function initChat() {
    const input = $('#msgInput');
    $('#composer').addEventListener('submit', (e) => { e.preventDefault(); const v = input.value; input.value = ''; send(v); });
    input.addEventListener('input', () => {
      setState('typing-watch', !!input.value);
      clearTimeout(typingTimer); typingTimer = setTimeout(() => setState('typing-watch', false), 2500);
    });
    let pokes = 0, pokeT;
    $('#avatarHost').addEventListener('click', () => {
      pokes++; clearTimeout(pokeT); pokeT = setTimeout(() => (pokes = 0), 3000);
      setMood('surprised', 1400);
      if (navigator.vibrate) navigator.vibrate(30);
      if (pokes === 3) {
        const l = { thaqib: 'هممم… هذا يدغدغ ريشي الرقمي 🦉', ghusn: 'هههه! توقف، أوراقي حساسة! 🌿', raad: 'هيه! أنا أسد شجاع… لكن هذا يدغدغ! ⚡' }[SM.settings.partner];
        botSay(l, 'demo'); if (SM.evo.add(1)) setTimeout(evolveAnim, 1500); updateHUD();
      }
    });
    $('#voiceToggle').addEventListener('click', () => {
      SM.settings.voice = !SM.settings.voice; saveSettings();
      $('#voiceToggle').textContent = SM.settings.voice ? '🔊' : '🔇';
      if (!SM.settings.voice) SM.voice.stop();
      toast(SM.settings.voice ? 'الصوت مفعّل' : 'الصوت متوقف');
    });
    $('#micBtn').addEventListener('click', () => {
      if (rec) { rec.stop(); return; }
      if (!SM.voice.Recognition) { toast('المتصفح لا يدعم التعرّف على الصوت. استخدم لوحة المفاتيح الصوتية (زر المايك في الكيبورد) 🎙️', 4500); input.focus(); return; }
      SM.voice.stop();
      $('#micBtn').classList.add('rec'); setState('typing-watch', true);
      rec = SM.voice.listen((txt, final) => { input.value = txt; if (final) { const v = txt; input.value = ''; send(v); } },
        () => { rec = null; $('#micBtn').classList.remove('rec'); setState('typing-watch', false); },
        (err) => { toast(err === 'not-allowed' ? 'اسمح بالوصول إلى الميكروفون' : 'تعذّر التعرّف على الصوت (' + err + ')'); });
      if (!rec) $('#micBtn').classList.remove('rec');
    });
    $('#settingsBtn').addEventListener('click', openSettings);
  }

  /* ===== Settings ===== */
  function openSettings() {
    const s = SM.settings;
    $('#setName').value = s.name; $('#setVoice').checked = s.voice; $('#setKey').value = s.geminiKey;
    $('#setModel').innerHTML = SM.GEMINI_MODELS.map((m) => `<option ${m === s.geminiModel ? 'selected' : ''}>${m}</option>`).join('');
    renderCards($('#setCards'), s.partner, (id) => {
      if (id === s.partner) return;
      s.partner = id; saveSettings(); history = []; saveHistory(); SM.evo.reset(); startChat(true); refreshInfo();
    });
    refreshInfo();
    $('#settings').classList.remove('hidden');
  }
  function refreshInfo() {
    const v = SM.voice;
    $('#voiceInfo').textContent = !v.ttsSupported ? 'النطق غير مدعوم في هذا المتصفح.' : v.hasArabic() ? `صوت عربي متاح: ${v.voiceName()}` : 'لم يُعثر على صوت عربي في جهازك؛ قد يُقرأ النص بصوت افتراضي. (ثبّت العربية في إعدادات تحويل النص إلى كلام)';
    if (!v.Recognition) $('#voiceInfo').textContent += ' · الميكروفون: استخدم إملاء لوحة المفاتيح.';
    const ev = SM.evo.get(), c = C[SM.settings.partner];
    $('#evoInfo').textContent = `المرحلة: ${c ? c.stages[ev.stage] : '-'} · النقاط: ${ev.points} · ${SM.evo.nextAt() === null ? 'أقصى مرحلة' : 'التطور التالي عند ' + SM.evo.nextAt()} (+3 لكل محادثة، ومكافأة زيارة يومية)`;
  }
  function closeSettings() {
    const s = SM.settings;
    s.name = $('#setName').value.trim() || s.name; s.voice = $('#setVoice').checked;
    s.geminiKey = $('#setKey').value.trim(); s.geminiModel = $('#setModel').value; saveSettings();
    $('#voiceToggle').textContent = s.voice ? '🔊' : '🔇';
    $('#settings').classList.add('hidden');
  }
  function initSettings() {
    $('#closeSettings').addEventListener('click', closeSettings);
    $('#settings').addEventListener('click', (e) => { if (e.target.id === 'settings') closeSettings(); });
    $('#testVoice').addEventListener('click', () => {
      const prev = SM.settings.voice; SM.settings.voice = true;
      const c = C[SM.settings.partner];
      if (!SM.voice.speak(`مرحباً، أنا ${c.stages[SM.evo.stage()]}`, c.id, { onstart: () => setState('talking', true), onend: () => setState('talking', false) })) toast('النطق غير مدعوم');
      SM.settings.voice = prev || $('#setVoice').checked;
    });
    $('#testKey').addEventListener('click', async () => {
      const key = $('#setKey').value.trim(); const st = $('#keyStatus');
      if (!key) { st.textContent = 'أدخل المفتاح أولاً.'; return; }
      st.textContent = 'جارٍ الاختبار…';
      const prev = { k: SM.settings.geminiKey, m: SM.settings.geminiModel };
      SM.settings.geminiKey = key; SM.settings.geminiModel = $('#setModel').value;
      const r = await SM.ai.reply(SM.settings.partner, [{ role: 'user', text: 'قل مرحباً في جملة قصيرة' }], SM.settings.name);
      st.textContent = r.source === 'gemini' ? '✅ يعمل! ' + r.text.slice(0, 80) : '❌ فشل: ' + (r.error || '');
      if (r.source !== 'gemini') { SM.settings.geminiKey = prev.k; SM.settings.geminiModel = prev.m; }
    });
    $('#testEvo').addEventListener('click', async () => {
      closeSettings();
      if (SM.evo.stage() >= 2) { SM.evo.testNext(); mountAvatar(); updateHUD(); addMsg('sys', '↺ عادت الشخصية إلى المرحلة الأولى للاختبار'); return; }
      await evolveAnim();
    });
    $('#addPts').addEventListener('click', () => { const e = SM.evo.add(10); updateHUD(); refreshInfo(); toast('+10 نقاط رابطة'); if (e) { closeSettings(); setTimeout(evolveAnim, 300); } });
    $('#resetAll').addEventListener('click', () => { if (confirm('حذف كل البيانات والبدء من جديد؟')) { localStorage.clear(); location.reload(); } });
  }

  /* ===== Boot ===== */
  initOnboard(); initChat(); initSettings();
  if (SM.settings.name && C[SM.settings.partner]) startChat(false);
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
  SM.app = { send, evolveAnim, setMood };
})();
