import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GameLayout } from './GameLayout'
import { useGameStore } from '../store/gameStore'

describe('GameLayout', () => {
  it('keeps chapter-one casework on the primary desk', () => {
    useGameStore.setState({
      screen: 'game',
      chapter: 'chapter1',
      phase: 'mainline',
      mainlineNode: 'chapter1.entry',
      currentNarrative: { title: '第一章 · 纸灰里的银子', paragraphs: [{ kind: 'prose', text: '覃保坤已经在门外等你。' }] },
    })

    render(<GameLayout />)

    expect(screen.getByRole('button', { name: /随覃百户前往城南/ })).toBeInTheDocument()
    expect(screen.queryByText('安排这一段空档')).not.toBeInTheDocument()
  })

  it('shows the chapter-two register workbench only at the total-register review', () => {
    useGameStore.setState({
      screen: 'game',
      chapter: 'chapter2',
      phase: 'mainline',
      mainlineNode: 'chapter2.register-review',
      currentNarrative: { title: '章末核验 · 失号凭照', paragraphs: [{ kind: 'prose', text: '三案材料已经并排放上案桌。' }] },
      chapter2Investigation: {
        completedCaseIds: ['rain-night-transfer', 'empty-dowry-house', 'before-the-watch-drum'],
        branchIds: ['c2_01_route_chain', 'c2_02_receipt_chain', 'c2_03_record_chain'],
        materialIds: ['wet-transfer-stub', 'inspection-credential', 'night-pass-counterfoil'],
        fixedFactIds: [],
        registerVerified: false,
      },
    })

    render(<GameLayout />)

    expect(screen.getByRole('region', { name: '失号凭照总簿核验' })).toBeInTheDocument()
    expect(screen.getByText('湿透的换押存根')).toBeInTheDocument()
    expect(screen.getByText('未剪角的封验凭照')).toBeInTheDocument()
    expect(screen.getByText('夜放牌副券')).toBeInTheDocument()
  })
})
