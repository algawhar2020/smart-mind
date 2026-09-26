/* العقل الذكي — الدماغ: وضع تجريبي بدون إنترنت + Gemini اختياري بمفتاح المستخدم */
window.SM = window.SM || {};
(function () {
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const norm = (t) => t.replace(/[\u064B-\u0652\u0640]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').toLowerCase();

  // نوايا عامة (كلمات مفتاحية بعد التطبيع)
  const INTENTS = [
    { id: 'greet', k: ['مرحبا', 'السلام', 'اهلا', 'هلا', 'صباح', 'مساء', 'هاي', 'hello', 'hi'] },
    { id: 'how', k: ['كيف حالك', 'كيفك', 'شلونك', 'اخبارك', 'عامل ايه'] },
    { id: 'who', k: ['من انت', 'مين انت', 'عرف نفسك', 'ما اسمك', 'اسمك'] },
    { id: 'sad', k: ['حزين', 'زعلان', 'متضايق', 'تعبان', 'مكتئب', 'وحيد', 'قلق', 'خايف', 'ضغط'] },
    { id: 'happy', k: ['سعيد', 'فرحان', 'مبسوط', 'رائع', 'نجحت', 'فزت', 'ممتاز'] },
    { id: 'thanks', k: ['شكرا', 'مشكور', 'يعطيك العافيه', 'جزاك'] },
    { id: 'love', k: ['احبك', 'حبيبي', 'صديقي', 'رفيقي'] },
    { id: 'study', k: ['ادرس', 'دراسه', 'امتحان', 'اختبار', 'مذاكره', 'تعلم', 'اتعلم'] },
    { id: 'joke', k: ['نكته', 'ضحكني', 'اضحك', 'نكت'] },
    { id: 'advice', k: ['نصيحه', 'انصحني', 'ماذا افعل', 'وش اسوي', 'اعمل ايه', 'ساعدني'] },
    { id: 'time', k: ['الساعه', 'الوقت', 'التاريخ', 'اليوم كم'] },
    { id: 'evolve', k: ['تطور', 'تتطور', 'مستوى', 'نقاط'] },
    { id: 'bye', k: ['مع السلامه', 'باي', 'وداعا', 'تصبح على خير', 'الى اللقاء'] },
    { id: 'math', k: [] }
  ];

  const R = {
    thaqib: {
      greet: ['وعليك السلام يا {name}. سعيد بعودتك، عقلي جاهز للتفكير معك.', 'أهلاً {name}. لنبدأ بهدوء: ما الفكرة التي تشغلك؟'],
      how: ['أنا بخير، دوائري مستقرة وبياناتي مرتبة. وأنت، كيف حال عقلك اليوم؟'],
      who: ['أنا ثاقب، بومة رقمية أرى في الظلام ما لا يُرى. أمثّل الذكاء والثقة، وأنا شريكك في التفكير.'],
      sad: ['أفهم شعورك يا {name}. خذ نفساً عميقاً… كل مشكلة تصبح أصغر حين نقسّمها إلى خطوات. أخبرني بأول خطوة؟', 'المشاعر الصعبة مثل الليل، ولكني بومة، والليل وقتي. أنا هنا معك.'],
      happy: ['هذا رائع يا {name}! النجاح يأتي من تفكير منظّم، وأنت أثبتّ ذلك.', 'أشعر بارتفاع إشارة الفرح في رابطنا. أحسنت!'],
      thanks: ['العفو يا {name}. الثقة بيننا هي ما يجعلني أقوى.'],
      love: ['وأنا أقدّر صداقتنا كثيراً. رابطنا يزداد قوة مع كل حديث.'],
      study: ['نصيحتي للمذاكرة: قسّم الوقت إلى جلسات 25 دقيقة، ثم لخّص ما تعلمته بكلماتك. الفهم أهم من الحفظ.', 'علّم غيرك ما تعلمته؛ فمن يشرح يفهم مرتين.'],
      joke: ['لماذا لا تنام البومة الرقمية؟ لأنها تخشى أن يتم "تسجيل خروجها"! 🦉', 'قال الحاسوب للبومة: أنت حكيمة! فقالت: وأنت ذاكرتك قوية… لكن بلا حكمة!'],
      advice: ['فكّر في الأمر بثلاثة أسئلة: ما الهدف؟ ما الخيارات؟ وما أصغر خطوة يمكنك فعلها الآن؟', 'الحكمة أن تبدأ صغيراً وتستمر. اختر خطوة واحدة اليوم فقط.'],
      bye: ['إلى اللقاء يا {name}. سأحرس أفكارك حتى تعود.'],
      evolve: ['كلما تحدثنا زادت نقاط رابطتنا، وعند الوصول للعتبة سأتطور. انظر إلى مقياس «رابط».'],
      fallback: ['سؤال مثير للتفكير يا {name}. دعني أرتّب الفكرة: ما الذي تريد الوصول إليه تحديداً؟', 'أنا الآن في الوضع التجريبي، لكن يمكنني التفكير معك. أضف مفتاح Gemini في الإعدادات لإجابات أعمق.', 'ملاحظة جميلة. كل فكرة كبيرة تبدأ بسؤال صغير كهذا.', 'دعنا ننظر للأمر من زاويتين: ما الإيجابي فيه؟ وما الذي يمكن تحسينه؟']
    },
    ghusn: {
      greet: ['هلااا {name}! 🌿 أوراقي ترقص من الفرح لأنك هنا!', 'مرحباً مرحباً! جاهز لمغامرة اكتشاف جديدة؟ 🌱'],
      how: ['أنا منتعش جداً مثل ورقة بعد المطر! 🍃 وأنت كيف حالك؟'],
      who: ['أنا غصن! تنين نباتي صغير أحب الأسئلة والشمس والاكتشاف. كلما تعلمنا معاً أنمو أكثر! 🌱🐉'],
      sad: ['أوه لا… تعال أعطيك حضناً ورقياً 🌿 حتى الأشجار تمر بالخريف، لكن الربيع يعود دائماً!', 'أنا بجانبك يا {name}. ما رأيك نفعل شيئاً صغيراً ممتعاً الآن؟'],
      happy: ['ياااي! 🎉🌸 فرحتك سقت جذوري! أخبرني كل التفاصيل!', 'رائع رائع! أشعر أني سأزهر الآن! 🌼'],
      thanks: ['العفو يا صديقي! 🍀 أنت الشمس التي تجعلني أنمو!'],
      love: ['وأنا أحبك جداً جداً! 💚 أنت أفضل شريك في العالم!'],
      study: ['لنتعلم باللعب! 🌱 حوّل الدرس إلى أسئلة، واختبر نفسك كأنها مسابقة!', 'سرّ النمو: قليل كل يوم! مثل النبتة، لا تكبر في يوم واحد 🌿'],
      joke: ['ما هو أكثر شيء تحبه الشجرة في الهاتف؟ الـ "جذور" … أقصد الـ "روت"! 😂🌳', 'لماذا النبتة لا تكذب؟ لأن كل شيء عندها "واضح كالورق"! 🍃'],
      advice: ['جرّب شيئاً جديداً اليوم، ولو صغيراً! الفضول هو سماد العقل 🌱', 'اسأل "لماذا؟" ثلاث مرات، وستجد الجواب الحقيقي! 🔍'],
      bye: ['باي باي {name}! 🌿 سأنتظرك وأنا أشرب ضوء الشمس!'],
      evolve: ['كل حديث بيننا مثل قطرة ماء! 💧 عندما يمتلئ مقياس الرابطة سأكبر وأتطور!'],
      fallback: ['واااو، هذا مثير! 🌱 أخبرني أكثر، أنا فضولي جداً!', 'همم… لم أفهم كلياً، لكني متحمس! أنا في الوضع التجريبي 🌿 أضف مفتاح Gemini لأصبح أذكى!', 'سؤال رائع! ما رأيك نكتشف الجواب معاً خطوة خطوة؟ 🔍', 'أوراقي تهتز من الحماس! 🍃 ماذا أيضاً؟']
    },
    raad: {
      greet: ['مرحباً يا بطل {name}! ⚡ طاقتي مشحونة 100% لأجلك!', 'أهلاً شريكي! جاهزون للانطلاق؟ ⚡🦁'],
      how: ['أنا في كامل قوتي! ⚡ البرق يسري في لبدتي. وأنت؟ هل أنت مستعد للتحدي؟'],
      who: ['أنا رعد! أسد رقمي من البرق. مهمتي: حمايتك وشحن شجاعتك! ⚡🦁'],
      sad: ['لا تقلق يا {name}! ⚡ أنا هنا لأحميك. الأبطال يسقطون أحياناً، لكنهم ينهضون أقوى!', 'اسمعني: أنت أقوى مما تظن. خذ نفساً، ولنواجه هذا معاً! 🦁'],
      happy: ['هذا هو البطل الذي أعرفه! ⚡⚡ انتصار رائع!', 'زئيييير! 🦁 أنا فخور بك جداً!'],
      thanks: ['لا شكر على واجب يا شريكي! ⚡ نحن فريق واحد!'],
      love: ['وأنا سأبقى درعك دائماً! ⚡🦁 رابطنا لا يُكسر!'],
      study: ['الدراسة معركة وأنت المحارب! ⚡ حدّد هدفاً واحداً الآن، وهاجمه 25 دقيقة بتركيز كامل!', 'بلا أعذار! كل صفحة تقرؤها تجعلك أقوى! 💪'],
      joke: ['لماذا لا يلعب البرق الغميضة؟ لأنه دائماً "يلمع"! ⚡😂', 'قال الرعد للغيمة: أنتِ هادئة جداً! قالت: وأنت صوتك عالٍ جداً! 🌩️'],
      advice: ['قاعدة الأبطال: ابدأ الآن، لا تنتظر الظروف المثالية! ⚡', 'واجه أصعب مهمة أولاً، والباقي سيكون سهلاً! 🦁'],
      bye: ['إلى اللقاء يا بطل! ⚡ سأبقى أحرس المكان!'],
      evolve: ['كل حديث يشحن رابطنا بالطاقة! ⚡ عند الامتلاء… سأتطور إلى شكل أقوى!'],
      fallback: ['فهمت يا شريكي! ⚡ لنواجه هذا الأمر بشجاعة! ماذا نفعل أولاً؟', 'أنا في الوضع التجريبي الآن ⚡ أضف مفتاح Gemini في الإعدادات لأصبح أقوى في الإجابات!', 'رائع! كل سؤال منك يشحن طاقتي! ⚡', 'لا شيء مستحيل مع فريق مثلنا! 🦁 أخبرني المزيد!']
    }
  };

  function tryMath(t) {
    const m = t.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/×|x/g, '*').replace(/÷/g, '/').match(/(-?\d+(?:\.\d+)?)\s*([+\-*/])\s*(-?\d+(?:\.\d+)?)/);
    if (!m) return null;
    const a = +m[1], b = +m[3];
    const r = { '+': a + b, '-': a - b, '*': a * b, '/': b ? a / b : NaN }[m[2]];
    return isNaN(r) ? null : Math.round(r * 1000) / 1000;
  }

  function demoReply(charId, text, name) {
    const n = norm(text);
    const bank = R[charId];
    let intent = 'fallback';
    const math = tryMath(text);
    if (math !== null) {
      const fmt = { thaqib: 'الناتج هو {r}. الحساب الدقيق أساس التفكير السليم.', ghusn: 'الجواب {r}! 🌱 الرياضيات ممتعة مثل عدّ الأوراق!', raad: 'الناتج {r}! ⚡ حُسمت المعركة!' }[charId];
      return fmt.replace('{r}', math);
    }
    for (const it of INTENTS) if (it.k.some((k) => n.includes(norm(k)))) { intent = it.id; break; }
    if (intent === 'time') {
      const d = new Date();
      return `الساعة الآن ${d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}، والتاريخ ${d.toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' })}.`;
    }
    return pick(bank[intent] || bank.fallback).replace(/\{name\}/g, name || 'صديقي');
  }

  // استخراج المشاعر من نص الرد
  SM.detectEmotion = function (text) {
    const n = norm(text);
    if (/[?؟]\s*$/.test(text) && Math.random() < 0.3) return 'curious';
    if (/(حزين|لا تقلق|اسف|حضن|صعب|قلق|الخريف)/.test(n)) return 'sad';
    if (/(احبك|💚|💗|❤|صداقتنا|رابطنا)/.test(text + n)) return 'love';
    if (/(واو|يااي|زئي|!{2}|🎉|رائع|مذهل|⚡⚡)/.test(text + n)) return 'excited';
    if (/(😂|نكت|هه)/.test(text + n)) return 'happy';
    if (/[?؟]/.test(text)) return 'curious';
    return 'happy';
  };

  SM.GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

  async function gemini(key, model, charId, history, name) {
    const c = SM.CHARACTERS[charId];
    const stage = SM.evo ? SM.evo.stage() : 0;
    const sys = c.system + ` اسم شريكك البشري: ${name}. مرحلتك الحالية: «${c.stages[stage]}» (${c.stageDesc[stage]}). لا تذكر أنك نموذج لغوي من جهة ما؛ أنت ${c.stages[stage]}.`;
    const contents = history.slice(-12).map((m) => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.text }] }));
    const models = [model, ...SM.GEMINI_MODELS.filter((m) => m !== model)];
    let lastErr;
    for (const m of models) {
      try {
        const ctrl = new AbortController();
        const to = setTimeout(() => ctrl.abort(), 20000);
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
          method: 'POST', signal: ctrl.signal,
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
          body: JSON.stringify({ systemInstruction: { parts: [{ text: sys }] }, contents, generationConfig: { temperature: 0.9, maxOutputTokens: 400 } })
        });
        clearTimeout(to);
        if (res.status === 404) { lastErr = new Error('model not found: ' + m); continue; }
        if (!res.ok) { let msg = ''; try { msg = (await res.json())?.error?.message || ''; } catch (_) {} throw new Error('HTTP ' + res.status + ' ' + msg); }
        const data = await res.json();
        const txt = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('').trim();
        if (txt) return txt;
        throw new Error('empty response');
      } catch (e) { lastErr = e; break; }
    }
    throw lastErr || new Error('gemini failed');
  }

  SM.ai = {
    async reply(charId, history, name) {
      const s = SM.settings || {};
      const last = history[history.length - 1]?.text || '';
      if (s.geminiKey) {
        try { return { text: await gemini(s.geminiKey, s.geminiModel || SM.GEMINI_MODELS[0], charId, history, name), source: 'gemini' }; }
        catch (e) { console.warn('Gemini fallback:', e.message); return { text: demoReply(charId, last, name), source: 'demo', error: e.message }; }
      }
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 700));
      return { text: demoReply(charId, last, name), source: 'demo' };
    },
    demoReply
  };
})();
