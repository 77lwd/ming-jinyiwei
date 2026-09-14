import { Clock3 } from 'lucide-react'
import { useGameStore } from '../store/gameStore'

export function RecentEvents() {
  const events = useGameStore((state) => state.recentEvents)
  return (
    <aside className="recent-events" aria-label="最近纪事">
      <h2><Clock3 size={17} /> 最近纪事</h2>
      {events.length ? <ol>{events.slice(0, 6).map((event) => <li key={event.id}><time>{event.chapter === 'chapter1' ? '第一章' : event.chapter}</time><strong>{event.title}</strong><p>{event.summary}</p>{event.effects.length > 0 && <ul className="event-effects" aria-label="效果摘要">{event.effects.map((effect, index) => <li key={`${effect}-${index}`}>{effect}</li>)}</ul>}</li>)}</ol> : <p className="empty-copy">你的第一笔记录尚未写下。</p>}
    </aside>
  )
}
