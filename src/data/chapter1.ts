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
      supportedNarrative: { title: '吴生是被支去后巷的', tone: 'quiet', paragraphs: [{ kind: 'prose', text: '你把凭条、脚夫的口供和邻铺的说法摊在一起。凭条写的是正门，脚夫记得的却是后巷；邻铺听见有人催吴生改路，时间也接得上。' }, { kind: 'prose', text: '吴生确实不是平白从后门出来的。至于包里的散银，单凭这一点还不能拿来定他的罪。' }, { kind: 'dialogue', text: '覃保坤把凭条翻到背面：“先把他为什么离铺写清。写这张凭条的人，还得另找。”' }] },
    },
    {
      id: 'fire-target',
      prompt: '火为什么先烧向内部记录和印纸存放处？',
      shortLabel: '起火位置是否指向毁证',
      requiredMaterialSets: [['fire-origin', 'dragged-pages'], ['fire-origin', 'package-remains']],
      supportedNarrative: { title: '火是从账架旁起的', tone: 'tense', paragraphs: [{ kind: 'prose', text: '你把火场方位图和纸页上的落灰一一对过。登记架靠着后墙，纸边卷曲的方向都朝向同一处；几页烧账却不在架下，而是落在门槛边。' }, { kind: 'prose', text: '门边的杂物若是先着火，灰不会这样落，纸页也不会自己换地方。登记架和印纸包先烧，纸页在起火前被人动过。' }, { kind: 'dialogue', text: '覃保坤把两张记录并到一起：“这就能写进案卷了。动手的人，还要顺着经手的记录找。”' }] },
    },
    {
      id: 'paper-fate',
      prompt: '失窃印纸是否真的全部毁于火中？',
      shortLabel: '印纸是否在火前被转移',
      requiredMaterialSets: [['client-counterfoil', 'quantity-gap'], ['client-counterfoil', 'package-remains']],
      supportedNarrative: { title: '有一批印纸没有留在火里', tone: 'tense', paragraphs: [{ kind: 'prose', text: '客户副联上的数量和入库记录对上了。再往下查，差牌和残存登记却少了一截。纸铺说印纸全烧了，可账上的数字和带编号的残片都不答应。' }, { kind: 'prose', text: '这批印纸进过后库，却没有全留到火后。少掉的那一截，得从经手的人和次序往回查。' }, { kind: 'dialogue', text: '覃保坤按住副联：“先把数记准。缺口是谁留下的，等找到经手的人再说。”' }] },
    },
  ],
  routes: [
    {
      id: 'sample-route', label: '核验送样路线', materialIds: ['sample-slip', 'neighbor-testimony', 'porter-testimony'],
      actions: [
        { id: 'sample-read-slip', label: '先看送样凭条的地址和时刻', materialIds: ['sample-slip'], narrative: { title: '凭条上的空白', tone: 'tense', paragraphs: [{ kind: 'prose', text: '你把凭条摊平。地址写得很满，落款却挤在最下面，墨色也比前面的字新。' }, { kind: 'dialogue', text: '覃保坤接过去看了一眼：“这里，谁补的？”' }] } },
        { id: 'sample-question-porter', label: '找脚夫核对这张凭条是否送过', materialIds: ['neighbor-testimony', 'porter-testimony'], narrative: { title: '脚夫记得另一条路', tone: 'tense', paragraphs: [{ kind: 'prose', text: '脚夫起初只说认得凭条上的地址。你把纸翻到背面，他才想起那天走的不是正门，而是后巷的偏门。邻铺的人也听见有人催吴生往那边去。' }, { kind: 'system', text: '凭条确实把吴生支去了后巷，但写下它的人还没有露面。' }] } },
      ],
    },
    {
      id: 'fire-scene', label: '勘验火场与后库', materialIds: ['fire-origin', 'dragged-pages', 'package-remains'],
      actions: [
        { id: 'fire-map-origin', label: '沿灰线确认最先起火的位置', materialIds: ['fire-origin'], narrative: { title: '火先咬住后库', tone: 'tense', paragraphs: [{ kind: 'prose', text: '你蹲在湿灰里，用刀鞘拨开一层黑纸。门边的库料还压着原来的样子，靠墙的登记架已经卷黑，印纸包也烧穿了。' }, { kind: 'dialogue', text: '覃保坤看着那两处：“别记门口。这里先起的。”' }] } },
        { id: 'fire-check-remains', label: '检查被拖拢的纸页和包装残片', materialIds: ['dragged-pages', 'package-remains'], narrative: { title: '灰里有被动过的痕迹', tone: 'tense', paragraphs: [{ kind: 'prose', text: '几页烧账堆在门槛边，断绳的纤维却留在后库深处。你捻起一小段焦黑的绳头，手上立刻沾了灰。纸包是在火起来前被动过的。' }, { kind: 'system', text: '这些痕迹能说明纸包曾被挪动，至于是谁动的，还得继续查。' }] } },
      ],
    },
    {
      id: 'client-counterfoil', label: '核对客户副联与数量', materialIds: ['client-counterfoil', 'duty-card', 'quantity-gap'],
      actions: [
        { id: 'client-find-counterfoil', label: '向客户索取留存副联', materialIds: ['client-counterfoil'], narrative: { title: '副联上的预付款', tone: 'quiet', paragraphs: [{ kind: 'prose', text: '客户把留存的副联从柜底取出来，纸角还压着一块砚台印。预付款和印纸数量写得清楚，纸铺那句“全烧没了”因此先停在了半路。' }] } },
        { id: 'client-reconcile-quantity', label: '拿副联对照差牌和内部数量', materialIds: ['duty-card', 'quantity-gap'], narrative: { title: '少掉的不是灰', tone: 'tense', paragraphs: [{ kind: 'prose', text: '你把副联、差牌和残存登记页排在案桌上。三张纸的数字一路对下来，缺口正落在贺兴经手的那一批。' }, { kind: 'dialogue', text: '覃保坤看了很久：“数对上了。先别急着写人名。”' }] } },
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
        { kind: 'dialogue', text: '覃保坤翻了翻你的笔录：“后库看过了？”你说看过。他用指节敲了敲纸面：“那你带回来的东西呢？别只写看过。”' },
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
        { kind: 'dialogue', text: '覃保坤把纸页分成两叠，一叠放在左手边，另一叠压在砚台旁：“这些能对上。剩下的，另列。”他看了你一眼，“缺的就是缺的。”' },
        { kind: 'monologue', text: '吴生的口供和铺里的账对不上。至于哪一句是后来改的，眼下还看不出来。' },
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
