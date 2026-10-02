import type { Chapter2InquiryReview, Chapter2MainlineStep } from './chapter2'
import type { Effect, MainlineChoice, NarrativeBlock } from '../types'

const noEffects: Effect[] = []

const paragraph = (text: string, kind: NarrativeBlock['paragraphs'][number]['kind'] = 'prose') => ({ kind, text })

export const chapter2Case2Images = {
  emptyDowryHouse: { src: '/assets/chapter2/case2/empty-dowry-house.png', alt: '空置旧宅内堆放的嫁妆箱笼与红色嫁衣' },
  backdoorFootprints: { src: '/assets/chapter2/case2/backdoor-footprints.png', alt: '卢宅后门外通往废染坊的靛色脚印' },
  dyehouseInterior: { src: '/assets/chapter2/case2/dyehouse-interior.png', alt: '雨后的废染坊内部' },
  tornDowrySash: { src: '/assets/chapter2/case2/inheritance-deed-close.png', alt: '后门石阶上的撕裂衣带' },
  deedUnderBrick: { src: '/assets/chapter2/case2/inheritance-deed-under-brick.png', alt: '灰砖下发现的继承副契' },
  deedClose: { src: '/assets/chapter2/case2/inheritance-deed-close.png', alt: '继承副契原件近景' },
  debtLedger: { src: '/assets/chapter2/case2/debt-ledger-and-contract.png', alt: '卢盛的债册与代管私约' },
  inspectionCredential: { src: '/assets/chapter2/case2/uncut-inspection-credential.png', alt: '未剪角的封验凭照' },
  credentialReviewDesk: { src: '/assets/chapter2/case2/credential-review-desk.png', alt: '凭照权限核验案桌' },
  credentialHandover: { src: '/assets/chapter2/case2/credential-handover-tea-stall.png', alt: '茶摊后的凭照交接' },
} as const

export const chapter2Case2MaterialLabels: Record<string, string> = {
  'indigo-footprints': '通往废染坊的靛色脚印',
  'torn-dowry-sash': '撕裂的嫁衣衣带',
  'inheritance-deed': '卢小绫继承副契',
  'debt-ledger': '卢盛债册与欠款页',
  'coercive-private-contract': '代管房契私约',
  'inspection-credential': '未剪角的封验凭照',
  'credential-scope-record': '封验凭照权限核验记录',
  'credential-handover-record': '茶摊凭照交割记录',
  'luxiaoling-signed-statement': '卢小绫签押口供',
  'lusheng-signed-statement': '卢盛签押口供',
  'spouse-witness-signed-testimony': '夫家妇人签押证言',
  'tea-clerk-signed-testimony': '茶摊伙计签押证言',
  'family-pressure-comparison': '家庭压力与副契对照记录',
  'credential-handover-comparison': '凭照权限与茶摊交接对照记录',
}

export const chapter2Case2MaterialDescriptions: Record<string, string> = {
  'indigo-footprints': '后门外的靛泥脚印一路通往废染坊，脚尖方向与卢小绫主动离开的说法相合。',
  'torn-dowry-sash': '嫁衣衣带在后门石阶处撕裂，断口带着新鲜拉扯痕，不足以单独证明谁动过手。',
  'inheritance-deed': '副契写明小宅由卢小绫承继，未写卢盛有代管或处分权限。',
  'debt-ledger': '债册记着卢盛欠款、催还时辰和以卢宅房契抵债的条目。',
  'coercive-private-contract': '私约把房契交由卢盛代管，附有逾期即转让的苛刻条款，签押日期早于卢小绫藏身。',
  'inspection-credential': '真实封验凭照未剪角，却被人拿到卢宅要求取看房契，凭照本身不能证明持有人身份。',
  'credential-scope-record': '回所核对发放栏、适用范围和回收规矩，确认凭照没有查封卢宅或取走房契的权限。',
  'credential-handover-record': '茶摊伙计记下凭照由一名自称“替人办差”的中间人转交给卢盛一方，未记出中间人的上游。',
  'luxiaoling-signed-statement': '卢小绫签押确认自己从后门离开并藏身，也确认离开前曾被卢盛逼问副契和房契。',
  'lusheng-signed-statement': '卢盛签押承认债务、私约和逼问经过，但不能说明封验凭照从何处流出。',
  'spouse-witness-signed-testimony': '夫家妇人固定了卢宅争执、嫁衣被扯裂和卢小绫自行离开的现场片段，保留她未见后续交割的边界。',
  'tea-clerk-signed-testimony': '茶摊伙计固定凭照交接的时辰、位置、经手动作和中间人别号，未辨清其背后主使。',
  'family-pressure-comparison': '卢小绫、卢盛和夫家妇人的口供按亲见、冲突和副契可核部分逐栏对照。',
  'credential-handover-comparison': '封验凭照权限、交割记录和茶摊伙计证言按可相互印证与仍待追查处并列。',
}

export const chapter2Case2MaterialProvenance: Record<string, { kind: string; source: string; formation: string }> = {
  'indigo-footprints': { kind: '现场勘验', source: '卢宅后门至废染坊的泥地', formation: '先封住后门出入口，逐枚描下脚印长短、深浅和脚尖方向，再取边缘靛泥入袋。' },
  'torn-dowry-sash': { kind: '物证检视', source: '后门石阶与未穿嫁衣', formation: '按原位拍照记录后剪取脱落线头，比较衣带两端的撕裂方向和沾泥位置。' },
  'inheritance-deed': { kind: '文书原件', source: '灶台灰砖下的夹层', formation: '清开灰砖和纸包，按原折痕取出副契，逐页核对签押、日期和房屋范围后封存。' },
  'debt-ledger': { kind: '账册核验', source: '卢盛借住处的旧木箱', formation: '由卢盛当面指出账册所在，调取欠款页、催还页与房契抵债条目，连同前后页一并抄录。' },
  'coercive-private-contract': { kind: '文书对照', source: '卢盛随身钱袋夹层', formation: '在债册记载的日期范围内搜出私约，核对代管条款、逾期处置和卢小绫未在场的签押缺口。' },
  'inspection-credential': { kind: '凭照原件', source: '卢宅案桌与持照人的交接处', formation: '不触碰封面剪角，先描记编号、印色和回收栏，再以证物袋封存原件。' },
  'credential-scope-record': { kind: '权限核验', source: '百户所凭照发放簿与规条', formation: '经覃保坤准许调取发放簿，逐项抄录凭照适用范围、有效时限和必须剪角回收的规矩。' },
  'credential-handover-record': { kind: '交割记录', source: '城南茶摊后桌与伙计记账纸', formation: '封存茶摊后桌，按伙计记下的时辰、座次、别号和递纸动作复原交割次序。' },
  'luxiaoling-signed-statement': { kind: '签押口供', source: '废染坊内单独闻讯', formation: '三轮问话后，将主动藏身、离开前争执和未亲见的凭照经过分栏复述，由卢小绫按印形成。' },
  'lusheng-signed-statement': { kind: '签押口供', source: '卢宅外厢单独闻讯', formation: '隔离闻讯并出示债册、私约逐项追问，卢盛撤回含混说法后按自己的动作和所知范围签押。' },
  'spouse-witness-signed-testimony': { kind: '签押证言', source: '夫家妇人暂住的偏屋', formation: '单独固定她亲见的争执、衣带撕裂和离开时辰，将她未见的凭照交割列入待核后按指印。' },
  'tea-clerk-signed-testimony': { kind: '签押证言', source: '城南茶摊', formation: '不让伙计先看其他人的记录，只按桌位、时辰、纸张和别号重述凭照交接，再由其按指印。' },
  'family-pressure-comparison': { kind: '口供对照', source: '卢小绫、卢盛与夫家妇人三份记录', formation: '三份材料分别签押后，把主动离开、逼问副契、衣带撕裂和未见部分并列成对照页。' },
  'credential-handover-comparison': { kind: '凭照对照', source: '封验凭照、权限记录与茶摊证言', formation: '先以权限记录划出凭照不能做的事，再把茶摊交接时辰与伙计亲见内容并列，未替中间人补出上游。' },
}

export const chapter2Case2ActionMaterials: Record<string, string[]> = {
  'c2-02-inspect-backdoor': ['indigo-footprints'],
  'c2-02-inspect-dyehouse': ['torn-dowry-sash'],
  'c2-02-recover-deed': ['inheritance-deed'],
  'c2-02-check-debt-ledger': ['debt-ledger', 'coercive-private-contract'],
  'c2-02-verify-credential': ['inspection-credential', 'credential-scope-record'],
  'c2-02-trace-credential-handover': ['credential-handover-record'],
}

export const chapter2Case2MaterialIds = [
  'indigo-footprints', 'torn-dowry-sash', 'inheritance-deed', 'debt-ledger', 'coercive-private-contract',
  'inspection-credential', 'credential-scope-record', 'credential-handover-record',
  'luxiaoling-signed-statement', 'lusheng-signed-statement', 'spouse-witness-signed-testimony', 'tea-clerk-signed-testimony',
  'family-pressure-comparison', 'credential-handover-comparison',
]

export const chapter2Case2VerificationSets: Record<string, readonly string[]> = {
  'voluntary-hiding-pressure': ['indigo-footprints', 'torn-dowry-sash', 'luxiaoling-signed-statement', 'spouse-witness-signed-testimony'],
  'debt-coercion': ['inheritance-deed', 'debt-ledger', 'coercive-private-contract', 'lusheng-signed-statement'],
  'credential-abuse-handover': ['inspection-credential', 'credential-scope-record', 'credential-handover-record', 'tea-clerk-signed-testimony'],
}

export const chapter2Case2Questions = [
  { id: 'voluntary-hiding-pressure', stageLabel: '基础事实 · 必须核验', shortLabel: '卢小绫是主动藏身，还是被人直接带走？', prompt: '核对后门脚印、撕裂衣带和两份独立证言，保留她离开前受到压力的边界。', requiredCount: 4 },
  { id: 'debt-coercion', stageLabel: '责任事实 · 必须核验', shortLabel: '卢盛是否以债务逼迫交出继承文书？', prompt: '核对副契、债册、代管私约和卢盛亲口承认的动作。', requiredCount: 4 },
  { id: 'credential-abuse-handover', stageLabel: '凭照事实 · 必须核验', shortLabel: '真实凭照是否被滥用并经过中间人交接？', prompt: '核对凭照原件的权限边界、茶摊交割记录和伙计的亲见证言。', requiredCount: 4 },
] as const

export const chapter2Case2InvestigationActions: MainlineChoice[] = [
  { id: 'c2-02-inspect-backdoor', label: '封住后门，勘验靛色脚印方向', nextNode: 'chapter2.case2-route-backdoor', effects: noEffects, outcomeNarrative: { title: '脚印没有回头', tone: 'tense', image: chapter2Case2Images.backdoorFootprints, paragraphs: [paragraph('你先让差役把后门两侧围住，不许人踩进泥里。靛色脚印从厨房门外起，鞋底纹路在石阶上断开一小段，随后又在废染坊门前接上。脚尖一直朝外，没有折回正屋的印子。'), paragraph('书记官把每枚脚印的间距写下，取了最清楚的两处泥样。方向可以入卷，究竟是谁从这里走出去，还要问人。')] } },
  { id: 'c2-02-inspect-dyehouse', label: '清理废染坊入口，检查衣带与藏身处', nextNode: 'chapter2.case2-investigation', effects: noEffects, outcomeNarrative: { title: '废染坊里留着一夜藏身的痕迹', tone: 'quiet', image: chapter2Case2Images.dyehouseInterior, paragraphs: [paragraph('废染坊里没有打斗留下的乱象，桌椅还在原处。染缸后的干草被压倒一片，地上的湿泥一路连到后门，像有人在这里蜷过一夜。'), paragraph('后门石阶还留着一截撕裂衣带，断口很新，带面沾满湿泥。卢小绫确实自己躲进了这里，没在屋里留下被拖拽过的痕迹。只是她离开卢宅时，门边还起过一阵拉扯——她躲起来，是一回事；她为什么要躲，是另一回事。')] } },
  { id: 'c2-02-recover-deed', label: '按灰砖和灶台原位清出隐藏副契', nextNode: 'chapter2.case2-route-deed', effects: noEffects, outcomeNarrative: { title: '灰下藏着一张副契', tone: 'tense', image: chapter2Case2Images.deedUnderBrick, paragraphs: [paragraph('你没有先翻动灶台，只让人按砖缝宽窄画出原位。第三块灰砖下有旧纸包，外层沾灰，内里的折痕却没有被水泡开。拆封后露出一张写卢小绫姓名的继承副契，房屋范围写得清楚。'), paragraph('副契是从现场取出的原件，不是卢小绫后来补说的凭据。接下来要把它和债册、私约放在同一张案桌上核对。')] } },
  { id: 'c2-02-check-debt-ledger', label: '调取卢盛债册，核对代管私约与期限', nextNode: 'chapter2.case2-investigation', effects: noEffects, outcomeNarrative: { title: '债册旁，夹着一张私约', tone: 'tense', image: chapter2Case2Images.debtLedger, paragraphs: [paragraph('卢盛先说债册留在旧宅。差役在他借住处的木箱里翻了半天，才从夹层里摸出一本折了角的旧账。欠款页上记着催债的日子和时辰，旁边夹着一张代管私约，写着债期一到，卢宅房契便由他处置。'), paragraph('私约落在卢小绫藏身之前，账上还留着两次催她交契的记号。副契管的是房屋归属，债册和私约留下的，是卢盛逼她交契的来由。那些催记一笔一笔落在那里，卢盛显然不是临时起意。至于那张封验凭照从哪里来，账上没有，还得另找。')] } },
  { id: 'c2-02-verify-credential', label: '保全未剪角凭照，核对适用权限', nextNode: 'chapter2.case2-route-credential', effects: noEffects, outcomeNarrative: { title: '真凭照也不能做什么都做', tone: 'quiet', image: chapter2Case2Images.inspectionCredential, paragraphs: [paragraph('凭照的编号、印色和纸张都是真的，回收栏却没有剪角。你按原样描记后，让书记官调出发放簿。簿上写的是限定场所和期限，没有查封民宅、强取房契或由私人代办的权限。'), paragraph('它是真凭照，不等于持有人有权取走房契。权限缺口先固定下来，交接经过还要去茶摊查。')] } },
  { id: 'c2-02-trace-credential-handover', label: '封存茶摊后桌，追查凭照交接次序', nextNode: 'chapter2.case2-investigation', effects: noEffects, outcomeNarrative: { title: '凭照经过一只没有署名的手', tone: 'tense', image: chapter2Case2Images.credentialHandover, paragraphs: [paragraph('茶摊伙计先说只记得一桌客人。你让他按桌位重摆茶碗，再问谁把纸压到桌角、谁把纸收走。他才从账纸背面翻出几行时辰和一个“替人办差”的别号。'), paragraph('记录能固定凭照经过中间人交到卢盛一方，不能回答中间人从哪里拿到凭照。案卷在这里停住，不替空白添上一个幕后人的名字。')] } },
]

const review = (value: Chapter2InquiryReview): Chapter2InquiryReview => value

export const chapter2Case2InquiryReviews: Record<string, Chapter2InquiryReview> = {
  'chapter2.case2-inquiry.luxiaoling.review': review({
    title: '整理卢小绫口供',
    instruction: '把她亲自走过的路、听到的逼问和不能替凭照持有人作证的部分分开。',
    categories: [{ id: 'fact', label: '写入亲见事实' }, { id: 'pending', label: '列入待核' }, { id: 'conflict', label: '标记冲突' }],
    statements: [
      { id: 'luxiaoling-hide', text: '卢小绫从后门离开，自己走进废染坊躲了一夜。' },
      { id: 'luxiaoling-credential', text: '持凭照的人一定就是卢盛找来的债主，并且亲自从她手里夺走了房契。' },
      { id: 'luxiaoling-pressure', text: '离开前卢盛拿债册和私约逼她交出副契，她拉门时衣带被扯断。' },
    ],
    expected: ['luxiaoling-hide:fact', 'luxiaoling-credential:pending', 'luxiaoling-pressure:fact'],
    successTitle: '卢小绫口供复述签押',
    successText: '卢小绫重新说清自己主动藏身的经过，也承认离开前受到逼契压力；关于凭照持有人的身份，仍按未亲见列入待核。',
    nextNode: 'chapter2.case2-inquiry.luxiaoling.signed',
    completionId: 'c2-02-luxiaoling-statement',
    materialId: 'luxiaoling-signed-statement',
  }),
  'chapter2.case2-inquiry.lusheng.review': review({
    title: '整理卢盛口供',
    instruction: '只把卢盛亲手做过的事写实；债主身份、凭照来源和最终产权不能由他的猜测补齐。',
    categories: [{ id: 'fact', label: '写入亲历事实' }, { id: 'pending', label: '列入待核' }, { id: 'conflict', label: '标记改口' }],
    statements: [
      { id: 'lusheng-debt', text: '卢盛承认欠款、签过代管私约，并在卢小绫离开前两次催她交契。' },
      { id: 'lusheng-denial', text: '卢盛先称自己没有见过卢小绫，后又承认在后门追问过她。' },
      { id: 'lusheng-source', text: '卢盛知道真实封验凭照从哪一间官署流出，也知道中间人最后要把房契交给谁。' },
    ],
    expected: ['lusheng-debt:fact', 'lusheng-denial:conflict', 'lusheng-source:pending'],
    successTitle: '卢盛口供复述签押',
    successText: '卢盛撤回“没有见过她”的说法，承认债务和逼契经过；凭照来源与上游交接仍没有由他亲见，单列待核。',
    nextNode: 'chapter2.case2-inquiry.lusheng.signed',
    completionId: 'c2-02-lusheng-statement',
    materialId: 'lusheng-signed-statement',
  }),
  'chapter2.case2-inquiry.spouse.review': review({
    title: '整理夫家妇人证言',
    instruction: '把她站在门内亲眼见到的争执与衣带痕迹写下，不把她未看见的交割过程当作事实。',
    categories: [{ id: 'fact', label: '写入亲见事实' }, { id: 'pending', label: '留待核对' }, { id: 'conflict', label: '标记偏差' }],
    statements: [
      { id: 'spouse-quarrel', text: '她亲眼看见卢盛在后门拦着卢小绫问副契，卢小绫没有穿上嫁衣。' },
      { id: 'spouse-identity', text: '她看清后来持凭照进宅的人就是卢盛的债主。' },
      { id: 'spouse-sash', text: '衣带是在拉门时被扯断，卢小绫随后朝废染坊方向跑去。' },
    ],
    expected: ['spouse-quarrel:fact', 'spouse-identity:pending', 'spouse-sash:fact'],
    successTitle: '夫家妇人证言复述签押',
    successText: '夫家妇人把后门争执、衣带撕裂和离开方向重新说清；她没有看见后续凭照交割，身份判断留在待核栏。',
    nextNode: 'chapter2.case2-inquiry.spouse.signed',
    completionId: 'c2-02-spouse-statement',
    materialId: 'spouse-witness-signed-testimony',
  }),
  'chapter2.case2-inquiry.tea-clerk.review': review({
    title: '整理茶摊伙计证言',
    instruction: '只固定茶摊内的时辰、座次和递纸动作；别号之外的真实身份不能凭猜测写入。',
    categories: [{ id: 'fact', label: '写入亲见亲听' }, { id: 'pending', label: '列入待核' }, { id: 'conflict', label: '标记前后说法' }],
    statements: [
      { id: 'tea-handover', text: '一名自称替人办差的人把封验凭照压在茶桌上，随后由另一人收走并带往卢宅。' },
      { id: 'tea-upstream', text: '伙计看清了中间人从哪名官署人员手中接到凭照。' },
      { id: 'tea-denial', text: '伙计起初称自己没在后桌，后来承认记账纸是他按时辰写下的。' },
    ],
    expected: ['tea-handover:fact', 'tea-upstream:pending', 'tea-denial:conflict'],
    successTitle: '茶摊伙计证言复述签押',
    successText: '伙计按桌位和时辰复述了凭照交接，承认自己起初怕惹事而隐去后桌所见；中间人的上游仍无亲见依据。',
    nextNode: 'chapter2.case2-inquiry.tea-clerk.signed',
    completionId: 'c2-02-tea-clerk-statement',
    materialId: 'tea-clerk-signed-testimony',
  }),
  'chapter2.case2-inquiry.family.compare': review({
    title: '对照家庭压力与副契',
    instruction: '找出三人相互印证的动作、彼此不一致的身份判断，以及必须交给物证解决的部分。',
    categories: [{ id: 'confirmed', label: '相互印证' }, { id: 'conflict', label: '口供冲突' }, { id: 'evidence', label: '物证解决' }],
    statements: [
      { id: 'family-route', text: '卢小绫从后门离开并进入废染坊，夫家妇人也看见她向那个方向跑去。' },
      { id: 'family-pressure', text: '卢盛是否拿债务和私约逼契，须由债册、私约和副契互相核对。' },
      { id: 'family-identity', text: '夫家妇人和卢小绫都没有亲眼看清凭照持有人的上游身份。' },
    ],
    expected: ['family-route:confirmed', 'family-pressure:evidence', 'family-identity:conflict'],
    successTitle: '家庭压力与副契对照入卷',
    successText: '主动离开和废染坊方向由两份证言互相印证；逼契部分交由文书核验，凭照上游身份仍保留边界。',
    nextNode: 'chapter2.case2-inquiry-select',
    completionId: 'c2-02-family-comparison',
    materialId: 'family-pressure-comparison',
  }),
  'chapter2.case2-inquiry.credential.compare': review({
    title: '对照凭照权限与茶摊交接',
    instruction: '把凭照能做什么、实际被拿来做什么和谁在茶摊递过手分开记录。',
    categories: [{ id: 'confirmed', label: '相互印证' }, { id: 'conflict', label: '仍有冲突' }, { id: 'evidence', label: '由文书固定' }],
    statements: [
      { id: 'credential-scope', text: '凭照原件真实，但权限记录没有查封民宅或强取房契的范围。' },
      { id: 'credential-time', text: '茶摊时辰、别号和递纸动作能够与伙计签押证言互相接上。' },
      { id: 'credential-source', text: '凭照最初如何离开发放环节，已经由茶摊记录完全证明。' },
    ],
    expected: ['credential-scope:evidence', 'credential-time:confirmed', 'credential-source:conflict'],
    successTitle: '凭照权限与茶摊交接对照入卷',
    successText: '权限边界由发放簿固定，茶摊交接由记录和证言互相印证；凭照最初流出路径仍列续查。',
    nextNode: 'chapter2.case2-inquiry-select',
    completionId: 'c2-02-credential-comparison',
    materialId: 'credential-handover-comparison',
  }),
}

const inquiryNodes: Record<string, Chapter2MainlineStep> = {
  'chapter2.case2-inquiry.luxiaoling.1': {
    chapter: 'chapter2',
    narrative: { title: '分开闻讯 · 卢小绫', tone: 'tense', paragraphs: [paragraph('卢小绫坐在废染坊门边，手指一直压着袖口。她先说自己是怕婚事，话到一半却停了。', 'prose'), paragraph('“我从后门走的。那夜没有人押我，我自己进了染坊。只是走之前，舅父把副契摊在桌上，问我什么时候肯交出来。”', 'dialogue')] },
    choices: [
      { id: 'c2-02-luxiaoling-pressure', label: '“你说自己走的。离开前门边发生了什么，衣带为什么会断？”', nextNode: 'chapter2.case2-inquiry.luxiaoling.2', effects: noEffects, outcomeNarrative: { title: '卢小绫 · 后门', tone: 'tense', paragraphs: [paragraph('“我拉门时他抓过来，衣带挂在门钉上，扯断了。我没有回头，怕他追进染坊。”', 'dialogue')] } },
      { id: 'c2-02-luxiaoling-deed', label: '“副契是你自己藏的？在你离开前，卢盛拿它说了什么？”', nextNode: 'chapter2.case2-inquiry.luxiaoling.2', effects: noEffects, outcomeNarrative: { title: '卢小绫 · 那张副契', tone: 'tense', paragraphs: [paragraph('“副契我藏在灶台下。舅父说债主只认房契，副契在我手里也没用。他要我先把纸交给他，说只是代管。”', 'dialogue')] } },
    ],
  },
  'chapter2.case2-inquiry.luxiaoling.2': {
    chapter: 'chapter2',
    narrative: { title: '卢小绫 · 她没有看见的凭照', tone: 'tense', paragraphs: [paragraph('她说到“凭照”时，先抬头看了看门外，随后把声音压低。', 'prose'), paragraph('“我听见有人在正屋说官府要封门。那个人手里有纸，可我躲进染坊后没有再出去。我不知道他是谁，也没看见他把纸交给谁。”', 'dialogue')] },
    choices: [
      { id: 'c2-02-luxiaoling-restatement', label: '“最后从你亲自走出后门开始说，只写你看见和亲身做过的事。”', nextNode: 'chapter2.case2-inquiry.luxiaoling.3', effects: noEffects, outcomeNarrative: { title: '卢小绫 · 重说经过', tone: 'quiet', paragraphs: [paragraph('“我从后门自己走到废染坊，路上没有人押我。走前舅父逼我交副契，门边扯断了衣带。凭照那一段，我只听见屋里有人说话，没有亲眼看见。”', 'dialogue')] } },
    ],
  },
  'chapter2.case2-inquiry.luxiaoling.3': {
    chapter: 'chapter2',
    narrative: { title: '卢小绫 · 问话已完', tone: 'quiet', paragraphs: [paragraph('卢小绫的主动藏身和离开前的逼契压力已经分别记下。她没有替案卷确认凭照持有人的身份。', 'prose')] },
    choices: [{ id: 'c2-02-luxiaoling-finish', label: '进入卢小绫口供整理', nextNode: 'chapter2.case2-inquiry.luxiaoling.review', effects: noEffects, outcomeNarrative: { title: '卢小绫问话已完', tone: 'quiet', paragraphs: [paragraph('问话到这里停止。口供尚未签押，须先把亲见、听闻和待核内容逐句归栏。')] } }],
  },
  'chapter2.case2-inquiry.luxiaoling.signed': { chapter: 'chapter2', narrative: { title: '卢小绫口供复述签押', tone: 'quiet', paragraphs: [paragraph('卢小绫听过誊清后的口供，确认主动藏身、逼契压力和凭照未亲见的边界，在末页按下手印。')] } },
  'chapter2.case2-inquiry.lusheng.1': {
    chapter: 'chapter2',
    narrative: { title: '分开闻讯 · 卢盛', tone: 'tense', paragraphs: [paragraph('卢盛进门时先看债册，再看你手边的副契。', 'prose'), paragraph('“我只是替外甥女保管几天。她自己不肯出嫁，自己把事情闹大，倒要说我逼她。”', 'dialogue')] },
    choices: [
      { id: 'c2-02-lusheng-ledger', label: '“债册上有两次催交房契的记号。那两次你分别对她说了什么？”', nextNode: 'chapter2.case2-inquiry.lusheng.2', effects: noEffects, outcomeNarrative: { title: '卢盛 · 两次催契', tone: 'tense', paragraphs: [paragraph('“债主催得紧，我只是把账给她看。说逾期房子就保不住，这话不假。她若早些把契给我，哪会有后面的事。”', 'dialogue')] } },
      { id: 'c2-02-lusheng-contract', label: '“私约写的是代管，逾期却可处置。你签这张约时，卢小绫在不在场？”', nextNode: 'chapter2.case2-inquiry.lusheng.2', effects: noEffects, outcomeNarrative: { title: '卢盛 · 私约', tone: 'tense', paragraphs: [paragraph('卢盛把手从桌边收回去：“她没在场。可那是我替她挡债，先签个字不算逼她。”', 'dialogue')] } },
    ],
  },
  'chapter2.case2-inquiry.lusheng.2': {
    chapter: 'chapter2',
    narrative: { title: '卢盛 · 凭照不是他的', tone: 'tense', paragraphs: [paragraph('你把未剪角的凭照放在纸包里，没有推到他手边。', 'prose'), paragraph('“我只知道有人说官府要来封房。凭照不是我拿的，是茶摊那边交来的。谁从哪儿拿到的，我没有问。”', 'dialogue')] },
    choices: [
      { id: 'c2-02-lusheng-restatement', label: '“从你欠债、签私约、追问副契开始重说。知道的写知道，不知道的不要替人补。”', nextNode: 'chapter2.case2-inquiry.lusheng.3', effects: noEffects, outcomeNarrative: { title: '卢盛 · 重说经过', tone: 'quiet', paragraphs: [paragraph('“我欠债，签了代管私约，也去问过她副契在哪儿。她从后门跑了。凭照是别人递来的，我见过它，但不知道那个人的来处。”', 'dialogue')] } },
    ],
  },
  'chapter2.case2-inquiry.lusheng.3': {
    chapter: 'chapter2',
    narrative: { title: '卢盛 · 问话已完', tone: 'quiet', paragraphs: [paragraph('卢盛承认债务、私约和逼问动作，却不能为凭照来源和上游交接提供亲见依据。', 'prose')] },
    choices: [{ id: 'c2-02-lusheng-finish', label: '进入卢盛口供整理', nextNode: 'chapter2.case2-inquiry.lusheng.review', effects: noEffects, outcomeNarrative: { title: '卢盛问话已完', tone: 'quiet', paragraphs: [paragraph('问话到这里停止。先把承认、改口和凭照来源的待核部分分开。')] } }],
  },
  'chapter2.case2-inquiry.lusheng.signed': { chapter: 'chapter2', narrative: { title: '卢盛口供复述签押', tone: 'quiet', paragraphs: [paragraph('卢盛逐项复述债务、私约和逼契动作，把凭照来源列为不知情处，在末页按下手印。')] } },
  'chapter2.case2-inquiry.spouse.1': {
    chapter: 'chapter2',
    narrative: { title: '分开闻讯 · 夫家妇人', tone: 'quiet', paragraphs: [paragraph('夫家妇人把湿伞放在门外，说自己只在卢宅后门停过片刻。', 'prose'), paragraph('“我看见卢盛拦着小绫问一张纸。她没穿嫁衣，转身就往后门走。”', 'dialogue')] },
    choices: [
      { id: 'c2-02-spouse-sash', label: '“她离开时衣带是什么情形？你看见谁碰到她了吗？”', nextNode: 'chapter2.case2-inquiry.spouse.2', effects: noEffects, outcomeNarrative: { title: '夫家妇人 · 衣带', tone: 'quiet', paragraphs: [paragraph('“她拉门时衣带挂住了，像是有人伸手拽过。我只看见衣带断，不敢说那只手是谁的。”', 'dialogue')] } },
      { id: 'c2-02-spouse-direction', label: '“她从后门出去后往哪里走？你有没有跟到废染坊？”', nextNode: 'chapter2.case2-inquiry.spouse.2', effects: noEffects, outcomeNarrative: { title: '夫家妇人 · 方向', tone: 'quiet', paragraphs: [paragraph('“她朝旧染坊去了。我没有跟上，后面的屋里有没有人拿凭照，我没看见。”', 'dialogue')] } },
    ],
  },
  'chapter2.case2-inquiry.spouse.2': {
    chapter: 'chapter2',
    narrative: { title: '夫家妇人 · 她没有看见的屋内', tone: 'quiet', paragraphs: [paragraph('她把手放在伞柄上，反复说自己没有进正屋。', 'prose'), paragraph('“有人说后来来了个持官纸的人，可那是门房传的话。我没看见他的脸，也没看见他和卢盛交什么东西。”', 'dialogue')] },
    choices: [
      { id: 'c2-02-spouse-restatement', label: '“最后只说你站在后门亲眼看见的争执、衣带和去向。”', nextNode: 'chapter2.case2-inquiry.spouse.3', effects: noEffects, outcomeNarrative: { title: '夫家妇人 · 重说经过', tone: 'quiet', paragraphs: [paragraph('“我看见卢盛在后门问副契，看见衣带断，也看见小绫往旧染坊走。持凭照的人是谁，我没有看清。”', 'dialogue')] } },
    ],
  },
  'chapter2.case2-inquiry.spouse.3': {
    chapter: 'chapter2',
    narrative: { title: '夫家妇人 · 问话已完', tone: 'quiet', paragraphs: [paragraph('她的证言能与脚印、衣带和卢小绫的离开方向相互对照，但不能补出凭照交割的身份。', 'prose')] },
    choices: [{ id: 'c2-02-spouse-finish', label: '进入夫家妇人证言整理', nextNode: 'chapter2.case2-inquiry.spouse.review', effects: noEffects, outcomeNarrative: { title: '夫家妇人问话已完', tone: 'quiet', paragraphs: [paragraph('问话到这里停止。先把后门亲见与门房传闻分栏。')] } }],
  },
  'chapter2.case2-inquiry.spouse.signed': { chapter: 'chapter2', narrative: { title: '夫家妇人证言复述签押', tone: 'quiet', paragraphs: [paragraph('夫家妇人确认自己看见的是后门争执、衣带撕裂和离开方向，未见凭照交割，在末页按下指印。')] } },
  'chapter2.case2-inquiry.tea-clerk.1': {
    chapter: 'chapter2',
    narrative: { title: '分开闻讯 · 茶摊伙计', tone: 'quiet', paragraphs: [paragraph('茶摊伙计进屋后一直盯着自己手上的墨渍。', 'prose'), paragraph('“后桌那晚有人坐过，但我没敢细看。茶钱都记在前桌，后桌只是替人留了张纸。”', 'dialogue')] },
    choices: [
      { id: 'c2-02-tea-table', label: '“你说替人留纸。谁把纸放下，谁最后拿走，按桌位和先后说。”', nextNode: 'chapter2.case2-inquiry.tea-clerk.2', effects: noEffects, outcomeNarrative: { title: '茶摊伙计 · 后桌', tone: 'quiet', paragraphs: [paragraph('“先来的人把一张折纸压在茶碗下，过了一会儿另一个人来取。取纸的人说要送去卢宅，别号我记成了‘老槐’。”', 'dialogue')] } },
      { id: 'c2-02-tea-time', label: '“账纸背面有时辰。你当时在后桌附近，为什么起初说没看见？”', nextNode: 'chapter2.case2-inquiry.tea-clerk.2', effects: noEffects, outcomeNarrative: { title: '茶摊伙计 · 记账纸', tone: 'tense', paragraphs: [paragraph('“我怕那两个人不是寻常客，才把时辰写在背面。有人把官纸露出来，我看见封验凭照的印色，却没看清交纸人的脸。”', 'dialogue')] } },
    ],
  },
  'chapter2.case2-inquiry.tea-clerk.2': {
    chapter: 'chapter2',
    narrative: { title: '茶摊伙计 · 凭照从哪里来', tone: 'tense', paragraphs: [paragraph('你问到“谁先把纸带来”时，他停了很久。', 'prose'), paragraph('“这我真不知道。先来的人坐下就有纸，不像刚从官署赶来。后来取纸的人带着它走，我只知道方向，不知道他替谁办。”', 'dialogue')] },
    choices: [
      { id: 'c2-02-tea-restatement', label: '“从先来的人、折纸、取纸和送往卢宅重说，只写你亲见的动作。”', nextNode: 'chapter2.case2-inquiry.tea-clerk.3', effects: noEffects, outcomeNarrative: { title: '茶摊伙计 · 重说交接', tone: 'quiet', paragraphs: [paragraph('“先来的人把封验凭照压在桌上，后来的人取走，凭照随后被带往卢宅。我认得别号，不认得他的来处，也没看清先来人的身份。”', 'dialogue')] } },
    ],
  },
  'chapter2.case2-inquiry.tea-clerk.3': {
    chapter: 'chapter2',
    narrative: { title: '茶摊伙计 · 问话已完', tone: 'quiet', paragraphs: [paragraph('茶摊记录可以固定交接时辰、动作和别号，不能证明凭照最初如何流出。', 'prose')] },
    choices: [{ id: 'c2-02-tea-clerk-finish', label: '进入茶摊伙计证言整理', nextNode: 'chapter2.case2-inquiry.tea-clerk.review', effects: noEffects, outcomeNarrative: { title: '茶摊伙计问话已完', tone: 'quiet', paragraphs: [paragraph('问话到这里停止。先把交接亲见、身份待核和起初隐瞒分开。')] } }],
  },
  'chapter2.case2-inquiry.tea-clerk.signed': { chapter: 'chapter2', narrative: { title: '茶摊伙计证言复述签押', tone: 'quiet', paragraphs: [paragraph('茶摊伙计确认时辰、座次和递纸动作，把别号之外的身份和上游留在待核栏后按下指印。')] } },
}

export const chapter2Case2MainlineSteps: Record<string, Chapter2MainlineStep> = {
  'chapter2.empty-dowry-house': {
    chapter: 'chapter2',
    narrative: { title: '第二案 · 空屋里的嫁妆', tone: 'tense', image: chapter2Case2Images.emptyDowryHouse, paragraphs: [
      paragraph('卢宅正屋摆着没有穿过的嫁衣。后门泥地有一串靛色脚印，屋里少了人，案桌上却留下几处没有收好的纸角。'),
      paragraph('卢盛说卢小绫自行离家，夫家那边却说她离开前曾在后门争执。另有人持一张官府凭照进宅，要求取看房契。'),
      paragraph('眼下只先记三个问题：她怎样离开，卢盛做了什么，凭照又怎样经过中间人交到宅里。'),
      { kind: 'dialogue', text: '覃保坤把案夹推到你面前：“先查现场和纸。不要因为人自己走了，就把逼迫那一笔抹掉；也不要因为有人持凭照，就替他把上游写出来。”' },
    ] },
  },
  'chapter2.case2-route-backdoor': { chapter: 'chapter2', narrative: { title: '调查线 · 后门与废染坊', tone: 'tense', image: chapter2Case2Images.dyehouseInterior, paragraphs: [paragraph('后门的泥还没有干。靛色脚印和门边衣带都要按原位取证，不能先让卢小绫的说法替现场下结论。')] } },
  'chapter2.case2-route-deed': { chapter: 'chapter2', narrative: { title: '调查线 · 副契与债务压力', tone: 'tense', image: chapter2Case2Images.deedClose, paragraphs: [paragraph('副契已从灰砖下取出。卢盛的债册和代管私约要逐页对照，确认是债务压力，还是另有已经发生的处分。')] } },
  'chapter2.case2-route-credential': { chapter: 'chapter2', narrative: { title: '调查线 · 凭照与中间人交接', tone: 'quiet', image: chapter2Case2Images.inspectionCredential, paragraphs: [paragraph('凭照原件已经保全。权限核验只能回答它能做什么，茶摊交割记录才能回答它经过了谁的手。')] } },
  'chapter2.case2-investigation': { chapter: 'chapter2', narrative: { title: '空屋里的嫁妆 · 调查案桌', tone: 'quiet', image: chapter2Case2Images.credentialReviewDesk, paragraphs: [paragraph('后门、废染坊、灶台、债册和茶摊的记录分成三栏摆在案桌上。已经取出的材料标上朱点，尚未完成的调查线仍留着空格。')] } },
  'chapter2.case2-inquiry-select': { chapter: 'chapter2', narrative: { title: '空屋里的嫁妆 · 分开闻讯', tone: 'tense', paragraphs: [paragraph('调查阶段已经结束。卢小绫、卢盛、夫家妇人和茶摊伙计分别候在不同房间，每个人都要从自己的所见开始，问完、整理、复述并签押。')] } },
  'chapter2.case2-inquiry.luxiaoling.review': { chapter: 'chapter2', narrative: { title: '卢小绫 · 口供整理', tone: 'quiet', paragraphs: [paragraph('三轮问话已经记下。签押以前，必须把她亲自走过的路、离开前的逼问和凭照传闻分开。')] } },
  'chapter2.case2-inquiry.lusheng.review': { chapter: 'chapter2', narrative: { title: '卢盛 · 口供整理', tone: 'quiet', paragraphs: [paragraph('卢盛的承认、改口和替凭照找理由的说法仍混在一处。先分栏，再让他对着自己的动作签押。')] } },
  'chapter2.case2-inquiry.spouse.review': { chapter: 'chapter2', narrative: { title: '夫家妇人 · 证言整理', tone: 'quiet', paragraphs: [paragraph('她站在后门看见的部分可以落纸，门房传来的凭照身份必须留在待核栏。')] } },
  'chapter2.case2-inquiry.tea-clerk.review': { chapter: 'chapter2', narrative: { title: '茶摊伙计 · 证言整理', tone: 'quiet', paragraphs: [paragraph('茶摊后桌的时辰、座次和递纸动作已经记下。别号之外的身份与上游尚不能由猜测补齐。')] } },
  'chapter2.case2-inquiry.family.compare': { chapter: 'chapter2', narrative: { title: '家庭压力与副契对照', tone: 'tense', paragraphs: [paragraph('三份口供已经分别签押。现在对照主动离开、后门争执和逼契部分，把必须交给副契与债册解决的地方单独列出。')] } },
  'chapter2.case2-inquiry.credential.compare': { chapter: 'chapter2', narrative: { title: '凭照权限与茶摊交接对照', tone: 'quiet', paragraphs: [paragraph('凭照原件、权限核验和茶摊证言已经各自入卷。对照只固定滥用和交接，不替上游流出路径下结论。')] } },
  'chapter2.case2-close-review': { chapter: 'chapter2', narrative: { title: '第二案 · 材料核验', tone: 'quiet', image: chapter2Case2Images.credentialReviewDesk, paragraphs: [paragraph('四份独立签押、两份对照记录和三条调查线已经按形成顺序排好。现在要逐条回答三个命题：主动藏身与离开前压力、债务逼契、凭照滥用与中间人交接。')] } },
  'chapter2.case2-authority-review': { chapter: 'chapter2', narrative: { title: '第二案 · 呈请保全重点', tone: 'tense', image: chapter2Case2Images.credentialReviewDesk, paragraphs: [paragraph('三条命题都已经由精确材料组合核验通过。案件事实足以封结，但副契原件和凭照交割链不能同时得到同样完整的保全，须由你选择先保哪一处。')] } },
  'chapter2.case2-closed': { chapter: 'chapter2', nextNode: 'chapter2.before-the-watch-drum', narrative: { title: '第二案封卷 · 空屋里的嫁妆', tone: 'quiet', paragraphs: [paragraph('案件结论已经按事实、责任和未解内容分开落卷。卢小绫的主动藏身不写成绑架；卢盛的债务逼契与中间人的凭照滥用分别记责；凭照最初流出和房契后续权属另列续查。')] } },
  ...inquiryNodes,
}
