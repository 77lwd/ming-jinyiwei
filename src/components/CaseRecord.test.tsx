import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CaseRecord } from './CaseRecord'

describe('CaseRecord', () => {
  it('shows completed, current, and pending case stages without free-window counters', () => {
    render(<CaseRecord node="chapter1.day1-evidence" events={[]} investigation={{ completedRouteIds: [], activeRouteId: null, completedActionIds: [], materialIds: [], fixedFactIds: [], openQuestionIds: ['wusheng-bag', 'fire-target', 'paper-fate'], nightChoiceId: null, verificationIds: [], petitionResultIds: [], confrontationMode: null, closureSubmitted: false }} />)

    expect(screen.getByText('接案现场').closest('li')).toHaveClass('is-complete')
    expect(screen.getByText('固定矛盾').closest('li')).toHaveClass('is-current')
    expect(screen.getByText('正式复核').closest('li')).toHaveClass('is-pending')
    expect(screen.queryByText(/自由行动|窗口|木牌|重逢/)).not.toBeInTheDocument()
  })

  it('shows only acquired materials and fixed facts', () => {
    render(<CaseRecord node="chapter1.day2-verify" events={[]} investigation={{ completedRouteIds: ['sample-route'], activeRouteId: null, completedActionIds: ['sample-read-slip', 'sample-question-porter'], materialIds: ['sample-slip'], fixedFactIds: ['fire-target'], openQuestionIds: ['paper-fate'], nightChoiceId: 'organize-evidence', verificationIds: ['fire-target'], petitionResultIds: [], confrontationMode: null, closureSubmitted: false }} />)

    expect(screen.getByText('送样凭条')).toBeInTheDocument()
    expect(screen.getByText('火先指向登记架和印纸包，存在毁证目标')).toBeInTheDocument()
    expect(screen.getByText('失窃印纸是否真的全部毁于火中？')).toBeInTheDocument()
    expect(screen.queryByText('客户副联')).not.toBeInTheDocument()
  })
})
