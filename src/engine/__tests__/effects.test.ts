import { describe, expect, it } from 'vitest'
import { applyEffects } from '../effects'
import { createInitialState } from '../gameEngine'

describe('new effect boundaries', () => {
  it('clamps persistent resources without creating risk state', () => {
    const state = createInitialState()
    const next = applyEffects(state, [
      { type: 'health_change', delta: -200 },
      { type: 'wealth_change', delta: -200 },
      { type: 'attribute_change', attribute: 'strength', delta: 200 },
      { type: 'relation_change', npcId: 'zhou_hanchuan', delta: 200 },
    ])
    expect(next.health).toBe(0)
    expect(next.wealth).toBe(0)
    expect(next.attributes.strength).toBe(100)
    expect(next.npcRelations.zhou_hanchuan).toBe(100)
    expect('riskLevel' in next).toBe(false)
  })
})
