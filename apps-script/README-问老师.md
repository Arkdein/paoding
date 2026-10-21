# 问老师 & usage data — the Google Sheet backend

## Upgrading to v2 (usage data + replies in the app)

If you set up v1 already, you only need to replace the code:

1. Open the sheet → **Extensions → Apps Script**.
2. Select all of `Code.gs`, delete it, paste in the new [`Code.gs`](Code.gs), and click 💾 **Save**.
3. Choose `setup` in the function dropdown → **▶ Run** (approve if asked). This adds the `使用记录` tab and the new 问题 columns if they are missing.
4. **Deploy → Manage deployments → ✏ (Edit) → Version: New version → Deploy.** The URL stays the same, so the app keeps working.

From then on:
- Each student signs in once (name + class). Every completed sentence, card, boss round and PDF export is logged to `使用记录`.
- **To reply:** type in the `老师回复` column of `问题`. The row turns `已回复` with a timestamp automatically, and the student sees the reply under 我的 → 我的提问 (with a red dot) the next time they open the app.
- The teacher dashboard is a Claude dashboard that reads this sheet live through your Google Sheets connection.

---

# First-time setup (about 5 minutes, once)

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
