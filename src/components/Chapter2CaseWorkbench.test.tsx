import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Chapter2CaseRecord } from './Chapter2CaseWorkbench'

describe('Chapter2CaseRecord', () => {
  it('shows only the current first-case record without future-case or register spoilers', () => {
    render(<Chapter2CaseRecord node="chapter2.rain-night-transfer" investigation={{
      activeCaseId: 'rain-night-transfer',
      completedActionIds: ['c2-01-preserve-wet-stub'],
      caseMaterialIds: ['wet-transfer-stub'],
      completedCaseIds: [],
      branchIds: [],
      materialIds: ['wet-transfer-stub'],
      fixedFactIds: [],
      registerVerified: false,
    }} />)

    expect(screen.getByRole('heading', { name: '雨夜失押' })).toBeInTheDocument()
    expect(screen.getByText('湿透的换押存根')).toBeInTheDocument()
    expect(screen.getByText(/换押文书/)).toBeInTheDocument()
    expect(screen.queryByText('空屋里的嫁妆')).not.toBeInTheDocument()
    expect(screen.queryByText('倒在更鼓前的人')).not.toBeInTheDocument()
    expect(screen.queryByText('章末总簿要求')).not.toBeInTheDocument()
    expect(screen.queryByText('未剪角的封验凭照')).not.toBeInTheDocument()
    expect(screen.queryByText('夜放牌副券')).not.toBeInTheDocument()
  })

  it('shows each signed statement only after that person has finished inquiry', () => {
    render(<Chapter2CaseRecord node="chapter2.case1-inquiry.guard-b.1" investigation={{
      activeCaseId: 'rain-night-transfer',
      completedActionIds: ['c2-01-guard-a-statement'],
      caseMaterialIds: [],
      completedCaseIds: [],
      branchIds: [],
      materialIds: [],
      fixedFactIds: [],
      registerVerified: false,
    }} />)

    expect(screen.getByText('周六口供 · 已复述签押')).toBeInTheDocument()
    expect(screen.getByText('赵七口供 · 闻讯未完')).toBeInTheDocument()
    expect(screen.queryByText('船夫陈老桨证言 · 已复述签押')).not.toBeInTheDocument()
  })
})
