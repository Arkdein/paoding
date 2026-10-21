/**
 * 庖丁 · Apps Script backend (v2)
 * - Receives 问老师 questions  → sheet "问题"   (+ screenshots in Drive folder "庖丁 提问截图")
 * - Receives usage events      → sheet "使用记录"
 * - Serves each student's replies to the app (doGet ?action=inbox&device=…)
 * - When you type a reply in the 老师回复 column, marks the question 已回复 and stamps the time (onEdit)
 * The teacher dashboard is a Claude dashboard that reads this spreadsheet through your Google Sheets connection.
 * Setup and upgrade steps: apps-script/README-问老师.md
 */

const Q_SHEET = '问题';
const U_SHEET = '使用记录';
const FOLDER_NAME = '庖丁 提问截图';
const NOTIFY_EMAIL = '';            // optional: your email, to get an email for every new question
const MAX_SHOT_CHARS = 3 * 1024 * 1024;

const Q_HEADERS = ['时间', '姓名', '班级', '问题', '题号', '题组 · 模式', '句子', '层次 / 片段', '学生作答过程', '正确答案', '学生看到的反馈', '截图', '状态', '老师回复', '回复时间', '提问编号', '设备'];
const U_HEADERS = ['时间', '设备', '姓名', '班级', '类型', '题号', '句子', '题组', '模式', '零失误', '刀数', '一次切对', '各层', '混淆', '分数', '等级', '版本'];

/* ------------------------------------------------------------------ entry points */

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (d.kind === 'events') return json_(logEvents_(d));
    return json_(ask_(d));
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action === 'inbox') return json_(inbox_(String(p.device || '')));
  return json_({ ok: true, app: '庖丁 问老师', sheet: Q_SHEET });
}

/** Run once after pasting the code (▶ Run → setup): creates the sheets and the Drive folder, and grants permissions. */
function setup() {
  sheet_(Q_SHEET, Q_HEADERS);
  sheet_(U_SHEET, U_HEADERS);
  folder_();
}

/** Simple trigger: a reply typed into 老师回复 marks the question answered and stamps the time, so the student's app shows it. */
function onEdit(e) {
  if (!e || !e.range) return;
  const sh = e.range.getSheet();
  if (sh.getName() !== Q_SHEET) return;
  const H = headers_(sh);
  const replyCol = H.indexOf('老师回复') + 1;
  if (!replyCol || e.range.getColumn() > replyCol || e.range.getLastColumn() < replyCol) return;
  for (let r = Math.max(2, e.range.getRow()); r <= e.range.getLastRow(); r++) {
    const text = String(sh.getRange(r, replyCol).getValue() || '').trim();
    setCells_(sh, r, text ? { '状态': '已回复', '回复时间': new Date() } : { '状态': '待回复', '回复时间': '' });
  }
}

/* ------------------------------------------------------------------ students → sheet */

function ask_(d) {
  if (!d.name || !d.q) return { ok: false, error: 'missing name or question' };
  const sh = sheet_(Q_SHEET, Q_HEADERS);
  let shotCell = '';
  if (d.shot && typeof d.shot === 'string' && d.shot.length < MAX_SHOT_CHARS && d.shot.indexOf('base64,') > 0) {
    const bytes = Utilities.base64Decode(d.shot.split('base64,')[1]);
    const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');
    const file = folder_().createFile(Utilities.newBlob(bytes, 'image/jpeg', stamp + '_' + clean_(d.cls) + '_' + clean_(d.name) + '_' + clean_(d.item || 'page') + '.jpg'));
    shotCell = '=HYPERLINK("' + file.getUrl() + '","查看截图")';
  }
  const id = Utilities.getUuid();
  sh.appendRow(rowFor_(sh, {
    '时间': new Date(), '姓名': d.name, '班级': d.cls || '', '问题': d.q, '题号': d.item || '',
    '题组 · 模式': [d.set, d.mode].filter(String).join(' · '), '句子': d.sentence || '', '层次 / 片段': d.layer || '',
    '学生作答过程': d.attempt || '', '正确答案': d.answer || '', '学生看到的反馈': d.feedback || '', '截图': shotCell,
    '状态': '待回复', '老师回复': '', '回复时间': '', '提问编号': id, '设备': d.device || ''
  }));
  if (NOTIFY_EMAIL) {
    MailApp.sendEmail(NOTIFY_EMAIL, '庖丁 新问题：' + d.name + (d.cls ? '（' + d.cls + '）' : ''),
      d.q + '\n\n句子：' + (d.sentence || '') + '\n' + (d.layer || '') + '\n\n作答：\n' + (d.attempt || '') + '\n\n表格：' + SpreadsheetApp.getActiveSpreadsheet().getUrl());
  }
  return { ok: true, id: id };
}

function logEvents_(d) {
  const evs = Array.isArray(d.events) ? d.events.slice(0, 300) : [];
  if (!evs.length || !d.device) return { ok: true, n: 0 };
  const sh = sheet_(U_SHEET, U_HEADERS);
  const rows = evs.map(ev => rowFor_(sh, {
    '时间': new Date(Number(ev.t) || Date.now()), '设备': d.device, '姓名': d.name || '', '班级': d.cls || '',
    '类型': ev.type || '', '题号': ev.item || '', '句子': ev.text || '', '题组': ev.set || '', '模式': ev.mode || '',
    '零失误': ev.clean === undefined ? '' : (ev.clean ? 1 : 0), '刀数': ev.nodes || '', '一次切对': ev.first === undefined ? '' : ev.first,
    '各层': ev.rels || '', '混淆': ev.conf || '', '分数': ev.score || '', '等级': ev.level || '', '版本': d.v || ''
  }));
  sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  return { ok: true, n: rows.length };
}

function inbox_(device) {
  if (!device || device.length < 8) return { ok: true, items: [] };
  const t = table_(Q_SHEET);
  if (!t) return { ok: true, items: [] };
  const items = t.rows.filter(r => String(r['设备']) === device).map(r => ({
    id: String(r['提问编号'] || ''), t: ms_(r['时间']), q: String(r['问题'] || ''), sentence: String(r['句子'] || ''),
    layer: String(r['层次 / 片段'] || ''), status: String(r['状态'] || ''), reply: String(r['老师回复'] || ''), replyAt: ms_(r['回复时间'])
  })).slice(-30);
  return { ok: true, items: items };
}

/* ------------------------------------------------------------------ helpers */

function sheet_(name, H) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.appendRow(H);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, H.length).setFontWeight('bold').setBackground('#e3e8e3');
    if (name === Q_SHEET) {
      sh.setColumnWidth(4, 260); sh.setColumnWidth(7, 260); sh.setColumnWidth(9, 260); sh.setColumnWidth(10, 220); sh.setColumnWidth(14, 260);
      sh.getRange('D:N').setWrap(true);
    }
  } else {
    const have = headers_(sh);
    const missing = H.filter(h => have.indexOf(h) < 0);
    if (missing.length) sh.getRange(1, have.length + 1, 1, missing.length).setValues([missing]).setFontWeight('bold').setBackground('#e3e8e3');
  }
  return sh;
}
function headers_(sh) { const n = sh.getLastColumn(); return n ? sh.getRange(1, 1, 1, n).getValues()[0].map(String) : []; }
function rowFor_(sh, obj) { return headers_(sh).map(h => (h in obj ? obj[h] : '')); }
function table_(name) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sh || sh.getLastRow() < 2) return null;
  const range = sh.getRange(1, 1, sh.getLastRow(), sh.getLastColumn());
  const vals = range.getValues();
  const H = vals[0].map(String);
  const rows = vals.slice(1).map((v, i) => {
    const o = { _row: i + 2 };
    H.forEach((h, j) => { o[h] = v[j]; });
    return o;
  });
  return { sh: sh, H: H, rows: rows };
}
function setCells_(sh, row, obj) {
  const H = headers_(sh);
  Object.keys(obj).forEach(k => { const c = H.indexOf(k); if (c >= 0) sh.getRange(row, c + 1).setValue(obj[k]); });
}
function ms_(v) { if (v instanceof Date) return v.getTime(); const n = Date.parse(v); return isNaN(n) ? 0 : n; }
function folder_() { const it = DriveApp.getFoldersByName(FOLDER_NAME); return it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER_NAME); }
function clean_(s) { return String(s || '').replace(/[\\/:*?"<>|\s]+/g, '').slice(0, 20); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
