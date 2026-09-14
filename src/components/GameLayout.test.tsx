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
})
