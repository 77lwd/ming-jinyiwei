import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Chapter1InvestigationState } from '../types'
import { Chapter1VerificationWorkbench } from './Chapter1VerificationWorkbench'

const investigation: Chapter1InvestigationState = {
  completedRouteIds: ['sample-route', 'fire-scene'],
  activeRouteId: null,
  completedActionIds: ['sample-read-slip', 'sample-question-porter', 'fire-map-origin', 'fire-check-remains'],
  materialIds: ['sample-slip', 'neighbor-testimony', 'porter-testimony', 'fire-origin', 'dragged-pages'],
  fixedFactIds: [],
  openQuestionIds: ['wusheng-bag', 'fire-target', 'paper-fate'],
  nightChoiceId: 'organize-evidence',
  verificationIds: [],
  petitionResultIds: [],
  confrontationMode: null,
  closureSubmitted: false,
}

describe('Chapter1VerificationWorkbench', () => {
  it('requires the player to choose a question and at least two acquired materials', () => {
    const onVerify = vi.fn()
    render(<Chapter1VerificationWorkbench investigation={investigation} supplementalChoices={[]} onSupplement={vi.fn()} onVerify={onVerify} />)

    const fireQuestion = screen.getByRole('button', { name: /起火位置是否指向毁证/ })
    fireEvent.click(fireQuestion)
    expect(fireQuestion).toHaveAttribute('aria-pressed', 'true')
    const submit = screen.getByRole('button', { name: '呈交这组核验' })
    expect(submit).toBeDisabled()

    fireEvent.click(screen.getByRole('checkbox', { name: /起火位置/ }))
    expect(submit).toBeDisabled()
    fireEvent.click(screen.getByRole('checkbox', { name: /集中拖拢的纸页/ }))
    expect(submit).toBeEnabled()

    fireEvent.click(submit)
    expect(onVerify).toHaveBeenCalledWith('fire-target', ['fire-origin', 'dragged-pages'])
  })

  it('keeps the missing investigation route available beside the evidence desk', () => {
    const onSupplement = vi.fn()
    render(<Chapter1VerificationWorkbench investigation={investigation} supplementalChoices={[{ id: 'supplement-client-counterfoil', label: '补查：核对客户副联与数量' }]} onSupplement={onSupplement} onVerify={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /补查：核对客户副联与数量/ }))
    expect(onSupplement).toHaveBeenCalledWith('supplement-client-counterfoil')
  })

  it('does not offer a fact that has already been fixed', () => {
    render(<Chapter1VerificationWorkbench investigation={{
      ...investigation,
      fixedFactIds: ['fire-target'],
      openQuestionIds: ['wusheng-bag', 'paper-fate'],
    }} supplementalChoices={[]} onSupplement={vi.fn()} onVerify={vi.fn()} />)

    expect(screen.queryByRole('button', { name: /起火位置是否指向毁证/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /印纸是否在火前被转移/ })).toBeInTheDocument()
  })
})
