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
  const DEF = () => ({ xp: 0, done: {}, mistakes: {}, cards: {}, streak: { n: 0, last: '' }, daily: { date: '', n: 0 }, stats: { nodes: 0, first: 0, sent: 0, en: 0, clean: 0, reviewed: 0, bossBest: 0, bossPerfect: 0 }, badges: {} });
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const o = JSON.parse(raw); const d = DEF(); return Object.assign(d, o, { stats: Object.assign(d.stats, o.stats || {}), streak: Object.assign(d.streak, o.streak || {}), daily: Object.assign(d.daily, o.daily || {}) }); }
    } catch (e) { /* storage unavailable */ }
    return DEF();
  }
  let S = load();
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
    document.querySelectorAll('#nav a').forEach(a => a.setAttribute('aria-current', a.dataset.v === v || (v === 'card' && a.dataset.v === 'learn') || ((v === 'teacher' || v === 'review') && a.dataset.v === 'me') ? 'page' : 'false'));
    const m = $('#main');
    if (v === 'home') m.innerHTML = homeHTML(), bindHome();
    else if (v === 'learn') m.innerHTML = learnHTML(), bindLearn();
    else if (v === 'card') m.innerHTML = cardHTML(arg), bindCard(arg);
    else if (v === 'me') m.innerHTML = meHTML(), bindMe();
    else if (v === 'review') m.innerHTML = reviewHTML(), bindReview();
    else if (v === 'teacher') m.innerHTML = teacherHTML(), bindTeacher();
    else if (v === 'practice') renderPractice();
    renderHeader();
    if (v !== 'practice') window.scrollTo(0, 0);
    try { const h = ['learn', 'me', 'teacher'].includes(v) ? '#' + v : ''; history.replaceState(null, '', location.pathname + location.search + h); } catch (e) { /* ignore */ }
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
      '</section>' + daily +
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
          S.cards[c.id] = today(); addXP(20); checkBadges(); save(); renderHeader();
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
        if (!sess || sess.over) return;
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
    Object.assign(sess, { item: it, P, queue: bfs(P.root), qi: 0, done: new Set(), depth: depthMap(P.root), cuts: new Set(), rel: null, tries: 0, hint: false, revealed: false, itemMistakes: 0, itemXP: 0, itemHints: 0, finished: false, fb: null, fresh: null });
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
    let body = '<div class="pv-sentence">' + diagram(P, { done: sess.done, cur: sess.finished ? null : n, fresh: sess.fresh }) + '</div>';
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
    return '<div class="cutter-card"><p class="ct-label"><span class="layer">第 ' + layer + ' 层</span>点击词语之间的空隙下刀' + (n.children.length > 2 ? '' : '') + '</p>' +
      '<div class="cutter ' + P.lang + '" role="group" aria-label="切分区">' + cut + '</div>' +
      '<p class="ct-label">再判断切出的部分是什么关系</p><div class="rels">' + rels + '</div>' +
      '<div aria-live="polite">' + fb + '</div><div class="actions">' + actions + '</div></div>';
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
    m.querySelectorAll('[data-act]').forEach(b => b.onclick = () => finishAction(b.dataset.act));
  }
  function submit() {
    const n = curNode();
    if (!sess.cuts.size) { setFb('info', '先在词语之间点一下，切出这一层的直接成分。'); return; }
    if (!sess.rel) { setFb('info', '切好了，再从下面选出结构关系。'); return; }
    const exp = new Set(expCuts(sess.P, n));
    const extra = [...sess.cuts].filter(g => !exp.has(g)), missing = [...exp].filter(g => !sess.cuts.has(g));
    const cutsOK = !extra.length && !missing.length, relOK = sess.rel === n.rel;
    sess.tries++;
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
    let msg;
    if (!cutsOK) {
      if (extra.length && !missing.length) msg = '多切了' + extra.length + '刀。' + (exp.size === 1 ? '这一层只需要一刀：先找直接组合的两大块。' : '有的地方属于下一层。');
      else if (missing.length && !extra.length) msg = '还差' + missing.length + '刀。这一层不止' + (sess.cuts.size + 1) + '段。';
      else msg = '切的位置不对。问问自己：切开后，每一部分还能单独成立吗？意思和原句一样吗？';
      if (sess.rel && relOK) msg += ' （关系先不评。）';
    } else {
      const key = [sess.rel, n.rel].sort().join('|');
      msg = '<b>切对了！</b>关系再想想。' + (PAIR_HINT[key] || ('你选了“' + REL[sess.rel].zh + '”：' + REL[sess.rel].test + ' 这里符合吗？'));
    }
    if (sess.mode === 'boss' && sess.tries >= 2) { reveal(); return; }
    if (sess.mode !== 'boss' && sess.tries === 2) msg += ' 实在想不出，可以点“看答案”。';
    setFb('err', msg);
  }
  function setFb(kind, html) { sess.fb = { kind, html }; renderPractice(); }
  function hint() {
    const n = curNode(); sess.hint = true; sess.itemHints++;
    const parts = n.children.length;
    let h = '这一层要切成 <b>' + parts + '</b> 段（' + (parts - 1) + ' 刀）。';
    if (sess.qi === 0 && sess.item.hint) h += ' ' + esc(sess.item.hint);
    else if (sess.qi > 0 && sess.item.hint && n.children.length > 2) h += ' ' + esc(sess.item.hint);
    setFb('info', h);
  }
  function reveal() {
    const n = curNode();
    sess.cuts = new Set(expCuts(sess.P, n)); sess.rel = n.rel; sess.revealed = true;
    const roles = rolesFor(n);
    const sp = brSpans(sess.P, n);
    const parts = n.children.map((c, k) => '<b>' + esc(spanText(sess.P, sp[k][0], sp[k][1])) + '</b>（' + roles[k] + '）').join(' ｜ ');
    sess.fb = { kind: 'info', html: '答案：' + parts + ' — ' + REL[n.rel].zh + '。' + REL[n.rel].test };
    if (sess.mode === 'boss') sess.fb.html = '两次未中，看看答案：' + parts + ' — ' + REL[n.rel].zh + '。';
    renderPractice();
  }
  function advanceNode(pts) {
    const n = curNode();
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
      '<div class="actions">' + (last ? '<button class="btn" data-act="home">回首页</button><button class="btn primary" data-act="summary">本轮小结</button>' : '<button class="btn ghost" data-act="home">先到这里</button><button class="btn primary" data-act="next">下一句 ›</button>') + '</div></div>';
  }
  function finishAction(a) {
    if (a === 'next') { sess.idx++; loadItem(); renderPractice(); window.scrollTo(0, 0); }
    else if (a === 'home') go('home');
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
    return '<h1 class="page-title">我的 <span>Progress</span></h1>' +
      '<section class="lvl"><p class="eyebrow">等级 ' + (li + 1) + ' / ' + LEVELS.length + '</p><h2 class="lvl-name">' + L.name + '</h2><blockquote class="motto">' + L.q + '<span>' + L.en + '</span></blockquote>' +
      '<ol class="lvl-track">' + LEVELS.map((l, i) => '<li class="' + (i <= li ? 'on' : '') + '"><b>' + l.name + '</b><small>' + l.xp + '</small></li>').join('') + '</ol></section>' +
      '<dl class="sum-stats"><div><dt>总经验</dt><dd>' + S.xp + '</dd></div><div><dt>完成句子</dt><dd>' + S.stats.sent + '</dd></div><div><dt>一次切对率</dt><dd>' + acc + '%</dd></div><div><dt>连续天数</dt><dd>' + streakNow() + '</dd></div></dl>' +
      '<h2 class="sec-title">徽章 <span>Badges</span></h2><div class="badges">' + BADGES.map(b => '<div class="bd' + (S.badges[b.id] ? ' earned' : '') + '"><div class="badge' + (S.badges[b.id] ? ' earned' : '') + '"><span>' + b.g + '</span></div><b>' + b.name + '</b><small>' + b.desc + '</small></div>').join('') + '</div>' +
      '<div class="me-links"><button class="btn" id="me-review">错题本（' + Object.keys(S.mistakes).filter(id => ITEM[id]).length + '）</button><button class="btn" id="me-teacher">教师工具</button><button class="btn ghost danger" id="me-reset">重置进度</button></div><div id="reset-zone"></div>' +
      '<p class="fine">进度只保存在这台设备的浏览器里，不收集任何个人资料。</p>';
  }
  function bindMe() {
    $('#me-review').onclick = () => go('review');
    $('#me-teacher').onclick = () => go('teacher');
    $('#me-reset').onclick = () => {
      $('#reset-zone').innerHTML = '<div class="confirm"><p>确定清除这台设备上的全部进度？此操作无法撤销。</p><div class="actions"><button class="btn" id="rs-no">取消</button><button class="btn danger" id="rs-yes">清除</button></div></div>';
      $('#rs-no').onclick = () => { $('#reset-zone').innerHTML = ''; };
      $('#rs-yes').onclick = () => { S = DEF(); save(); go('me'); toast('进度已清除'); };
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
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('#ov').hidden) { ovQueue.shift(); showOverlay(); }
    if (view === 'practice' && e.key === 'Enter' && e.target.tagName !== 'BUTTON') { const b = $('#pv-submit'); if (b) b.click(); }
  });
  window.addEventListener('hashchange', () => { const h = (location.hash || '').slice(1); if (['learn', 'me', 'teacher'].includes(h) && h !== view) go(h); });
  const h0 = (location.hash || '').slice(1);
  go(['learn', 'me', 'teacher'].includes(h0) ? h0 : 'home');

  // expose parser for tests
  window.PD = { parseTree, bfs, expCuts, brSpans, rolesFor, REL };
})();
