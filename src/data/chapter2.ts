import type { Chapter2BranchId, Chapter2CaseId, Chapter2InvestigationState, Effect, MainlineChoice, NarrativeBlock } from '../types'

export interface Chapter2MainlineStep {
  chapter: 'chapter2'
  narrative: NarrativeBlock
  nextNode?: string
  choices?: MainlineChoice[]
}

interface Chapter2ChoiceOutcome {
  caseId: Chapter2CaseId
  completionFlag: 'slip_chain_1' | 'slip_chain_2' | 'slip_chain_3'
  branchId: Chapter2BranchId
  materialIds: string[]
}

export const chapter2MaterialLabels: Record<string, string> = {
  'wet-transfer-stub': '湿透的换押存根',
  'unforced-lock': '未受强力破坏的锁扣',
  'shaft-break-record': '车辕断口勘验记录',
  'cart-drag-trace': '车厢拖拽泥痕记录',
  'cut-rope-fibers': '缺失麻绳与断口纤维',
  'original-escort-order': '原押送差牌对照',
  'zhou-liu-signed-statement': '周六签押口供',
  'zhao-qi-signed-statement': '赵七签押口供',
  'separate-guard-statements': '押役口供对照记录',
  'chen-laojiang-signed-testimony': '陈老桨签押证言',
  'ashun-signed-testimony': '阿顺签押证言',
  'river-route-testimony': '河埠证言对照记录',
  'inspection-credential': '未剪角的封验凭照',
  'indigo-footprints': '通往废染坊的靛色脚印',
  'inheritance-deed': '卢小绫继承副契',
  'credential-handover-record': '茶摊凭照交割记录',
  'night-pass-counterfoil': '夜放牌副券',
  'death-timeline': '门闩血迹与更鼓时序',
  'altered-watch-register': '被改写的值夜簿',
  'cargo-seal-record': '当夜货封放行记录',
}

export const chapter2MaterialDescriptions: Record<string, string> = {
  'wet-transfer-stub': '编号与蜡记均真，但领取人模糊、最终交接地点空白。',
  'unforced-lock': '锁舌、扣环与穿销只有旧油泥，没有撞弯、撬压或新鲜刮痕。',
  'shaft-break-record': '断口木色新鲜，木刺受力方向一致，车辕是在停车后被人折断。',
  'cart-drag-trace': '车底擦痕与两段错开的轮辙表明囚车曾被拖离原位，又重新摆回官道。',
  'cut-rope-fibers': '车钩残留的麻纤维带有平直刀口，缺失麻绳并非受力挣断。',
  'original-escort-order': '原差牌只准沿官道押送入城，没有河埠停靠或中途换押的授权。',
  'zhou-liu-signed-statement': '周六承认自己在柳沟离开看守位置；回来时锁扣仍挂着，车内已经无人。',
  'zhao-qi-signed-statement': '赵七承认自己看牌、开锁并交人，未曾回署核验换押命令。',
  'separate-guard-statements': '两份原口供的相同处、冲突处及能够由物证核对的部分逐栏并列。',
  'chen-laojiang-signed-testimony': '陈老桨固定了渡船离岸的时辰、靠岸位置和东岸篷车的去向，未辨清被带者面貌。',
  'ashun-signed-testimony': '阿顺记录官车、渡船与篷车出现的先后，并承认只从门缝看见有人被抬走。',
  'river-route-testimony': '两份河埠证言的共同路线、身份边界和可由车辙衔接之处逐栏并列。',
  'inspection-credential': '真实封验凭照被用于施压取看房契，回收栏没有剪角。',
  'indigo-footprints': '脚印从卢宅后门通往废染坊，支持卢小绫主动藏身的说法。',
  'inheritance-deed': '副契证明小宅归卢小绫继承，与舅父债务无关。',
  'credential-handover-record': '记录真实凭照如何经中间人交到逼取房契者手中。',
  'night-pass-counterfoil': '副券编号真实，曾被冯六用于放行篷车。',
  'death-timeline': '门闩血迹、尸体位置与更鼓时刻共同固定程佑死亡前后的顺序。',
  'altered-watch-register': '值夜簿在事后改写了放车时刻和当值记录。',
  'cargo-seal-record': '货封编号与放行车辆相符，证明当夜确有篷车出城。',
}

export const chapter2ChoiceOutcomes: Record<string, Chapter2ChoiceOutcome> = {
  'preserve-guard-responsibility': {
    caseId: 'rain-night-transfer',
    completionFlag: 'slip_chain_1',
    branchId: 'c2_01_responsibility_chain',
    materialIds: ['wet-transfer-stub', 'unforced-lock', 'separate-guard-statements'],
  },
  'follow-river-transfer': {
    caseId: 'rain-night-transfer',
    completionFlag: 'slip_chain_1',
    branchId: 'c2_01_route_chain',
    materialIds: ['wet-transfer-stub', 'river-route-testimony'],
  },
  'protect-witness-and-deed': {
    caseId: 'empty-dowry-house',
    completionFlag: 'slip_chain_2',
    branchId: 'c2_02_witness_deed',
    materialIds: ['inspection-credential', 'indigo-footprints', 'inheritance-deed'],
  },
  'trace-credential-handover': {
    caseId: 'empty-dowry-house',
    completionFlag: 'slip_chain_2',
    branchId: 'c2_02_receipt_chain',
    materialIds: ['inspection-credential', 'credential-handover-record'],
  },
  'preserve-death-timeline': {
    caseId: 'before-the-watch-drum',
    completionFlag: 'slip_chain_3',
    branchId: 'c2_03_death_chain',
    materialIds: ['night-pass-counterfoil', 'death-timeline'],
  },
  'preserve-altered-record-chain': {
    caseId: 'before-the-watch-drum',
    completionFlag: 'slip_chain_3',
    branchId: 'c2_03_record_chain',
    materialIds: ['night-pass-counterfoil', 'altered-watch-register', 'cargo-seal-record'],
  },
}

export const chapter2RegisterMaterialIds = ['wet-transfer-stub', 'inspection-credential', 'night-pass-counterfoil']

const noEffects: Effect[] = []

export const chapter2ActionMaterials: Record<string, string[]> = {
  'c2-01-inspect-lock': ['unforced-lock'],
  'c2-01-inspect-shaft': ['shaft-break-record'],
  'c2-01-trace-drag-marks': ['cart-drag-trace'],
  'c2-01-examine-rope-fibers': ['cut-rope-fibers'],
  'c2-01-preserve-wet-stub': ['wet-transfer-stub'],
  'c2-01-compare-escort-order': ['original-escort-order'],
}

export const chapter2MaterialProvenance: Record<string, { kind: string; source: string; formation: string }> = {
  'unforced-lock': { kind: '现场勘验', source: '囚车锁扣', formation: '按原位描图后拆检锁舌、扣环和穿销，包布编号入档。' },
  'shaft-break-record': { kind: '现场勘验', source: '囚车车辕', formation: '清开断口泥水，记录木色、木刺方向和断口内残留。' },
  'cart-drag-trace': { kind: '现场勘验', source: '桥坡与车底', formation: '量取轮距，对照官道断辙、桥坡沟痕和车底湿泥方向。' },
  'cut-rope-fibers': { kind: '物证检视', source: '囚车尾钩', formation: '从空车钩挑取残留湿麻，压黑纸观察纤维断口。' },
  'wet-transfer-stub': { kind: '文书原件', source: '车厢底板', formation: '以干纸吸水后揭取，保全编号、蜡记、领取人和交接栏原貌。' },
  'original-escort-order': { kind: '文书对照', source: '百户所值房', formation: '调取封存原差牌，与湿存根逐栏核对路线、权限和交接手续。' },
  'zhou-liu-signed-statement': { kind: '签押口供', source: '押役周六', formation: '三轮问话完成后，经逐句归类、当面复述并按印形成。' },
  'zhao-qi-signed-statement': { kind: '签押口供', source: '押役赵七', formation: '与周六隔离闻讯，经三轮追问、撤回前说、复述并按印形成。' },
  'separate-guard-statements': { kind: '口供对照', source: '周六与赵七', formation: '周六与赵七两份原口供分别签押后，再把相同、冲突和物证可核处并列成页。' },
  'chen-laojiang-signed-testimony': { kind: '签押证言', source: '船夫陈老桨', formation: '单独核清时辰、渡路和辨认边界，经复述并按指印形成。' },
  'ashun-signed-testimony': { kind: '签押证言', source: '茶棚伙计阿顺', formation: '单独核清所见位置与车船次序，经改正前说、复述并按指印形成。' },
  'river-route-testimony': { kind: '证言对照', source: '陈老桨与阿顺', formation: '两份原证言分别签押后，再把共同路线、身份边界和车辙衔接处并列成页。' },
}

export const chapter2Case1VerificationSets: Record<string, readonly string[]> = {
  'self-escape': ['unforced-lock', 'shaft-break-record', 'cart-drag-trace', 'cut-rope-fibers'],
  'guard-duty': ['original-escort-order', 'wet-transfer-stub', 'zhou-liu-signed-statement', 'zhao-qi-signed-statement', 'separate-guard-statements'],
  'illegal-transfer': ['wet-transfer-stub', 'cart-drag-trace', 'original-escort-order', 'chen-laojiang-signed-testimony', 'ashun-signed-testimony', 'river-route-testimony'],
}

export type Chapter2InquiryReview = {
  title: string
  instruction: string
  categories: Array<{ id: string; label: string }>
  statements: Array<{ id: string; text: string }>
  expected: string[]
  successTitle: string
  successText: string
  nextNode: string
  completionId?: string
  materialId?: string
}

export const chapter2InquiryReviews: Record<string, Chapter2InquiryReview> = {
  'chapter2.case1-inquiry.guard-a.review': {
    title: '整理周六口供', instruction: '把周六亲眼见到的、听来的推断和需要与物证核对的缺口分开。',
    categories: [{ id: 'fact', label: '写入亲见事实' }, { id: 'pending', label: '列入待核' }, { id: 'conflict', label: '标记冲突' }],
    statements: [
      { id: 'zhou-stop', text: '柳沟来了两个人，赵七接过一张纸；周六离开后回来，锁扣挂着，车内无人。' },
      { id: 'zhou-guess', text: '来人拿的一定是有效换押文书，马骁必定由他们合法接走。' },
      { id: 'zhou-gap', text: '周六先称行车中翻车，却没听见断木声；车辕断口也没有行车带泥。' },
    ],
    expected: ['zhou-stop:fact', 'zhou-guess:pending', 'zhou-gap:conflict'],
    successTitle: '周六口供复述签押', successText: '书记官按三栏誊清。周六听过一遍，在“未见马骁如何离车”一行旁按下手印。',
    nextNode: 'chapter2.case1-inquiry.guard-a.signed', completionId: 'c2-01-guard-a-statement', materialId: 'zhou-liu-signed-statement',
  },
  'chapter2.case1-inquiry.guard-b.review': {
    title: '整理赵七口供', instruction: '只把赵七承认亲手做过的事写成事实；他的辩解与前后冲突另列。',
    categories: [{ id: 'fact', label: '写入亲历事实' }, { id: 'pending', label: '列入待核' }, { id: 'conflict', label: '标记冲突' }],
    statements: [
      { id: 'zhao-open', text: '赵七签领钥匙、看牌、开锁，并在没有回署核验时让来人带走马骁。' },
      { id: 'zhao-claim', text: '来人所持牌子必定是真的，因此赵七没有责任。' },
      { id: 'zhao-denial', text: '赵七先称无人来过、马骁撞门逃走，后又承认自己开锁并重新挂锁。' },
    ],
    expected: ['zhao-open:fact', 'zhao-claim:pending', 'zhao-denial:conflict'],
    successTitle: '赵七口供复述签押', successText: '赵七撤回“撞门逃走”的说法，把看牌、开锁和未回署核验逐项复述，在末页按下手印。',
    nextNode: 'chapter2.case1-inquiry.guard.compare', completionId: 'c2-01-guard-b-statement', materialId: 'zhao-qi-signed-statement',
  },
  'chapter2.case1-inquiry.guard.compare': {
    title: '对照两份押役口供', instruction: '找出两人能够互相印证的事实、真正冲突的说法，以及可以解决冲突的物证。',
    categories: [{ id: 'confirmed', label: '相互印证' }, { id: 'conflict', label: '口供冲突' }, { id: 'evidence', label: '物证解决' }],
    statements: [
      { id: 'guard-stop', text: '囚车在柳沟停下，来人接近囚车，周六曾离开看守位置。' },
      { id: 'guard-order', text: '是谁让周六离岗、钥匙当时由谁保管，两人的说法不能互相照看。' },
      { id: 'guard-lock', text: '锁扣没有撞痕，原差牌也没有中途换押授权。' },
    ],
    expected: ['guard-stop:confirmed', 'guard-order:conflict', 'guard-lock:evidence'],
    successTitle: '押役口供对照入卷', successText: '相同处、冲突处和物证能够固定的部分分栏抄清，两份原口供仍各自封存。',
    nextNode: 'chapter2.case1-inquiry-select', materialId: 'separate-guard-statements',
  },
  'chapter2.case1-inquiry.river-boat.review': {
    title: '整理陈老桨证言', instruction: '船夫能固定水路与时辰，但不能替案卷认定被带者身份。',
    categories: [{ id: 'fact', label: '写入亲见事实' }, { id: 'pending', label: '列入待核' }, { id: 'conflict', label: '标记冲突' }],
    statements: [{ id: 'boat-route', text: '三更第三梆后，一人被两人架上船；船靠东岸芦苇地，篷车随后南去。' }, { id: 'boat-name', text: '被架上船的人就是马骁。' }, { id: 'boat-count', text: '船夫起初说“两个病人”，细问后承认只有一名被架扶者。' }],
    expected: ['boat-route:fact', 'boat-name:pending', 'boat-count:conflict'], successTitle: '陈老桨证言复述签押', successText: '陈老桨沿着水路重新说过一遍，在“未看清被带者面貌”后按下指印。', nextNode: 'chapter2.case1-inquiry.river-boat.signed', completionId: 'c2-01-river-boat-statement', materialId: 'chen-laojiang-signed-testimony',
  },
  'chapter2.case1-inquiry.river-tea.review': {
    title: '整理阿顺证言', instruction: '把门缝里的亲见、隔河辨认不清的部分和前后改口分开。',
    categories: [{ id: 'fact', label: '写入亲见亲听' }, { id: 'pending', label: '列入待核' }, { id: 'conflict', label: '标记冲突' }],
    statements: [{ id: 'tea-sequence', text: '官车先到、篷车后到；车内有两下撞板声，有人被抬往河边。' }, { id: 'tea-name', text: '阿顺看清了被抬者就是马骁。' }, { id: 'tea-denial', text: '阿顺先说没有出去看，后来承认曾从门缝观察车外。' }],
    expected: ['tea-sequence:fact', 'tea-name:pending', 'tea-denial:conflict'], successTitle: '阿顺证言复述签押', successText: '阿顺把官车到埠、渡船离岸和篷车南去的次序复述一遍，在末页按下指印。', nextNode: 'chapter2.case1-inquiry.river.compare', completionId: 'c2-01-river-tea-statement', materialId: 'ashun-signed-testimony',
  },
  'chapter2.case1-inquiry.river.compare': {
    title: '对照两份河埠证言', instruction: '两人只能共同固定路线，不能共同确认被带者身份。',
    categories: [{ id: 'confirmed', label: '相互印证' }, { id: 'conflict', label: '保留边界' }, { id: 'evidence', label: '物证衔接' }],
    statements: [{ id: 'river-route', text: '三更后有人从茶棚附近被带往渡船，东岸有篷车接应并向南离开。' }, { id: 'river-identity', text: '两人都没有看清被带者面貌，不能据此写成已经认出马骁。' }, { id: 'river-trace', text: '桥坡拖痕和错开的轮辙把囚车与河埠方向接在一起。' }],
    expected: ['river-route:confirmed', 'river-identity:conflict', 'river-trace:evidence'], successTitle: '河埠证言对照入卷', successText: '水路、时辰和篷车去向由两份独立证言互相印证；身份仍列待查。', nextNode: 'chapter2.case1-inquiry-select', materialId: 'river-route-testimony',
  },
}

export const chapter2Case1InvestigationActions: MainlineChoice[] = [
  { id: 'c2-01-inspect-lock', label: '勘验囚车、锁扣与车辕', nextNode: 'chapter2.case1-route-cart', effects: noEffects, outcomeNarrative: { title: '锁没有被人撞开', tone: 'tense', paragraphs: [{ kind: 'prose', text: '你先让人照着原位画下锁扣，才拔出穿销。锁孔里都是旧油泥，没有新刮出的铜屑；锁舌和扣环也找不到撬压留下的亮痕。雨水顺着车门往下淌，锁却是有人拿钥匙打开后重新挂回去的。' }, { kind: 'prose', text: '书记官把锁扣包进粗布，位置、朝向和穿销次序逐项写在签条上。车辕断口还在泥里，须接着查。' }] } },
  { id: 'c2-01-inspect-shaft', label: '清开泥水，复看车辕断口', nextNode: 'chapter2.case1-investigation', effects: noEffects, outcomeNarrative: { title: '车停了，木头才断', tone: 'tense', paragraphs: [{ kind: 'prose', text: '断口外面糊满泥，里面的木色却还是浅的。你用竹片一点点剔开木刺，朝向全往同一边倒，断口深处没有行车时该带进去的泥砂。' }, { kind: 'prose', text: '这根车辕不是在路上颠断的。车已经停稳，才有人压住一头，把它硬折下来。' }] } },
  { id: 'c2-01-trace-drag-marks', label: '追查车底拖痕与遗留麻绳', nextNode: 'chapter2.case1-route-traces', effects: noEffects, outcomeNarrative: { title: '车被重新摆过', tone: 'quiet', paragraphs: [{ kind: 'prose', text: '官道上的轮辙在车后断了一截，桥坡下却另有两道被雨水冲浅的沟。你让人横放木尺，量过轮距，再伏低去看车底。横梁上的湿泥向河埠一侧拖开，边缘已经结了一层薄浆。' }, { kind: 'prose', text: '囚车先被拖下官道，隔了一阵，又被摆回翻倒的位置。空车钩上还留着湿麻，须顺着这一处继续查。' }] } },
  { id: 'c2-01-examine-rope-fibers', label: '检查空车钩与残留麻纤维', nextNode: 'chapter2.case1-investigation', effects: noEffects, outcomeNarrative: { title: '少掉的那条麻绳', tone: 'quiet', paragraphs: [{ kind: 'prose', text: '车尾两只铁钩，一只还缠着旧绳，另一只空着。你从钩根挑出几根湿麻，压在黑纸上对光看。纤维末端平齐，不是绷断时留下的乱茬。' }, { kind: 'prose', text: '有人用过这条绳，事后又拿刀割走。至于是绑人、拖车，还是两样都做过，卷里暂不多写。' }] } },
  { id: 'c2-01-preserve-wet-stub', label: '核验换押存根与原押送差牌', nextNode: 'chapter2.case1-route-documents', effects: noEffects, outcomeNarrative: { title: '没有去处的换押存根', tone: 'quiet', paragraphs: [{ kind: 'prose', text: '纸片黏在底板缝里，硬揭就会掉字。你先用干纸覆住两面，换了三次，等纸筋稍稍回硬，才从角上慢慢揭开。编号、纸种和半枚蜡记都是真的，领取人只剩一个被水晕开的姓，交接地点那一栏却从来没有落过笔。' }, { kind: 'prose', text: '真纸没有把手续变真。要知道它缺了什么，还得回所调出原差牌逐栏对照。' }] } },
  { id: 'c2-01-compare-escort-order', label: '回所调出原差牌，逐栏对照', nextNode: 'chapter2.case1-investigation', effects: noEffects, outcomeNarrative: { title: '原差牌上没有河埠', tone: 'quiet', paragraphs: [{ kind: 'prose', text: '原差牌从值房匣中调出时，封口仍是昨夜的旧蜡。押送人名、出发时刻和入城路线都写得清楚：过河桥后直走北门，不许中途停靠，也没有另派人接手。' }, { kind: 'prose', text: '你把湿存根平码在差牌旁边。两张纸的编号能接上，手续却接不上。书记官另起一页，把没有得到批准的每一处空白抄了下来。' }] } },
]

export const chapter2Case1Questions = [
  { id: 'self-escape', stageLabel: '基础事实 · 必须核验', shortLabel: '马骁是否自行破锁逃脱？', prompt: '只核对锁具、车辆移动与绳索使用留下的现场痕迹。', requiredCount: 4 },
  { id: 'guard-duty', stageLabel: '结案侧重 · 与去向方向二选一', shortLabel: '押役是否存在失职？', prompt: '核对原押送命令、换押手续与两名押役各自所见。', requiredCount: 5 },
  { id: 'illegal-transfer', stageLabel: '结案侧重 · 与责任方向二选一', shortLabel: '是否发生未经批准的转移？', prompt: '核对换押存根、车辆去向和河埠证人的目击。', requiredCount: 6 },
] as const

export function createChapter2InvestigationState(): Chapter2InvestigationState {
  return { activeCaseId: null, completedActionIds: [], caseMaterialIds: [], completedCaseIds: [], branchIds: [], materialIds: [], fixedFactIds: [], registerVerified: false }
}

export const chapter2MainlineSteps: Record<string, Chapter2MainlineStep> = {
  'chapter2.rain-night-transfer': {
    chapter: 'chapter2',
    narrative: {
      title: '第一案 · 雨夜失押',
      tone: 'tense',
      paragraphs: [
        { kind: 'prose', text: '河桥边的押送车歪在泥里。锁扣仍挂在门上，锁舌没有弯，车辕断口的木屑却朝外翻。两个押役对翻车方向各说一边。' },
        { kind: 'prose', text: '车厢内少了一条麻绳，泥痕从低处一直拖到门边。有人把马骁拖出车厢，又将锁扣重新挂了回去。' },
        { kind: 'dialogue', text: '覃保坤命人把两名押役分开：“先问亲眼见到的，再问后来听来的。谁把听来的写成亲眼见到，谁自己担。”' },
      ],
    },
    choices: [
      { id: 'c2-01-lock', label: '先检查押送车锁扣与车辕', nextNode: 'chapter2.case1-lock', effects: noEffects, outcomeNarrative: { title: '锁扣没有被撞开', tone: 'tense', paragraphs: [{ kind: 'prose', text: '你蹲在泥里，用灯笼照着锁舌和扣环。锁舌没有撞弯，扣环内侧也没有新裂口。车辕断处的木屑却朝外翻，像是车厢里的人被什么力量拖向了门边。' }, { kind: 'prose', text: '你让书记官把锁扣单独包好，在门闩旁压下一枚小木签，标明它原来挂着的位置。' }] } },
      { id: 'c2-01-stub', label: '先查看换押文书与车内遗留物', nextNode: 'chapter2.case1-stub', effects: noEffects, outcomeNarrative: { title: '存根上的空白', tone: 'quiet', paragraphs: [{ kind: 'prose', text: '车厢底板积着雨水。湿透的换押存根编号和蜡记都是真的，领取人却只剩模糊别号，最终交接地点一栏干干净净。你把原件夹在干纸之间，先记下它在车厢里的位置。' }] } },
    ],
  },
  'chapter2.case1-lock': {
    chapter: 'chapter2',
    narrative: { title: '第一案 · 车辕断口', tone: 'tense', paragraphs: [{ kind: 'prose', text: '泥痕从车厢低处拖到门边，麻绳少了一条。你把锁扣、车辕和拖痕分别编号，先不替谁写结论。' }] },
    choices: [{ id: 'c2-01-stub', label: '查看换押文书和车内遗留物', nextNode: 'chapter2.case1-inquiry', effects: noEffects, outcomeNarrative: { title: '存根上的空白', tone: 'quiet', paragraphs: [{ kind: 'prose', text: '湿透的换押存根编号和蜡记都真，领取人只剩模糊别号，最终地点空白。' }] } }],
  },
  'chapter2.case1-stub': {
    chapter: 'chapter2',
    narrative: { title: '第一案 · 车里的遗留物', tone: 'tense', paragraphs: [{ kind: 'prose', text: '换押存根被夹在车厢底板和一块旧木片之间。麻绳纤维卡在缝里，断口上的泥和河桥边的泥色相近，却还不能单凭颜色下结论。' }] },
    choices: [{ id: 'c2-01-lock', label: '回查锁扣、门闩与拖拽方向', nextNode: 'chapter2.case1-inquiry', effects: noEffects, outcomeNarrative: { title: '锁扣仍在原处', tone: 'tense', paragraphs: [{ kind: 'prose', text: '你回到车门边，把锁扣、门闩和车辕断口连成一条线。锁没有被撞开，拖痕却从车厢低处斜向门外，少掉的麻绳不可能替人自己解开。' }] } }],
  },
  'chapter2.case1-inquiry': {
    chapter: 'chapter2',
    narrative: { title: '第一案 · 分开问话', tone: 'tense', paragraphs: [{ kind: 'prose', text: '雨声压在偏房的瓦上。押役和河埠证人被分在两间屋里，案桌上只留已经固定的锁扣和换押存根。覃保坤让书记官把每一句话照原样记下。' }, { kind: 'dialogue', text: '“先问他亲眼见到的，再问他后来听来的。”覃保坤说，“两种话不能挤在同一栏里。”' }] },
    choices: [
      { id: 'c2-01-guard-interview', label: '先闻讯押役：追问离岗与交接', nextNode: 'chapter2.case1-close-review', effects: noEffects, outcomeNarrative: { title: '两份不能互相照看的口供', tone: 'tense', paragraphs: [{ kind: 'prose', text: '你没有先问马骁去了哪里，只把湿存根压在桌角，问周六谁让他离开车旁。他先说去牵马，听见锁扣没有撞响后，又改口说是赵七让他去的。' }, { kind: 'prose', text: '你把“回来时锁已挂上”和“没有亲眼见到马骁离开”分开落笔。另一名押役想替他补一句，你抬手让书记官停笔，先把两人的话分在两张纸上。' }, { kind: 'dialogue', text: '“别因为他们胆小，就写成同谋；也别因为他们没想明白，就把责任抹掉。”覃保坤在门外说。' }] } },
      { id: 'c2-01-river-interview', label: '先闻讯河埠证人：追问篷车去向', nextNode: 'chapter2.case1-close-review', effects: noEffects, outcomeNarrative: { title: '雨水里留下的去向', tone: 'tense', paragraphs: [{ kind: 'prose', text: '茶棚伙计起初只说听见车轮声。你把三更的更鼓和渡口换班时刻摆在他面前，问他为什么现在才提起车厢里的敲击。' }, { kind: 'prose', text: '他望着门外的雨，说自己不想惹押送班。船夫补上篷车离开的方向和时刻，却说不清车里的人是谁。你把“有人敲过两下木板”记作证言，把姓名和身份留在待查栏。' }, { kind: 'dialogue', text: '覃保坤接过记录：“去向先落下，别把听见两声敲击写成已经认出马骁。”' }] } },
    ],
  },
  'chapter2.case1-investigation': {
    chapter: 'chapter2',
    narrative: { title: '雨夜失押 · 调查案桌', tone: 'quiet', paragraphs: [{ kind: 'prose', text: '现场图、车上遗物和两张差牌分开放着。已经查过的地方用朱点压住，尚未动手的部分仍留着空栏。你可以换一条线继续，不必照固定次序把现场走完。' }] },
  },
  'chapter2.case1-route-cart': {
    chapter: 'chapter2',
    narrative: { title: '调查线 · 囚车与锁具', tone: 'tense', paragraphs: [{ kind: 'prose', text: '锁扣已经拆下入袋。车辕断口仍压在泥里，若不趁雨势加重前复看，断面很快会被泥水泡透。' }] },
  },
  'chapter2.case1-route-traces': {
    chapter: 'chapter2',
    narrative: { title: '调查线 · 拖痕与麻绳', tone: 'quiet', paragraphs: [{ kind: 'prose', text: '轮辙已经把囚车被移动过的方向留下。车尾空钩上的残纤维，是这条线剩下的查验。' }] },
  },
  'chapter2.case1-route-documents': {
    chapter: 'chapter2',
    narrative: { title: '调查线 · 换押文书', tone: 'quiet', paragraphs: [{ kind: 'prose', text: '湿存根已经保住，编号和蜡记也能辨认。下一步是调出原押送差牌，把路线、交接和授权逐栏对上。' }] },
  },
  'chapter2.case1-inquiry-select': {
    chapter: 'chapter2',
    narrative: { title: '雨夜失押 · 分开闻讯', tone: 'tense', paragraphs: [{ kind: 'prose', text: '现场和文书已经查完。两名押役各候一室，河埠的船夫与茶棚伙计也分开等候。每个人都要从头问完、复述确认并签押，才能形成自己的口供。' }] },
  },
  'chapter2.case1-inquiry.guard-a.review': { chapter: 'chapter2', narrative: { title: '周六 · 口供整理', tone: 'quiet', paragraphs: [{ kind: 'prose', text: '三轮问话已经记完。签押之前，须把周六亲眼见到的、听赵七说的和与现场相冲突的部分分开。' }] } },
  'chapter2.case1-inquiry.guard-a.signed': { chapter: 'chapter2', narrative: { title: '周六口供复述签押', tone: 'quiet', paragraphs: [{ kind: 'prose', text: '周六听过誊清后的口供，在“未见马骁如何离车”旁按下手印。' }] } },
  'chapter2.case1-inquiry.guard-b.review': { chapter: 'chapter2', narrative: { title: '赵七 · 口供整理', tone: 'quiet', paragraphs: [{ kind: 'prose', text: '赵七的承认、辩解和前后改口仍在三页纸上。须先分栏，才能让他逐项复述签押。' }] } },
  'chapter2.case1-inquiry.guard.compare': { chapter: 'chapter2', narrative: { title: '两份押役口供对照', tone: 'tense', paragraphs: [{ kind: 'prose', text: '两份口供已经分别签押。现在只对照相互印证的事实、真正的冲突和能够解决冲突的物证。' }] } },
  'chapter2.case1-inquiry.river-boat.review': { chapter: 'chapter2', narrative: { title: '陈老桨 · 证言整理', tone: 'quiet', paragraphs: [{ kind: 'prose', text: '水路和时辰可以落纸，被带者身份仍须留在待核栏。' }] } },
  'chapter2.case1-inquiry.river-boat.signed': { chapter: 'chapter2', narrative: { title: '陈老桨证言复述签押', tone: 'quiet', paragraphs: [{ kind: 'prose', text: '陈老桨沿水路重新说过一遍，在“未看清面貌”后按下指印。' }] } },
  'chapter2.case1-inquiry.river-tea.review': { chapter: 'chapter2', narrative: { title: '阿顺 · 证言整理', tone: 'quiet', paragraphs: [{ kind: 'prose', text: '门缝里看见的、隔河辨认不清的和最初隐去的部分，须各自归栏。' }] } },
  'chapter2.case1-inquiry.river.compare': { chapter: 'chapter2', narrative: { title: '两份河埠证言对照', tone: 'quiet', paragraphs: [{ kind: 'prose', text: '两份证言可以共同固定路线，却不能共同确认被带者是谁。' }] } },
  'chapter2.case1-inquiry.guard-a.1': {
    chapter: 'chapter2',
    narrative: { title: '分开闻讯 · 押役周六', tone: 'tense', paragraphs: [{ kind: 'prose', text: '周六进门时，裤脚还在往下滴水。他先看了一眼空着的另一张椅子，才在案桌前站定。赵七被留在西厢，两个人听不见彼此说话。' }, { kind: 'dialogue', text: '“人是酉时后领的。班头验了锁，钥匙起先在赵七手里。出了北门一路没停，后来雨实在大，车辕又断，我们才靠边。”' }] },
    choices: [
      { id: 'c2-01-guard-a-key', label: '“你说钥匙起先在赵七手里。后来交给了谁，什么时候交的，当时还有谁看见？”', nextNode: 'chapter2.case1-inquiry.guard-a.2', outcomeNarrative: { title: '周六 · 钥匙', tone: 'tense', paragraphs: [{ kind: 'dialogue', text: '“过桥前给了我。赵七手冻得发僵，说让我收着。我就挂在腰后……翻车时还在不在，我一时没摸。”' }, { kind: 'prose', text: '他说到最后一句，手往腰后探了一下，像那串钥匙此刻还挂在那里。' }] } },
      { id: 'c2-01-guard-a-stop', label: '“从北门到河桥，中间经过两处巡棚。你们当真一次也没停？想清楚了再说。”', nextNode: 'chapter2.case1-inquiry.guard-a.2', outcomeNarrative: { title: '周六 · 停车', tone: 'tense', paragraphs: [{ kind: 'dialogue', text: '“巡棚前慢过一回，没落脚。再往前……赵七说后头有人追上来递话，我们在柳沟边等过半盏茶。”' }, { kind: 'prose', text: '第一份“一路没停”，还没写满一页便改了。' }] } },
    ],
  },
  'chapter2.case1-inquiry.guard-a.2': {
    chapter: 'chapter2',
    narrative: { title: '周六 · 车辕是什么时候断的', tone: 'tense', paragraphs: [{ kind: 'dialogue', text: '“车一歪，我就滚进泥里了。等爬起来，赵七已经在车门那边喊人犯跑了。我只顾去牵马，没看见谁开过锁。”' }] },
    choices: [
      { id: 'c2-01-guard-a-shaft', label: '“你坐在车前，车辕若在行驶中折断，总该先听见木头响。你听见没有？断口又为什么没吃进泥？”', nextNode: 'chapter2.case1-inquiry.guard-a.3', outcomeNarrative: { title: '周六 · 没有那声断响', tone: 'tense', paragraphs: [{ kind: 'dialogue', text: '“我没听见。雨砸得太响，也可能是没听真……车停下后，赵七在前头弄过一阵。我问他做什么，他说把压住的缰绳扯出来。”' }] } },
      { id: 'c2-01-guard-a-stub', label: '把湿存根放到他面前：“你们若只是翻车，这张换押存根怎么会在车厢底下？”', nextNode: 'chapter2.case1-inquiry.guard-a.3', outcomeNarrative: { title: '周六 · 存根', tone: 'tense', paragraphs: [{ kind: 'dialogue', text: '“我没写过这个。柳沟边来过两个人，赵七看了他们的牌子，还钻进车里说了几句话。纸是谁掉的，我真不知道。”' }] } },
    ],
  },
  'chapter2.case1-inquiry.guard-a.3': {
    chapter: 'chapter2',
    narrative: { title: '周六 · 把亲眼所见的重新说一遍', tone: 'quiet', paragraphs: [{ kind: 'prose', text: '书记官把前两页推开，另换了一张纸。周六盯着纸边，半晌才把“翻车”和“人犯逃走”两个说法拆开。' }] },
    choices: [
      { id: 'c2-01-guard-a-finish', label: '“不要替赵七补，也不要拿猜的充数。从柳沟停车起，只说你自己看见了什么。”', nextNode: 'chapter2.case1-inquiry.guard-a.review', outcomeNarrative: { title: '周六 · 亲见口供', tone: 'quiet', paragraphs: [{ kind: 'dialogue', text: '“我看见两个人到车边，赵七拿过一张纸。我被叫去牵马，回来时车已经挪到坡下，锁扣挂着，车里没人。马骁怎么下的车，我没看见。”' }, { kind: 'prose', text: '廖威达把“来人奉命换押”圈在纸外。那是周六听来的说法，不是他亲眼见到的事。余下的话，还要逐句分栏。' }] } },
      { id: 'c2-01-guard-a-order', label: '“原差牌不许中途停靠。谁叫你去牵马，谁准你离开车旁，把名字说清楚。”', nextNode: 'chapter2.case1-inquiry.guard-a.review', outcomeNarrative: { title: '周六 · 离岗口供', tone: 'quiet', paragraphs: [{ kind: 'dialogue', text: '“是赵七。他说来人有上头的牌子，让我别多问。我离开车旁约一盏茶，没人接我的岗。”' }, { kind: 'prose', text: '书记官没有立刻誊清，只在“赵七所说”旁留下一道空栏，等着把亲见、听闻和冲突分开。' }] } },
    ],
  },
  'chapter2.case1-inquiry.guard-b.1': {
    chapter: 'chapter2',
    narrative: { title: '分开闻讯 · 押役赵七', tone: 'tense', paragraphs: [{ kind: 'prose', text: '赵七进来前，周六的口供已经封在案夹里。廖威达没有把案夹摊开，只让他从出署开始说。' }, { kind: 'dialogue', text: '“路上没出岔子。到了河桥，周六说车辕不对，下车一看就折了。人犯趁乱撞开门跑的，钥匙从头到尾都在周六那里。”' }] },
    choices: [
      { id: 'c2-01-guard-b-route', label: '“原差牌写的是过桥直入北门。你们为什么在柳沟停下？追上来的两个人又是谁？”', nextNode: 'chapter2.case1-inquiry.guard-b.2', outcomeNarrative: { title: '赵七 · 柳沟', tone: 'tense', paragraphs: [{ kind: 'dialogue', text: '“没有什么两个人。柳沟那边路窄，我们只是让车。周六若说见了人，多半是雨里看岔了。”' }] } },
      { id: 'c2-01-guard-b-key', label: '“你说钥匙一直在周六手里。出署时是谁签字领钥匙，交给周六时又有谁在场？”', nextNode: 'chapter2.case1-inquiry.guard-b.2', outcomeNarrative: { title: '赵七 · 领钥匙', tone: 'tense', paragraphs: [{ kind: 'dialogue', text: '“领钥匙是我签的。出了门就给了他，没有旁人看见。这种小事，本来也不另写交接。”' }] } },
    ],
  },
  'chapter2.case1-inquiry.guard-b.2': {
    chapter: 'chapter2',
    narrative: { title: '赵七 · 那张没有写完的纸', tone: 'tense', paragraphs: [{ kind: 'prose', text: '湿存根被夹在两张干纸中间，只露出编号和半枚蜡记。赵七看见编号时，眼神停了一下。' }] },
    choices: [
      { id: 'c2-01-guard-b-order', label: '“编号接得上原差牌，交接地点却是空的。谁把它交给你，你凭什么让人靠近囚车？”', nextNode: 'chapter2.case1-inquiry.guard-b.3', outcomeNarrative: { title: '赵七 · 没写完的换押', tone: 'tense', paragraphs: [{ kind: 'dialogue', text: '“来人拿的是所里的牌子，说前面路断了，要从水路走。我只看了牌，没有等他们把存根写完。他们说进城后再补。”' }, { kind: 'prose', text: '他说完才意识到，自己刚刚还说柳沟没有来人。' }] } },
      { id: 'c2-01-guard-b-lock', label: '“锁上没有撞痕。若马骁是趁乱跑的，门是谁用钥匙开的，又是谁重新把锁挂回去？”', nextNode: 'chapter2.case1-inquiry.guard-b.3', outcomeNarrative: { title: '赵七 · 重新挂上的锁', tone: 'tense', paragraphs: [{ kind: 'dialogue', text: '“我开的门，但不是放人。我是要验他的脚镣。来人催得急，后来……后来他们把人扶下去了。锁是我挂回去的。”' }] } },
    ],
  },
  'chapter2.case1-inquiry.guard-b.3': {
    chapter: 'chapter2',
    narrative: { title: '赵七 · 第二份口供', tone: 'quiet', paragraphs: [{ kind: 'prose', text: '赵七先前说过的“翻车”“撞门”和“无人来过”，已经无法写回同一份经过。书记官停笔，等他自己重新说。' }] },
    choices: [
      { id: 'c2-01-guard-b-confront', label: '“从柳沟停车开始重说。谁看了牌，谁开的锁，周六离开时你在做什么，一件一件说。”', nextNode: 'chapter2.case1-inquiry.guard-b.review', outcomeNarrative: { title: '赵七 · 重新交代', tone: 'quiet', paragraphs: [{ kind: 'dialogue', text: '“牌是我看的，锁是我开的。周六去牵马时，那两个人把马骁带下车。我没向值房回报，也没等正式回令。车辕是人走后才折的。”' }, { kind: 'prose', text: '这一次他说得慢。书记官逐项留出空格，等着把承认的动作、为自己开脱的话和前后的矛盾分开。' }] } },
      { id: 'c2-01-guard-b-restatement', label: '“你可以说自己看错了牌，也可以说当时怕担事。但别再说人犯自己撞门。把你亲手做过的事写实。”', nextNode: 'chapter2.case1-inquiry.guard-b.review', outcomeNarrative: { title: '赵七 · 重新交代', tone: 'quiet', paragraphs: [{ kind: 'dialogue', text: '“我认了那张牌，开了锁，也让周六离岗。人是别人带走的。车辕和翻车的样子，是他们走后才弄出来的。”' }, { kind: 'prose', text: '廖威达没有催他按手印。前面那句“撞门逃走”还在旧页上，须与这份说法并列核清。' }] } },
    ],
  },
  'chapter2.case1-inquiry.river-boat.1': {
    chapter: 'chapter2',
    narrative: { title: '河埠询问 · 船夫陈老桨', tone: 'quiet', paragraphs: [{ kind: 'dialogue', text: '“那夜雨大，我本来已经收篙了。三更前后，有人敲船帮，说要送两个病人过河。给的钱足，我就又撑了一趟。”' }] },
    choices: [
      { id: 'c2-01-river-boat-time', label: '“你说三更前后。开船前听见更鼓没有？回来时渡头换班的人到了没有？”', nextNode: 'chapter2.case1-inquiry.river-boat.2', outcomeNarrative: { title: '船夫 · 时辰', tone: 'quiet', paragraphs: [{ kind: 'dialogue', text: '“开船前听见三更第三梆，回来时老宋正来换我。那一趟来回不到半个时辰，不会差得太远。”' }] } },
      { id: 'c2-01-river-boat-people', label: '“两个病人是自己走上船的，还是被人扶着？同行的人穿什么，手里带了什么？”', nextNode: 'chapter2.case1-inquiry.river-boat.2', outcomeNarrative: { title: '船夫 · 上船的人', tone: 'quiet', paragraphs: [{ kind: 'dialogue', text: '“只有一个病人。两个人架着他，脚像使不上力。另一个抱着卷起来的湿绳，腰上有块牌，我没敢细看。”' }] } },
    ],
  },
  'chapter2.case1-inquiry.river-boat.2': {
    chapter: 'chapter2',
    narrative: { title: '船夫 · 船靠到哪里', tone: 'quiet', paragraphs: [{ kind: 'dialogue', text: '“他们不让我靠正渡口，叫我停在东岸芦苇边。那边早有一辆带篷的车等着。人上车后，往城南去了。”' }] },
    choices: [
      { id: 'c2-01-river-boat-finish', label: '“你没有看清那人的脸，就只写你看见的：人数、上船方式、靠岸地方和篷车去向。别替我们认人。”', nextNode: 'chapter2.case1-inquiry.river-boat.review', outcomeNarrative: { title: '船夫 · 沿水路重说', tone: 'quiet', paragraphs: [{ kind: 'dialogue', text: '“三更第三梆后开的船。一个人被两个架着，从东岸芦苇边下船。那边有篷车，接上人便往南走。我没看清被架着的是谁。”' }, { kind: 'prose', text: '书记官把“马骁”二字留在笔外。船夫能认水路，不能替案卷认人。' }] } },
    ],
  },
  'chapter2.case1-inquiry.river-tea.1': {
    chapter: 'chapter2',
    narrative: { title: '河埠询问 · 茶棚伙计阿顺', tone: 'quiet', paragraphs: [{ kind: 'dialogue', text: '“我只听见车响，没出去看。那夜来往的人多，哪一辆是什么车，我说不准。”' }, { kind: 'prose', text: '他说话时一直擦同一只粗瓷碗，碗沿早已经干了。' }] },
    choices: [
      { id: 'c2-01-river-tea-cart', label: '“桥坡下留下的轮距和你棚外那两道沟一样。车停了多久，车边有几个人，你从头说。”', nextNode: 'chapter2.case1-inquiry.river-tea.2', outcomeNarrative: { title: '阿顺 · 棚外的车', tone: 'tense', paragraphs: [{ kind: 'dialogue', text: '“停了有一盏茶。先是官车，后来又来一辆篷车。三个人在雨里忙，有一个穿押役的号衣。我怕惹事，把灯吹了，只从门缝里看。”' }] } },
      { id: 'c2-01-river-tea-sound', label: '“你向巡棚提过车厢里有声音。现在为什么又说没有出去看？你究竟听见了什么？”', nextNode: 'chapter2.case1-inquiry.river-tea.2', outcomeNarrative: { title: '阿顺 · 两下木板声', tone: 'tense', paragraphs: [{ kind: 'dialogue', text: '“有人在车里踢了两下板，随后便没声了。我把门推开一条缝，看见他们抬人往河边走。号衣那人站在车门旁。”' }] } },
    ],
  },
  'chapter2.case1-inquiry.river-tea.2': {
    chapter: 'chapter2',
    narrative: { title: '阿顺 · 篷车离开的方向', tone: 'quiet', paragraphs: [{ kind: 'dialogue', text: '“河对岸那辆篷车我也见过。车帘右下角补过一块浅布，赶车人走的是城南旧堤，不是往北门。”' }] },
    choices: [
      { id: 'c2-01-river-tea-finish', label: '“把你亲眼看见的和隔河望见的分开说。看不清的人脸不写，只写车、时辰和去向。”', nextNode: 'chapter2.case1-inquiry.river-tea.review', outcomeNarrative: { title: '阿顺 · 按先后重说', tone: 'quiet', paragraphs: [{ kind: 'dialogue', text: '“官车先停，篷车后到。车里响过两下，有人被抬去河边。渡船离开以后，东岸那辆篷车往南走了。脸，我一个也没看清。”' }] } },
      { id: 'c2-01-river-tea-confirm', label: '“你只认那块补布，不能因此认定车里是谁。再把三更前后的先后说一遍，书记官照原话记。”', nextNode: 'chapter2.case1-inquiry.river-tea.review', outcomeNarrative: { title: '阿顺 · 按先后重说', tone: 'quiet', paragraphs: [{ kind: 'dialogue', text: '“先来的是官车，后到的是补过车帘的篷车。有人被抬向河边，船离岸后，那辆篷车从东岸往南去了。我只能认车，认不出人。”' }] } },
    ],
  },
  'chapter2.case1-authority-review': {
    chapter: 'chapter2',
    narrative: { title: '第一案 · 呈请处置', tone: 'tense', paragraphs: [{ kind: 'prose', text: '已经固定的事实抄成两页：马骁没有自行破锁；押送途中至少发生了一项未经批准的处置。廖威达只能把材料和责任建议呈上去，暂扣、追缉与封卷仍要覃保坤落签。' }] },
  },
  'chapter2.case1-close-review': {
    chapter: 'chapter2',
    narrative: { title: '第一案 · 结案核验', tone: 'quiet', paragraphs: [{ kind: 'prose', text: '十二项材料已经按取得和形成次序入卷。先固定马骁并非自行破锁，再从押役责任与河埠去向中选择一条保全更完整的证据链呈报；没有选作本次结案侧重的方向仍留待续查。' }] },
    choices: [
      { id: 'preserve-guard-responsibility', label: '先固定押役口供与失职责任', nextNode: 'chapter2.case1-closed', effects: noEffects, outcomeNarrative: { title: '两份不能互相照看的口供', tone: 'tense', paragraphs: [{ kind: 'prose', text: '两名押役被分开记录。收钱、未回拨核验、擅离车旁和隐瞒所见各自落到纸上；河埠方向却只剩模糊痕迹。' }, { kind: 'dialogue', text: '覃保坤道：“别因为他们胆小，就写成同谋；也别因为他们没想明白，就把责任抹掉。”' }] } },
      { id: 'follow-river-transfer', label: '先追河埠的篷车与交接路线', nextNode: 'chapter2.case1-closed', effects: noEffects, outcomeNarrative: { title: '雨水里留下的去向', tone: 'tense', paragraphs: [{ kind: 'prose', text: '船夫确认篷车在三更末离开，茶棚伙计听见车中有人敲过两下木板。你回到桥头时，两名押役的第二份口供已经变得过分一致。' }, { kind: 'dialogue', text: '覃保坤道：“你保住了车去哪儿，也让他们有时间把自己写得更干净。”' }] } },
    ],
  },
  'chapter2.case1-closed': {
    chapter: 'chapter2',
    nextNode: 'chapter2.empty-dowry-house',
    narrative: { title: '第一案封卷 · 真凭照，假交接', tone: 'quiet', paragraphs: [{ kind: 'prose', text: '马骁仍未找到，但违规换押已经坐实。湿存根编号、蜡记和纸种都真，领取人却只留模糊别号，最终地点空白，回收栏也没有剪角。' }, { kind: 'dialogue', text: '覃保坤将凭照套进证物袋：“查清的责任先落下。没找到的人和没查明的去向，另列待查。”' }] },
  },
  'chapter2.empty-dowry-house': {
    chapter: 'chapter2',
    narrative: { title: '第二案 · 空屋里的嫁妆', tone: 'tense', paragraphs: [{ kind: 'prose', text: '卢宅正屋摆着没有穿过的嫁衣。后院湿靛色脚印从厨房门一直通向废染坊，灶边压着一份继承副契。' }, { kind: 'prose', text: '卢小绫承认自己主动躲藏。舅父卢盛欠下赌债，两次逼她交契；另有人持真实封验凭照进宅，要求取看房契。' }, { kind: 'dialogue', text: '她攥着湿透的衣带：“我不是怕婚事。我怕我一回来，那张契就不再是我的了。”' }] },
    choices: [
      { id: 'protect-witness-and-deed', label: '先守住卢小绫与副契原件', nextNode: 'chapter2.case2-closed', outcomeNarrative: { title: '先让人能站着说完', tone: 'hopeful', paragraphs: [{ kind: 'prose', text: '地方衙门守住废染坊，卢小绫当面取出副契原件。脚印、自愿藏身的陈述和舅父两次逼契分别入录。' }, { kind: 'dialogue', text: '覃保坤道：“凭照冒用的人还能从纸上追。人没了，纸只能替她说话。”' }] } },
      { id: 'trace-credential-handover', label: '先追查凭照如何交到中间人手中', nextNode: 'chapter2.case2-closed', outcomeNarrative: { title: '茶摊上的交割', tone: 'tense', paragraphs: [{ kind: 'prose', text: '茶摊留下的交割记录固定了凭照经手次序。等你回到染坊，副契原件已被水泡坏一角，只能先制作抄件。' }, { kind: 'prose', text: '自愿躲藏、舅父胁迫和凭照滥用仍被分成三件事记录，没有被写成一桩方便结案的绑架。' }] } },
    ],
  },
  'chapter2.case2-closed': {
    chapter: 'chapter2',
    nextNode: 'chapter2.before-the-watch-drum',
    narrative: { title: '第二案封卷 · 契在人手里', tone: 'quiet', paragraphs: [{ kind: 'prose', text: '卢小绫的继承权得到保全，卢盛的债务胁迫另行处理。那张没有剪角的真实封验凭照则被单独收进案袋，等待回所核销。' }] },
  },
  'chapter2.before-the-watch-drum': {
    chapter: 'chapter2',
    narrative: { title: '第三案 · 倒在更鼓前的人', tone: 'somber', paragraphs: [{ kind: 'prose', text: '程佑倒在城门值房外。门闩内侧留着血，夜放牌副券攥在他手边，值夜簿上的放车时刻却有重描痕迹。' }, { kind: 'prose', text: '赵培早些时候确实打过他；随后冯六收钱放入一辆篷车，又在争夺副券时将程佑撞向门闩。程佑倒下后，值夜簿才被改写。' }, { kind: 'dialogue', text: '覃保坤道：“先打过人，不等于后面每一道伤都算在他身上。把更鼓前后的事拆开。”' }] },
    choices: [
      { id: 'preserve-death-timeline', label: '先固定尸体、门闩与更鼓时序', nextNode: 'chapter2.case3-closed', outcomeNarrative: { title: '更鼓前后的五步', tone: 'somber', paragraphs: [{ kind: 'prose', text: '尸体位置、门闩血迹和更鼓时刻被先行固定。赵培的旧伤与冯六造成的致命碰撞得以分开，改簿经手只留下较窄的追查范围。' }] } },
      { id: 'preserve-altered-record-chain', label: '先封住值夜簿与放行记录', nextNode: 'chapter2.case3-closed', outcomeNarrative: { title: '被重描的那一行', tone: 'tense', paragraphs: [{ kind: 'prose', text: '值夜簿、货封记录和书吏证言先被封住。冯六收钱放车、争夺副券和事后改簿连成一线，死亡现场的部分细节则只能依原始笔录复核。' }] } },
    ],
  },
  'chapter2.case3-closed': {
    chapter: 'chapter2',
    nextNode: 'chapter2.register-review',
    narrative: { title: '第三案封卷 · 先后不能倒写', tone: 'quiet', paragraphs: [{ kind: 'prose', text: '赵培为先前殴打负责，冯六为收钱放车、争券致伤和改簿负责。夜放牌副券随卷入袋，三件案子的凭照材料第一次并排放上案桌。' }] },
  },
  'chapter2.register-review': {
    chapter: 'chapter2',
    narrative: { title: '章末核验 · 失号凭照', tone: 'tense', paragraphs: [{ kind: 'prose', text: '覃保坤取得书面授权，只开百户所发放、注销、封存总簿和三案材料。书记官在旁抄录，库吏逐栏说明核销规矩。' }, { kind: 'dialogue', text: '覃保坤道：“只拿三件案子里能证明凭照流转的原件。旁的责任材料，留在各自卷里。”' }] },
  },
  'chapter2.register-sealed': {
    chapter: 'chapter2',
    nextNode: 'chapter3.entry',
    narrative: { title: '总簿封存 · 同一间转收房', tone: 'tense', paragraphs: [{ kind: 'prose', text: '三种凭照都被写作“误印、待回收”，却没有剪角，最终都经过同一间内部转收房。收件簿缺了页，封蜡也有后来破开的痕迹。' }, { kind: 'prose', text: '覃保坤先让书记官抄下缺页前后的编号、页码和封蜡痕迹，盖印副本收入内匣，才重新封存原簿。' }, { kind: 'dialogue', text: '“现在只能写流程被人用过。”他压住案卷，“至于谁在用，下一份材料到了再说。”' }] },
  },
}
