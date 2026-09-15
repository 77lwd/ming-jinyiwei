import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ChapterComplete } from './ChapterComplete'
import { useGameStore } from '../store/gameStore'

describe('ChapterComplete', () => {
  it('presents the end of the first playable chapter as a case closure', () => {
    useGameStore.setState({ chapter: 'chapter1', screen: 'complete', phase: 'complete' })

    render(<ChapterComplete />)

    expect(screen.getByText('第一章 · 纸灰里的银子')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '纸铺失火案已经封结' })).toBeInTheDocument()
    expect(screen.queryByText('自由窗口')).not.toBeInTheDocument()
    expect(screen.queryByText('第五章 · 终局')).not.toBeInTheDocument()
  })

  it('offers a direct continuation into chapter two', () => {
    useGameStore.setState({
      chapter: 'chapter1',
      mainlineNode: 'chapter1.feng-reunion',
      screen: 'complete',
      phase: 'complete',
      wealth: 25,
      flags: { first_case_closed: true },
    })

    render(<ChapterComplete />)
    fireEvent.click(screen.getByRole('button', { name: '进入第二章' }))

    expect(useGameStore.getState()).toMatchObject({
      chapter: 'chapter2',
      mainlineNode: 'chapter2.entry',
      screen: 'game',
      phase: 'mainline',
      wealth: 30,
    })
  })
})
