# 庖丁 · 层次分析练习

A gamified practice web app for 层次分析 (IC analysis) of Chinese and English sentences, built for the RVHS H2 Translation linguistics module (3-4 语法学).

> 依乎天理，批大郤，导大窾，因其固然。——《庄子·养生主》
> Find the natural joints of a sentence and cut there.

## What students do

| Area | What happens |
|---|---|
| **练习** | Tap the gap between words to cut, pick the relation, confirm. The diagram builds layer by layer in the same bracket-and-label format as the answer keys. Feedback is given at every layer: wrong cut position, missing cut, cut too deep, or right cut with the wrong relation (with a 小窍门 from 《五大基本语法关系》). After two misses, students can reveal the answer. |
| **概念卡** | 13 cards: IC basics, house cutting rules, the five relations plus 连动 / 介宾 / 方位 / 数量, and Chinese–English contrast. Each has worked diagrams and a 2-question check. |
| **辨析挑战** | Timed boss round (6 items, 4 min): same words, different structures (狐狸狡猾 vs 狐狸的狡猾, 进口汽车, 咬死了猎人的狗…). Combos and a time bonus. |
| **错题本** | Any sentence finished with a mistake, hint or reveal lands here. It is cleared by a clean redo. |
| **Gamification** | XP and five levels from 庖丁解牛 (学徒 → 族庖 → 良庖 → 庖丁 → 游刃有余), a daily goal of 5 sentences, a streak, 9 badges, and per-sentence verdicts (刀刃若新 / 良庖之刀 / 族庖之刀). |

Progress lives only in each student's browser (`localStorage`). There are no logins and no personal data, so there are no PDPA concerns. Clearing browser data resets progress.

## Deploy on GitHub Pages (about 5 minutes)

1. Create a new **public** repository on GitHub, e.g. `paoding`.
2. Upload every file in this folder (keep the folder structure: `index.html`, `css/`, `js/`, `data/`, `icons/`, `manifest.webmanifest`, `sw.js`). You can drag the whole folder onto the "Add file → Upload files" page.
3. Go to **Settings → Pages**, set *Source* to "Deploy from a branch", choose `main` and `/ (root)`, then save.
4. After a minute the app is live at `https://<your-username>.github.io/paoding/`. Share that link or a QR code.
5. On phones: Safari → Share → **Add to Home Screen** (iOS), or Chrome → ⋮ → **Install app** (Android). It then opens full-screen and works offline.

## Editing the question bank

All questions live in **`data/bank.js`**. Concept cards live in **`data/concepts.js`**. No build step is needed: edit, commit, done.

**After changing any file, also change `VERSION` at the top of `sw.js`** (e.g. to today's date). Installed copies on students' phones then fetch the update.

### Notation

```
[述宾 学习 汉语]                         relation first, words separated by spaces
[主谓 他 [述补 长^得 [述宾 像 [定中 他 爸]]]]   brackets nest; ^ marks a grey particle that is never cut
[定中 [述宾 咬死^了 猎人]^的 狗]             ^的 after a bracket: particle belongs to the block on its left
[并列 loudly and^ merrily]                and^ / 和^ / that^ / whom^: particle attaches to the RIGHT
[定中* [定中 The boy] [介宾 with [定中 red shorts]]]   * = head first → labels 中｜定 / 中｜状
```

Relations: `主谓 述宾 述补 定中 状中 并列 连动 介宾 方位 数量` (aliases accepted: 动宾 联合 连谓 中补).

House conventions encoded (taken from the answer keys):

- 兼语句 is cut as 述宾 + 主谓: `[述宾 叫 [主谓 他 来]]`.
- 能愿动词 take a 宾语: `[述宾 敢 [述宾 肯定 …]]`.
- 数量词 is always cut to 数｜量.
- The English object complement is labelled 述｜补.
- In 并列, the conjunction goes with the second conjunct.

**Use the built-in 教师工具 (我的 → 教师工具)**: type a tree, see the diagram, catch format errors, and copy a ready-made line for `bank.js`.

Item fields: `id` (unique), `lang` (`zh` / `en`), `tree`, and optionally `hint` (提示 button), `note` (shown after completion), `gloss` (meaning, for the 辨析 round), `src`, `key: true` (from a marked answer key), `review: true` (analysed by Claude; please vet).

## Files

```
index.html             app shell
css/app.css            styles (light + dark)
js/app.js              engine: parser, cutter, feedback, XP, badges, views
data/bank.js           question bank   ← edit this
data/concepts.js       concept cards   ← and this
manifest.webmanifest   install-to-home-screen metadata
sw.js                  offline cache (bump VERSION after edits)
icons/                 app icons
```
