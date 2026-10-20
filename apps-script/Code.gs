/**
 * 庖丁 · 问老师 receiver (Google Apps Script)
 * Receives questions from the 庖丁 app and writes them to the "问题" sheet of this spreadsheet.
 * Screenshots are saved to a Drive folder named "庖丁 提问截图"; the sheet links to each one.
 * Setup steps: apps-script/README-问老师.md
 */

const SHEET_NAME = '问题';
const FOLDER_NAME = '庖丁 提问截图';
const NOTIFY_EMAIL = '';            // optional: put your email here to get an email for every new question
const MAX_SHOT_CHARS = 3 * 1024 * 1024;

const HEADERS = ['时间', '姓名', '班级', '问题', '题号', '题组 · 模式', '句子', '层次 / 片段', '学生作答过程', '正确答案', '学生看到的反馈', '截图', '状态', '老师回复'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents || '{}');
    if (!d.name || !d.q) return json_({ ok: false, error: 'missing name or question' });

    const sh = sheet_();
    let shotCell = '';
    if (d.shot && typeof d.shot === 'string' && d.shot.length < MAX_SHOT_CHARS && d.shot.indexOf('base64,') > 0) {
      const bytes = Utilities.base64Decode(d.shot.split('base64,')[1]);
      const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');
      const file = folder_().createFile(Utilities.newBlob(bytes, 'image/jpeg', stamp + '_' + clean_(d.cls) + '_' + clean_(d.name) + '_' + clean_(d.item || 'page') + '.jpg'));
      shotCell = '=HYPERLINK("' + file.getUrl() + '","查看截图")';
    }

    sh.appendRow([
      new Date(), d.name, d.cls || '', d.q, d.item || '', [d.set, d.mode].filter(String).join(' · '),
      d.sentence || '', d.layer || '', d.attempt || '', d.answer || '', d.feedback || '', shotCell, '待回复', ''
    ]);

    if (NOTIFY_EMAIL) {
      MailApp.sendEmail(NOTIFY_EMAIL, '庖丁 新问题：' + d.name + (d.cls ? '（' + d.cls + '）' : ''),
        d.q + '\n\n句子：' + (d.sentence || '') + '\n' + (d.layer || '') + '\n\n作答：\n' + (d.attempt || '') + '\n\n表格：' + SpreadsheetApp.getActiveSpreadsheet().getUrl());
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() { return json_({ ok: true, app: '庖丁 问老师', sheet: SHEET_NAME }); }

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#e3e8e3');
    sh.setColumnWidth(4, 260); sh.setColumnWidth(7, 260); sh.setColumnWidth(9, 260); sh.setColumnWidth(10, 220);
    sh.getRange('D:K').setWrap(true);
    const rule = SpreadsheetApp.newDataValidation().requireValueInList(['待回复', '已回复'], true).build();
    sh.getRange('M2:M').setDataValidation(rule);
  }
  return sh;
}
function folder_() { const it = DriveApp.getFoldersByName(FOLDER_NAME); return it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER_NAME); }
function clean_(s) { return String(s || '').replace(/[\\/:*?"<>|\s]+/g, '').slice(0, 20); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/** Run this once from the editor (▶ Run → setup) to create the sheet and grant permissions. */
function setup() { sheet_(); folder_(); }
