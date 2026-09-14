import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useGameStore } from '../store/gameStore'
import { NetworkDrawer } from './NetworkDrawer'

const initialStoreState = useGameStore.getState()

afterEach(() => {
  useGameStore.setState(initialStoreState, true)
})

describe('NetworkDrawer', () => {
  it('shows Tan Baokun as soon as Liao Weida has entered his command', () => {
    useGameStore.setState({
      npcRelations: { ...initialStoreState.npcRelations, tan_baokun: 1 },
      flags: {},
    })

    render(<NetworkDrawer initialSelectedId="tan_baokun" onClose={vi.fn()} />)

    expect(screen.getByRole('heading', { name: '覃保坤' })).toBeInTheDocument()
    expect(screen.getByText('关系阶段：熟悉')).toBeInTheDocument()
  })

  it('shows Tan Baokun for an older chapter save after the prologue', () => {
    useGameStore.setState({
      npcRelations: { ...initialStoreState.npcRelations, tan_baokun: 0 },
      flags: { prologue_survivor: true },
    })

    render(<NetworkDrawer initialSelectedId="tan_baokun" onClose={vi.fn()} />)

    expect(screen.getByRole('heading', { name: '覃保坤' })).toBeInTheDocument()
  })

  it('preselects Feng Tianshun when the reunion entry opens the drawer for him', () => {
    useGameStore.setState({
      npcRelations: {
        ...initialStoreState.npcRelations,
        zhou_hanchuan: 20,
        feng_tianshun: 1,
      },
      flags: { tianshun_reconnected: true },
    })

    render(<NetworkDrawer initialSelectedId="feng_tianshun" onClose={vi.fn()} />)

    expect(screen.getByRole('heading', { name: '冯天顺' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '冯天顺肖像' })).toHaveAttribute('src', '/assets/chapter1/characters/feng-tianshun-portrait-v1.png')
    expect(screen.getByText('关系阶段：熟悉')).toBeInTheDocument()
  })

  it('shows Feng Tianshun\'s established opinion without changing the relationship stage', () => {
    useGameStore.setState({
      npcRelations: { ...initialStoreState.npcRelations, feng_tianshun: 1 },
      flags: { tianshun_reconnected: true },
    })

    render(<NetworkDrawer initialSelectedId="feng_tianshun" onClose={vi.fn()} />)

    expect(screen.getByText('关系阶段：熟悉')).toBeInTheDocument()
    expect(screen.getByText('仍把你当作儿时兄弟，愿意与你恢复往来。')).toBeInTheDocument()
  })

  it('shows Tan Baokun as familiar after the first case even when an older save has no relation score', () => {
    useGameStore.setState({
      npcRelations: { ...initialStoreState.npcRelations, tan_baokun: 0 },
      flags: { first_case_closed: true },
    })

    render(<NetworkDrawer initialSelectedId="tan_baokun" onClose={vi.fn()} />)

    expect(screen.getByRole('heading', { name: '覃保坤' })).toBeInTheDocument()
    expect(screen.getByText('关系阶段：熟悉')).toBeInTheDocument()
  })
})
