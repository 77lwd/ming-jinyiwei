import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Chapter2Case1VerificationWorkbench } from './Chapter2Case1VerificationWorkbench'

const materials = [
  'unforced-lock', 'shaft-break-record', 'cart-drag-trace', 'cut-rope-fibers', 'wet-transfer-stub', 'original-escort-order',
  'zhou-liu-signed-statement', 'zhao-qi-signed-statement', 'separate-guard-statements',
  'chen-laojiang-signed-testimony', 'ashun-signed-testimony', 'river-route-testimony',
]

describe('Chapter2Case1VerificationWorkbench', () => {
  it('shows how signed testimony became a case-file material', () => {
    render(<Chapter2Case1VerificationWorkbench materialIds={materials} onVerify={vi.fn()} />)

    expect(screen.getByText('周六签押口供')).toBeInTheDocument()
    expect(screen.getByText('签押口供 · 押役周六')).toBeInTheDocument()
    expect(screen.getByText(/三轮问话完成后，经逐句归类、当面复述并按印形成/)).toBeInTheDocument()
    expect(screen.getByText('押役口供对照记录')).toBeInTheDocument()
    expect(screen.getByText(/周六与赵七两份原口供分别签押后/)).toBeInTheDocument()
  })

  it('uses a different required material count for each proposition', () => {
    render(<Chapter2Case1VerificationWorkbench materialIds={materials} onVerify={vi.fn()} />)

    expect(screen.getByText((_, element) => element?.tagName === 'P' && element.textContent?.includes('本题须提交 4 项直接材料') === true)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('radio', { name: /押役是否存在失职/ }))
    expect(screen.getByText((_, element) => element?.tagName === 'P' && element.textContent?.includes('本题须提交 5 项直接材料') === true)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('radio', { name: /是否发生未经批准的转移/ }))
    expect(screen.getByText((_, element) => element?.tagName === 'P' && element.textContent?.includes('本题须提交 6 项直接材料') === true)).toBeInTheDocument()
  })

  it('keeps each proposition selection when switching between questions', () => {
    render(<Chapter2Case1VerificationWorkbench materialIds={materials} onVerify={vi.fn()} />)
    fireEvent.click(screen.getByLabelText('未受强力破坏的锁扣'))
    fireEvent.click(screen.getByRole('radio', { name: /押役是否存在失职/ }))
    fireEvent.click(screen.getByLabelText('原押送差牌对照'))
    fireEvent.click(screen.getByRole('radio', { name: /基础事实/ }))
    expect(screen.getByLabelText('未受强力破坏的锁扣')).toBeChecked()
    fireEvent.click(screen.getByRole('radio', { name: /押役是否存在失职/ }))
    expect(screen.getByLabelText('原押送差牌对照')).toBeChecked()
  })

  it('groups materials by how they entered the case file', () => {
    render(<Chapter2Case1VerificationWorkbench materialIds={materials} onVerify={vi.fn()} />)
    expect(screen.getByRole('heading', { name: /现场与物证\s*4项/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /文书原件\s*2项/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /独立签押口供\s*4项/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /口供与证言对照\s*2项/ })).toBeInTheDocument()
  })
})
