/* 庖丁 · 层次分析练习 — app logic (vanilla JS, no build step) */
(function () {
  'use strict';

  const BANK = window.PD_BANK;
  const CONCEPTS = window.PD_CONCEPTS;

  /* ---------------- relations ---------------- */
  const REL = {
    主谓: { zh: '主谓', en: 'Subject–Predicate', roles: ['主', '谓'], n: 2, test: '主语和谓语之间往往能插入“是不是”变成问句；不能插入“的、了、着、得”。' },
    述宾: { zh: '述宾', en: 'Verb–Object', roles: ['述', '宾'], n: 2, test: '述语和宾语之间可以带上“了、着”；不能插入“的”，插入后结构和意思都会改变。' },
    述补: { zh: '述补', en: 'Verb–Complement', roles: ['述', '补'], n: 2, test: '述语和补语之间往往可以插入“得”；补语说明结果、程度、趋向、数量，回答“怎么样”。' },
    定中: { zh: '偏正（定中）', chip: '定中', en: '偏正 · attributive', roles: ['定', '中'], n: 2, test: '中心语是名词性的，前面（英语也可在后面）的修饰语是定语，中间大多可以加“的”。' },
    状中: { zh: '偏正（状中）', chip: '状中', en: '偏正 · adverbial', roles: ['状', '中'], n: 2, test: '中心语是动词或形容词，修饰语是状语，中间大多可以加“地”。' },
    并列: { zh: '并列', en: 'Coordinate', roles: ['并', '列'], repeat: true, test: '两部分地位平等、不分主次，中间可以插入“和、并、与”。' },
    连动: { zh: '连动', en: 'Serial verbs', roles: ['连', '动'], repeat: true, test: '几个动作由同一个主语先后发出，中间没有停顿和关联词。' },
    介宾: { zh: '介宾', en: 'Prep–Object', roles: ['介', '宾'], n: 2, test: '前一部分是介词（在、把、被、朝、关于、with、by、into…）。' },
    方位: { zh: '方位', en: 'Noun + localizer', roles: ['方', '位'], n: 2, test: '后一部分是方位词（上、下、里、中、前、后…）。' },
    数量: { zh: '数量', en: 'Numeral + measure', roles: ['数', '量'], n: 2, test: '数词或指示代词加量词（一个、那辆、五天）。' }
  };
  const REL_ORDER = ['主谓', '述宾', '述补', '定中', '状中', '并列', '连动', '介宾', '方位', '数量'];
  const ALIAS = { 动宾: '述宾', 中补: '述补', 联合: '并列', 连谓: '连动', 偏正定中: '定中', 偏正状中: '状中' };

  const PAIR_HINT = {
    '述宾|述补': '中间能插入“得”的是述补；能带“了、着”、后面是动作对象的是述宾。',
    '定中|状中': '看中心语：名词性的是定中（可加“的”），动词或形容词是状中（可加“地”）。',
    '主谓|定中': '试着插入“是不是”：能插入的是主谓；插入“的”意思不变的才是定中。比较“狐狸狡猾”和“狐狸的狡猾”。',
    '主谓|状中': '前一部分是被陈述的对象，还是只修饰后面的动作？试插“是不是”。',
    '主谓|述宾': '动词在前、对象在后是述宾；名词在前、陈述在后是主谓。',
    '介宾|述宾': '前一部分是介词（在、把、朝、by、with）还是能单独作谓语的动词？',
    '连动|述宾': '后一部分是前一动作的对象，还是同一个人接着做的另一个动作？',
    '连动|并列': '并列的两部分可以调换顺序、可插“和”；连动的动作有先后，不能调换。',
    '并列|定中': '两部分地位平等（可插“和”），还是一个修饰另一个（可插“的”）？',
    '定中|方位': '后一部分是不是方位词（上、里、中、前、后）？',
    '状中|述补': '修饰成分在中心语前是状语；在动词后补充结果、程度的是补语。英语状语常在后面（中｜状）。',
    '定中|述宾': '试插“的”：意思变成“东西本身”的是定中；表示“一种行为”的是述宾。比较“洗衣服”和“洗的衣服”。',
    '定中|数量': '这一块是不是“数词／指示代词 + 量词”？',
    '主谓|述补': '后一部分是在说明主语，还是补充说明前面的动作？中间能插“得”吗？'
  };

  /* ---------------- levels & badges ---------------- */
  const LEVELS = [
    { xp: 0, name: '学徒', q: '始臣之解牛之时，所见无非全牛者。', en: 'When I first began, all I could see was the whole ox.' },
    { xp: 120, name: '族庖', q: '族庖月更刀，折也。', en: 'An ordinary cook changes his knife every month: he hacks.' },
    { xp: 350, name: '良庖', q: '良庖岁更刀，割也。', en: 'A good cook changes his knife every year: he slices.' },
    { xp: 800, name: '庖丁', q: '今臣之刀十九年矣，所解数千牛矣，而刀刃若新发于硎。', en: 'My knife is nineteen years old, yet its edge is as if fresh from the whetstone.' },
    { xp: 1600, name: '游刃有余', q: '以无厚入有间，恢恢乎其于游刃必有余地矣。', en: 'A blade with no thickness enters the spaces, with room to spare.' }
  ];
  const BADGES = [
    { id: 'first', g: '初', name: '初试锋芒', desc: '完成第一句分析', test: s => s.stats.sent >= 1 },
    { id: 'clean5', g: '新', name: '刀刃若新', desc: '累计 5 句零失误', test: s => s.stats.clean >= 5 },
    { id: 'cut50', g: '郤', name: '批郤导窾', desc: '累计一次切对 50 刀', test: s => s.stats.first >= 50 },
    { id: 'sent20', g: '牛', name: '目无全牛', desc: '累计完成 20 句', test: s => s.stats.sent >= 20 },
    { id: 'en5', g: '通', name: '中西贯通', desc: '完成 5 道英文句子', test: s => s.stats.en >= 5 },
    { id: 'boss', g: '游', name: '游刃有余', desc: '辨析挑战零失误', test: s => s.stats.bossPerfect >= 1 },
    { id: 'streak7', g: '志', name: '踌躇满志', desc: '连续 7 天练习', test: s => s.streak.n >= 7 },
    { id: 'review5', g: '温', name: '温故知新', desc: '从错题本消灭 5 题', test: s => s.stats.reviewed >= 5 },
    { id: 'cards', g: '图', name: '了然于胸', desc: '收集全部概念卡', test: s => CONCEPTS.every(c => s.cards[c.id]) }
  ];
  const DAILY_GOAL = 5;
  const ROUND = 5;
  const BOSS_ITEMS = 6;
  const BOSS_TIME = 240;

  /* ---------------- helpers ---------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pad = n => String(n).padStart(2, '0');
  const dstr = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const today = () => dstr(new Date());
  const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dstr(d); };
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const reduceMotion = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- storage ---------------- */
  const KEY = 'paoding-v1';
  const DEF = () => ({ xp: 0, done: {}, mistakes: {}, cards: {}, streak: { n: 0, last: '' }, daily: { date: '', n: 0 }, stats: { nodes: 0, first: 0, sent: 0, en: 0, clean: 0, reviewed: 0, bossBest: 0, bossPerfect: 0 }, badges: {}, rel: {}, conf: {}, log: [], profile: { name: '', cls: '' }, lastExport: 0, device: '', lastOpen: '', inbox: [], inboxSeen: 0 });
  const LOG_MAX = 400;
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const o = JSON.parse(raw); const d = DEF(); return Object.assign(d, o, { stats: Object.assign(d.stats, o.stats || {}), streak: Object.assign(d.streak, o.streak || {}), daily: Object.assign(d.daily, o.daily || {}), profile: Object.assign(d.profile, o.profile || {}) }); }
    } catch (e) { /* storage unavailable */ }
    return DEF();
  }
  let S = load();
  if (!S.device) { S.device = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } }

  /* ---------------- bank index ---------------- */
  const ITEM = {};
  BANK.sets.forEach(set => set.items.forEach(it => { ITEM[it.id] = Object.assign({ setId: set.id }, it); }));
  const setById = id => BANK.sets.find(s => s.id === id);

  /* ---------------- parser ---------------- */
  function lex(s) {
    const out = []; let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (c === '[' || c === ']') { out.push(c); i++; }
      else if (/\s/.test(c)) i++;
      else { let j = i; while (j < s.length && !/[\s[\]]/.test(s[j])) j++; out.push(s.slice(i, j)); i = j; }
    }
    return out;
  }
  function parseTree(src, lang) {
    const toks = lex(src || ''); let p = 0;
    const tokens = []; const errors = [];
    function atom(a) {
      if (a.length > 1 && a[0] === '^') { tokens.push({ segs: [{ t: a.slice(1), dim: true }], glue: 'prev', kind: 'part' }); return { type: 'part' }; }
      if (a.length > 1 && a[a.length - 1] === '^' && a.indexOf('^') === a.length - 1) { tokens.push({ segs: [{ t: a.slice(0, -1), dim: true }], glue: 'next', kind: 'part' }); return { type: 'part' }; }
      const bits = a.split('^');
      const segs = [{ t: bits[0], dim: false }].concat(bits.slice(1).filter(Boolean).map(t => ({ t, dim: true })));
      tokens.push({ segs, glue: null, kind: 'word' });
      return { type: 'leaf', s: tokens.length - 1, e: tokens.length };
    }
    function node() {
      const relTok = toks[p++] || '';
      let rel = relTok, rev = false;
      if (rel.endsWith('*')) { rev = true; rel = rel.slice(0, -1); }
      rel = ALIAS[rel] || rel;
      if (!REL[rel]) errors.push('未知关系「' + relTok + '」');
      const n = { type: 'node', rel, rev, children: [], s: tokens.length, e: 0 };
      while (p < toks.length && toks[p] !== ']') {
        const t = toks[p++];
        if (t === '[') n.children.push(node());
        else { const it = atom(t); if (it.type !== 'part') n.children.push(it); }
      }
      if (toks[p] !== ']') errors.push('缺少「]」'); else p++;
      n.e = tokens.length;
      if (REL[rel]) {
        const k = n.children.length;
        if (k < 2) errors.push('「' + relTok + '」只有 ' + k + ' 个成分');
        else if (REL[rel].n && k !== REL[rel].n) errors.push('「' + REL[rel].zh + '」应有 ' + REL[rel].n + ' 个成分，现有 ' + k + ' 个');
      }
      return n;
    }
    let root = null;
    if (toks[0] !== '[') errors.push('题目必须以「[关系 …」开头');
    else { p = 1; root = node(); while (p < toks.length) { const t = toks[p++]; if (t === '[' || t === ']') { errors.push('最外层后面多出了括号'); break; } const it = atom(t); if (it.type !== 'part') { errors.push('最外层括号外有多余的词「' + t + '」'); } } root.e = tokens.length; }
    const P = { lang: lang === 'en' ? 'en' : 'zh', tokens, root, errors };
    if (root && !errors.length) {
      // boundaries must be real gaps
      walkNodes(root, n => { n.children.slice(1).forEach((c, k) => { if (cutBetween(P, n.children[k], c) < 0) errors.push('「' + spanText(P, c.s, c.e) + '」前面没有可切的位置（虚词粘连）'); }); });
    }
    return P;
  }
  function walkNodes(n, f) { if (!n || n.type !== 'node') return; f(n); n.children.forEach(c => walkNodes(c, f)); }
  function gapOK(P, g) { return g > 0 && g < P.tokens.length && P.tokens[g - 1].glue !== 'next' && P.tokens[g].glue !== 'prev'; }
  function cutBetween(P, a, b) { for (let g = a.e; g <= b.s; g++) if (gapOK(P, g)) return g; return -1; }
  function expCuts(P, n) { return n.children.slice(1).map((c, k) => cutBetween(P, n.children[k], c)); }
  /* bracket spans run cut-to-cut, so particles (的、地、得、and) sit inside the bracket they attach to */
  function brSpans(P, n) { const cuts = expCuts(P, n); const b = [n.s].concat(cuts, [n.e]); return n.children.map((c, k) => [b[k], b[k + 1]]); }
  function bfs(root) { const q = [root], out = []; while (q.length) { const n = q.shift(); out.push(n); n.children.forEach(c => { if (c.type === 'node') q.push(c); }); } return out; }
  function depthMap(root) { const m = new Map(); (function w(n, d) { m.set(n, d); n.children.forEach(c => { if (c.type === 'node') w(c, d + 1); }); })(root, 0); return m; }
  function rolesFor(n) {
    const R = REL[n.rel]; if (!R) return n.children.map(() => '?');
    if (R.repeat) return n.children.map((c, k) => k === 0 ? R.roles[0] : R.roles[1]);
    const roles = R.roles.slice(); if (n.rev) roles.reverse();
    return n.children.map((c, k) => roles[k] || '?');
  }
  function tokHTML(t) { return t.segs.map(s => s.dim ? '<span class="dim">' + esc(s.t) + '</span>' : esc(s.t)).join(''); }
  function tokText(t) { return t.segs.map(s => s.t).join(''); }
  function spanText(P, s, e) { return P.tokens.slice(s, e).map(tokText).join(P.lang === 'en' ? ' ' : ''); }
  function itemText(it) { const P = parseTree(it.tree, it.lang); return spanText(P, 0, P.tokens.length); }

  /* ---------------- diagram ---------------- */
  function diagram(P, opt) {
    opt = opt || {};
    const all = !opt.done; const isDone = n => all || opt.done.has(n);
    const n = P.tokens.length;
    let h = '<div class="dg-wrap"><div class="dg ' + P.lang + '" style="grid-template-columns:repeat(' + n + ',auto)">';
    P.tokens.forEach((t, i) => {
      const inCur = opt.cur && i >= opt.cur.s && i < opt.cur.e;
      h += '<div class="dg-tok' + (inCur ? ' in' : '') + (t.kind === 'part' ? ' part' : '') + '" style="grid-column:' + (i + 1) + ';grid-row:1">' + tokHTML(t) + '</div>';
    });
    if (P.root) (function walk(nd, depth) {
      if (!isDone(nd)) return;
      const roles = rolesFor(nd); const sp = brSpans(P, nd);
      nd.children.forEach((c, k) => {
        const cls = c.type === 'leaf' ? 'leaf' : (isDone(c) ? 'node' : (c === opt.cur ? 'cur' : 'pend'));
        const fresh = opt.fresh === nd ? ' fresh' : '';
        h += '<div class="dg-br ' + cls + fresh + '" style="grid-column:' + (sp[k][0] + 1) + '/' + (sp[k][1] + 1) + ';grid-row:' + (depth + 2) + '"><span class="dg-line"></span><span class="dg-lab">' + esc(roles[k]) + '</span></div>';
        if (c.type === 'node') walk(c, depth + 1);
      });
    })(P.root, 0);
    return h + '</div></div>';
  }

  /* ---------------- progress logic ---------------- */
  function levelOf(xp) { let i = 0; LEVELS.forEach((l, k) => { if (xp >= l.xp) i = k; }); return i; }
  function addXP(n) {
    if (n <= 0) return;
    const before = levelOf(S.xp); S.xp += n; const after = levelOf(S.xp);
    if (after > before) queueOverlay(levelUpHTML(after));
  }
  function touchDay() {
    const t = today();
    if (S.streak.last !== t) { S.streak.n = S.streak.last === yesterday() ? S.streak.n + 1 : 1; S.streak.last = t; }
    if (S.daily.date !== t) { S.daily.date = t; S.daily.n = 0; }
  }
  function streakNow() { return (S.streak.last === today() || S.streak.last === yesterday()) ? S.streak.n : 0; }
  function dailyNow() { return S.daily.date === today() ? S.daily.n : 0; }
  function checkBadges() {
    BADGES.forEach(b => { if (!S.badges[b.id] && b.test(S)) { S.badges[b.id] = today(); queueOverlay(badgeHTML(b)); } });
  }

  /* ---------------- overlay & toast ---------------- */
  const ovQueue = [];
  function queueOverlay(html) { ovQueue.push(html); if (ovQueue.length === 1) showOverlay(); }
  function showOverlay() {
    const ov = $('#ov'); if (!ovQueue.length) { ov.hidden = true; ov.innerHTML = ''; return; }
    ov.innerHTML = '<div class="ov-card" role="dialog" aria-modal="true">' + ovQueue[0] + '<button class="btn primary" id="ov-ok">好</button></div>';
    ov.hidden = false; $('#ov-ok').focus();
    $('#ov-ok').onclick = () => { ovQueue.shift(); showOverlay(); };
  }
  function levelUpHTML(i) { const L = LEVELS[i]; return '<p class="ov-eyebrow">升级 · Level up</p><h2 class="ov-title">' + L.name + '</h2><blockquote class="ov-q">' + L.q + '<span>' + L.en + '</span></blockquote>'; }
  function badgeHTML(b) { return '<p class="ov-eyebrow">获得徽章 · Badge</p><div class="badge big earned"><span>' + b.g + '</span></div><h2 class="ov-title">' + b.name + '</h2><p class="ov-desc">' + b.desc + '</p>'; }
  let toastT;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2200); }

  /* ---------------- header ---------------- */
  function renderHeader() {
    const li = levelOf(S.xp), L = LEVELS[li], N = LEVELS[li + 1];
    const pct = N ? Math.round((S.xp - L.xp) / (N.xp - L.xp) * 100) : 100;
    $('#hd-level').textContent = L.name;
    $('#hd-xp').textContent = S.xp + (N ? ' / ' + N.xp : '') + ' XP';
    $('#hd-bar').style.width = pct + '%';
    $('#hd-streak').textContent = streakNow();
  }

  /* ---------------- routing ---------------- */
  let view = 'home', sess = null, bossTimer = null;
  function go(v, arg) {
    if (bossTimer) { clearInterval(bossTimer); bossTimer = null; }
    view = v;
    document.body.dataset.view = v;
    document.querySelectorAll('#nav a').forEach(a => a.setAttribute('aria-current', a.dataset.v === v || (v === 'card' && a.dataset.v === 'learn') || ((v === 'teacher' || v === 'review' || v === 'report') && a.dataset.v === 'me') ? 'page' : 'false'));
    const m = $('#main');
    if (v === 'home') m.innerHTML = homeHTML(), bindHome();
    else if (v === 'learn') m.innerHTML = learnHTML(), bindLearn();
    else if (v === 'card') m.innerHTML = cardHTML(arg), bindCard(arg);
    else if (v === 'me') m.innerHTML = meHTML(), bindMe();
    else if (v === 'review') m.innerHTML = reviewHTML(), bindReview();
    else if (v === 'teacher') m.innerHTML = teacherHTML(), bindTeacher();
    else if (v === 'report') m.innerHTML = reportHTML(), bindReport();
    else if (v === 'practice') renderPractice();
    renderHeader();
    if (v !== 'practice') window.scrollTo(0, 0);
    try { const h = ['learn', 'me', 'teacher'].includes(v) ? '#' + v : ''; history.replaceState(null, '', location.pathname + location.search + h); } catch (e) { /* ignore */ }
  }


  /* ---------------- mastery & recommendations ---------------- */
  const relInfo = {};
  function itemRels(it) {
    if (relInfo[it.id]) return relInfo[it.id];
    const P = parseTree(it.tree, it.lang), cnt = {}; let nodes = 0;
    if (P.root) walkNodes(P.root, nd => { cnt[nd.rel] = (cnt[nd.rel] || 0) + 1; nodes++; });
    return (relInfo[it.id] = { cnt, nodes });
  }
  function mastery(r) { const st = S.rel[r]; if (!st || !st.h.length) return null; return st.h.reduce((a, b) => a + b, 0) / st.h.length; }
  function weakness(r) { const st = S.rel[r]; if (!st || !st.h.length) return 0.55; const h = st.h; return 1 - (h.reduce((a, b) => a + b, 0) + 1) / (h.length + 2); }
  function weakRels(k) { return REL_ORDER.filter(r => S.rel[r] && S.rel[r].h.length >= 1).map(r => ({ r, m: mastery(r) })).filter(x => x.m < 0.8).sort((a, b) => a.m - b.m).slice(0, k); }
  function targetSize() {
    const clean = S.log.filter(e => e.c && e.m !== 'boss').slice(-8).map(e => e.n.length);
    if (!clean.length) return S.stats.sent ? 2 : 1;
    clean.sort((a, b) => a - b); return clean[Math.floor(clean.length / 2)] + 1;
  }
  function recommend(k) {
    k = k || ROUND;
    const pool = BANK.sets.filter(s => !s.boss).flatMap(s => s.items);
    if (!S.stats.nodes) return { ids: (setById('phrase') || BANK.sets[0]).items.slice(0, k).map(i => i.id), why: {}, first: true };
    const tgt = targetSize();
    const recent = new Set(S.log.slice(-15).map(e => e.id));
    const scored = pool.map(it => {
      const info = itemRels(it);
      let w = 0; Object.keys(info.cnt).forEach(r => { w += info.cnt[r] * weakness(r); });
      w = w / info.nodes * 4;
      let nov = S.done[it.id] ? (S.mistakes[it.id] ? 0.8 : -1.5) : 1.2;
      if (recent.has(it.id)) nov -= 2;
      const fit = -0.3 * Math.abs(info.nodes - tgt);
      return { it, score: w + nov + fit + Math.random() * 0.4 };
    }).sort((a, b) => b.score - a.score);
    const ids = scored.slice(0, k).map(x => x.it.id);
    const why = {};
    ids.forEach(id => {
      const c = itemRels(ITEM[id]).cnt;
      why[id] = Object.keys(c).sort((a, b) => weakness(b) - weakness(a)).slice(0, 2).map(r => REL[r].chip || REL[r].zh);
    });
    return { ids, why, tgt };
  }
  function startRec() { const R = recommend(); startSession({ mode: 'rec', ids: R.ids, title: '为你推荐' }); }
  function recHTML() {
    const W = weakRels(3);
    let body;
    if (!S.stats.nodes) body = '<p class="rec-d">还没有练习记录。先从五大关系热身开始，系统会根据你的表现推荐题目。</p>';
    else if (!W.length) body = '<p class="rec-d">各种关系都掌握得不错。推荐几句更长、更难的句子来挑战你。</p>';
    else body = '<p class="rec-d">根据你最近的作答，这几种关系还需要多练：</p><div class="rec-chips">' + W.map(x => '<span class="mchip ' + mcls(x.m) + '">' + esc(REL[x.r].chip || REL[x.r].zh) + ' <b>' + Math.round(x.m * 100) + '%</b></span>').join('') + '</div>';
    return '<section class="rec"><div class="daily-head"><p class="eyebrow">为你推荐 · For you</p></div>' + body + '<button class="btn primary" id="rec-go">开始推荐练习（' + ROUND + ' 句）</button></section>';
  }
  const mcls = m => m == null ? 'none' : m < 0.6 ? 'low' : m < 0.8 ? 'mid' : 'high';
  function masteryHTML() {
    const rows = REL_ORDER.map(r => {
      const m = mastery(r), st = S.rel[r];
      return '<div class="mrow"><span class="mrow-l">' + esc(REL[r].chip || REL[r].zh) + '</span><span class="mbar"><i class="' + mcls(m) + '" style="width:' + (m == null ? 0 : Math.round(m * 100)) + '%"></i></span><span class="mrow-v">' + (m == null ? '未练' : Math.round(m * 100) + '%') + '</span><span class="mrow-n">' + (st ? st.n : 0) + ' 次</span></div>';
    }).join('');
    const conf = Object.entries(S.conf).sort((a, b) => b[1] - a[1]).slice(0, 4);
    return '<h2 class="sec-title">掌握程度 <span>Mastery</span></h2><p class="page-sub">每种关系最近 20 次的一次答对率（不用提示、不看答案、一次切对并选对）。</p><div class="mastery">' + rows + '</div>' +
      (conf.length ? '<p class="conf-t">常见混淆</p><ul class="conf">' + conf.map(([k, v]) => { const [a, b] = k.split('>'); return '<li>把 <b>' + esc(REL[b] ? (REL[b].chip || REL[b].zh) : b) + '</b> 判断成 ' + esc(REL[a] ? (REL[a].chip || REL[a].zh) : a) + ' <span>×' + v + '</span></li>'; }).join('') + '</ul>' : '');
  }

  /* ---------------- home ---------------- */
  function dailyItem() {
    const pool = ['simple', 'long', 'english'].flatMap(id => (setById(id) || { items: [] }).items);
    if (!pool.length) return null;
    const t = today().replace(/-/g, ''); let h = 0; for (const c of t) h = (h * 31 + c.charCodeAt(0)) % 9973;
    return pool[h % pool.length];
  }
  function setProgress(set) { const d = set.items.filter(i => S.done[i.id]).length; return { d, n: set.items.length }; }
  function homeHTML() {
    const di = dailyItem();
    const dn = dailyNow(); const ring = Math.min(dn / DAILY_GOAL, 1);
    const C = 2 * Math.PI * 22;
    const mcount = Object.keys(S.mistakes).filter(id => ITEM[id]).length;
    const sets = BANK.sets.filter(s => !s.boss);
    const boss = BANK.sets.find(s => s.boss);
    let daily = '';
    if (di) {
      const P = parseTree(di.tree, di.lang);
      let line = '';
      P.tokens.forEach((t, i) => { line += '<span>' + tokHTML(t) + '</span>'; if (i < P.tokens.length - 1) line += gapOK(P, i + 1) ? '<i class="tick" aria-hidden="true"></i>' : (P.lang === 'en' ? ' ' : ''); });
      daily = '<section class="daily"><div class="daily-head"><p class="eyebrow">今日一句 · Sentence of the day</p>' + (S.done[di.id] ? '<span class="chip ok">已完成</span>' : '') + '</div><p class="daily-line ' + P.lang + '">' + line + '</p><button class="btn primary" data-start-item="' + di.id + '">开始切分</button></section>';
    }
    return '<section class="hero">' +
      '<div class="hero-text"><h1 class="brand">庖丁<span>层次分析练习</span></h1>' +
      '<blockquote class="motto">依乎天理，批大郤，导大窾，因其固然。<span>Follow the natural grain; strike the large gaps; guide the blade through the openings. 《庄子·养生主》</span></blockquote></div>' +
      '<div class="goal"><svg viewBox="0 0 52 52" width="72" height="72" aria-hidden="true"><circle cx="26" cy="26" r="22" class="ring-bg"/><circle cx="26" cy="26" r="22" class="ring-fg" stroke-dasharray="' + (C * ring).toFixed(1) + ' ' + C.toFixed(1) + '" transform="rotate(-90 26 26)"/></svg><div class="goal-num"><b>' + dn + '</b>/' + DAILY_GOAL + '</div><p>今日目标</p></div>' +
      '</section>' + daily + recHTML() +
      (BANK.meta && BANK.meta.sample ? '<p class="sample-note">' + esc(BANK.meta.label) + '</p>' : '') +
      '<h2 class="sec-title">练习 <span>Practice</span></h2><div class="modes">' +
      sets.map(s => { const pr = setProgress(s); return '<button class="mode" data-set="' + s.id + '"><span class="mode-t">' + esc(s.title) + '</span><span class="mode-en">' + esc(s.en) + '</span><span class="mode-d">' + esc(s.desc) + '</span><span class="meter" aria-label="完成 ' + pr.d + ' / ' + pr.n + '"><i style="width:' + (pr.n ? pr.d / pr.n * 100 : 0) + '%"></i></span><span class="mode-n">' + pr.d + ' / ' + pr.n + '</span></button>'; }).join('') +
      '</div><div class="modes two">' +
      (boss ? '<button class="mode boss" data-boss="1"><span class="mode-t">' + esc(boss.title) + '</span><span class="mode-en">' + esc(boss.en) + '</span><span class="mode-d">' + BOSS_ITEMS + ' 句 · 限时 ' + (BOSS_TIME / 60) + ' 分钟 · 连击加分</span><span class="mode-n">最高分 ' + (S.stats.bossBest || 0) + '</span></button>' : '') +
      '<button class="mode" data-review="1"><span class="mode-t">错题本</span><span class="mode-en">Review</span><span class="mode-d">做错过的句子会回到这里，零失误完成即可消灭</span><span class="mode-n">' + mcount + ' 题待复习</span></button>' +
      '</div>';
  }
  function bindHome() {
    const m = $('#main');
    m.querySelectorAll('[data-set]').forEach(b => b.onclick = () => startSet(b.dataset.set));
    m.querySelectorAll('[data-start-item]').forEach(b => b.onclick = () => startSession({ mode: 'single', ids: [b.dataset.startItem], title: '今日一句' }));
    const bb = m.querySelector('[data-boss]'); if (bb) bb.onclick = startBoss;
    const rv = m.querySelector('[data-review]'); if (rv) rv.onclick = () => go('review');
    const rg = $('#rec-go'); if (rg) rg.onclick = startRec;
  }
  function startSet(id) {
    const set = setById(id); if (!set) return;
    const undone = set.items.filter(i => !S.done[i.id]);
    const pool = undone.length ? undone : shuffle(set.items);
    startSession({ mode: 'practice', ids: pool.slice(0, ROUND).map(i => i.id), title: set.title });
  }

  /* ---------------- learn ---------------- */
  function learnHTML() {
    const got = CONCEPTS.filter(c => S.cards[c.id]).length;
    return '<h1 class="page-title">概念卡 <span>Concept cards</span></h1><p class="page-sub">读懂一张卡，答对小测，就能把它收进卡册。已收集 <b>' + got + '</b> / ' + CONCEPTS.length + '</p>' +
      '<div class="cards">' + CONCEPTS.map(c => { const has = S.cards[c.id]; const roles = c.rel ? REL[c.rel].roles.join('｜') : (c.id === 'ic' ? '总' : c.id === 'rules' ? '法' : '比'); return '<button class="ccard' + (has ? ' got' : '') + '" data-card="' + c.id + '"><span class="ccard-glyph">' + esc(roles) + '</span><span class="ccard-t">' + esc(c.title) + '</span><span class="ccard-en">' + esc(c.en) + '</span><span class="ccard-s">' + (has ? '已收集' : '未收集') + '</span></button>'; }).join('') + '</div>';
  }
  function bindLearn() { $('#main').querySelectorAll('[data-card]').forEach(b => b.onclick = () => go('card', b.dataset.card)); }
  function cardHTML(id) {
    const c = CONCEPTS.find(x => x.id === id); if (!c) return '';
    const idx = CONCEPTS.indexOf(c);
    return '<button class="back" data-back>‹ 概念卡</button><article class="concept"><p class="eyebrow">概念卡 ' + (idx + 1) + ' / ' + CONCEPTS.length + '</p><h1 class="page-title">' + esc(c.title) + ' <span>' + esc(c.en) + '</span></h1><div class="prose">' + c.body + '</div>' +
      (c.examples || []).map(ex => { const P = parseTree(ex.tree, ex.lang); return '<figure class="ex">' + diagram(P) + (ex.cap ? '<figcaption>' + esc(ex.cap) + '</figcaption>' : '') + '</figure>'; }).join('') +
      '<section class="quiz"><h2 class="sec-title">小测 <span>Quick check</span></h2>' +
      c.quiz.map((q, qi) => '<fieldset class="q" data-q="' + qi + '"><legend>' + (qi + 1) + '. ' + esc(q.q) + '</legend>' + q.opts.map((o, oi) => '<button class="opt" data-o="' + oi + '">' + esc(o) + '</button>').join('') + '<p class="q-fb" aria-live="polite"></p></fieldset>').join('') +
      '<p class="collect" aria-live="polite">' + (S.cards[c.id] ? '这张卡已经收进卡册。' : '') + '</p></section>' +
      '<div class="card-nav">' + (idx > 0 ? '<button class="btn" data-goto="' + CONCEPTS[idx - 1].id + '">‹ 上一张</button>' : '<span></span>') + (idx < CONCEPTS.length - 1 ? '<button class="btn" data-goto="' + CONCEPTS[idx + 1].id + '">下一张 ›</button>' : '<button class="btn primary" data-practice>去练习 ›</button>') + '</div></article>';
  }
  function bindCard(id) {
    const c = CONCEPTS.find(x => x.id === id); const m = $('#main');
    m.querySelector('[data-back]').onclick = () => go('learn');
    m.querySelectorAll('[data-goto]').forEach(b => b.onclick = () => go('card', b.dataset.goto));
    const pr = m.querySelector('[data-practice]'); if (pr) pr.onclick = () => go('home');
    const right = new Set();
    m.querySelectorAll('.q').forEach(fs => {
      const qi = +fs.dataset.q, q = c.quiz[qi];
      fs.querySelectorAll('.opt').forEach(b => b.onclick = () => {
        const oi = +b.dataset.o;
        fs.querySelectorAll('.opt').forEach(x => x.classList.remove('right', 'wrong'));
        if (oi === q.a) { b.classList.add('right'); fs.querySelector('.q-fb').textContent = '对了。'; right.add(qi); }
        else { b.classList.add('wrong'); fs.querySelector('.q-fb').textContent = '再想想，回到上面的说明找找线索。'; right.delete(qi); }
        if (right.size === c.quiz.length && !S.cards[c.id]) {
          S.cards[c.id] = today(); addXP(20); checkBadges(); save(); renderHeader(); track({ type: 'card', item: c.id });
          m.querySelector('.collect').innerHTML = '<span class="chip ok">已收进卡册 +20 XP</span>';
        }
      });
    });
  }

  /* ---------------- practice session ---------------- */
  function startSession(o) {
    sess = { mode: o.mode, ids: o.ids, title: o.title, idx: 0, xpGain: 0, results: [], score: 0, combo: 0, bestCombo: 0, bossMistakes: 0, timeLeft: BOSS_TIME, over: false };
    loadItem();
    go('practice');
    if (sess.mode === 'boss') {
      bossTimer = setInterval(() => {
        if (!sess || sess.over || !$('#ask').hidden) return;
        sess.timeLeft--; const el = $('#pv-timer'); if (el) { el.textContent = fmtTime(sess.timeLeft); el.classList.toggle('low', sess.timeLeft <= 30); }
        if (sess.timeLeft <= 0) endBoss(true);
      }, 1000);
    }
  }
  function startBoss() {
    const set = BANK.sets.find(s => s.boss); if (!set) return;
    startSession({ mode: 'boss', ids: shuffle(set.items).slice(0, BOSS_ITEMS).map(i => i.id), title: set.title });
  }
  function fmtTime(s) { s = Math.max(0, s); return Math.floor(s / 60) + ':' + pad(s % 60); }
  function loadItem() {
    const it = ITEM[sess.ids[sess.idx]];
    const P = parseTree(it.tree, it.lang);
    Object.assign(sess, { item: it, P, queue: bfs(P.root), qi: 0, done: new Set(), depth: depthMap(P.root), cuts: new Set(), rel: null, tries: 0, hint: false, revealed: false, itemMistakes: 0, itemXP: 0, itemHints: 0, finished: false, fb: null, fresh: null, nlog: [], curLog: null, relWrong: 0 });
  }
  const curNode = () => sess.queue[sess.qi];

  function renderPractice() {
    const m = $('#main'); const it = sess.item, P = sess.P, n = curNode();
    const boss = sess.mode === 'boss';
    let top = '<header class="pv-top"><button class="back" id="pv-quit">‹ 结束</button><div class="pv-prog"><b>' + esc(sess.title) + '</b> · 第 ' + (sess.idx + 1) + ' / ' + sess.ids.length + ' 题</div>';
    top += boss ? '<div class="pv-boss"><span id="pv-timer" class="timer' + (sess.timeLeft <= 30 ? ' low' : '') + '">' + fmtTime(sess.timeLeft) + '</span><span class="score">' + sess.score + ' 分</span>' + (sess.combo >= 2 ? '<span class="combo">连击 ×' + sess.combo + '</span>' : '') + '</div>' : '<div class="pv-xp">+' + sess.xpGain + ' XP</div>';
    top += '</header>';
    const dots = '<div class="pv-dots" aria-hidden="true">' + sess.ids.map((_, i) => '<i class="' + (i < sess.idx ? (sess.results[i] && sess.results[i].clean ? 'ok' : 'done') : i === sess.idx ? 'now' : '') + '"></i>').join('') + '</div>';
    const gloss = it.gloss ? '<p class="gloss"><span>按这个意思切分</span>' + esc(it.gloss) + '</p>' : '';
    const mean = it.mean ? '<p class="mean"><span>' + (it.lang === 'en' ? '中文意思' : 'Meaning') + '</span>' + esc(it.mean) + '<small>' + (it.lang === 'en' ? '只帮助理解句意，切分仍按英文结构。' : '英文只帮助理解句意，切分仍按中文结构。') + '</small></p>' : '';
    let body = '<div class="pv-sentence">' + diagram(P, { done: sess.done, cur: sess.finished ? null : n, fresh: sess.fresh }) + mean + '</div>';
    body += sess.finished ? finishHTML() : cutterHTML();
    m.innerHTML = '<section class="pv">' + top + dots + gloss + body + '</section>';
    bindPractice();
  }
  function cutterHTML() {
    const P = sess.P, n = curNode(), boss = sess.mode === 'boss';
    const layer = sess.depth.get(n) + 1;
    let cut = '';
    for (let i = n.s; i < n.e; i++) {
      const t = P.tokens[i];
      cut += '<span class="ct-tok' + (t.kind === 'part' ? ' part' : '') + '">' + tokHTML(t) + '</span>';
      if (i < n.e - 1) {
        const g = i + 1;
        if (gapOK(P, g)) {
          const on = sess.cuts.has(g);
          const cls = sess.revealed ? (on ? ' cut reveal' : '') : (on ? ' cut' : '');
          cut += '<button class="gap' + cls + '" data-g="' + g + '" aria-pressed="' + on + '" aria-label="在「' + esc(tokText(P.tokens[i])) + '」和「' + esc(tokText(P.tokens[g])) + '」之间切一刀"' + (sess.revealed ? ' disabled' : '') + '></button>';
        } else if (P.lang === 'en') cut += '<span class="sp"> </span>';
      }
    }
    const rels = REL_ORDER.map(r => '<button class="rel' + (sess.rel === r ? ' on' : '') + '" data-rel="' + r + '" aria-pressed="' + (sess.rel === r) + '"' + (sess.revealed ? ' disabled' : '') + '><b>' + (REL[r].chip || REL[r].zh) + '</b><small>' + REL[r].en + '</small></button>').join('');
    const fb = sess.fb ? '<div class="fb ' + sess.fb.kind + '">' + sess.fb.html + '</div>' : '';
    let actions = '';
    if (sess.revealed) actions = '<button class="btn primary" id="pv-next-node">明白了，继续</button>';
    else {
      if (!boss) actions += '<button class="btn ghost" id="pv-hint"' + (sess.hint ? ' disabled' : '') + '>提示</button>';
      if (!boss && sess.tries >= 2) actions += '<button class="btn ghost" id="pv-reveal">看答案</button>';
      actions += '<button class="btn primary" id="pv-submit">确认这一刀</button>';
    }
    const askLink = askOn() && sess.fb && sess.fb.kind !== 'ok' ? '<button class="ask-inline" id="pv-ask">有疑问？问老师</button>' : '';
    return '<div class="cutter-card"><p class="ct-label"><span class="layer">第 ' + layer + ' 层</span>点击词语之间的空隙下刀' + (n.children.length > 2 ? '' : '') + '</p>' +
      '<div class="cutter ' + P.lang + '" role="group" aria-label="切分区">' + cut + '</div>' +
      '<p class="ct-label">再判断切出的部分是什么关系</p><div class="rels">' + rels + '</div>' +
      '<div aria-live="polite">' + fb + askLink + '</div><div class="actions">' + actions + '</div></div>';
  }
  function bindPractice() {
    const m = $('#main');
    $('#pv-quit').onclick = () => { if (sess.mode === 'boss' && !sess.over) endBoss(false); else go('home'); };
    m.querySelectorAll('.gap').forEach(b => b.onclick = () => {
      const g = +b.dataset.g; if (sess.cuts.has(g)) sess.cuts.delete(g); else sess.cuts.add(g);
      b.classList.toggle('cut'); b.setAttribute('aria-pressed', sess.cuts.has(g));
    });
    m.querySelectorAll('.rel').forEach(b => b.onclick = () => {
      sess.rel = b.dataset.rel;
      m.querySelectorAll('.rel').forEach(x => { const on = x.dataset.rel === sess.rel; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
    });
    const sb = $('#pv-submit'); if (sb) sb.onclick = submit;
    const hb = $('#pv-hint'); if (hb) hb.onclick = hint;
    const rb = $('#pv-reveal'); if (rb) rb.onclick = reveal;
    const nb = $('#pv-next-node'); if (nb) nb.onclick = () => advanceNode(0);
    const pa = $('#pv-ask'); if (pa) pa.onclick = openAsk;
    m.querySelectorAll('[data-act]').forEach(b => b.onclick = () => finishAction(b.dataset.act));
  }

  /* ---------------- attempt log & targeted feedback ---------------- */
  function nodeLog() {
    if (!sess.curLog) {
      const n = curNode(), P = sess.P, sp = brSpans(P, n), roles = rolesFor(n);
      sess.curLog = { rel: n.rel, layer: sess.depth.get(n) + 1, seg: spanText(P, n.s, n.e), ans: n.children.map((c, k) => spanText(P, sp[k][0], sp[k][1]) + '(' + roles[k] + ')').join('｜'), tries: [], hint: false, reveal: false };
    }
    return sess.curLog;
  }
  function segTexts(P, n, cuts) { const b = [n.s].concat([...cuts].sort((x, y) => x - y), [n.e]); return b.slice(0, -1).map((a, i) => spanText(P, a, b[i + 1])); }
  function unitSpans(P) {
    const set = new Set();
    (function w(nd) { set.add(nd.s + '-' + nd.e); const sp = brSpans(P, nd); nd.children.forEach((c, k) => { set.add(sp[k][0] + '-' + sp[k][1]); set.add(c.s + '-' + c.e); if (c.type === 'node') w(c); }); })(P.root);
    return set;
  }
  function ownerOf(P, from, g) { // the descendant node whose own layer contains cut g
    let hit = null;
    (function w(nd) { if (hit) return; if (nd !== from && expCuts(P, nd).includes(g)) { hit = nd; return; } nd.children.forEach(c => { if (c.type === 'node' && c.s < g && g < c.e + 1) w(c); }); })(from);
    return hit;
  }
  const q = t => '「' + esc(t) + '」';
  function explainCuts(n, sel) {
    const P = sess.P, exp = expCuts(P, n), E = new Set(exp), sp = brSpans(P, n);
    const cuts = [...sel].sort((a, b) => a - b);
    const extra = cuts.filter(g => !E.has(g)), missing = exp.filter(g => !sel.has(g));
    const out = [];
    extra.forEach(g => {
      const k = sp.findIndex(([a, b]) => a < g && g < b); if (k < 0) return;
      const unit = spanText(P, sp[k][0], sp[k][1]);
      const own = ownerOf(P, n, g);
      let m = '你在' + q(spanText(P, sp[k][0], g)) + '和' + q(spanText(P, g, sp[k][1])) + '之间下了刀，切进了' + q(unit) + '的内部。在这一层，' + q(unit) + '是一个整体';
      if (own) { const lay = sess.depth.get(own) + 1, roles = rolesFor(own); m += '，这一刀要到<b>第 ' + lay + ' 层</b>才切（' + roles.join('｜') + '）。先切大块，再切小块。'; }
      else m += '，不能切开。';
      out.push(m);
    });
    // pieces the student produced that are not real units
    const units = unitSpans(P);
    const b = [n.s].concat(cuts, [n.e]);
    for (let i = 0; i < b.length - 1 && out.length < 3; i++) {
      const a = b[i], e = b[i + 1];
      if (units.has(a + '-' + e)) continue;
      const over = n.children.map((c, k) => k).filter(k => sp[k][0] < e && sp[k][1] > a);
      const broken = over.filter(k => sp[k][0] < a || sp[k][1] > e);
      if (over.length > 1 && broken.length) {
        out.push(q(spanText(P, a, e)) + '不是一个结构单位：它横跨了' + over.map(k => q(spanText(P, sp[k][0], sp[k][1]))).join('和') + '，又把' + broken.map(k => q(spanText(P, sp[k][0], sp[k][1]))).join('、') + '拆开了，结构上不能成立。');
      }
    }
    if (missing.length && !extra.length) {
      missing.forEach(g => {
        const i = b.findIndex((x, j) => j < b.length - 1 && x < g && g < b[j + 1]);
        const piece = spanText(P, b[i], b[i + 1]);
        let m = '你切出的' + q(piece) + '里还包含两个直接成分，在这一层就要分开';
        if (sess.tries >= 2) m += '：分界线在' + q(spanText(P, b[i], g)) + '和' + q(spanText(P, g, b[i + 1])) + '之间。';
        else m += '。想一想：它里面哪两块是直接组合的？';
        out.push(m);
      });
    }
    if (!out.length) out.push('切的位置不对。切开后，每一部分都要能单独成立，意思也要和原句一致。');
    return '<ul class="fb-list">' + out.map(x => '<li>' + x + '</li>').join('') + '</ul>';
  }
  const strip = t => t.replace(/[的地得了着]$/, '');
  const ends = (t, ch) => ch.includes(t.slice(-1));
  const WHYNOT = {
    主谓: (A, B, zh) => zh ? '主语和谓语之间能插入“是不是”。读一读：' + q(A + '是不是' + B) + '——说得通吗？主语要是被陈述的对象。' : '主谓要求' + q(A) + '是被陈述的对象（主语），' + q(B) + '是对它的陈述（谓语）。' + q(A) + '能当主语吗？',
    述宾: (A, B, zh) => zh && !ends(A, '了着') ? '述语和宾语之间能带“了”。读一读：' + q(A + '了' + B) + '——说得通吗？' + q(B) + '应该是' + q(A) + '这个动作支配的对象。' : '述宾要求' + q(A) + '是动作，' + q(B) + '是这个动作直接支配的对象。' + q(B) + '是' + q(A) + '的对象吗？',
    述补: (A, B, zh) => zh && !ends(A, '得') ? '述补之间往往能插入“得”。读一读：' + q(A + '得' + B) + '——说得通吗？补语要说明动作的结果、程度或趋向。' : '述补要求' + q(B) + '补充说明' + q(A) + '的结果、程度或趋向（英语为补足语）。',
    定中: (A, B, zh) => zh && !ends(A, '的') ? '定语和中心语之间大多能加“的”。读一读：' + q(A + '的' + B) + '——意思还一样吗？中心语' + q(B) + '必须是名词性的。' : '定中要求中心语是名词性的，另一部分修饰它。' + (zh ? q(B) + '是名词性的吗？' : '这里有名词性的中心语吗？'),
    状中: (A, B, zh) => zh && !ends(A, '地') ? '状语和中心语之间大多能加“地”。读一读：' + q(strip(A) + '地' + B) + '——说得通吗？中心语' + q(B) + '必须是动词或形容词。' : '状中要求中心语是动词或形容词，另一部分修饰它。' + (zh ? q(B) + '是动词或形容词吗？' : ''),
    并列: (A, B, zh) => zh ? '并列的两部分地位平等，能插“和”、能互换。读一读：' + q(B + '和' + A) + '——意思还一样吗？' : '并列要求两部分地位平等，可以互换位置。' + q(A) + '和' + q(B) + '是平等的吗？',
    连动: (A, B) => '连动要求' + q(A) + '和' + q(B) + '都是动作，而且是同一个主语先后做的。是这样吗？',
    介宾: (A) => '介宾要求' + q(A) + '是介词（在、把、朝、被、by、with……）。' + q(A) + '是介词吗？',
    方位: (A, B) => '方位要求' + q(B) + '是方位词（上、里、中、前、后……）。' + q(B) + '是方位词吗？',
    数量: (A, B) => '数量要求' + q(A) + '是数词或“这、那”，' + q(B) + '是量词。这里是吗？'
  };
  const ACTUAL = {
    主谓: (A, B) => '实际上，「' + A + '」是被陈述的对象，「' + B + '」说明它怎么样或做什么。',
    述宾: (A, B) => '实际上，「' + A + '」是动作，「' + B + '」是它支配的对象。',
    述补: (A, B) => '实际上，「' + B + '」补充说明「' + A + '」的结果、程度、趋向或数量。',
    定中: (A, B, rev) => rev ? '实际上，「' + B + '」放在后面，修饰名词性的「' + A + '」（中｜定）。' : '实际上，「' + A + '」修饰名词性的中心语「' + B + '」。',
    状中: (A, B, rev) => rev ? '实际上，「' + B + '」放在后面，修饰「' + A + '」（中｜状）。' : '实际上，「' + A + '」修饰动词或形容词「' + B + '」。',
    并列: (A, B) => '实际上，「' + A + '」和「' + B + '」地位平等，不分主次。',
    连动: (A, B) => '实际上，「' + A + '」和「' + B + '」是同一个主语先后做的动作。',
    介宾: (A, B) => '实际上，「' + A + '」是介词，「' + B + '」是它的宾语。',
    方位: (A, B) => '实际上，「' + B + '」是方位词，附在「' + A + '」后面。',
    数量: (A, B) => '实际上，「' + A + '」是数词或指示词，「' + B + '」是量词。'
  };
  function explainRel(picked, n, deep) {
    const P = sess.P, sp = brSpans(P, n);
    const A = spanText(P, sp[0][0], sp[0][1]), B = spanText(P, sp[1][0], sp[1][1]);
    let h = '<p>为什么不是“' + REL[picked].zh + '”？' + WHYNOT[picked](A, B, P.lang === 'zh') + '</p>';
    if (deep) h += '<p>' + esc(ACTUAL[n.rel](A, B, n.rev)) + '</p>';
    else h += '<p class="fb-note">再看看' + q(A) + '和' + q(B) + '之间到底是什么关系。</p>';
    return h;
  }

  function submit() {
    const n = curNode(), P = sess.P;
    if (!sess.cuts.size) { setFb('info', '先在词语之间点一下，切出这一层的直接成分。'); return; }
    if (!sess.rel) { setFb('info', '切好了，再从下面选出结构关系。'); return; }
    const exp = new Set(expCuts(P, n));
    const extra = [...sess.cuts].filter(g => !exp.has(g)), missing = [...exp].filter(g => !sess.cuts.has(g));
    const cutsOK = !extra.length && !missing.length, relOK = sess.rel === n.rel;
    sess.tries++;
    const err = cutsOK ? (relOK ? 'ok' : 'rel') : (extra.length && !missing.length ? 'extra' : (!extra.length ? 'missing' : 'wrong'));
    nodeLog().tries.push({ cut: segTexts(P, n, sess.cuts).join('｜'), rel: sess.rel, err });
    if (cutsOK && relOK) {
      let pts;
      if (sess.mode === 'boss') {
        if (sess.tries === 1) { sess.combo++; sess.bestCombo = Math.max(sess.bestCombo, sess.combo); pts = 10 * (1 + Math.floor(sess.combo / 3)); } else { sess.combo = 0; pts = 3; }
        sess.score += pts;
      } else pts = sess.tries === 1 ? (sess.hint ? 6 : 10) : 3;
      S.stats.nodes++; if (sess.tries === 1 && !sess.hint) S.stats.first++;
      advanceNode(pts);
      return;
    }
    sess.itemMistakes++; if (sess.mode === 'boss') { sess.combo = 0; sess.bossMistakes++; }
    if (err === 'rel') { S.conf[sess.rel + '>' + n.rel] = (S.conf[sess.rel + '>' + n.rel] || 0) + 1; sess.relWrong++; }
    let html;
    if (!cutsOK) html = explainCuts(n, sess.cuts) + (relOK ? '<p class="fb-note">关系先不评，切对了再看。</p>' : '');
    else html = '<p><b>切对了！</b>但关系不对。</p>' + explainRel(sess.rel, n, sess.relWrong >= 2);
    if (sess.mode === 'boss' && sess.tries >= 2) { reveal(); return; }
    if (sess.mode !== 'boss' && sess.tries === 2) html += '<p class="fb-note">实在想不出，可以点“看答案”。</p>';
    setFb('err', html);
  }
  function setFb(kind, html) { sess.fb = { kind, html }; renderPractice(); }
  function hint() {
    const n = curNode(); sess.hint = true; sess.itemHints++; nodeLog().hint = true;
    const parts = n.children.length;
    let h = '这一层要切成 <b>' + parts + '</b> 段（' + (parts - 1) + ' 刀）。';
    if (sess.qi === 0 && sess.item.hint) h += ' ' + esc(sess.item.hint);
    else if (sess.qi > 0 && sess.item.hint && n.children.length > 2) h += ' ' + esc(sess.item.hint);
    setFb('info', h);
  }
  function reveal() {
    const n = curNode();
    sess.cuts = new Set(expCuts(sess.P, n)); sess.rel = n.rel; sess.revealed = true; nodeLog().reveal = true;
    const roles = rolesFor(n);
    const sp = brSpans(sess.P, n);
    const parts = n.children.map((c, k) => '<b>' + esc(spanText(sess.P, sp[k][0], sp[k][1])) + '</b>（' + roles[k] + '）').join(' ｜ ');
    const A = spanText(sess.P, sp[0][0], sp[0][1]), B = spanText(sess.P, sp[1][0], sp[1][1]);
    sess.fb = { kind: 'info', html: '答案：' + parts + ' — ' + REL[n.rel].zh + '。' + esc(ACTUAL[n.rel](A, B, n.rev)) };
    if (sess.mode === 'boss') sess.fb.html = '两次未中，看看答案：' + parts + ' — ' + REL[n.rel].zh + '。';
    renderPractice();
  }
  function advanceNode(pts) {
    const n = curNode();
    const L = nodeLog(); const first = L.tries.length === 1 && L.tries[0].err === 'ok' && !L.hint && !L.reveal;
    const st = S.rel[n.rel] || (S.rel[n.rel] = { n: 0, h: [] }); st.n++; st.h.push(first ? 1 : 0); if (st.h.length > 20) st.h.shift();
    sess.nlog.push(L); sess.curLog = null; sess.relWrong = 0;
    sess.done.add(n); sess.fresh = n; sess.itemXP += pts; if (sess.mode !== 'boss') sess.xpGain += pts;
    sess.qi++; sess.cuts = new Set(); sess.rel = null; sess.tries = 0; sess.hint = false; sess.fb = null;
    const wasRevealed = sess.revealed; sess.revealed = false;
    if (wasRevealed) sess.anyReveal = true;
    if (sess.qi >= sess.queue.length) { finishItem(); return; }
    renderPractice();
    if (!reduceMotion()) setTimeout(() => { sess && (sess.fresh = null); }, 50);
  }
  function finishItem() {
    const it = sess.item; const clean = sess.itemMistakes === 0 && sess.itemHints === 0 && !sess.anyReveal;
    sess.anyReveal = false;
    touchDay(); S.daily.n++;
    S.stats.sent++; if (it.lang === 'en') S.stats.en++;
    let bonus = 0;
    if (clean) { S.stats.clean++; bonus = sess.mode === 'boss' ? 0 : 15; }
    S.done[it.id] = { n: ((S.done[it.id] && S.done[it.id].n) || 0) + 1, clean: clean || !!(S.done[it.id] && S.done[it.id].clean) };
    if (!clean) S.mistakes[it.id] = today();
    else if (S.mistakes[it.id]) { delete S.mistakes[it.id]; if (sess.mode === 'review') S.stats.reviewed++; }
    sess.itemXP += bonus;
    S.log.push({ id: it.id, t: Date.now(), m: sess.mode, set: it.setId, x: itemText(it), c: clean ? 1 : 0, n: sess.nlog.map(l => {
      const r = { r: l.rel, k: l.tries.length }; if (l.hint) r.h = 1; if (l.reveal) r.v = 1;
      if (l.tries.length > 1 || l.hint || l.reveal || (l.tries[0] && l.tries[0].err !== 'ok')) { r.seg = l.seg; r.ans = l.ans; r.tr = l.tries; r.L = l.layer; }
      return r; }) });
    if (S.log.length > LOG_MAX) S.log.splice(0, S.log.length - LOG_MAX);
    {
      const ok1 = l => l.tries.length === 1 && l.tries[0].err === 'ok' && !l.hint && !l.reveal;
      const confs = []; sess.nlog.forEach(l => { const seen = {}; l.tries.forEach(t => { if (t.err === 'rel' && !seen[t.rel]) { seen[t.rel] = 1; confs.push(t.rel + '>' + l.rel); } }); });
      track({ type: 'sentence', item: it.id, text: itemText(it), set: it.setId, mode: sess.mode, clean: clean, nodes: sess.nlog.length, first: sess.nlog.filter(ok1).length, rels: sess.nlog.map(l => l.rel + (ok1(l) ? 1 : 0)).join(','), conf: confs.join(';'), level: LEVELS[levelOf(S.xp)].name });
    }
    if (sess.mode === 'boss') { sess.results.push({ clean }); }
    else { sess.xpGain += bonus; sess.results.push({ clean, xp: sess.itemXP }); addXP(sess.itemXP); }
    checkBadges(); save(); renderHeader();
    if (sess.mode === 'boss') {
      if (sess.idx + 1 >= sess.ids.length) { endBoss(false); return; }
      sess.idx++; loadItem(); toast(clean ? '一刀到位' : '下一句'); renderPractice(); return;
    }
    sess.finished = true; sess.clean = clean; renderPractice();
  }
  function verdict() {
    const k = sess.itemMistakes + sess.itemHints;
    if (sess.clean) return { t: '刀刃若新', d: '每一刀都在关节上。', cls: 'ok' };
    if (k <= 2) return { t: '良庖之刀', d: '良庖岁更刀，割也。差一点就零失误。', cls: 'mid' };
    return { t: '族庖之刀', d: '族庖月更刀，折也。这句已放进错题本，过两天再来。', cls: 'low' };
  }
  function finishHTML() {
    const v = verdict(); const it = sess.item; const last = sess.idx + 1 >= sess.ids.length;
    return '<div class="cutter-card finish"><p class="eyebrow">完成</p><h2 class="verdict ' + v.cls + '">' + v.t + '</h2><p class="v-d">' + v.d + '</p><p class="v-xp">本句 <b>+' + sess.itemXP + ' XP</b>' + (sess.clean ? '（含零失误奖励 +15）' : '') + '</p>' +
      (it.note ? '<div class="note"><span class="eyebrow">中英对照</span><p>' + esc(it.note) + '</p></div>' : '') +
      '<div class="actions">' + (askOn() ? '<button class="btn ghost" data-act="ask">问老师</button>' : '') + (last ? '<button class="btn" data-act="home">回首页</button><button class="btn primary" data-act="summary">本轮小结</button>' : '<button class="btn ghost" data-act="home">先到这里</button><button class="btn primary" data-act="next">下一句 ›</button>') + '</div></div>';
  }
  function finishAction(a) {
    if (a === 'next') { sess.idx++; loadItem(); renderPractice(); window.scrollTo(0, 0); }
    else if (a === 'home') go('home');
    else if (a === 'ask') openAsk();
    else if (a === 'summary') roundSummary();
    else if (a === 'again') { if (sess.mode === 'boss') startBoss(); else go('home'); }
  }
  function roundSummary() {
    const clean = sess.results.filter(r => r.clean).length;
    $('#main').innerHTML = '<section class="summary"><p class="eyebrow">本轮小结 · ' + esc(sess.title) + '</p><h1 class="page-title">' + clean + ' / ' + sess.results.length + ' 句零失误</h1><p class="big-xp">+' + sess.xpGain + ' XP</p>' +
      '<ul class="sum-list">' + sess.ids.map((id, i) => '<li><span class="mk ' + (sess.results[i] && sess.results[i].clean ? 'ok' : 'err') + '"></span>' + esc(itemText(ITEM[id])) + '</li>').join('') + '</ul>' +
      '<div class="actions"><button class="btn" data-act="home">回首页</button></div></section>';
    $('#main').querySelectorAll('[data-act]').forEach(b => b.onclick = () => finishAction(b.dataset.act));
  }
  function endBoss(timeout) {
    if (!sess || sess.over) return;
    sess.over = true; if (bossTimer) { clearInterval(bossTimer); bossTimer = null; }
    const completed = sess.results.length; const all = completed === sess.ids.length;
    const timeBonus = all ? sess.timeLeft * 2 : 0;
    const total = sess.score + timeBonus;
    const perfect = all && sess.bossMistakes === 0;
    const best = total > (S.stats.bossBest || 0);
    if (best) S.stats.bossBest = total;
    if (perfect) S.stats.bossPerfect = (S.stats.bossPerfect || 0) + 1;
    const xp = Math.min(80, Math.round(total / 15)); addXP(xp);
    track({ type: 'boss', score: total, clean: perfect, nodes: completed });
    checkBadges(); save(); renderHeader();
    $('#main').innerHTML = '<section class="summary boss-sum"><p class="eyebrow">歧义句挑战 · ' + (timeout ? '时间到' : all ? '全部完成' : '中途结束') + '</p><h1 class="page-title">' + total + ' 分' + (best ? ' <span class="chip ok">新纪录</span>' : '') + '</h1>' +
      '<dl class="sum-stats"><div><dt>完成</dt><dd>' + completed + ' / ' + sess.ids.length + '</dd></div><div><dt>最高连击</dt><dd>×' + sess.bestCombo + '</dd></div><div><dt>时间奖励</dt><dd>+' + timeBonus + '</dd></div><div><dt>获得</dt><dd>+' + xp + ' XP</dd></div></dl>' +
      (perfect ? '<p class="v-d">零失误。彼节者有间，而刀刃者无厚。</p>' : '<p class="v-d">歧义句的关键：先读懂意思，再决定第一刀切在哪里。</p>') +
      '<div class="actions"><button class="btn" data-act="home">回首页</button><button class="btn primary" data-act="again">再来一局</button></div></section>';
    $('#main').querySelectorAll('[data-act]').forEach(b => b.onclick = () => finishAction(b.dataset.act));
  }

  /* ---------------- review ---------------- */
  function reviewHTML() {
    const ids = Object.keys(S.mistakes).filter(id => ITEM[id]);
    return '<button class="back" data-back>‹ 返回</button><h1 class="page-title">错题本 <span>Review</span></h1><p class="page-sub">零失误、不用提示完成一句，它就会从这里消失。</p>' +
      (ids.length ? '<ul class="sum-list">' + ids.map(id => '<li><span class="mk err"></span>' + esc(itemText(ITEM[id])) + '<small>' + esc((setById(ITEM[id].setId) || {}).title || '') + '</small></li>').join('') + '</ul><div class="actions"><button class="btn primary" id="rv-go">复习 ' + Math.min(ids.length, ROUND) + ' 句</button></div>'
        : '<div class="empty"><p>错题本是空的。</p><p>做错过的句子会自动收进来。</p></div>');
  }
  function bindReview() {
    $('#main').querySelector('[data-back]').onclick = () => go('home');
    const b = $('#rv-go'); if (b) b.onclick = () => startSession({ mode: 'review', ids: shuffle(Object.keys(S.mistakes).filter(id => ITEM[id])).slice(0, ROUND), title: '错题本' });
  }

  /* ---------------- me ---------------- */
  function meHTML() {
    const li = levelOf(S.xp), L = LEVELS[li];
    const acc = S.stats.nodes ? Math.round(S.stats.first / S.stats.nodes * 100) : 0;
    const reg = askOn() ? '<p class="me-reg">' + (S.profile.name ? '登记为 <b>' + esc(S.profile.name) + '</b>' + (S.profile.cls ? ' · ' + esc(S.profile.cls) : '') : '还没有登记') + ' <button class="ask-inline" id="me-reg">修改</button></p>' : '';
    return '<h1 class="page-title">我的 <span>Progress</span></h1>' + reg + inboxHTML() +
      '<section class="lvl"><p class="eyebrow">等级 ' + (li + 1) + ' / ' + LEVELS.length + '</p><h2 class="lvl-name">' + L.name + '</h2><blockquote class="motto">' + L.q + '<span>' + L.en + '</span></blockquote>' +
      '<ol class="lvl-track">' + LEVELS.map((l, i) => '<li class="' + (i <= li ? 'on' : '') + '"><b>' + l.name + '</b><small>' + l.xp + '</small></li>').join('') + '</ol></section>' +
      '<dl class="sum-stats"><div><dt>总经验</dt><dd>' + S.xp + '</dd></div><div><dt>完成句子</dt><dd>' + S.stats.sent + '</dd></div><div><dt>一次切对率</dt><dd>' + acc + '%</dd></div><div><dt>连续天数</dt><dd>' + streakNow() + '</dd></div></dl>' +
      masteryHTML() +
      '<section class="export"><h2 class="sec-title">学习记录 <span>Report for your teacher</span></h2><p class="page-sub">生成一份 PDF，列出你做过的题、错在哪里、各种关系的掌握情况，发给老师。</p><button class="btn primary" id="me-report">生成学习记录 PDF</button></section>' +
      '<h2 class="sec-title">徽章 <span>Badges</span></h2><div class="badges">' + BADGES.map(b => '<div class="bd' + (S.badges[b.id] ? ' earned' : '') + '"><div class="badge' + (S.badges[b.id] ? ' earned' : '') + '"><span>' + b.g + '</span></div><b>' + b.name + '</b><small>' + b.desc + '</small></div>').join('') + '</div>' +
      '<div class="me-links"><button class="btn" id="me-review">错题本（' + Object.keys(S.mistakes).filter(id => ITEM[id]).length + '）</button><button class="btn" id="me-teacher">教师工具</button><button class="btn ghost danger" id="me-reset">重置进度</button></div><div id="reset-zone"></div>' +
      '<p class="fine">' + (askOn() ? '你的姓名、班级和练习记录会发送到老师的 Google 表格，只有老师能看到。进度本身保存在这台设备上。' : '进度只保存在这台设备的浏览器里，不收集任何个人资料。') + '</p>';
  }
  function bindMe() {
    $('#me-review').onclick = () => go('review');
    $('#me-teacher').onclick = () => go('teacher');
    $('#me-report').onclick = () => go('report');
    const mr = $('#me-reg'); if (mr) mr.onclick = () => showReg(true);
    markInboxSeen();
    $('#me-reset').onclick = () => {
      $('#reset-zone').innerHTML = '<div class="confirm"><p>确定清除这台设备上的全部进度？此操作无法撤销。</p><div class="actions"><button class="btn" id="rs-no">取消</button><button class="btn danger" id="rs-yes">清除</button></div></div>';
      $('#rs-no').onclick = () => { $('#reset-zone').innerHTML = ''; };
      $('#rs-yes').onclick = () => { S = Object.assign(DEF(), { device: S.device, profile: S.profile, inbox: S.inbox, inboxSeen: S.inboxSeen }); save(); go('me'); toast('进度已清除'); };
    };
  }


  /* ---------------- PDF learning log ---------------- */
  const LIBS = ['https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'];
  function loadScript(src) { return new Promise((res, rej) => { if (document.querySelector('script[src="' + src + '"]')) return res(); const el = document.createElement('script'); el.src = src; el.onload = res; el.onerror = () => rej(new Error('load')); document.head.appendChild(el); }); }
  const ERR_ZH = { extra: '切太深／多切', missing: '漏切', wrong: '切分位置错', rel: '关系判断错' };
  const MODE_ZH = { practice: '练习', single: '今日一句', review: '错题本', boss: '辨析挑战', rec: '推荐练习' };
  function fmtDT(t) { const d = new Date(t); return (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function reportData(range) {
    const now = Date.now();
    const from = range === 'week' ? now - 7 * 864e5 : range === 'since' ? (S.lastExport || 0) : 0;
    const E = S.log.filter(e => e.t >= from);
    const per = {}; REL_ORDER.forEach(r => { per[r] = { n: 0, ok: 0 }; });
    const errs = { extra: 0, missing: 0, wrong: 0, rel: 0 }, conf = {}; let nodes = 0, first = 0, hints = 0, reveals = 0;
    const days = new Set();
    E.forEach(e => {
      days.add(dstr(new Date(e.t)));
      e.n.forEach(nd => {
        nodes++; const p = per[nd.r] || (per[nd.r] = { n: 0, ok: 0 }); p.n++;
        const ok1 = nd.k === 1 && !nd.h && !nd.v && (!nd.tr || nd.tr[0].err === 'ok');
        if (ok1) { first++; p.ok++; }
        if (nd.h) hints++; if (nd.v) reveals++;
        (nd.tr || []).forEach(t => { if (errs[t.err] != null) errs[t.err]++; if (t.err === 'rel') { const key = t.rel + '>' + nd.r; conf[key] = (conf[key] || 0) + 1; } });
      });
    });
    return { E, from, per, errs, conf, nodes, first, hints, reveals, days: days.size, clean: E.filter(e => e.c).length };
  }
  function reportHTML() {
    return '<button class="back" data-back>‹ 我的</button><h1 class="page-title">学习记录 <span>PDF report</span></h1>' +
      '<p class="page-sub">填好姓名和班级，选择时间范围，生成 PDF 后发给老师。姓名只写在这份 PDF 里，不会上传到任何地方。</p>' +
      '<form class="rp-form" id="rp-form"><div class="tt-row"><label for="rp-name">姓名</label><input id="rp-name" autocomplete="name" value="' + esc(S.profile.name) + '"><label for="rp-cls">班级</label><input id="rp-cls" value="' + esc(S.profile.cls) + '"></div>' +
      '<fieldset class="rp-range"><legend>时间范围</legend>' +
      '<label><input type="radio" name="rp-r" value="all" checked> 全部记录</label>' +
      '<label><input type="radio" name="rp-r" value="week"> 最近 7 天</label>' +
      '<label><input type="radio" name="rp-r" value="since"' + (S.lastExport ? '' : ' disabled') + '> 上次导出以后' + (S.lastExport ? '（' + fmtDT(S.lastExport) + '）' : '') + '</label></fieldset>' +
      '<p class="rp-count" id="rp-count"></p><div class="actions"><button class="btn primary" type="submit" id="rp-go">生成 PDF</button></div></form>' +
      '<div id="rp-out" aria-live="polite"></div><div id="rp-stage" aria-hidden="true"></div>';
  }
  function bindReport() {
    $('#main').querySelector('[data-back]').onclick = () => go('me');
    const range = () => (document.querySelector('input[name="rp-r"]:checked') || {}).value || 'all';
    const upd = () => { const D = reportData(range()); $('#rp-count').textContent = D.E.length ? '这份记录包含 ' + D.E.length + ' 句、' + D.nodes + ' 刀。' : '这个范围内还没有练习记录。'; $('#rp-go').disabled = !D.E.length; };
    document.querySelectorAll('input[name="rp-r"]').forEach(r => r.addEventListener('change', upd)); upd();
    $('#rp-form').addEventListener('submit', async e => {
      e.preventDefault();
      S.profile.name = $('#rp-name').value.trim(); S.profile.cls = $('#rp-cls').value.trim(); save();
      if (!S.profile.name) { $('#rp-out').innerHTML = '<div class="fb err">请先填写姓名，老师才知道是谁的记录。</div>'; $('#rp-name').focus(); return; }
      const btn = $('#rp-go'); btn.disabled = true; btn.textContent = '正在生成…';
      $('#rp-out').innerHTML = '<div class="fb info">正在生成 PDF，句子较多时需要十几秒。</div>';
      try {
        const D = reportData(range());
        const blob = await buildPDF(D);
        const fname = '层次分析记录_' + (S.profile.cls ? S.profile.cls + '_' : '') + S.profile.name + '_' + today().replace(/-/g, '') + '.pdf';
        const url = URL.createObjectURL(blob);
        const file = (typeof File === 'function') ? new File([blob], fname, { type: 'application/pdf' }) : null;
        const canShare = !!(file && navigator.canShare && navigator.canShare({ files: [file] }));
        S.lastExport = Date.now(); save(); track({ type: 'pdf' });
        $('#rp-out').innerHTML = '<div class="rp-done"><p><b>PDF 已生成</b>（' + Math.max(1, Math.round(blob.size / 1024)) + ' KB）：' + esc(fname) + '</p><div class="actions">' +
          (canShare ? '<button class="btn primary" id="rp-share">发送给老师</button>' : '') +
          '<a class="btn' + (canShare ? '' : ' primary') + '" id="rp-dl" href="' + url + '" download="' + esc(fname) + '">下载 PDF</a></div><p class="fine">下载后，可以通过电邮、Teams 或 SLS 交给老师。</p></div>';
        const sh = $('#rp-share'); if (sh) sh.onclick = () => navigator.share({ files: [file], title: '层次分析学习记录', text: S.profile.name + ' 的层次分析学习记录' }).catch(() => {});
      } catch (err) {
        $('#rp-out').innerHTML = '<div class="fb err">生成失败：需要联网下载 PDF 工具（第一次使用时）。请连上网络再试一次。</div>';
      }
      btn.disabled = false; btn.textContent = '生成 PDF';
    });
  }
  function rpBlocks(D) {
    const L = LEVELS[levelOf(S.xp)];
    const pct = (a, b) => b ? Math.round(a / b * 100) + '%' : '—';
    const rangeTxt = D.from ? fmtDT(D.from) + ' 至 ' + fmtDT(Date.now()) : '全部记录（至 ' + fmtDT(Date.now()) + '）';
    const blocks = [];
    blocks.push('<div class="rb-head"><div class="rb-brand">庖丁 · 层次分析学习记录</div><div class="rb-meta"><span>姓名：<b>' + esc(S.profile.name) + '</b></span><span>班级：<b>' + esc(S.profile.cls || '—') + '</b></span><span>范围：' + rangeTxt + '</span></div></div>' +
      '<div class="rb-stats">' + [['完成句子', D.E.length], ['零失误句子', D.clean + '（' + pct(D.clean, D.E.length) + '）'], ['一次切对率', pct(D.first, D.nodes) + '（' + D.first + '/' + D.nodes + ' 刀）'], ['练习天数', D.days], ['使用提示／看答案', D.hints + ' / ' + D.reveals], ['当前等级', L.name + ' · ' + S.xp + ' XP']].map(([a, b]) => '<div><span>' + a + '</span><b>' + b + '</b></div>').join('') + '</div>');
    const weak = REL_ORDER.filter(r => D.per[r].n >= 1).map(r => ({ r, m: D.per[r].ok / D.per[r].n })).filter(x => x.m < 0.8).sort((a, b) => a.m - b.m);
    const conf = Object.entries(D.conf).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topErr = Object.entries(D.errs).sort((a, b) => b[1] - a[1]).filter(x => x[1]);
    blocks.push('<div class="rb-sec">老师速览</div><div class="rb-glance"><p><b>需要加强：</b>' + (weak.length ? weak.map(x => (REL[x.r].chip || REL[x.r].zh) + '（' + Math.round(x.m * 100) + '%，' + D.per[x.r].n + ' 刀）').join('、') : '暂无明显弱项') + '</p>' +
      '<p><b>主要错误类型：</b>' + (topErr.length ? topErr.map(([k, v]) => ERR_ZH[k] + ' ' + v + ' 次').join('、') : '无') + '</p>' +
      '<p><b>常见混淆：</b>' + (conf.length ? conf.map(([k, v]) => { const [a, b] = k.split('>'); return '把' + (REL[b].chip || REL[b].zh) + '判断成' + (REL[a].chip || REL[a].zh) + ' ×' + v; }).join('；') : '无') + '</p></div>');
    blocks.push('<div class="rb-sec">各关系掌握情况</div><table class="rb-tab"><thead><tr><th>关系</th><th>练习刀数</th><th>一次答对</th><th>答对率</th></tr></thead><tbody>' +
      REL_ORDER.map(r => { const p = D.per[r]; const m = p.n ? p.ok / p.n : null; return '<tr><td>' + REL[r].zh + '</td><td>' + p.n + '</td><td>' + p.ok + '</td><td class="' + mcls(m) + '">' + pct(p.ok, p.n) + '</td></tr>'; }).join('') + '</tbody></table>');
    blocks.push('<div class="rb-sec">作答明细（按时间顺序）</div><p class="rb-note">✓ 零失误　✗ 有失误。有失误的句子列出每一层的作答过程：学生的切分与关系判断，以及正确答案。</p>');
    D.E.forEach((e, i) => {
      const set = setById(e.set);
      let h = '<div class="rb-item ' + (e.c ? 'ok' : 'bad') + '"><div class="rb-line"><span class="rb-no">' + (i + 1) + '</span><span class="rb-mk">' + (e.c ? '✓' : '✗') + '</span><span class="rb-x">' + esc(e.x) + '</span><span class="rb-src">' + esc(set ? set.title : '') + ' · ' + (MODE_ZH[e.m] || '') + ' · ' + fmtDT(e.t) + '</span></div>';
      const bad = e.n.filter(nd => nd.tr);
      if (bad.length) {
        h += '<div class="rb-nodes">' + bad.map(nd => '<div class="rb-node"><div>第 ' + nd.L + ' 层「' + esc(nd.seg) + '」　正确：<b>' + esc(nd.ans) + '</b>　' + esc(REL[nd.r].zh) + (nd.h ? '　<i>用了提示</i>' : '') + (nd.v ? '　<i>看了答案</i>' : '') + '</div><ol>' +
          nd.tr.filter(t => t.err !== 'ok').map(t => '<li>' + esc(t.cut) + '　〔' + esc(REL[t.rel] ? REL[t.rel].zh : t.rel) + '〕　— ' + ERR_ZH[t.err] + '</li>').join('') + '</ol></div>').join('') + '</div>';
      }
      blocks.push(h + '</div>');
    });
    return blocks;
  }
  async function buildPDF(D) {
    for (const src of LIBS) await loadScript(src);
    if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch (e) { /* ignore */ } }
    const stage = $('#rp-stage');
    stage.innerHTML = rpBlocks(D).map(b => '<div class="rb">' + b + '</div>').join('');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'a4', compress: true });
    const W = 595.28, H = 841.89, M = 36, CW = W - 2 * M, BOT = H - M - 12;
    let y = M;
    for (const el of stage.children) {
      const cv = await window.html2canvas(el, { scale: 1.6, backgroundColor: '#ffffff', logging: false });
      const h = cv.height * CW / cv.width;
      if (y + h > BOT && y > M) { doc.addPage(); y = M; }
      doc.addImage(cv.toDataURL('image/jpeg', 0.85), 'JPEG', M, y, CW, Math.min(h, BOT - M));
      y += h + 6;
    }
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) { doc.setPage(i); doc.setFontSize(8); doc.setTextColor(130); doc.text('Paoding IC analysis log  |  ' + today() + '  |  ' + i + ' / ' + pages, W / 2, H - 20, { align: 'center' }); }
    stage.innerHTML = '';
    return doc.output('blob');
  }


  /* ---------------- 问老师 (ask the teacher) ---------------- */
  const CFG = window.PD_CONFIG || {};
  const askOn = () => !!(CFG.askUrl && /^https:\/\//.test(CFG.askUrl));
  function stripTags(h) { const d = document.createElement('div'); d.innerHTML = h || ''; return d.textContent.replace(/\s+/g, ' ').trim(); }
  function askContext() {
    const c = { view: view };
    if (view === 'practice' && sess && sess.item) {
      const it = sess.item, n = curNode();
      c.item = it.id; c.set = (setById(it.setId) || {}).title || ''; c.mode = MODE_ZH[sess.mode] || sess.mode;
      c.sentence = itemText(it) + (it.gloss ? '（意思：' + it.gloss + '）' : '');
      if (n && !sess.finished) {
        const L = nodeLog();
        c.layer = '第 ' + L.layer + ' 层「' + L.seg + '」';
        const now = sess.cuts.size ? segTexts(sess.P, n, sess.cuts).join('｜') : '（还没下刀）';
        c.attempt = L.tries.map((t, i) => (i + 1) + '. ' + t.cut + '〔' + (REL[t.rel] ? REL[t.rel].zh : t.rel) + '〕' + (ERR_ZH[t.err] ? ' ' + ERR_ZH[t.err] : '')).concat(['当前：' + now + (sess.rel ? '〔' + REL[sess.rel].zh + '〕' : '')]).join('\n');
        c.answer = L.ans + ' ' + REL[n.rel].zh;
      } else { c.layer = '已完成整句'; c.answer = (sess.nlog || []).map(l => '第' + l.layer + '层 ' + l.ans).join('\n'); }
      c.feedback = sess.fb ? stripTags(sess.fb.html) : '';
    } else if (view === 'card') { const t = $('.concept .page-title'); c.sentence = '概念卡：' + (t ? t.textContent : ''); }
    else { const t = $('.page-title'); c.sentence = t ? t.textContent : '首页'; }
    return c;
  }
  let askShot = null;
  async function openAsk() {
    if (!askOn()) { toast('老师还没有开通提问功能'); return; }
    const ctx = askContext(); askShot = null;
    const ov = $('#ask');
    ov.innerHTML = '<div class="ask-card" role="dialog" aria-modal="true" aria-labelledby="ask-t"><h2 id="ask-t" class="ask-title">问老师</h2>' +
      '<p class="ask-ctx"><b>' + esc(ctx.sentence || '') + '</b>' + (ctx.layer ? '<br>' + esc(ctx.layer) : '') + '</p>' +
      '<form id="ask-form"><div class="tt-row"><label for="ask-name">姓名</label><input id="ask-name" value="' + esc(S.profile.name) + '" required><label for="ask-cls">班级</label><input id="ask-cls" value="' + esc(S.profile.cls) + '"></div>' +
      '<label for="ask-q" class="ask-l">你的问题</label><textarea id="ask-q" rows="4" required placeholder="例如：为什么这里是述补，不是述宾？"></textarea>' +
      '<label class="ask-chk"><input type="checkbox" id="ask-shot" checked> 附上这一页的截图</label><div id="ask-thumb" class="ask-thumb">正在截图…</div>' +
      '<p class="fine">你的姓名、问题、作答过程和截图会发送到老师的 Google 表格。</p>' +
      '<div id="ask-msg" aria-live="polite"></div><div class="actions"><button type="button" class="btn ghost" id="ask-x">取消</button><button type="submit" class="btn primary" id="ask-send">发送</button></div></form></div>';
    ov.hidden = false;
    $('#ask-x').onclick = closeAsk;
    setTimeout(() => $('#ask-q').focus(), 50);
    // screenshot of the page underneath (taken before the dialog is painted over it)
    (async () => {
      try {
        await loadScript(LIBS[0]);
        const cv = await window.html2canvas($('#main'), { scale: Math.min(1.5, window.devicePixelRatio || 1), backgroundColor: getComputedStyle(document.body).backgroundColor, logging: false, windowWidth: document.documentElement.clientWidth });
        let w = cv.width, h = cv.height; const maxH = 2400;
        let src = cv;
        if (h > maxH) { const c2 = document.createElement('canvas'); c2.width = w; c2.height = maxH; c2.getContext('2d').drawImage(cv, 0, 0); src = c2; }
        askShot = src.toDataURL('image/jpeg', 0.72);
        const th = $('#ask-thumb'); if (th) th.innerHTML = '<img alt="页面截图" src="' + askShot + '">';
      } catch (e) { const th = $('#ask-thumb'); if (th) th.textContent = '截图失败，可以只发送文字。'; }
    })();
    $('#ask-shot').onchange = e => { $('#ask-thumb').hidden = !e.target.checked; };
    $('#ask-form').onsubmit = async e => {
      e.preventDefault();
      const name = $('#ask-name').value.trim(), cls = $('#ask-cls').value.trim(), qtxt = $('#ask-q').value.trim();
      if (!name || !qtxt) { $('#ask-msg').innerHTML = '<div class="fb err">请填写姓名和问题。</div>'; return; }
      S.profile.name = name; S.profile.cls = cls; save();
      const payload = Object.assign({ kind: 'ask', device: S.device, name, cls, q: qtxt, t: new Date().toISOString(), shot: $('#ask-shot').checked ? askShot : null }, ctx);
      const btn = $('#ask-send'); btn.disabled = true; btn.textContent = '发送中…';
      const res = await postAsk(payload);
      if (res === 'ok') { closeAsk(); toast('已发送给老师，回复会出现在「我的」里'); setTimeout(fetchInbox, 1500); }
      else if (res === 'queued') { closeAsk(); toast('现在没有网络，连上网后会自动发送'); }
      else { $('#ask-msg').innerHTML = '<div class="fb err">发送失败。请检查网络后再试，或直接问老师。</div>'; btn.disabled = false; btn.textContent = '发送'; }
    };
  }
  function closeAsk() { const ov = $('#ask'); ov.hidden = true; ov.innerHTML = ''; }
  async function postAsk(p) {
    if (!navigator.onLine) { queueAsk(p); return 'queued'; }
    try {
      const r = await fetch(CFG.askUrl, { method: 'POST', body: JSON.stringify(p) });
      const j = await r.json().catch(() => ({}));
      return j && j.ok ? 'ok' : 'fail';
    } catch (e) { if (!navigator.onLine) { queueAsk(p); return 'queued'; } return 'fail'; }
  }
  function queueAsk(p) { try { const k = 'paoding-outbox'; const q = JSON.parse(localStorage.getItem(k) || '[]'); q.push(p); localStorage.setItem(k, JSON.stringify(q.slice(-5))); } catch (e) { /* storage full: drop */ } }
  async function flushAsk() {
    if (!askOn() || !navigator.onLine) return;
    let q; try { q = JSON.parse(localStorage.getItem('paoding-outbox') || '[]'); } catch (e) { return; }
    if (!q.length) return;
    const left = [];
    for (const p of q) { const r = await postAsk(p); if (r !== 'ok') left.push(p); }
    try { localStorage.setItem('paoding-outbox', JSON.stringify(left)); } catch (e) { /* ignore */ }
    if (left.length < q.length) toast('之前保存的问题已发送给老师');
  }


  /* ---------------- sign-in, usage reporting, replies ---------------- */
  const APPV = '2026-10-21';
  const EVQ = 'paoding-events';
  function track(ev) {
    if (!askOn()) return;
    ev.t = Date.now();
    try { const q = JSON.parse(localStorage.getItem(EVQ) || '[]'); q.push(ev); localStorage.setItem(EVQ, JSON.stringify(q.slice(-500))); } catch (e) { return; }
    clearTimeout(track.timer); track.timer = setTimeout(flushEvents, 4000);
  }
  let flushing = false;
  async function flushEvents() {
    if (flushing || !askOn() || !navigator.onLine || !S.profile.name) return;
    let q; try { q = JSON.parse(localStorage.getItem(EVQ) || '[]'); } catch (e) { return; }
    if (!q.length) return;
    flushing = true;
    const batch = q.slice(0, 100);
    try {
      const r = await fetch(CFG.askUrl, { method: 'POST', body: JSON.stringify({ kind: 'events', device: S.device, name: S.profile.name, cls: S.profile.cls, v: APPV, events: batch }) });
      const j = await r.json().catch(() => ({}));
      if (j && j.ok) {
        const cur = JSON.parse(localStorage.getItem(EVQ) || '[]');
        localStorage.setItem(EVQ, JSON.stringify(cur.slice(batch.length)));
        if (cur.length > batch.length) setTimeout(flushEvents, 1500);
      }
    } catch (e) { /* offline or blocked: keep the queue */ }
    flushing = false;
  }
  function unread() { return (S.inbox || []).filter(i => i.reply && i.replyAt > (S.inboxSeen || 0)).length; }
  function updateDots() {
    const n = unread();
    const b = $('#hd-ask'); if (b) b.classList.toggle('has-new', n > 0);
    const m = $('#nav a[data-v="me"]'); if (m) m.classList.toggle('has-new', n > 0);
  }
  async function fetchInbox() {
    if (!askOn() || !navigator.onLine) return;
    try {
      const r = await fetch(CFG.askUrl + (CFG.askUrl.indexOf('?') < 0 ? '?' : '&') + 'action=inbox&device=' + encodeURIComponent(S.device));
      const j = await r.json();
      if (!j || !j.ok || !Array.isArray(j.items)) return;
      const before = unread();
      S.inbox = j.items; save();
      const after = unread();
      updateDots();
      if (view === 'me') { const box = $('#me-inbox'); if (box) { box.outerHTML = inboxHTML(); markInboxSeen(); } }
      else if (after > before) toast('老师回复了你的问题，到「我的」查看');
    } catch (e) { /* ignore */ }
  }
  function inboxHTML() {
    if (!askOn() || !(S.inbox || []).length) return '<div id="me-inbox"></div>';
    const items = S.inbox.slice().sort((a, b) => (b.replyAt || b.t) - (a.replyAt || a.t));
    return '<section id="me-inbox" class="inbox"><h2 class="sec-title">我的提问 <span>Replies from your teacher</span></h2><ul>' + items.map(i => {
      const isNew = i.reply && i.replyAt > (S.inboxSeen || 0);
      return '<li class="ib' + (isNew ? ' new' : '') + '"><div class="ib-q"><span class="chip ' + (i.reply ? 'ok' : '') + '">' + (i.reply ? (isNew ? '新回复' : '已回复') : (i.status === '已回复' ? '已当面回复' : '等待回复')) + '</span><b>' + esc(i.q) + '</b></div>' +
        (i.sentence ? '<p class="ib-s">' + esc(i.sentence) + (i.layer ? ' · ' + esc(i.layer) : '') + '</p>' : '') +
        (i.reply ? '<div class="ib-r"><span>老师：</span>' + esc(i.reply) + '</div>' : '') + '</li>';
    }).join('') + '</ul></section>';
  }
  function markInboxSeen() {
    const mx = Math.max(0, ...(S.inbox || []).map(i => i.replyAt || 0));
    if (mx > (S.inboxSeen || 0)) { setTimeout(() => { S.inboxSeen = mx; save(); updateDots(); }, 1200); }
  }
  function showReg(editing) {
    let ov = $('#reg');
    if (!ov) { ov = document.createElement('div'); ov.id = 'reg'; document.body.appendChild(ov); }
    ov.innerHTML = '<div class="ask-card" role="dialog" aria-modal="true" aria-labelledby="reg-t"><h2 id="reg-t" class="ask-title">' + (editing ? '修改登记信息' : '欢迎使用庖丁') + '</h2>' +
      '<p class="reg-intro">先登记姓名和班级。老师会通过 Google 表格看到你的练习情况（做了哪些题、哪一层切错、哪天练习），用来安排复习和回答你的问题。只有老师能看到这些记录。</p>' +
      '<form id="reg-form"><div class="tt-row"><label for="reg-name">姓名</label><input id="reg-name" autocomplete="name" value="' + esc(S.profile.name) + '" placeholder="例如：陈小明"><label for="reg-cls">班级</label><input id="reg-cls" value="' + esc(S.profile.cls) + '" placeholder="例如：26A01"></div>' +
      '<div id="reg-msg" aria-live="polite"></div><div class="actions">' + (editing ? '<button type="button" class="btn ghost" id="reg-x">取消</button>' : '') + '<button type="submit" class="btn primary">' + (editing ? '保存' : '开始使用') + '</button></div></form></div>';
    ov.hidden = false;
    setTimeout(() => { const n = $('#reg-name'); if (n) n.focus(); }, 50);
    const x = $('#reg-x'); if (x) x.onclick = () => { ov.hidden = true; ov.innerHTML = ''; };
    $('#reg-form').onsubmit = e => {
      e.preventDefault();
      const name = $('#reg-name').value.trim(), cls = $('#reg-cls').value.trim().toUpperCase();
      if (name.length < 2 || !cls) { $('#reg-msg').innerHTML = '<div class="fb err">请填写完整的姓名和班级。</div>'; return; }
      const first = !S.profile.name;
      S.profile.name = name; S.profile.cls = cls; save();
      ov.hidden = true; ov.innerHTML = '';
      if (first) { S.lastOpen = today(); save(); track({ type: 'open' }); toast('欢迎，' + name); }
      else { toast('已保存'); if (view === 'me') go('me'); }
      flushEvents();
    };
  }

  /* ---------------- teacher tool ---------------- */
  function teacherHTML() {
    return '<button class="back" data-back>‹ 我的</button><h1 class="page-title">教师工具 <span>Item builder</span></h1>' +
      '<p class="page-sub">输入一道题的切分记法，预览图解并检查格式，再把生成的一行复制进 <code>data/bank.js</code>。</p>' +
      '<details class="syntax"><summary>记法说明</summary><ul>' +
      '<li><code>[述宾 学习 汉语]</code>：关系写在括号开头，词语用空格分开。</li>' +
      '<li>关系：' + REL_ORDER.map(r => '<code>' + r + '</code>').join(' ') + '</li>' +
      '<li><code>定中*</code>：加星号表示中心语在前（英语后置定语／状语）。</li>' +
      '<li><code>说^得</code>：^ 后是虚词，灰色显示，不切。<code>[述宾 咬死^了 猎人]^的</code>：虚词附在左边的整块上。<code>to^</code>：附在右边。</li>' +
      '<li><code>[并列 loudly and^ merrily]</code>：连词附在后一个并列项上（loudly ｜ and merrily）。</li>' +
      '<li>兼语句按述宾 + 主谓切：<code>[述宾 叫 [主谓 他 来]]</code>；能愿动词带宾语：<code>[述宾 愿意 参加]</code></li>' +
      '<li>英语关系代词、that 附在从句上：<code>[主谓 whom^ she scolded]</code></li></ul></details>' +
      '<div class="tt-form"><label for="tt-tree">切分记法</label><textarea id="tt-tree" rows="3" spellcheck="false">[主谓 [定中 那位 老人] [述宾 喜欢 [定中 古典 音乐]]]</textarea>' +
      '<div class="tt-row"><label for="tt-lang">语言</label><select id="tt-lang"><option value="zh">中文</option><option value="en">English</option></select><label for="tt-id">题号</label><input id="tt-id" value="s99"><label for="tt-hint">提示（可选）</label><input id="tt-hint" value=""></div></div>' +
      '<div id="tt-out"></div>';
  }
  function bindTeacher() {
    $('#main').querySelector('[data-back]').onclick = () => go('me');
    const upd = () => {
      const tree = $('#tt-tree').value.trim(), lang = $('#tt-lang').value;
      const P = parseTree(tree, lang);
      let h = '';
      if (P.errors.length) h += '<div class="fb err"><b>格式问题</b><ul>' + P.errors.map(e => '<li>' + esc(e) + '</li>').join('') + '</ul></div>';
      if (P.root && !P.errors.length) {
        const q = bfs(P.root);
        h += '<div class="fb ok">格式正确：' + P.tokens.length + ' 个词，' + q.length + ' 刀（' + (Math.max(...[...depthMap(P.root).values()]) + 1) + ' 层）。学生看到的句子：<b>' + esc(spanText(P, 0, P.tokens.length)) + '</b></div>';
        h += '<div class="pv-sentence">' + diagram(P) + '</div>';
        const obj = { id: $('#tt-id').value.trim() || 'x01', lang, tree };
        const hv = $('#tt-hint').value.trim(); if (hv) obj.hint = hv;
        const line = '{ ' + Object.keys(obj).map(k => k + ': ' + JSON.stringify(obj[k]).replace(/^"|"$/g, "'").replace(/\\"/g, '"')).join(', ') + ' },';
        h += '<label class="tt-copy-l" for="tt-line">复制到 bank.js 对应的 items 里</label><div class="tt-copy"><input id="tt-line" readonly value="' + esc(line) + '"><button class="btn" id="tt-cp">复制</button></div>';
      }
      $('#tt-out').innerHTML = h;
      const cp = $('#tt-cp');
      if (cp) cp.onclick = () => {
        const inp = $('#tt-line');
        const done = () => toast('已复制');
        try { navigator.clipboard.writeText(inp.value).then(done, () => { inp.select(); toast('已选中，请手动复制'); }); } catch (e) { inp.select(); toast('已选中，请手动复制'); }
      };
    };
    ['tt-tree', 'tt-lang', 'tt-id', 'tt-hint'].forEach(id => $('#' + id).addEventListener('input', upd));
    upd();
  }

  /* ---------------- boot ---------------- */
  document.querySelectorAll('#nav a').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    const v = a.dataset.v;
    if (view === 'practice' && sess && sess.mode === 'boss' && !sess.over) endBoss(false);
    if (v === 'boss') startBoss(); else go(v);
  }));
  $('#hd-home').addEventListener('click', e => { e.preventDefault(); go('home'); });
  const askBtn = $('#hd-ask'); if (askBtn) { askBtn.hidden = !askOn(); askBtn.addEventListener('click', openAsk); }
  window.addEventListener('online', () => { flushAsk(); flushEvents(); fetchInbox(); }); setTimeout(flushAsk, 3000);
  if (askOn()) {
    save();
    if (!S.profile.name) showReg(false);
    else if (S.lastOpen !== today()) { S.lastOpen = today(); save(); track({ type: 'open' }); }
    updateDots();
    setTimeout(() => { flushEvents(); fetchInbox(); }, 2000);
    setInterval(fetchInbox, 5 * 60 * 1000);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') fetchInbox(); else flushEvents(); });
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('#ov').hidden) { ovQueue.shift(); showOverlay(); }
    if (e.key === 'Escape' && !$('#ask').hidden) closeAsk();
    if (e.key === 'Escape' && $('#reg') && !$('#reg').hidden && $('#reg-x')) $('#reg-x').click();
    if (view === 'practice' && e.key === 'Enter' && $('#ask').hidden && !($('#reg') && !$('#reg').hidden) && e.target.tagName !== 'BUTTON') { const b = $('#pv-submit'); if (b) b.click(); }
  });
  window.addEventListener('hashchange', () => { const h = (location.hash || '').slice(1); if (['learn', 'me', 'teacher'].includes(h) && h !== view) go(h); });
  const h0 = (location.hash || '').slice(1);
  go(['learn', 'me', 'teacher'].includes(h0) ? h0 : 'home');

  // expose parser for tests
  window.PD = { parseTree, bfs, expCuts, brSpans, rolesFor, REL };
})();
