/* العقل الذكي — الصوت: نطق عربي + تعرّف على الكلام */
window.SM = window.SM || {};
(function () {
  const synth = window.speechSynthesis;
  let voices = [];
  function loadVoices() { if (synth) voices = synth.getVoices() || []; }
  if (synth) { loadVoices(); synth.onvoiceschanged = loadVoices; }

  function arabicVoice() {
    const ar = voices.filter((v) => /^ar/i.test(v.lang));
    return ar.find((v) => /SA/i.test(v.lang)) || ar.find((v) => /google|natural|online/i.test(v.name)) || ar[0] || null;
  }
  const clean = (t) => t.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').replace(/[*_#`]/g, '');

  SM.voice = {
    ttsSupported: !!synth,
    hasArabic: () => !!arabicVoice(),
    voiceName: () => (arabicVoice() || {}).name || '',
    speak(text, charId, hooks = {}) {
      if (!synth || !(SM.settings && SM.settings.voice)) { hooks.onend && hooks.onend(); return false; }
      synth.cancel();
      const u = new SpeechSynthesisUtterance(clean(text));
      const v = arabicVoice();
      u.lang = v ? v.lang : 'ar-SA';
      if (v) u.voice = v;
      const p = SM.CHARACTERS[charId].voice;
      u.pitch = p.pitch; u.rate = p.rate;
      u.onstart = () => hooks.onstart && hooks.onstart();
      u.onend = u.onerror = () => hooks.onend && hooks.onend();
      synth.speak(u);
      return true;
    },
    stop() { synth && synth.cancel(); },
    Recognition: window.SpeechRecognition || window.webkitSpeechRecognition || null,
    listen(onResult, onEnd, onError) {
      const R = this.Recognition;
      if (!R) { onError && onError('unsupported'); return null; }
      const r = new R();
      r.lang = 'ar-SA'; r.interimResults = true; r.maxAlternatives = 1; r.continuous = false;
      r.onresult = (e) => {
        let txt = '', final = false;
        for (let i = e.resultIndex; i < e.results.length; i++) { txt += e.results[i][0].transcript; if (e.results[i].isFinal) final = true; }
        onResult(txt, final);
      };
      r.onerror = (e) => onError && onError(e.error);
      r.onend = () => onEnd && onEnd();
      try { r.start(); } catch (e) { onError && onError(e.message); return null; }
      return r;
    }
  };
})();
