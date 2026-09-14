import type { Effect, GameState } from '../types'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function applyEffects(state: GameState, effects: Effect[]): GameState {
  const next = structuredClone(state) as GameState
  for (const effect of effects) {
    switch (effect.type) {
      case 'attribute_change':
        next.attributes[effect.attribute] = clamp(next.attributes[effect.attribute] + effect.delta, 0, 100)
        break
      case 'health_change':
        next.health = clamp(next.health + effect.delta, 0, 100)
        break
      case 'wealth_change':
        next.wealth = clamp(next.wealth + effect.delta, 0, Number.MAX_SAFE_INTEGER)
        break
      case 'relation_change':
        next.npcRelations[effect.npcId] = clamp((next.npcRelations[effect.npcId] ?? 0) + effect.delta, -100, 100)
        break
      case 'set_flag':
        next.flags[effect.flag] = effect.value
        break
      case 'add_clue':
        if (!next.clues.some((clue) => clue.id === effect.clue.id)) next.clues.push(effect.clue)
        break
      case 'upgrade_clue': {
        const clue = next.clues.find((item) => item.id === effect.clueId)
        if (clue) clue.clarity = effect.clarity
        break
      }
    }
  }
  return next
}
