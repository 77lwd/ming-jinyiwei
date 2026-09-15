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
  'separate-guard-statements': '两份分开记录的押役口供',
  'river-route-testimony': '船夫与茶棚伙计证言',
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
  'unforced-lock': '锁舌与扣环没有撞开新痕，犯人并非自行破锁脱逃。',
  'separate-guard-statements': '两名押役对翻车方向、接人过程和各自失职作出不同陈述。',
  'river-route-testimony': '篷车在三更末从渡头离开，车中有人敲过木板。',
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

export function createChapter2InvestigationState(): Chapter2InvestigationState {
  return { completedCaseIds: [], branchIds: [], materialIds: [], fixedFactIds: [], registerVerified: false }
}

const noEffects: Effect[] = []

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
