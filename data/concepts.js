/* 庖丁 · 概念卡 Concept cards — built on 《五大基本语法关系》 and the 句子成分 lecture.
 * body: short HTML. examples: trees in the same notation as bank.js (rendered as diagrams).
 * quiz: a = index of the correct option. Answering every item correctly collects the card.
 */
window.PD_CONCEPTS = [
  {
    id: 'ic', title: '什么是层次分析', en: 'What IC analysis is',
    body: '<p>句子成分之间的关系<b>不在一个平面上</b>，而是分属不同的层次。层次分析法把句子<b>由大到小</b>逐层切分：每切一刀，找出直接组合在一起的两个成分，并在下面标出它们的身份（主｜谓、述｜宾、定｜中……）。</p><p>单句第一刀一般切在<b>主语和谓语</b>之间。</p><p class="en">Immediate Constituent (IC) analysis splits a sentence top-down, layer by layer, labelling the two parts at every cut.</p>',
    examples: [{ lang: 'zh', tree: '[主谓 王平 [述宾 是 [定中 [数量 一 位] [定中 优秀^的 园艺家]]]]', cap: '练习2025（一）第1题' }],
    quiz: [
      { q: '层次分析每切一刀，要完成哪两件事？', opts: ['切出直接成分，并标出两部分的身份', '找出所有名词和动词', '按字数平均分成两半', '从最后一个词开始往前切'], a: 0 },
      { q: '“王平是一位优秀的园艺家”第一刀切在哪里？', opts: ['王平是 ｜ 一位优秀的园艺家', '王平 ｜ 是一位优秀的园艺家', '王平是一位 ｜ 优秀的园艺家', '王平是一位优秀的 ｜ 园艺家'], a: 1 }
    ]
  },
  {
    id: 'rules', title: '切分的规矩', en: 'House rules for cutting',
    body: '<ol><li><b>由大到小</b>：先主谓，再逐层往下；多层定语、状语<b>从外往里</b>切。</li><li><b>虚词随前</b>：“的、地、得、了、着”随前面的成分，不单独切（灰色显示）：我们的 ｜ 聚会、长得 ｜ 像他爸。</li><li><b>能愿动词带宾语</b>：敢 ｜ 肯定……、愿意 ｜ 参加……，标为述｜宾。</li><li><b>兼语句</b>按述宾 + 主谓切：叫 ｜ 他快去……，再切 他 ｜ 快去……。</li><li><b>数量词</b>要切到底：一个 → 数｜量。</li><li><b>并列项的连词随后</b>：loudly ｜ and merrily。</li></ol>',
    examples: [{ lang: 'zh', tree: '[述宾 叫 [主谓 他 [连动 [述宾 [状中 快 去] 前台] [述宾 呼唤 医生]]]]', cap: '兼语句：述｜宾，宾语本身是主谓' }],
    quiz: [
      { q: '“我们的聚会”应该怎么切？', opts: ['我们 ｜ 的聚会', '我们的 ｜ 聚会', '我 ｜ 们的聚会', '不用切'], a: 1 },
      { q: '“他愿意参加我们的聚会”中，“愿意 ｜ 参加我们的聚会”标为？', opts: ['状｜中', '述｜宾', '述｜补', '连｜动'], a: 1 }
    ]
  },
  {
    id: 'r-zw', rel: '主谓', title: '主谓：说明关系', en: 'Subject–Predicate',
    body: '<p><b>主语</b>是说话人要陈述的对象；<b>谓语</b>是对主语的陈述。</p><p class="tip">小窍门：主语和谓语之间往往能插入“是不是”变成问句；不能插入“的、了、着、得”。插入“的”，结构和意义都会变。</p>',
    examples: [{ lang: 'zh', tree: '[主谓 狐狸 狡猾]', cap: '狐狸是不是狡猾？' }, { lang: 'zh', tree: '[定中 狐狸^的 狡猾]', cap: '插入“的”就变成定中' }],
    quiz: [
      { q: '下列哪一项是主谓结构？', opts: ['狐狸的狡猾', '成绩不错', '洗干净', '认真学习'], a: 1 },
      { q: '检验主谓结构，中间通常可以插入什么？', opts: ['“的”', '“得”', '“是不是”', '“了”'], a: 2 }
    ]
  },
  {
    id: 'r-sb', rel: '述宾', title: '述宾：支配关系', en: 'Verb–Object',
    body: '<p><b>述语</b>举出动作或行为；<b>宾语</b>是受这个动作影响、支配的对象。</p><p class="tip">小窍门：述语和宾语之间可以带上“了、着”；不能插入“的”。插入“的”，“洗衣服”（一种行为）就变成“洗的衣服”（衣服本身）。</p>',
    examples: [{ lang: 'zh', tree: '[述宾 想 办法]' }, { lang: 'en', tree: '[述宾 raised [定中 his hand]]' }],
    quiz: [
      { q: '“洗衣服”和“洗干净”分别是？', opts: ['都是述宾', '述宾、述补', '都是述补', '述补、述宾'], a: 1 },
      { q: '述语和宾语之间可以插入什么而结构不变？', opts: ['“的”', '“了”或“着”', '“是不是”', '“得”'], a: 1 }
    ]
  },
  {
    id: 'r-sbu', rel: '述补', title: '述补：补充关系', en: 'Verb–Complement',
    body: '<p><b>述语</b>是动作或形容词；<b>补语</b>补充说明结果、程度、趋向、数量、可能。怎么找？看“得”字，问“怎么样”。</p><p class="tip">小窍门：述语和补语之间往往可以插入“得”；不能插入“的、了、着”。“得”随前面的述语。</p><p>英语的宾语补足语（consider Telma ｜ the best candidate）也按述｜补标。</p>',
    examples: [{ lang: 'zh', tree: '[述补 写^得 明明白白]' }, { lang: 'en', tree: '[述补 [述宾 consider Telma] [定中 the [定中 best candidate]]]' }],
    quiz: [
      { q: '“长得像他爸”第一刀切在哪里？', opts: ['长 ｜ 得像他爸', '长得 ｜ 像他爸', '长得像 ｜ 他爸', '不用切'], a: 1 },
      { q: '下列哪一项是述补结构？', opts: ['修电灯', '研究清楚', '非常漂亮', '爸爸妈妈'], a: 1 }
    ]
  },
  {
    id: 'r-pz', rel: '定中', title: '偏正：修饰关系', en: 'Modifier–Head',
    body: '<p>前一部分修饰或限定后一部分；后一部分叫<b>中心语</b>。中心语是名词，前一部分叫<b>定语</b>（定｜中）；中心语是动词或形容词，前一部分叫<b>状语</b>（状｜中）。</p><p class="tip">小窍门：定／状语和中心语之间大多可以加“的／地”，基本不改变结构和意思。</p><p>英语的修饰语常放在中心语<b>后面</b>，标为<b>中｜定</b>、<b>中｜状</b>。</p>',
    examples: [{ lang: 'zh', tree: '[定中 木头 房子]' }, { lang: 'zh', tree: '[状中 悄悄 走^了]' }, { lang: 'en', tree: '[定中* [定中 The [定中 clever boy]] [介宾 beside you]]', cap: '中｜定：后置定语' }],
    quiz: [
      { q: '“非常漂亮”是什么关系？', opts: ['定｜中', '状｜中', '述｜补', '主｜谓'], a: 1 },
      { q: 'We left the house at 8am. 中，left the house ｜ at 8am 标为？', opts: ['述｜宾', '中｜状', '状｜中', '主｜谓'], a: 1 }
    ]
  },
  {
    id: 'r-bl', rel: '并列', title: '并列：平等关系', en: 'Coordinate',
    body: '<p>两部分<b>地位平等、不分主次</b>，标为并｜列。</p><p class="tip">小窍门：两个部分中间可以插入“和、并、与”。</p><p>有连词时，连词随<b>后一个</b>并列项：loudly ｜ and merrily。</p>',
    examples: [{ lang: 'zh', tree: '[并列 爸爸 妈妈]' }, { lang: 'zh', tree: '[并列 买 [状中 没 买]]', cap: '买没买' }, { lang: 'en', tree: '[并列 loudly and^ merrily]' }],
    quiz: [
      { q: '“干净不干净”是什么关系？', opts: ['状｜中', '并｜列', '主｜谓', '述｜宾'], a: 1 },
      { q: 'loudly and merrily 应该怎么切？', opts: ['loudly and ｜ merrily', 'loudly ｜ and merrily', 'loudly ｜ and ｜ merrily', '不用切'], a: 1 }
    ]
  },
  {
    id: 'r-ld', rel: '连动', title: '连动', en: 'Serial verbs',
    body: '<p>几个动作由<b>同一个主语</b>先后发出，中间没有停顿和关联词，标为连｜动。动作有先后，不能调换。</p>',
    examples: [{ lang: 'zh', tree: '[连动 [述补 站 起来] [述宾 [述补 腾 出] [定中 [数量 一 把] 椅子]]]', cap: '练习（一）第8题（节选）' }],
    quiz: [
      { q: '“打电话请老张”中，“打电话”和“请老张”的关系是？', opts: ['并｜列', '连｜动', '述｜宾', '状｜中'], a: 1 },
      { q: '连动和并列最大的区别是？', opts: ['连动的动作有先后，不能调换', '连动一定有“和”', '并列只能是名词', '没有区别'], a: 0 }
    ]
  },
  {
    id: 'r-jb', rel: '介宾', title: '介宾', en: 'Preposition–Object',
    body: '<p>介词加上它的宾语，标为介｜宾，整体常作<b>状语</b>（把衣服 ｜ 放在这儿）或补语（放 ｜ 在这儿），英语里常作后置定语或状语（beside you、at 8am）。</p>',
    examples: [{ lang: 'zh', tree: '[状中 [介宾 把 衣服] [述补 放 [介宾 在 这儿]]]' }],
    quiz: [
      { q: '“把衣服”是什么结构？', opts: ['述｜宾', '介｜宾', '定｜中', '主｜谓'], a: 1 },
      { q: '“放在这儿”应该怎么标？', opts: ['述｜补，再 介｜宾', '述｜宾', '状｜中', '连｜动'], a: 0 }
    ]
  },
  {
    id: 'r-fw', rel: '方位', title: '方位', en: 'Noun + localizer',
    body: '<p>名词性成分加<b>方位词</b>（上、下、里、中、前、后），标为方｜位。“在……上”先切介｜宾，再切方｜位。</p>',
    examples: [{ lang: 'zh', tree: '[介宾 在 [方位 [定中 广阔^的 操场] 上]]', cap: 'DI 前测 第4题（节选）' }],
    quiz: [
      { q: '“在广阔的操场上”第一刀切在哪里？', opts: ['在广阔的操场 ｜ 上', '在 ｜ 广阔的操场上', '在广阔的 ｜ 操场上', '不用切'], a: 1 },
      { q: '“我哥哥骑的那辆自行车上”整体是什么结构？', opts: ['方｜位', '定｜中', '主｜谓', '介｜宾'], a: 0 }
    ]
  },
  {
    id: 'r-sl', rel: '数量', title: '数量', en: 'Numeral + measure',
    body: '<p>数词（或指示代词“这、那”）加量词，标为数｜量：一个、那辆、五天。数量词常作定语（一个 ｜ 帆布书包），也可作补语（等他 ｜ 一会儿）。</p>',
    examples: [{ lang: 'zh', tree: '[定中 [数量 一 个] [定中 帆布 书包]]' }],
    quiz: [
      { q: '“一个帆布书包”第一刀切在哪里？', opts: ['一 ｜ 个帆布书包', '一个 ｜ 帆布书包', '一个帆布 ｜ 书包', '不用切'], a: 1 },
      { q: '“一个”再切一刀，标为？', opts: ['定｜中', '数｜量', '并｜列', '不用切'], a: 1 }
    ]
  },
  {
    id: 'contrast', title: '中英结构对比', en: 'Chinese vs English structure',
    body: '<p>标签中英通用，但<b>语序常常相反</b>：</p><ol><li>汉语定语在中心语前；英语介词短语、分词、定语从句作定语时在后（中｜定）。</li><li>汉语状语多在谓语前；英语状语常在句末（中｜状）。</li><li>英语关系代词（whom、whose）、连词 that 随从句，不单独标。</li></ol><p>翻译时，先用层次分析找准修饰关系，再用<b>变序法</b>调整语序。</p>',
    examples: [{ lang: 'en', tree: '[定中* [定中 a shelter] [介宾 for [定中* women [主谓 [定中 whose husbands] [述宾 beat them]]]]]', cap: '两层后置定语' }],
    quiz: [
      { q: '把 the man whom she scolded yesterday 译成中文时，定语从句放在哪里？', opts: ['“男人”之前：她昨天骂过的那个男人', '“男人”之后', '句末', '删去不译'], a: 0 },
      { q: 'The boy carrying a red bag 中，The boy ｜ carrying a red bag 标为？', opts: ['定｜中', '中｜定', '主｜谓', '述｜宾'], a: 1 }
    ]
  }
];
