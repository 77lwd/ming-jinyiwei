import type { Chapter1InvestigationState, Chapter1QuestionId, Effect, MainlineChoice, NarrativeBlock } from '../types'

export interface Chapter1InvestigationQuestion {
  id: Chapter1QuestionId
  prompt: string
  shortLabel: string
  requiredMaterialSets: string[][]
  supportedNarrative: NarrativeBlock
}

export interface Chapter1InvestigationRoute {
  id: string
  label: string
  materialIds: string[]
  actions: Array<{ id: string; label: string; materialIds: string[]; narrative: NarrativeBlock }>
}

export interface Chapter1InvestigationBlueprint {
  openQuestions: Chapter1InvestigationQuestion[]
  routes: Chapter1InvestigationRoute[]
}

export const chapter1InvestigationBlueprint: Chapter1InvestigationBlueprint = {
  openQuestions: [
    {
      id: 'wusheng-bag',
      prompt: '吴生为什么拿着装有散银的工作包从后门出来？',
      shortLabel: '吴生离铺是否另有原因',
      requiredMaterialSets: [['sample-slip', 'porter-testimony'], ['sample-slip', 'neighbor-testimony']],
      supportedNarrative: { title: '吴生是被支去后巷的', tone: 'quiet', paragraphs: [{ kind: 'prose', text: '你把送样凭条压在桌角，又把脚夫和邻铺的说法逐句对过。凭条写的是正门，脚夫记得的却是后巷；邻铺听见有人催吴生改路，时间也能接上。' }, { kind: 'prose', text: '这些材料合在一起，只能先钉住一件事：吴生不是无缘无故从后门离开，包里的散银也不能单独把纵火罪扣在他身上。' }, { kind: 'dialogue', text: '覃保坤翻过凭条背面：“先把他为什么离铺写实。至于是谁动的手脚，还得找经手这张凭条的人。”' }] },
    },
    {
      id: 'fire-target',
      prompt: '火为什么先烧向内部记录和印纸存放处？',
      shortLabel: '起火位置是否指向毁证',
      requiredMaterialSets: [['fire-origin', 'dragged-pages'], ['fire-origin', 'package-remains']],
      supportedNarrative: { title: '火是从账架旁起的', tone: 'tense', paragraphs: [{ kind: 'prose', text: '你把火场方位记录和纸页落灰的位置并排摊开。登记架靠后墙，最先卷曲的纸边朝向一致；几页本该留在架下的烧账，却在火起来前被拖到了门槛。' }, { kind: 'prose', text: '若只是门边杂物走火，火势不会先咬住登记架，纸页也不会先离开原处。两份记录对上了：火首先冲着登记架和印纸包去，纸页在起火前已经被人动过。' }, { kind: 'dialogue', text: '覃保坤把两页记录调了个方向：“这就能写进案卷了。先把毁证的手段钉牢，至于是谁动的，还要拿经手记录和口供来接。”' }] },
    },
    {
      id: 'paper-fate',
      prompt: '失窃印纸是否真的全部毁于火中？',
      shortLabel: '印纸是否在火前被转移',
      requiredMaterialSets: [['client-counterfoil', 'quantity-gap'], ['client-counterfoil', 'package-remains']],
      supportedNarrative: { title: '有一批印纸没有留在火里', tone: 'tense', paragraphs: [{ kind: 'prose', text: '客户副联上的数量和入库记录先对上了，随后又在差牌与残存登记里少出一截。纸铺说“全数烧毁”，可账上的数字和带编号的残片都不肯替这句话作证。' }, { kind: 'prose', text: '现在能写进案卷的，是这批印纸确实进过后库，却没有全部留到火后；少掉的那一截，必须沿着经手次序继续查。' }, { kind: 'dialogue', text: '覃保坤点了点副联：“数量先钉住。别急着把缺口写成谁拿走的，下一笔要找的是经手，不是猜人。”' }] },
    },
  ],
  routes: [
    {
      id: 'sample-route', label: '核验送样路线', materialIds: ['sample-slip', 'neighbor-testimony', 'porter-testimony'],
      actions: [
        { id: 'sample-read-slip', label: '先看送样凭条的地址和时刻', materialIds: ['sample-slip'], narrative: { title: '凭条上的空白', tone: 'tense', paragraphs: [{ kind: 'prose', text: '你把凭条压在案板上，先不问吴生有没有偷银，只看地址、时刻和经手人的笔迹。地址写得很满，落款却像是临时补上的。' }, { kind: 'dialogue', text: '覃保坤道：“先记它写了什么，再记它没写什么。空白也能留证。”' }] } },
        { id: 'sample-question-porter', label: '找脚夫核对这张凭条是否送过', materialIds: ['neighbor-testimony', 'porter-testimony'], narrative: { title: '脚夫记得另一条路', tone: 'tense', paragraphs: [{ kind: 'prose', text: '脚夫先说自己只认地址，等你把纸翻到背面，他才想起那天送的不是铺外正门，而是后巷的偏门。邻铺也听见有人催吴生往那边走。' }, { kind: 'system', text: '这只能证明吴生被一张有问题的凭条支开，尚不能证明是谁写下它。' }] } },
      ],
    },
    {
      id: 'fire-scene', label: '勘验火场与后库', materialIds: ['fire-origin', 'dragged-pages', 'package-remains'],
      actions: [
        { id: 'fire-map-origin', label: '沿灰线确认最先起火的位置', materialIds: ['fire-origin'], narrative: { title: '火先咬住后库', tone: 'tense', paragraphs: [{ kind: 'prose', text: '你蹲在湿灰里，用刀鞘拨开一层黑纸。最先卷曲的不是堆在门边的库料，而是靠墙的登记架和印纸包。' }, { kind: 'dialogue', text: '覃保坤道：“火会走，人不会。先记它走过哪里。”' }] } },
        { id: 'fire-check-remains', label: '检查被拖拢的纸页和包装残片', materialIds: ['dragged-pages', 'package-remains'], narrative: { title: '灰里有被动过的痕迹', tone: 'tense', paragraphs: [{ kind: 'prose', text: '几页烧账被拖到门槛边，断绳的纤维却留在后库深处。有人在火势起来前先动过纸包。' }, { kind: 'system', text: '起火位置和残片能说明毁证手段，仍不能单独锁定经手人。' }] } },
      ],
    },
    {
      id: 'client-counterfoil', label: '核对客户副联与数量', materialIds: ['client-counterfoil', 'duty-card', 'quantity-gap'],
      actions: [
        { id: 'client-find-counterfoil', label: '向客户索取留存副联', materialIds: ['client-counterfoil'], narrative: { title: '副联上的预付款', tone: 'quiet', paragraphs: [{ kind: 'prose', text: '客户留存的副联还在，预付款和印纸数量都写得清楚。纸铺说“全烧没了”，副联却证明货确实已经进过后库。' }] } },
        { id: 'client-reconcile-quantity', label: '拿副联对照差牌和内部数量', materialIds: ['duty-card', 'quantity-gap'], narrative: { title: '少掉的不是灰', tone: 'tense', paragraphs: [{ kind: 'prose', text: '你把副联、差牌和纸铺残存的登记页排成一行，少掉的数量正好落在贺兴经手的那一批。' }, { kind: 'dialogue', text: '覃保坤没有替你下结论，只说：“数量能咬住手段，不能越过手段直接咬住人。”' }] } },
      ],
    },
  ],
}

export const chapter1MaterialLabels: Record<string, string> = {
  'sample-slip': '送样凭条',
  'neighbor-testimony': '邻铺证词',
  'porter-testimony': '脚夫证词',
  'fire-origin': '起火位置',
  'dragged-pages': '集中拖拢的纸页',
  'package-remains': '包装残片',
  'client-counterfoil': '客户副联',
  'duty-card': '上级差牌',
  'quantity-gap': '印纸数量缺口',
  'wusheng-testimony': '吴生折返证词',
  'record-order': '复核次序记录',
}

export const chapter1MaterialDescriptions: Record<string, string> = {
  'sample-slip': '地址、时刻和落款存在可复核的异常。',
  'neighbor-testimony': '邻铺听见有人催吴生改走后巷。',
  'porter-testimony': '脚夫记得实际送样路线与凭条不一致。',
  'fire-origin': '最先起火处位于登记架和印纸包附近。',
  'dragged-pages': '烧账在起火前被集中拖到门槛附近。',
  'package-remains': '断绳与带编号残片没有留在同一位置。',
  'client-counterfoil': '客户留存副联写明印纸数量与预付款。',
  'duty-card': '官署差牌能核对该批印纸的用途和数量。',
  'quantity-gap': '残存登记显示贺兴经手批次存在缺口。',
  'wusheng-testimony': '吴生给出了折返时间与后库人影。',
  'record-order': '已整理材料的复核先后，避免口供互相污染。',
}

export function createChapter1InvestigationState(): Chapter1InvestigationState {
  return {
    completedRouteIds: [],
    activeRouteId: null,
    completedActionIds: [],
    materialIds: [],
    fixedFactIds: [],
    openQuestionIds: chapter1InvestigationBlueprint.openQuestions.map((question) => question.id),
    nightChoiceId: null,
    verificationIds: [],
    petitionResultIds: [],
    confrontationMode: null,
    closureSubmitted: false,
  }
}

export interface Chapter1MainlineStep {
  chapter: 'chapter1'
  narrative: NarrativeBlock
  nextNode?: string
  completesPlayableChapter?: boolean
  image?: { src: string; alt: string }
  effects?: Effect[]
  choices?: MainlineChoice[]
}

export const chapter1MainlineSteps: Record<string, Chapter1MainlineStep> = {
  'chapter1.entry': {
    chapter: 'chapter1',
    nextNode: 'chapter1.paper-shop-fire',
    image: {
      src: '/assets/chapter1/chapter1-entry-v1.png',
      alt: '雨后的锦衣卫署门廊下，覃保坤向前示意，廖威达手持记录随行',
    },
    narrative: {
      title: '第一章 · 纸灰里的银子',
      tone: 'quiet',
      paragraphs: [
        { kind: 'prose', text: '入署第一日，覃保坤将你编入百户所，交代新校尉先把查访、勘验和笔录三件事做稳。周寒川从廊下经过，只停了一瞬，便让你随覃百户去城南。' },
        { kind: 'dialogue', text: '覃保坤道：“不是让你抢着定人罪。把看见的、听见的、能核的，分开写。”' },
      ],
    },
  },
  'chapter1.paper-shop-fire': {
    chapter: 'chapter1',
    image: {
      src: '/assets/chapter1/paper-shop-fire-scene-v1.png',
      alt: '城南纸铺后库火灾后的现场，覃保坤与廖威达正在勘验',
    },
    narrative: {
      title: '第一日 · 纸铺火案',
      tone: 'tense',
      paragraphs: [
        { kind: 'prose', text: '城南纸铺的后库刚灭火。覃保坤没有先问谁喊冤，只蹲下看了贺掌柜一眼，又看吴生鞋底的湿泥和工作包的扣结。学徒吴生从后门出来，包里有纸铺的散银；贺掌柜信了侄子贺兴的话，认定他偷银纵火。' },
        { kind: 'dialogue', text: '覃保坤道：“先别动吴生。人可以看着，包和灰别叫杂役碰。你先把看见的记下来，谁的话都等核过再算。这些材料不能由你直接定罪。”' },
        { kind: 'prose', text: '覃保坤已奉差核对供官署使用的印纸和关防样纸。你只能查访、勘验、核验口供；暂扣、封存和移交仍须由覃保坤按程序决定。' },
      ],
    },
    choices: [
      {
        id: 'trace-sample-route',
        label: '先核验送样路线',
        nextNode: 'chapter1.day1-evidence',
        outcomeNarrative: {
          title: '先核验送样路线',
          tone: 'tense',
          paragraphs: [{ kind: 'prose', text: '你先拿着送样凭条走访邻铺与脚夫。若吴生真在说谎，最先露出的应该是他离铺的理由。' }],
        },
      },
      {
        id: 'inspect-fire-scene',
        label: '先勘后库起火处',
        nextNode: 'chapter1.day1-evidence',
        outcomeNarrative: {
          title: '先勘后库起火处',
          tone: 'tense',
          paragraphs: [{ kind: 'prose', text: '你先留在后库，看火从哪里起、先吞掉了什么。若有人要借火掩盖事情，起火位置不会说谎。' }],
        },
      },
      {
        id: 'check-client-counterfoil',
        label: '先查客户副联',
        nextNode: 'chapter1.day1-evidence',
        outcomeNarrative: {
          title: '先查客户副联',
          tone: 'tense',
          paragraphs: [{ kind: 'prose', text: '你先去找客户留存的副联。银子和印纸到底有没有进过纸铺，不能只听掌柜一家怎么说。' }],
        },
      },
    ],
  },
  'chapter1.route-investigation': {
    chapter: 'chapter1',
    image: {
      src: '/assets/chapter1/paper-shop-field-investigation-v1.png',
      alt: '失火纸铺内，廖威达在覃保坤指导下逐项检查烧损纸页、散银与工作包',
    },
    narrative: {
      title: '现场查访 · 先做一件具体的事',
      tone: 'tense',
      paragraphs: [
        { kind: 'prose', text: '你没有把“查送样”“看火场”当成一句结论，而是把要问的人、要看的痕迹和要留下的记录分开。' },
        { kind: 'dialogue', text: '覃保坤道：“查案不是把地点走一遍。你得知道这一趟回来，要多一条什么能复核的东西。”' },
      ],
    },
  },
  'chapter1.day1-evidence': {
    chapter: 'chapter1',
    nextNode: 'chapter1.night-preservation',
    image: {
      src: '/assets/chapter1/paper-shop-evidence-v1.png',
      alt: '纸铺火案中待核对的凭条、工作包、散银与烧焦纸页',
    },
    narrative: {
      title: '第一日 · 两处初核',
      tone: 'tense',
      paragraphs: [
        { kind: 'prose', text: '日落前，你只来得及把两处调查做实。已经取得的材料分别进入案情记录，未查的一处仍然是第二日必须补核的缺口。' },
        { kind: 'dialogue', text: '覃保坤把纸页分成两叠：“能对上的写在前头，对不上的另起一行。别为了让案子好看，就把缺的那块假装补上。”' },
        { kind: 'monologue', text: '眼下只能确认原有指控存在解释不通的地方。谁在说谎、谎话遮住了什么，还需要证据互相咬合。' },
      ],
    },
  },
  'chapter1.night-preservation': {
    chapter: 'chapter1',
    image: {
      src: '/assets/chapter1/paper-shop-night-preservation-v1.png',
      alt: '夜间的失火纸铺内，覃保坤守在已封存的证物桌前，廖威达伏案记录',
    },
    narrative: {
      title: '夜间 · 保全办案条件',
      tone: 'quiet',
      paragraphs: [{ kind: 'prose', text: '纸铺等着复工，吴生仍被看押。你只能先保住一件最容易在夜里变样的事。' }],
    },
    choices: [
      {
        id: 'organize-evidence',
        label: '连夜整理证物与笔录',
        nextNode: 'chapter1.day2-verify',
        outcomeNarrative: { title: '连夜整理', tone: 'quiet', paragraphs: [{ kind: 'prose', text: '你把起火位置、凭条和副联的矛盾写成复核次序，灯火熄时，第二日要先问什么已经清楚。' }] },
      },
      {
        id: 'visit-wusheng',
        label: '看望吴生',
        nextNode: 'chapter1.day2-verify',
        outcomeNarrative: { title: '看望吴生', tone: 'quiet', paragraphs: [{ kind: 'prose', text: '吴生终于说起折返时见过贺兴从后库出来，袖口还沾着纸灰。他不再只等着别人替自己辩白。' }] },
      },
      {
        id: 'guard-remains',
        label: '雇人守住火场残料',
        nextNode: 'chapter1.day2-verify',
        outcomeNarrative: { title: '守住残料', tone: 'quiet', paragraphs: [{ kind: 'prose', text: '你按规矩留下人手看住坍塌处。带包装编号的残片没有被清场的杂役一并运走。' }] },
      },
    ],
  },
  'chapter1.day2-verify': {
    chapter: 'chapter1',
    image: {
      src: '/assets/chapter1/paper-shop-review-v1.png',
      alt: '覃保坤与廖威达在案桌上逐项核对纸铺火案材料',
    },
    narrative: {
      title: '第二日 · 补证与复核',
      tone: 'tense',
      paragraphs: [
        { kind: 'prose', text: '第二日，第一天未查的一处仍可补核；已经取得的材料也需要组成明确命题，才能从“看着可疑”变成可提交的事实。' },
        { kind: 'dialogue', text: '覃保坤用指节敲了敲笔录边角：“材料够不够，不看你说得像不像，看它能不能让旁人照着重走一遍。”' },
      ],
    },
  },
  'chapter1.authorization-review': {
    chapter: 'chapter1',
    image: {
      src: '/assets/chapter1/paper-shop-authorization-review-v1.png',
      alt: '廖威达站在案桌前向覃保坤呈交笔录与证据，请示后续程序处置',
    },
    narrative: {
      title: '第二日 · 向覃保坤请示',
      tone: 'tense',
      paragraphs: [
        { kind: 'prose', text: '你已经固定了一项事实。接下来只能提出办案建议，由覃保坤判断现有证据是否足以封存、补查或暂扣相关人员。' },
        { kind: 'dialogue', text: '覃保坤道：“你报依据，我定程序。少一环，就回案桌补。”' },
      ],
    },
  },
  'chapter1.case-closed': {
    chapter: 'chapter1',
    nextNode: 'chapter1.charred-token',
    image: {
      src: '/assets/chapter1/paper-shop-closed-case-v1.png',
      alt: '火后纸铺外，覃保坤与廖威达带着已核实的材料离开，店内仍有人整理残局',
    },
    narrative: {
      title: '第二日 · 程序处置',
      tone: 'tense',
      paragraphs: [
        { kind: 'prose', text: '责任判断已经写入案卷。现在需要决定如何让贺兴面对证据，并尽量减少吴生和纸铺继续承受的损失。' },
        { kind: 'dialogue', text: '覃保坤道：“证据链是你的，拿捏程序是我的。你先说，想怎么摊开。”' },
      ],
    },
  },
  'chapter1.closure-judgment': {
    chapter: 'chapter1',
    image: {
      src: '/assets/chapter1/paper-shop-closure-judgment-v1.png',
      alt: '廖威达在案桌前书写纸铺火案责任判断，覃保坤在旁复核证据材料',
    },
    narrative: {
      title: '第二日 · 提交责任判断',
      tone: 'tense',
      paragraphs: [
        { kind: 'prose', text: '核验完成后，你必须亲自写下责任判断和支撑它的证据链。材料仍有缺口时，也要把缺口与已固定事实分开呈报。' },
        { kind: 'dialogue', text: '覃保坤道：“先写你能证明的，再写你怀疑的。两行字，别混。”' },
      ],
    },
  },
  'chapter1.charred-token': {
    chapter: 'chapter1',
    nextNode: 'chapter1.feng-reunion',
    image: {
      src: '/assets/chapter1/charred-token-detail-v2.png',
      alt: '一块边缘残留红漆、表面被火烧焦的木牌',
    },
    effects: [{ type: 'set_flag', flag: 'charred_token_preserved', value: true }],
    narrative: {
      title: '案后 · 烧焦木牌入档',
      tone: 'quiet',
      paragraphs: [
        { kind: 'prose', text: '清点坍塌货架时，你从旧料里翻出一块漆木牌。它有悬挂钉孔和朱漆边，横截面上留着两层焦痕；旧焦裂被后来的刨削面截断，牌面身份显然曾被人抹去。' },
        { kind: 'prose', text: '老匠只能确认它经历过更早的火，原本用于标识，后来又被人为削去文字。覃保坤准许将它单独入档，不随废料清走。' },
      ],
    },
  },
  'chapter1.feng-reunion': {
    chapter: 'chapter1',
    completesPlayableChapter: true,
    image: { src: '/assets/events/feng-reunion-event-v2.png', alt: '廖威达与成年冯天顺在案后重逢' },
    effects: [
      { type: 'set_flag', flag: 'tianshun_reconnected', value: true },
      { type: 'relation_change', npcId: 'feng_tianshun', delta: 1 },
    ],
    narrative: {
      title: '案后 · 旧友重逢',
      tone: 'warm',
      paragraphs: [
        { kind: 'prose', text: '案子结后的傍晚，冯天顺在巷口叫住你。他还是说话快，先笑你飞鱼服穿得太板正，转眼又把一句“回来就好”压低了声音。' },
        { kind: 'dialogue', text: '“你进了北镇抚司，我进了军中。”冯天顺拍了拍你的肩，“路是各走各的，酒先欠着。下回见面，别又拿案卷堵我。”' },
        { kind: 'prose', text: '你们约好以后常通消息。那扇隔了多年的门，终于重新开了一条缝。' },
      ],
    },
  },
}
