import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { GameLayout } from './GameLayout'
import { useGameStore } from '../store/gameStore'
import { audioEngine, CHAPTER2_INVESTIGATION_MUSIC_TRACK_URL, INQUIRY_MUSIC_TRACK_URL } from '../audio/audioEngine'

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

  it('uses the chapter-two investigation track after the first case closure', () => {
    useGameStore.setState({
      screen: 'game',
      chapter: 'chapter2',
      phase: 'mainline',
      mainlineNode: 'chapter2.empty-dowry-house',
      currentNarrative: { title: '第二案 · 空屋里的嫁妆', paragraphs: [{ kind: 'prose', text: '第二案开始。' }] },
    })
    const setMusicTrack = vi.spyOn(audioEngine, 'setMusicTrack')

    render(<GameLayout />)

    expect(setMusicTrack).toHaveBeenLastCalledWith(CHAPTER2_INVESTIGATION_MUSIC_TRACK_URL)
    setMusicTrack.mockRestore()
  })

  it('keeps the chapter-two investigation and inquiry tracks assigned to their own stages', () => {
    const setMusicTrack = vi.spyOn(audioEngine, 'setMusicTrack')
    useGameStore.setState({
      screen: 'game',
      chapter: 'chapter2',
      phase: 'mainline',
      mainlineNode: 'chapter2.case1-investigate-scene',
      currentNarrative: { title: '雨夜失押', paragraphs: [{ kind: 'prose', text: '现场雨水未干。' }] },
    })

    const { rerender } = render(<GameLayout />)
    expect(setMusicTrack).toHaveBeenLastCalledWith(CHAPTER2_INVESTIGATION_MUSIC_TRACK_URL)

    act(() => useGameStore.setState({ mainlineNode: 'chapter2.case1-inquiry.zhouliu' }))
    rerender(<GameLayout />)
    expect(setMusicTrack).toHaveBeenLastCalledWith(INQUIRY_MUSIC_TRACK_URL)
    setMusicTrack.mockRestore()
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

  it('routes second-case inquiry and verification to their dedicated workbenches', () => {
    useGameStore.setState({
      screen: 'game',
      chapter: 'chapter2',
      phase: 'mainline',
      mainlineNode: 'chapter2.case2-inquiry.lusheng.review',
      currentNarrative: { title: '卢盛 · 口供整理', paragraphs: [{ kind: 'prose', text: '请分栏整理。' }] },
    })

    const { rerender } = render(<GameLayout />)
    expect(screen.getByRole('heading', { name: '整理卢盛口供' })).toBeInTheDocument()

    act(() => useGameStore.setState({
      mainlineNode: 'chapter2.case2-close-review',
      chapter2Investigation: {
        completedCaseIds: [],
        branchIds: [],
        materialIds: [],
        caseMaterialIds: [],
        completedActionIds: [],
        fixedFactIds: [],
        registerVerified: false,
      },
    }))
    rerender(<GameLayout />)
    expect(screen.getByRole('heading', { name: '第二案材料核验' })).toBeInTheDocument()
  })
})
