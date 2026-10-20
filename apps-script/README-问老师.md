# 问老师 — setting up the Google Sheet (about 5 minutes, once)

When a student taps **问老师**, the app sends their name, class and question, along with the sentence, the layer they were on, every attempt they made, the correct answer, the feedback they saw, and a screenshot of the page. Each question becomes one row in a Google Sheet. Screenshots are saved in a Drive folder and linked from the row.

## Steps

1. **Create the sheet.** In Google Drive: New → Google Sheets. Name it e.g. `庖丁 学生提问`.
2. **Open the script editor.** In the sheet: **Extensions → Apps Script**.
3. **Paste the code.** Delete what's in `Code.gs` and paste in the whole of [`Code.gs`](Code.gs) from this folder. Click 💾 Save.
   - Optional: to get an email for every question, put your address in `NOTIFY_EMAIL` at the top.
4. **Grant permissions.** In the toolbar's function dropdown choose `setup`, then click **▶ Run**. Approve the prompts. You may see "Google hasn't verified this app": click **Advanced → Go to (project name)**. This is your own script asking to write to your own Sheet and Drive. A `问题` tab now appears in the sheet.
5. **Deploy it as a web app.** Click **Deploy → New deployment**. Next to "Select type", click the ⚙ and choose **Web app**. Set:
   - **Execute as:** Me
   - **Who has access:** **Anyone**

   Then click **Deploy** and copy the **Web app URL**. It ends in `/exec`.
6. **Send me the URL.** I'll put it in `data/config.js` and push. Or do it yourself: paste it between the quotes of `askUrl` in `data/config.js`, commit, push, and bump `VERSION` in `sw.js`.

The 问老师 button appears in the app once `askUrl` is set.

## Notes

- **"Anyone" isn't offered?** Your school's Google admin may restrict it on a school-managed account. Deploy from a personal Google account instead. Nothing else changes.
- **Edited `Code.gs` later?** Use **Deploy → Manage deployments → ✏ Edit → Version: New version → Deploy**. The URL stays the same.
- **Status column:** each row starts as `待回复`; switch it to `已回复` once you've answered (in class, on SLS, or by email). The `老师回复` column is for your own notes.
- **Privacy:** questions go only to your Sheet and Drive. The web app URL accepts submissions from anyone who has it. It is visible in the public code, so in principle someone could send junk rows. If that ever happens, create a new deployment (new URL) and update `config.js`.
