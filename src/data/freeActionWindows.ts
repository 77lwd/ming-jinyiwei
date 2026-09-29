import type { Attribute, Effect, FreeActionId, FreeActionLocationId, FreeActionWindowId, GameState, NpcId } from '../types'

export interface FreeActionDefinition {
  id: FreeActionId
  location: FreeActionLocationId
  label: string
  description: string
  effects: Effect[]
  lowHealthThreshold?: number
  lowHealthEffects?: Effect[]
  requiresWealth?: number
  npcId?: NpcId
  opinion?: string
  result?: string
  lowHealthResult?: string
}

export interface FreeActionLocation {
  id: FreeActionLocationId
  label: string
  description: string
  scene: string
}

export const freeActionLocations: FreeActionLocation[] = [
  { id: 'home', label: '住处', description: '关上门，先把身上的泥水和疲惫放下来。', scene: '门闩落下时，外头的脚步声被隔在巷口。湿衣还贴在背上，灶台里只剩一层没烧透的灰。' },
  { id: 'clinic', label: '医馆', description: '让郎中看一眼伤处，再决定要不要带药回去。', scene: '药炉的苦味压着雨气。郎中抬眼看了看你的走路姿势，没有先问案子，只让你把袖子挽起来。' },
  { id: 'training-ground', label: '校场', description: '校场还亮着几盏灯，值守的人认得你的腰牌。', scene: '雨水从檐角一滴一滴落下来，校场的沙地还没干。值守同僚把木刀靠在兵器架边，等你自己开口。' },
  { id: 'office', label: '署内', description: '值房和书吏房都有人，适合做一件不惊动案情的事。', scene: '值房里炭火不旺，案头摊着几本翻旧的成例。换班的书吏抱着卷册进来，见你还没走，便把灯往你这边挪了挪。' },
  { id: 'city', label: '城中', description: '城门未闭，街上还有几处能办完一件小事的地方。', scene: '雨歇后街面亮着水光，巡夜的梆子从远处传来。城里的人还在收摊，没人把今晚当成什么值得记下的日子。' },
  { id: 'network', label: '人脉', description: '只显示已经认识、且此时确实能见到的人。', scene: '案子封了，人情却没有跟着封进卷里。你知道该去找谁，也知道有些话只能在离开值房以后再说。' },
]

export const chapter2FirstFreeActions: FreeActionDefinition[] = [
  { id: 'home-rest', location: 'home', label: '睡上半日', description: '不惊动任何人，踏踏实实睡一觉。', result: '你把刀放在床边，外衣也没叠，倒头睡到日影换过窗棂。醒来时巷子里有人挑担经过，身上的酸痛还在，手脚却不再发沉。', effects: [{ type: 'health_change', delta: 8 }] },
  { id: 'home-cook', location: 'home', label: '收拾住处并做顿热食', description: '把湿衣晾起，烧一锅热饭，顺手把案桌收干净。', result: '你先把湿衣撑到门后，再把案桌上的泥水擦掉。米粥煮开后，锅盖边一直往外冒白气，屋里的潮味才慢慢散开。吃完饭，你把案卷挪到干燥的地方，顺手把桌面收干净。', effects: [{ type: 'wealth_change', delta: -1 }, { type: 'health_change', delta: 10 }], requiresWealth: 1 },
  { id: 'clinic-basic', location: 'clinic', label: '处理最碍事的伤处', description: '请郎中处理影响行动的擦伤和扭伤。', result: '你把手腕和脚踝露出来，郎中先看肿处，再用热布敷开。药膏抹上去有些凉，重新缠好的布条不再松动，走出门时，脚下已经比来时稳了。', effects: [{ type: 'wealth_change', delta: -2 }, { type: 'health_change', delta: 12 }], requiresWealth: 2 },
  { id: 'clinic-thorough', location: 'clinic', label: '仔细诊治并带药', description: '把旧伤和新伤一并看过，带两剂药回去。', result: '这回连旧伤也一并拆开看过。郎中换了药，又按你的伤势包了两剂煎服的药材，纸包外面写了用法。你把药收进袖袋，直到天黑才离开医馆。', effects: [{ type: 'wealth_change', delta: -6 }, { type: 'health_change', delta: 20 }], requiresWealth: 6 },
  { id: 'training-solo', location: 'training-ground', label: '独自操练短刀', description: '不求快，只把手上发虚的地方重新找回来。', result: '你先在沙地上站稳，再按起势、收腕、回身的顺序走了一遍。前几下刀锋总差半寸，手腕也发虚，练到后面，木刀落在草靶中央，声音变得一样重。', effects: [{ type: 'health_change', delta: -5 }, { type: 'attribute_change', attribute: 'strength', delta: 1 }] },
  { id: 'training-colleague', location: 'training-ground', label: '与值守同僚对练', description: '请值守同僚过几招，再替他把刀架收好。', result: '你和同僚在湿沙地上过了几招。木刀磕开两次，第三次时你脚下打滑，便停下来把被雨水冲歪的刀架重新扶正，顺手把木刀一把把挂好。', lowHealthResult: '你刚抬手，脚下就先晃了一下。同僚没有再让你动刀，只让你把歪掉的刀架扶正，又把一碗热水放到你手边。你在廊下坐了一会儿，等手上的抖劲过去。', effects: [{ type: 'health_change', delta: -8 }, { type: 'attribute_change', attribute: 'strength', delta: 1 }, { type: 'attribute_change', attribute: 'reputation', delta: 1 }], lowHealthThreshold: 25, lowHealthEffects: [{ type: 'health_change', delta: -2 }, { type: 'attribute_change', attribute: 'reputation', delta: 1 }] },
  { id: 'office-precedents', location: 'office', label: '研读公开成例', description: '把今天用到的押送与封存条目抄一遍，弄清每个空栏该由谁补。', result: '值房里只剩一盏灯。你把押送、换押、封存三类成例从架上找出来，按今天办过的顺序摊在桌面上。押送要记差役、时辰、地点，换押要有批示，封存要记收件人、封口和存放处。你翻到一份旧卷，发现交接日期写得清楚，经手人的名字却空着，那份卷子一直压在退回栏里。你把三处容易漏的地方抄在小册上，才合上成例。', effects: [{ type: 'health_change', delta: -3 }, { type: 'attribute_change', attribute: 'insight', delta: 1 }] },
  { id: 'office-watch', location: 'office', label: '替同僚接一轮值守', description: '让刚从夜班下来的人先去吃口热饭。', result: '夜班的人刚把腰牌摘下，你便接过门廊的一轮值守。雨水从檐角落下来，来往的人依次报上姓名和去处，你把腰牌上的刻字一一记清。换班时，门边的炭火正好烧旺，手指也冻得发麻。', effects: [{ type: 'health_change', delta: -4 }, { type: 'attribute_change', attribute: 'reputation', delta: 1 }] },
  { id: 'office-clerk', location: 'office', label: '请老书吏指点正式呈报', description: '请他把呈报里最容易被退回的几处讲明白。', result: '你把呈报草稿摊开，老书吏从第一行看到最后一行，用朱笔划开责任、事实和请求三处混在一起的地方。你把含糊的传闻改成所见，把没有出处的判断删掉，等纸面重新排好，灯芯已经剪过两次。', effects: [{ type: 'health_change', delta: -3 }, { type: 'attribute_change', attribute: 'eloquence', delta: 1 }] },
  { id: 'city-meal', location: 'city', label: '请几名同僚吃顿便饭', description: '不谈下一案，只让几个人把这场雨和今晚的差事咽下去。', result: '你在街角小店要了几碗热面。桌上先是没人说话，只有筷子碰碗的声音，等面汤见底，几个人才把雨天里踩坏的鞋、没睡够的觉拿出来说。你付完账，回去的路比来时慢了一些。', effects: [{ type: 'wealth_change', delta: -4 }, { type: 'health_change', delta: 3 }, { type: 'attribute_change', attribute: 'reputation', delta: 1 }], requiresWealth: 4 },
  { id: 'city-escort', location: 'city', label: '承接一次短途护送', description: '替署里跑一趟已经核准的短途护送，报酬当场记账。', result: '你从署里领出一封封好的公文，先看封口，再看交接牌，沿着南街送到驿站。驿站收件后当场在回执上落名，封口没有破，脚程钱也一并记进了账。回署时，鞋底的水已经灌到袜边。', effects: [{ type: 'health_change', delta: -7 }, { type: 'wealth_change', delta: 5 }] },
  { id: 'network-tan-baokun', location: 'network', label: '登门拜访覃保坤', description: '把第一案封卷后的想法说一遍，听他只谈已结的部分。', result: '你把封存后的案卷细节重新捋了一遍，只留下已经落到纸上的部分。覃保坤看完凭照和封口记录，把其中一处容易被忽略的经手栏单独压在案边。离开时，那张纸还留在那里，等你下次办差时照着看。', effects: [], npcId: 'tan_baokun', opinion: '他认为你办完差后还愿意回想自己的疏漏，不是只惦记邀功的人。' },
  { id: 'network-feng-walk', location: 'network', label: '与冯天顺沿旧街走走', description: '走一段旧路，不谈军中尚未公开的事。', result: '你们沿旧街走到河埠口，路边的水还没退干。冯天顺几次把目光落到你的腰牌上，你便把话引回旧街、旧店和从前欠下的酒钱。走到桥边时，谁也没有再提案子的事。', effects: [{ type: 'health_change', delta: -2 }], npcId: 'feng_tianshun', opinion: '他确认你仍记得旧日相处的分寸，与你说话也比刚重逢时自在。' },
  { id: 'network-feng-meal', location: 'network', label: '请冯天顺吃顿便饭', description: '找一家不显眼的小店，把欠下的那顿饭补上。', result: '你在靠河的小店把迟了许久的那顿饭补上。冯天顺起初只低头吃饭，等碗底见了光，才把桌上的零钱分出一半推回来。你没有收，最后那几文钱在桌边来回推了两次，才被压在茶碗底下。', effects: [{ type: 'wealth_change', delta: -2 }, { type: 'health_change', delta: 3 }], requiresWealth: 2, npcId: 'feng_tianshun', opinion: '他知道你没有因为进了锦衣卫便疏远旧交，但也不愿让你总替他花钱。' },
]

export const freeActionLocationsFor = (state: GameState): FreeActionLocation[] => freeActionLocations.filter((location) => location.id !== 'network' || state.flags.first_case_closed === true)

export const freeActionsForLocation = (location: FreeActionLocationId): FreeActionDefinition[] => chapter2FirstFreeActions.filter((action) => action.location === location)

export function actionAttribute(action: FreeActionDefinition): Attribute | null {
  const effect = action.effects.find((item) => item.type === 'attribute_change')
  return effect?.type === 'attribute_change' ? effect.attribute : null
}

export function isActionAvailable(state: GameState, action: FreeActionDefinition): boolean {
  if (state.freeAction.completedActionIds.includes(action.id)) return false
  if (action.requiresWealth !== undefined && state.wealth < action.requiresWealth) return false
  return true
}

export function formatFreeActionEffect(effect: Effect, actualHealthDelta?: number): string {
  if (effect.type === 'health_change' && actualHealthDelta !== undefined) return `健康 ${actualHealthDelta >= 0 ? '+' : ''}${actualHealthDelta}`
  if (effect.type === 'wealth_change') return `银两 ${effect.delta >= 0 ? '+' : ''}${effect.delta}`
  if (effect.type === 'attribute_change') return `${({ strength: '武力', insight: '智谋', eloquence: '口才', reputation: '声望' } as Record<Attribute, string>)[effect.attribute]} ${effect.delta >= 0 ? '+' : ''}${effect.delta}`
  return ''
}

export const freeActionWindowLabel = (id: FreeActionWindowId): string => id === 'chapter2-after-case1' ? '案后空档' : '章末空档'
