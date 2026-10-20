/* 庖丁 · 层次分析 — 题库 Question bank
 * ------------------------------------------------------------------
 * 记法 Notation (one item = one bracketed tree):
 *   [关系 成分 成分 …]        e.g. [述宾 学习 汉语]   (tokens separated by spaces; Chinese must be pre-segmented)
 *   关系*                     head comes FIRST → labels 中｜定 / 中｜状 (English post-modification)
 *   认真^地  骑^的  长^得       ^ inside a word: grey particle, no cut inside
 *   [述宾 咬死^了 猎人]^的      ^的 after a bracket: particle attached to the whole block on its left
 *   and^  和^  that^  whom^   particle attached to the word on its RIGHT (conjunction, relative pronoun)
 * Relations: 主谓 述宾 述补 定中 状中 并列 连动 介宾 方位 数量   (aliases: 动宾 联合 连谓 中补)
 * House conventions (from the RVHS answer keys):
 *   - 兼语句 → 述宾 + 主谓: [述宾 叫 [主谓 他 来]]
 *   - 能愿动词 takes a 宾语: [述宾 愿意 [述宾 参加 …]]
 *   - 数量词 is cut: [数量 一 个]
 *   - English object complement → 述补: [述补 [述宾 consider Telma] …]
 *   - 并列: conjunction goes with the second conjunct (loudly ｜ and merrily)
 *         mean = meaning in the other language (shown under the sentence; analysis still follows the sentence's own structure).
 * Fields: src = where the item comes from; key: true = analysis taken from a marked answer key;
 *         review: true = analysed by Claude following the house conventions, needs a teacher check;
 *         hint (提示 button), note (shown after completion), gloss (meaning shown in the 辨析 round).
 * Use 我的 → 教师工具 in the app to preview a tree before adding it here.
 */
window.PD_BANK = {
  meta: { sample: false, label: '' },
  sets: [
    {
      id: 'phrase', title: '五大关系热身', en: 'Core relations', desc: '短语一刀定结构：主谓、述宾、述补、偏正、并列',
      items: [
        { id: 'p01', mean: "Foxes are cunning.", lang: 'zh', src: '五大基本语法关系', tree: '[主谓 狐狸 狡猾]', hint: '中间能插入“是不是”吗？' },
        { id: 'p02', mean: "Dad comes back.", lang: 'zh', src: '五大基本语法关系', tree: '[主谓 爸爸 回来]' },
        { id: 'p03', mean: "The results are good.", lang: 'zh', src: '五大基本语法关系', tree: '[主谓 成绩 不错]' },
        { id: 'p04', mean: "to wash clothes", lang: 'zh', src: '五大基本语法关系', tree: '[述宾 洗 衣服]', hint: '表示一种行为，还是衣服本身？' },
        { id: 'p05', mean: "to fix the lamp", lang: 'zh', src: '五大基本语法关系', tree: '[述宾 修 电灯]' },
        { id: 'p06', mean: "to think of a way", lang: 'zh', src: '五大基本语法关系', tree: '[述宾 想 办法]' },
        { id: 'p07', mean: "to wash (something) clean", lang: 'zh', src: '五大基本语法关系', tree: '[述补 洗 干净]', hint: '中间能插入“得”：洗得干净。' },
        { id: 'p08', mean: "to look into (something) until it is clear", lang: 'zh', src: '五大基本语法关系', tree: '[述补 研究 清楚]' },
        { id: 'p09', mean: "written very clearly", lang: 'zh', src: '五大基本语法关系', tree: '[述补 写^得 明明白白]' },
        { id: 'p10', mean: "new clothes", lang: 'zh', src: '五大基本语法关系', tree: '[定中 新 衣服]' },
        { id: 'p11', mean: "a wooden house", lang: 'zh', src: '五大基本语法关系', tree: '[定中 木头 房子]' },
        { id: 'p12', mean: "three horses", lang: 'zh', src: '五大基本语法关系', tree: '[定中 [数量 三 匹] 马]', hint: '先切出“三匹”，它本身还能再切一刀。' },
        { id: 'p13', mean: "left quietly", lang: 'zh', src: '五大基本语法关系', tree: '[状中 悄悄 走^了]' },
        { id: 'p14', mean: "very beautiful", lang: 'zh', src: '五大基本语法关系', tree: '[状中 非常 漂亮]' },
        { id: 'p15', mean: "to study conscientiously", lang: 'zh', src: '五大基本语法关系', tree: '[状中 认真 学习]' },
        { id: 'p16', mean: "Dad and Mum", lang: 'zh', src: '五大基本语法关系', tree: '[并列 爸爸 妈妈]', hint: '中间可以插入“和”。' },
        { id: 'p17', mean: "clean or not clean", lang: 'zh', src: '五大基本语法关系', tree: '[并列 干净 [状中 不 干净]]' },
        { id: 'p18', mean: "the cunning of a fox", lang: 'zh', src: '五大基本语法关系', tree: '[定中 狐狸^的 狡猾]', note: '比较“狐狸狡猾”（主谓：说明狐狸的本性）和“狐狸的狡猾”（定中：像狐狸一般的狡猾）。插入“的”，结构和意思都变了。' },
        { id: 'p19', mean: "the clothes that were washed", lang: 'zh', src: '五大基本语法关系', tree: '[定中 洗^的 衣服]', note: '比较“洗衣服”（述宾：一种行为）和“洗的衣服”（定中：衣服本身）。' },
        { id: 'p20', mean: "on the field", lang: 'zh', src: '练习 / 前测', tree: '[介宾 在 [方位 操场 上]]', review: true }
      ]
    },
    {
      id: 'simple', title: '中文单句', en: 'Chinese sentences', desc: '前测与练习（一）：先切主谓，再逐层往下',
      items: [
        { id: 's01', mean: "I don't know that tall man.", lang: 'zh', src: 'DI 前测 第3题', key: true, tree: '[主谓 我 [状中 不 [述宾 认识 [定中 [数量 那 个] [定中 高大^的 男人]]]]]' },
        { id: 's02', mean: "The children play happily on the wide field.", lang: 'zh', src: 'DI 前测 第4题', key: true, tree: '[主谓 孩子 [状中 [介宾 在 [方位 [定中 广阔^的 操场] 上]] [状中 愉快^地 玩耍]]]', hint: '“在广阔的操场上”整体作状语。' },
        { id: 's03', mean: "Wang Ping is an excellent gardener.", lang: 'zh', src: '练习2025（一）第1题', key: true, tree: '[主谓 王平 [述宾 是 [定中 [数量 一 位] [定中 优秀^的 园艺家]]]]' },
        { id: 's04', mean: "He looks like his dad.", lang: 'zh', src: '练习2025（一）第2题', key: true, tree: '[主谓 他 [述补 长^得 [述宾 像 [定中 他 爸]]]]', hint: '“得”随前面的“长”。' },
        { id: 's05', mean: "He doesn't know whether that classmate bought bananas or not.", lang: 'zh', src: '练习（一）第1题', key: true, tree: '[主谓 他 [述宾 [状中 不 知道] [主谓 [定中 [数量 那 位] 同学] [述宾 [并列 买 [状中 没 买]] 香蕉]]]]', hint: '“那位同学买没买香蕉”整体是“知道”的宾语。' },
        { id: 's06', mean: "Did the classmate he doesn't know buy bananas or not?", lang: 'zh', src: '练习（一）第2题', key: true, tree: '[主谓 [定中 [主谓 他 [状中 不 认识^的]] [定中 [数量 那 位] 同学]] [述宾 [并列 买 [状中 没 买]] 香蕉]]', note: '和上一句比较：多了一个“的”，“他不认识”就从句子的主干变成了定语。' },
        { id: 's07', mean: "I'm sure he is willing to come to our gathering.", lang: 'zh', src: '练习（一）第4题', key: true, tree: '[主谓 我 [述宾 敢 [述宾 肯定 [主谓 他 [述宾 愿意 [述宾 参加 [定中 我们^的 聚会]]]]]]]', hint: '能愿动词“敢、愿意”后面的部分作它的宾语。' },
        { id: 's08', mean: "The little frog was so angry that its belly swelled up like a small ball.", lang: 'zh', src: '练习（一）第5题', key: true, tree: '[主谓 [定中 小 青蛙] [述补 气^得 [主谓 肚子 [述补 胀^得 [述宾 像 [定中 [数量 一 个] [定中 小 皮球]]]]]]]' },
        { id: 's09', mean: "Who put the clothes here?", lang: 'zh', src: '练习（一）第7题', key: true, tree: '[述宾 是 [主谓 谁 [状中 [介宾 把 衣服] [述补 放 [介宾 在 这儿]]]]]' },
        { id: 's10', mean: "He stood up, freed up a chair and let me sit down.", lang: 'zh', src: '练习（一）第8题', key: true, tree: '[主谓 他 [连动 [述补 站 起来] [连动 [述宾 [述补 腾 出] [定中 [数量 一 把] 椅子]] [述宾 让 [主谓 我 [述补 坐 下]]]]]]', hint: '“站起来”“腾出一把椅子”“让我坐下”是同一个人先后做的动作。' },
        { id: 's11', mean: "He is willing to come to our gathering.", lang: 'zh', src: '层次分析练习（一）', review: true, tree: '[主谓 他 [述宾 愿意 [述宾 参加 [定中 我们^的 聚会]]]]' },
        { id: 's12', mean: "Wang Ping is a young gardener whom everyone recognises.", lang: 'zh', src: '层次分析练习（一）', review: true, tree: '[主谓 王平 [述宾 是 [定中 [主谓 大家 公认]^的 [定中 小 园艺家]]]]' },
        { id: 's13', mean: "That lamp is so bright that people cannot even open their eyes.", lang: 'zh', src: '层次分析练习（一）', review: true, tree: '[主谓 [定中 [数量 那 盏] 灯] [述补 亮^得 [主谓 [定中 人们 眼睛] [状中 都 [述补 睁 [状中 不 开]]]]]]' }
      ]
    },
    {
      id: 'long', title: '中文长句', en: 'Long sentences', desc: '练习（二）（三）：多层定语、连动、把字句',
      items: [
        { id: 'l01', mean: "Please don't build your happiness on other people's suffering.", lang: 'zh', src: '练习2025（二）第5题', key: true, tree: '[述宾 请 [状中 别 [状中 [介宾 把 [定中 你^的 快乐]] [述补 建立 [介宾 在 [方位 [定中 他人^的 痛苦] 上]]]]]]', hint: '“请”后面的整个部分是它的宾语。' },
        { id: 'l02', mean: "A canvas schoolbag hangs on the bicycle that my brother rides.", lang: 'zh', src: '练习2025（二）第6题', key: true, tree: '[主谓 [方位 [定中 [主谓 [定中 我 哥哥] 骑^的] [定中 [数量 那 辆] 自行车]] 上] [述宾 挂^着 [定中 [数量 一 个] [定中 帆布 书包]]]]', hint: '主语是“我哥哥骑的那辆自行车上”，整体是方位短语。' },
        { id: 'l03', mean: "Tell him to hurry to the front desk and call the doctor to fetch the medicine left in the consultation room!", lang: 'zh', src: '练习2025（三）第9题', key: true, tree: '[述宾 叫 [主谓 他 [连动 [述宾 [状中 快 去] 前台] [述宾 呼唤 [主谓 医生 [状中 [介宾 把 [定中 [述补 落 [介宾 在 诊室]]^的 药物]] [述补 取 来]]]]]]]', hint: '“叫”带一个主谓宾语：他……取来。' },
        { id: 'l04', mean: "He phoned and asked Lao Zhang to help him fetch the padded coat he had left at his younger brother's place.", lang: 'zh', src: '练习2025（三）第10题', key: true, tree: '[主谓 他 [连动 [述宾 打 电话] [述宾 请 [主谓 老张 [连动 [述宾 帮 他] [状中 [介宾 把 [定中 [述补 忘 [介宾 在 [定中 弟弟 那里]]]^的 [定中 棉 大衣]]] [述补 取 [述补 回 来]]]]]]]]' },
        { id: 'l05', mean: "The newly installed lamp on the stage of the big field is so bright that people cannot even open their eyes.", lang: 'zh', src: '练习（一）第6题', key: true, tree: '[主谓 [定中 [方位 [定中 大操场 戏台] 上] [定中 [数量 那 盏] [定中 新安^的 灯]]] [述补 亮^得 [主谓 [定中 人们 眼睛] [状中 都 [述补 睁 [状中 不 开]]]]]]' },
        { id: 'l06', mean: "This problem, which gives everyone a headache, has never been properly solved.", lang: 'zh', src: '层次分析练习（二）', review: true, tree: '[主谓 [定中 [数量 这 个] [定中 [主谓 人人 头疼]^的 问题]] [状中 一直 [状中 没有 [述宾 得到 [定中 [状中 很 好]^的 解决]]]]]', hint: '“人人头疼”本身是主谓短语，整体作定语。' },
        { id: 'l07', mean: "Flocks of sheep wander slowly across the endless grasslands of Inner Mongolia.", lang: 'zh', src: '层次分析练习（二）', review: true, tree: '[主谓 羊群 [状中 [介宾 在 [方位 [定中 [述宾 [述补 望 [状中 不 到]] 边际]^的 [定中 内蒙古 大草原]] 上]] [状中 慢慢^地 游动^着]]]' },
        { id: 'l08', mean: "Someone saw a person in green clothes drive the car away.", lang: 'zh', src: '层次分析练习（三）', review: true, tree: '[述宾 有 [主谓 人 [述宾 看见 [主谓 [定中 [数量 一 个] [定中 [述宾 穿 [定中 绿 衣服]]^的 人]] [状中 [介宾 把 汽车] [述补 开 跑^了]]]]]]' },
        { id: 'l09', mean: "People across the country advance towards the great goal of achieving peaceful reunification.", lang: 'zh', src: '层次分析练习（三）', review: true, tree: '[主谓 [定中 全国 人民] [状中 [介宾 朝 [定中 [述宾 实现 和平统一]^的 [定中 伟大^的 目标]]] 前进]]' }
      ]
    },
    {
      id: 'english', title: '英文句子', en: 'English sentences', desc: '同一套标签；后置修饰标为 中｜定、中｜状',
      items: [
        { id: 'e01', mean: "我最好的朋友满怀热情地喜爱音乐剧。", lang: 'en', src: 'DI 前测 第1题', key: true, tree: '[主谓 [定中 My [定中 best friend]] [状中* [述宾 loves musicals] [介宾 with [定中 strong passion]]]]', hint: 'with strong passion 修饰 loves musicals，放在后面：中｜状。' },
        { id: 'e02', mean: "背着红书包的男孩大声而欢快地唱歌。", lang: 'en', src: 'DI 前测 第2题', key: true, tree: '[主谓 [定中* [定中 The boy] [述宾 carrying [定中 a [定中 red bag]]]] [状中* sings [并列 loudly and^ merrily]]]', hint: 'and 随后一个并列项：loudly ｜ and merrily。' },
        { id: 'e03', mean: "我认为特尔玛是最佳人选。", lang: 'en', src: '练习2025（一）第3题', key: true, tree: '[主谓 I [述补 [述宾 consider Telma] [定中 the [定中 best candidate]]]]', note: 'the best candidate 是宾语补足语，按本校的标法记为“补”。' },
        { id: 'e04', mean: "我们早上八点离开了家。", lang: 'en', src: '练习2025（一）第4题', key: true, tree: '[主谓 We [状中* [述宾 left [定中 the house]] [介宾 at 8am]]]' },
        { id: 'e05', mean: "我喂了那只黑白相间的猫，它的尾巴很滑稽，一只眼睛周围有块斑。", lang: 'en', src: '练习2025（二）第7题', key: true, tree: '[主谓 I [述宾 fed [定中* [定中 the [定中 [并列 black and^ white] cat]] [介宾 with [并列 [定中 the [定中 funny tail]] [定中 and^ a [定中 patched eye]]]]]]]' },
        { id: 'e06', mean: "你旁边那个聪明的男孩举起了手。", lang: 'en', src: '练习2025（二）第8题', key: true, tree: '[主谓 [定中* [定中 The [定中 clever boy]] [介宾 beside you]] [述宾 raised [定中 his hand]]]', note: 'beside you 后置作定语；译成中文要前置：你旁边那个聪明的男孩。' },
        { id: 'e07', mean: "她昨天骂过的那个男人让她非常难过。", lang: 'en', src: '练习2025（三）第11题', key: true, tree: '[主谓 She [状中* [述补 was [状中 deeply upset]] [介宾 by [定中* [定中 the man] [主谓 whom^ she [状中* scolded yesterday]]]]]]', hint: '关系代词 whom 随从句，不单独标。' },
        { id: 'e08', mean: "关于该公司退出竞标的消息震惊了全国。", lang: 'en', src: '练习2025（三）第12题', key: true, tree: "[主谓 [定中* [定中 The news] [介宾 regarding [定中* [定中 [定中 the company's] withdrawal] [介宾 from [定中 the bidding]]]]] [述宾 shocked [定中 the nation]]]" },
        { id: 'e09', mean: "那辆蓝色的飞行汽车突然撞上了大门。", lang: 'en', src: '练习（一）第9题', key: true, tree: '[主谓 [定中 The [定中 blue [定中 flying car]]] [状中 suddenly [述补 rammed [介宾 into [定中 the gate]]]]]' },
        { id: 'e10', mean: "她为遭丈夫殴打的妇女开设了一个庇护所。", lang: 'en', src: '练习（一）第10题', key: true, tree: '[主谓 She [述宾 started [定中* [定中 a shelter] [介宾 for [定中* women [主谓 [定中 whose husbands] [述宾 beat them]]]]]]]', note: '两层后置定语。译成中文：她为那些遭丈夫殴打的妇女开设了一个庇护所。' },
        { id: 'e11', mean: "我们很早就离开了家。", lang: 'en', src: '层次分析练习（一）', review: true, tree: '[主谓 We [状中* [述宾 left [定中 the house]] early]]' },
        { id: 'e12', mean: "穿红短裤的男孩踢球射门，进了一球。", lang: 'en', src: '层次分析练习（一）', review: true, tree: '[主谓 [定中* [定中 The boy] [介宾 with [定中 red shorts]]] [并列 [述宾 kicked [定中 the ball]] [述宾 and^ scored [定中 a goal]]]]' },
        { id: 'e13', mean: "男孩说是他把花瓶摔了。", lang: 'en', src: '层次分析练习（二）', review: true, tree: '[主谓 [定中 The boy] [述宾 said [主谓 that^ he [述宾 dropped [定中 the vase]]]]]', hint: 'that 随宾语从句，不单独标。' },
        { id: 'e14', mean: "约翰相信凯茜知道玛丽帮助了乔治。", lang: 'en', src: '层次分析练习（三）', review: true, tree: '[主谓 John [述宾 believed [主谓 that^ Cathy [述宾 knew [主谓 that^ Mary [述宾 helped George]]]]]]' }
      ]
    },
    {
      id: 'bank', title: '题库精选', en: 'Question bank', desc: '题库100条精选，含数量补语、双宾语、兼语式',
      items: [
        { id: 'q01', mean: "I don't know that person.", lang: 'zh', src: '题库', review: true, tree: '[主谓 我 [状中 不 [述宾 认识 [定中 [数量 那 个] 人]]]]' },
        { id: 'q02', mean: "that person whom I don't know", lang: 'zh', src: '题库', review: true, tree: '[定中 [主谓 我 [状中 不 认识^的]] [定中 [数量 那 个] 人]]', note: '和“我不认识那个人”比较：这是一个定中短语，不是句子。' },
        { id: 'q03', mean: "the interests of the broad masses of the people", lang: 'zh', src: '题库', review: true, tree: '[定中 [定中 广大 人民]^的 利益]' },
        { id: 'q04', mean: "to protect the people's interests", lang: 'zh', src: '题库', review: true, tree: '[述宾 保护 [定中 人民^的 利益]]', note: '和“广大人民的利益”比较：第一刀的位置和关系都不同。' },
        { id: 'q05', mean: "I wrote an essay.", lang: 'zh', src: '题库', review: true, tree: '[主谓 我 [述宾 写^了 [定中 [数量 一 篇] 文章]]]' },
        { id: 'q06', mean: "The essay you wrote is very good.", lang: 'zh', src: '题库', review: true, tree: '[主谓 [定中 [主谓 你 写^的] [定中 [数量 那 篇] 文章]] [状中 很 好]]' },
        { id: 'q07', mean: "My best friend has come.", lang: 'zh', src: '题库', review: true, tree: '[主谓 [定中 我 [定中 [状中 最 好]^的 朋友]] 来^了]' },
        { id: 'q08', mean: "He told me a piece of good news.", lang: 'zh', src: '题库', review: true, tree: '[主谓 他 [述宾 [述宾 告诉 我] [定中 [数量 一 个] [定中 好 消息]]]]', hint: '双宾语：先切出“告诉我”，再看它带的第二个宾语。' },
        { id: 'q09', mean: "prepared five days' worth of dry rations", lang: 'zh', src: '题库', review: true, tree: '[述宾 准备^了 [定中 [数量 五 天] 干粮]]' },
        { id: 'q10', mean: "Wait for him for a while.", lang: 'zh', src: '题库', review: true, tree: '[主谓 你 [述补 [述宾 等 他] [数量 一 会儿]]]', hint: '“一会儿”补充说明“等他”多久。' },
        { id: 'q11', mean: "He glanced coldly at Xiao Wang.", lang: 'zh', src: '题库', review: true, tree: '[主谓 他 [状中 冷冷^地 [述补 [述宾 瞧^了 小王] [数量 一 眼]]]]' },
        { id: 'q12', mean: "We must make all the necessary preparations.", lang: 'zh', src: '题库', review: true, tree: '[主谓 我们 [状中 必须 [述宾 [述补 做 好] [定中 一切 准备]]]]' },
        { id: 'q13', mean: "The children were so happy that they jumped about.", lang: 'zh', src: '题库', review: true, tree: '[主谓 孩子们 [述补 高兴^得 [并列 [状中 又 蹦] [状中 又 跳]]]]' },
        { id: 'q14', mean: "I can't see the words on the blackboard clearly.", lang: 'zh', src: '题库', review: true, tree: '[主谓 我 [述宾 [述补 看 [状中 不 清楚]] [定中 [方位 黑板 上]^的 字]]]' },
        { id: 'q15', mean: "An old lady came walking over from up ahead.", lang: 'zh', src: '题库', review: true, tree: '[主谓 前面 [述宾 [述补 走 [述补 过 来]] [定中 [数量 一 位] 老太太]]]' },
        { id: 'q16', mean: "He is a classmate of the cousin of my mother's colleague.", lang: 'zh', src: '题库', review: true, tree: '[主谓 他 [述宾 是 [定中 [定中 [定中 [定中 我 妈妈]^的 同事]^的 表弟]^的 同学]]]', hint: '多层定语，从最外层切起：……的 ｜ 同学。' },
        { id: 'q17', mean: "Ask Xiao Zhang and Xiao Li to perform a crosstalk.", lang: 'zh', src: '题库', review: true, tree: '[述宾 请 [主谓 [并列 小张 和^ 小李] [述宾 说 相声]]]' },
        { id: 'q18', mean: "I don't agree to choosing him as the representative.", lang: 'zh', src: '题库', review: true, tree: '[主谓 我 [状中 不 [述宾 同意 [述宾 选 [主谓 他 [述宾 当 代表]]]]]]' },
        { id: 'q19', mean: "He immediately ran over.", lang: 'zh', src: '题库', review: true, tree: '[主谓 他 [状中 立刻 [述补 跑^了 [述补 过 来]]]]' },
        { id: 'q20', mean: "You should think of a way to solve this problem.", lang: 'zh', src: '题库', review: true, tree: '[主谓 你们 [述宾 应该 [连动 [述宾 想 [定中 个 办法]] [述宾 解决 [定中 [数量 这 个] 问题]]]]]' },
        { id: 'q21', mean: "I hope you can come and work here with us.", lang: 'zh', src: '题库', review: true, tree: '[述宾 希望 [主谓 你 [述宾 能 [连动 [述宾 来 [定中 我们 这儿]] 工作]]]]' }
      ]
    },
    {
      id: 'boss', title: '辨析挑战', en: 'Contrast & ambiguity round', desc: '同样的词，不同的结构', boss: true,
      items: [
        { id: 'b01', mean: "Foxes are cunning.", lang: 'zh', src: '五大基本语法关系', gloss: '说明狐狸的本性', tree: '[主谓 狐狸 狡猾]' },
        { id: 'b02', mean: "the cunning of a fox", lang: 'zh', src: '五大基本语法关系', gloss: '像狐狸一般的狡猾', tree: '[定中 狐狸^的 狡猾]' },
        { id: 'b03', mean: "to wash clothes (an action)", lang: 'zh', src: '五大基本语法关系', gloss: '指一种行为', tree: '[述宾 洗 衣服]' },
        { id: 'b04', mean: "the clothes that were washed (a thing)", lang: 'zh', src: '五大基本语法关系', gloss: '指衣服本身', tree: '[定中 洗^的 衣服]' },
        { id: 'b05', mean: "I don't know that person.", lang: 'zh', src: '题库', review: true, gloss: '一个完整的句子', tree: '[主谓 我 [状中 不 [述宾 认识 [定中 [数量 那 个] 人]]]]' },
        { id: 'b06', mean: "that person whom I don't know", lang: 'zh', src: '题库', review: true, gloss: '一个名词性短语（“那个人”是谁？）', tree: '[定中 [主谓 我 [状中 不 认识^的]] [定中 [数量 那 个] 人]]' },
        { id: 'b07', mean: "imported cars", lang: 'zh', review: true, gloss: '一种东西：从国外买来的汽车', tree: '[定中 进口 汽车]' },
        { id: 'b08', mean: "to import cars", lang: 'zh', review: true, gloss: '一个动作：这家公司打算从国外买进汽车', tree: '[述宾 进口 汽车]' },
        { id: 'b09', mean: "(something) bit the hunter's dog to death", lang: 'zh', review: true, gloss: '猎人的狗被咬死了', tree: '[述宾 咬死^了 [定中 猎人^的 狗]]' },
        { id: 'b10', mean: "the dog that bit the hunter to death", lang: 'zh', review: true, gloss: '那只狗咬死了猎人', tree: '[定中 [述宾 咬死^了 猎人]^的 狗]' },
        { id: 'b11', mean: "the teacher who cares about the students", lang: 'zh', review: true, gloss: '老师是关心别人的人：这位老师很关心学生', tree: '[定中 [述宾 关心 学生]^的 老师]' },
        { id: 'b12', mean: "to care about the students' teachers", lang: 'zh', review: true, gloss: '老师是被关心的人：我们要多关心老师——学生们的老师', tree: '[述宾 关心 [定中 学生^的 老师]]' },
        { id: 'b13', mean: "students from two schools", lang: 'zh', review: true, gloss: '来自两所学校的学生（人数不定）', tree: '[定中 [定中 [数量 两 个] 学校]^的 学生]' },
        { id: 'b14', mean: "two students of the school", lang: 'zh', review: true, gloss: '学校里的两名学生', tree: '[定中 [数量 两 个] [定中 学校^的 学生]]' },
        { id: 'b15', mean: "老年男子，以及女子", lang: 'en', review: true, gloss: '老年男子，以及（各年龄的）女子', tree: '[并列 [定中 old men] and^ women]' },
        { id: 'b16', mean: "老年男子和老年女子", lang: 'en', review: true, gloss: '老年男子和老年女子', tree: '[定中 old [并列 men and^ women]]' }
      ]
    }
  ]
};
