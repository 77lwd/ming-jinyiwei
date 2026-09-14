import { describe, expect, it } from 'vitest'
import { knownNetworkIds, relationStage } from '../data/network'

describe('network relationship visibility', () => {
  it('shows Feng Tianshun after the reunion flag is written even before a numeric relation change', () => {
    expect(knownNetworkIds({ feng_tianshun: 0 }, { tianshun_reconnected: true })).toContain('feng_tianshun')
  })

  it('keeps the formal relation-stage vocabulary separate from the reunion event', () => {
    expect(relationStage(0)).toBe('陌生')
    expect(relationStage(1)).toBe('熟悉')
  })
})
