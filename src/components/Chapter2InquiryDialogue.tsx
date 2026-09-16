import { useState } from 'react'
import { ChevronRight, PenLine, UserRound } from 'lucide-react'
import type { NarrativeBlock } from '../types'

const speakerByNode: Array<[string, string]> = [
  ['guard-a', '押役周六'],
  ['guard-b', '押役赵七'],
  ['river-boat', '船夫陈老桨'],
  ['river-tea', '茶棚伙计阿顺'],
]

const roundNotes: Record<string, { fixed: string; next: string }> = {
  '周六 · 钥匙': { fixed: '钥匙由赵七领出，周六称途中接手，但钥匙的交接没有旁证，他也不能确认出事时钥匙是否仍在身上。', next: '继续拿车辕断口与湿存根核对，查清所谓“翻车”发生在交接之前还是之后。' },
  '周六 · 停车': { fixed: '周六改口承认囚车曾在柳沟停留，赵七还以“有人递话”为由让车等了半盏茶。', next: '继续核对车辕断口与换押存根，确认停车时车边究竟发生了什么。' },
  '周六 · 没有那声断响': { fixed: '周六没有听见行车中应有的断木声，却看见停车后赵七在车前动过手。', next: '让他把柳沟停车后的亲眼所见重新说一遍，剔除猜测和替赵七补的话。' },
  '周六 · 存根': { fixed: '周六承认柳沟边来过两个人，赵七看过牌子并进入车厢；湿存根不是凭空出现在车里的。', next: '让他只说自己看见的人、纸和离岗经过，形成可签押的个人口供。' },
  '赵七 · 柳沟': { fixed: '赵七否认柳沟有人到车边，这与周六已经封存的独立陈述直接冲突。', next: '不出示周六口供，改用湿存根和钥匙领取记录继续核问。' },
  '赵七 · 领钥匙': { fixed: '赵七承认自己签字领出钥匙，却声称出门后私下交给周六，没有任何交接记录或旁证。', next: '拿湿存根和未受强力破坏的锁扣核对，追问谁接近过囚车。' },
  '赵七 · 没写完的换押': { fixed: '赵七改口承认有人持牌来到柳沟，他未等存根写完、也未回署核验便允许对方靠近囚车。', next: '让他从停车开始完整复述，逐项说清看牌、开锁和周六离岗时自己做了什么。' },
  '赵七 · 重新挂上的锁': { fixed: '赵七承认亲手开锁，并承认来人把马骁扶下车；锁扣是人离车后重新挂上的。', next: '让他撤回“人犯撞门逃走”的说法，按亲手做过的事重新签押。' },
  '船夫 · 时辰': { fixed: '陈老桨用更鼓和渡头换班确认，渡船在三更第三梆后开出，往返不到半个时辰。', next: '继续核清上船人数、被带者状态和东岸接应地点。' },
  '船夫 · 上船的人': { fixed: '船夫看见一人被两人架上船，同行者带着湿绳和牌子，但他没有看清被带者面貌。', next: '继续确认靠岸位置与篷车去向，并把“看见的”与“无法辨认的”分开落纸。' },
  '阿顺 · 棚外的车': { fixed: '阿顺承认官车在茶棚外停过，随后又来一辆篷车，雨中至少有一名押役在场。', next: '继续追问车厢声响、抬人经过和两辆车离开的先后。' },
  '阿顺 · 两下木板声': { fixed: '阿顺听见车内两下撞板声，又从门缝看见有人被抬往河边，押役仍站在车门旁。', next: '让他按时辰重排官车、渡船与篷车的先后，只保留能够亲见或亲听的部分。' },
}

const finalStatements: Array<{ key: string; title: string; conclusion: string; material: string }> = [
  { key: 'guard-a.3', title: '周六口供待签押', conclusion: '周六承认囚车在柳沟停过，他被赵七叫去牵马，回来时锁扣挂着、车内已经无人。他没有亲眼看见马骁自行逃走，也不能证明是谁把人带走。', material: '形成《周六签押口供》；尚未形成组合核验材料，需等赵七独立问完后再作对照。' },
  { key: 'guard-b.3', title: '本人口供已签押', conclusion: '赵七承认自己看牌、开锁、允许周六离岗，并在没有回署核验和正式回令的情况下让来人带走马骁。两名押役口供已经可以分开对照，停车、钥匙和开锁经过上的相同处与冲突处均已列明。', material: '新增核验材料：《两份分开记录的押役口供》' },
  { key: 'river-boat.2', title: '陈老桨证言待签押', conclusion: '陈老桨能够固定渡船时辰、被带者上船方式、东岸靠岸处和篷车南去方向，但无法辨认被带者身份。', material: '形成《陈老桨签押证言》；尚未形成组合核验材料，需与茶棚伙计的独立证言对照。' },
  { key: 'river-tea.2', title: '本人口供已签押', conclusion: '阿顺能够固定官车停留、车内声响、抬人往河边以及篷车南去的先后。与船夫证言重合后，河埠转移路线已有两份独立来源。', material: '新增核验材料：《船夫与茶棚伙计证言》' },
]

export function Chapter2InquiryDialogue({ node, question, narrative, onConfirm }: {
  node: string
  question: string
  narrative: NarrativeBlock
  onConfirm: () => void
}) {
  const [visibleCount, setVisibleCount] = useState(0)
  const speaker = speakerByNode.find(([key]) => node.includes(key))?.[1] ?? '证人'
  const finalStatement = finalStatements.find((item) => node.includes(item.key))
  const isCompleteStatement = Boolean(finalStatement)
  const roundNote = roundNotes[narrative.title]
  const allVisible = visibleCount >= narrative.paragraphs.length
  const buttonLabel = visibleCount === 0
    ? '听他回答'
    : allVisible
      ? isCompleteStatement ? '完成签押' : '继续闻讯'
      : '继续听'

  const advance = () => {
    if (allVisible) onConfirm()
    else setVisibleCount((count) => count + 1)
  }

  return <section className="inquiry-dialogue" aria-labelledby="inquiry-dialogue-heading">
    <header className="inquiry-dialogue-heading">
      <span>分开闻讯</span>
      <h2 id="inquiry-dialogue-heading">{speaker}</h2>
      <small>第 {Math.min(visibleCount + 1, narrative.paragraphs.length + 1)} 轮记录</small>
    </header>

    <div className="inquiry-stage">
      <aside className="inquiry-portrait inquiry-portrait-witness" aria-label={`${speaker}肖像待补`}>
        <span><UserRound size={36} aria-hidden="true" /></span>
        <strong>{speaker}</strong>
      </aside>

      <div className="inquiry-transcript" aria-live="polite">
        <article className="inquiry-line inquiry-question">
          <strong>廖威达：</strong>
          <p>{question}</p>
        </article>
        {narrative.paragraphs.slice(0, visibleCount).map((paragraph, index) => (
          <article className={`inquiry-line ${paragraph.kind === 'dialogue' ? 'inquiry-answer' : 'inquiry-action'}`} key={`${paragraph.kind}-${index}`}>
            {paragraph.kind === 'dialogue' ? <strong>{speaker}：</strong> : <span><PenLine size={14} />闻讯记录</span>}
            <p>{paragraph.text}</p>
          </article>
        ))}
        {allVisible && !isCompleteStatement && roundNote && <section className="inquiry-round-note" aria-label="本轮闻讯记录">
          <div><strong>本轮记下</strong><p>{roundNote.fixed}</p></div>
          <div><strong>下一步</strong><p>{roundNote.next}</p></div>
        </section>}
        {allVisible && finalStatement && <section className="inquiry-statement-summary" aria-label="口供签押结果">
          <strong>{finalStatement.title}</strong>
          <p>{finalStatement.conclusion}</p>
          <em>{finalStatement.material}</em>
        </section>}
      </div>

      <aside className="inquiry-portrait inquiry-portrait-player">
        <img src="/assets/chapter1/characters/liao-weida-portrait-v1.png" alt="廖威达肖像" />
        <strong>廖威达</strong>
      </aside>
    </div>

    <footer className="inquiry-dialogue-actions">
      {allVisible && isCompleteStatement && <p>书记官按本人口述誊清，复述无误后由本人签押；未亲见、未辨认的部分不写成已证事实。</p>}
      <button className="button button-primary" onClick={advance}>{buttonLabel}<ChevronRight size={18} /></button>
    </footer>
  </section>
}
