import { ArrowLeft, BedDouble, BookOpen, Coins, Heart, HeartHandshake, Landmark, MapPin, Shield, Stethoscope, Swords } from 'lucide-react'
import { useState } from 'react'
import { getFreeActionLocations, getFreeActions } from '../engine/gameEngine'
import type { FreeActionId, FreeActionLocationId, GameState } from '../types'
import { isActionAvailable } from '../data/freeActionWindows'

const locationIcons = {
  home: BedDouble,
  clinic: Stethoscope,
  'training-ground': Swords,
  office: BookOpen,
  city: Landmark,
  network: HeartHandshake,
} as const

export function FreeActionWindowView({ state, onChoose, onSkip }: { state: GameState; onChoose: (id: FreeActionId) => void; onSkip: () => void }) {
  const [selectedLocation, setSelectedLocation] = useStateLocation()
  const locations = getFreeActionLocations(state)
  const actions = selectedLocation ? getFreeActions(state, selectedLocation) : []
  const selectedLocationData = locations.find((item) => item.id === selectedLocation)

  return <section className="free-action-workbench" aria-label="案后空档">
    <header className="free-action-heading">
      <div>
        <span className="section-label">案后空档 · 仅一次</span>
        <h2>把半日留给自己</h2>
      </div>
      <p>选择一处去处，再完成一件事。也可以按时回署。</p>
    </header>
    <div className="free-action-layout">
      <nav className="free-action-locations" aria-label="空档地点">
        {locations.map((location) => {
          const Icon = locationIcons[location.id]
          const selected = selectedLocation === location.id
          return <button key={location.id} type="button" className={selected ? 'free-action-location is-selected' : 'free-action-location'} onClick={() => setSelectedLocation(location.id)}>
            <Icon size={18} aria-hidden="true" />
            <span><strong>{location.label}</strong><small>{location.description}</small></span>
          </button>
        })}
      </nav>
      <section className="free-action-options" aria-label={selectedLocation ? `${locations.find((item) => item.id === selectedLocation)?.label ?? ''}行动` : '选择地点'}>
        {selectedLocation ? <><div className="free-action-options-heading"><MapPin size={16} aria-hidden="true" /><span>{selectedLocationData?.label}</span></div>
          <p className="free-action-location-scene">{selectedLocationData?.scene}</p>
          {actions.map((action) => {
            const available = isActionAvailable(state, action)
            const lowHealth = state.health <= (action.lowHealthThreshold ?? -1) && Boolean(action.lowHealthEffects)
            return <button key={action.id} type="button" className="free-action-option" disabled={!available} onClick={() => onChoose(action.id)}>
              <span className="free-action-option-copy"><strong>{action.label}</strong><small>{action.description}</small>{action.requiresWealth !== undefined && <em><Coins size={13} aria-hidden="true" />需要银两 {action.requiresWealth}</em>}{lowHealth && <em><Heart size={13} aria-hidden="true" />身体状态较低，将改为低强度做法</em>}</span>
              <Shield size={17} aria-hidden="true" />
            </button>
          })}
        </> : <div className="free-action-empty"><Heart size={18} aria-hidden="true" /><p>先选一处地点。</p></div>}
      </section>
    </div>
    <footer className="free-action-footer">
      <span><Heart size={14} aria-hidden="true" />当前健康 {state.health} · <Coins size={14} aria-hidden="true" />银两 {state.wealth}</span>
      <button type="button" className="button button-secondary" onClick={onSkip}><ArrowLeft size={16} aria-hidden="true" />按时回署</button>
    </footer>
  </section>
}

function useStateLocation(): [FreeActionLocationId | null, (location: FreeActionLocationId) => void] {
  const [selectedLocation, setSelectedLocation] = useState<FreeActionLocationId | null>(null)
  return [selectedLocation, setSelectedLocation]
}
