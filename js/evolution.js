/* العقل الذكي — نظام الرابطة والتطور */
window.SM = window.SM || {};
(function () {
  const KEY = 'sm_bond';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (_) { return {}; } };
  let st = Object.assign({ points: 0, stage: 0, lastVisit: '', streak: 0, chats: 0 }, load());
  const save = () => localStorage.setItem(KEY, JSON.stringify(st));
  const T = () => SM.THRESHOLDS;

  SM.evo = {
    get: () => st,
    stage: () => st.stage,
    points: () => st.points,
    reset() { st = { points: 0, stage: 0, lastVisit: '', streak: 0, chats: 0 }; save(); },
    // نسبة التقدم نحو المرحلة التالية
    progress() {
      const t = T();
      if (st.stage >= t.length - 1) return 1;
      return Math.min(1, (st.points - t[st.stage]) / (t[st.stage + 1] - t[st.stage]));
    },
    nextAt() { const t = T(); return st.stage >= t.length - 1 ? null : t[st.stage + 1]; },
    // إضافة نقاط؛ يعيد true إذا حان التطور
    add(n) {
      st.points += n; save();
      const t = T();
      return st.stage < t.length - 1 && st.points >= t[st.stage + 1];
    },
    chat() { st.chats++; return this.add(3); },
    dailyVisit() {
      const today = new Date().toISOString().slice(0, 10);
      if (st.lastVisit === today) return { bonus: 0, evolve: false };
      const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
      st.streak = st.lastVisit === y ? st.streak + 1 : 1;
      const first = !st.lastVisit;
      st.lastVisit = today;
      const bonus = first ? 0 : 5 + Math.min(st.streak, 7);
      return { bonus, evolve: bonus ? this.add(bonus) : (save(), false) };
    },
    evolve() { if (st.stage < T().length - 1) { st.stage++; if (st.points < T()[st.stage]) st.points = T()[st.stage]; save(); return true; } return false; },
    // زر الاختبار: الانتقال للمرحلة التالية (أو العودة للأولى بعد الأخيرة)
    testNext() { if (st.stage >= T().length - 1) { st.stage = 0; st.points = 0; save(); return 'reset'; } return this.evolve() ? 'evolved' : 'none'; }
  };
})();
