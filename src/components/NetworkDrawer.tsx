import { ArrowLeft, HeartHandshake } from 'lucide-react'
import { useState } from 'react'
import { displayedRelationStage, knownNetworkIds, networkOpinion, networkPeople, type NetworkId } from '../data/network'
import { useGameStore } from '../store/gameStore'

export function NetworkDrawer({ onClose, initialSelectedId }: { onClose: () => void; initialSelectedId?: NetworkId }) {
  const { npcRelations, flags } = useGameStore()
  const ids = knownNetworkIds(npcRelations, flags)
  const [selectedId, setSelectedId] = useState<NetworkId>(initialSelectedId ?? ids[0] ?? 'zhou_hanchuan')
  const selected = ids.includes(selectedId) ? selectedId : ids[0]
  const person = selected ? networkPeople[selected] : null

  return <div className="network-drawer-content">
    <header className="network-drawer-heading">
      <div><span className="section-label">已建立联系</span><h2><HeartHandshake size={19} aria-hidden="true" />人脉</h2></div>
      <p>{ids.length} 人</p>
    </header>
    {ids.length ? <div className="network-layout">
      <nav className="network-list" aria-label="人脉名单">
        {ids.map((id) => <button type="button" className={id === selected ? 'network-person is-selected' : 'network-person'} key={id} onClick={() => setSelectedId(id)}>{networkPeople[id].name}<span>{displayedRelationStage(id, npcRelations[id], flags)}</span></button>)}
      </nav>
      {person && <article className="network-detail">
        <div className="network-detail-portrait">{person.image ? <img src={person.image} alt={person.imageAlt} /> : <span aria-label={person.imageAlt}>肖像暂缺</span>}</div>
        <h3>{person.name}</h3>
        <p className="network-stage">关系阶段：{displayedRelationStage(selected!, npcRelations[selected!], flags)}</p>
        <p className="network-opinion"><strong>他对你的看法</strong>{networkOpinion(selected!)}</p>
      </article>}
    </div> : <p className="empty-copy">尚未建立可记录的人脉。</p>}
    <button type="button" className="button button-secondary network-close" onClick={onClose}><ArrowLeft size={17} />返回案件</button>
  </div>
}
